import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { validatePasswordStrength, hashPassword, comparePasswords } from "./utils/auth";
import jwt from "jsonwebtoken";
import RateLimiter from 'express-rate-limit';
import csrf from 'csurf';
import { logger } from './logger';
import { securityService } from './security';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Security configuration
const securityConfig = {
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000'), // 7 days default
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes default
  sameSite: (process.env.SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  secure: process.env.NODE_ENV === 'production',
  csrfExclusion: ['/api/auth/token', '/api/auth/google/callback', '/api/auth/github/callback'],
  sessionInactivityTimeout: parseInt(process.env.SESSION_INACTIVITY_TIMEOUT || '1800000'), // 30 minutes default
};

// Validate required environment variables
if (!securityConfig.sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

if (!securityConfig.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Initialize rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

// Make sure secure cookies are used in production
if (process.env.NODE_ENV === 'production' && !securityConfig.secure) {
  logger.warn('Running in production but secure cookies are not enabled. This is a security risk.');
}

function checkLoginAttempts(username: string): boolean {
  const attempts = loginAttempts.get(username);
  if (!attempts) return true;

  if (Date.now() - attempts.timestamp > securityConfig.lockoutDuration) {
    loginAttempts.delete(username);
    return true;
  }

  if (attempts.count >= securityConfig.maxLoginAttempts) {
    return false;
  }

  return true;
}

function recordLoginAttempt(username: string, success: boolean) {
  if (success) {
    loginAttempts.delete(username);
    return;
  }

  const attempts = loginAttempts.get(username) || { count: 0, timestamp: Date.now() };
  attempts.count++;
  loginAttempts.set(username, attempts);
}

// Rate limiter for login endpoint
const loginRateLimiter = RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

// Session activity monitoring middleware
function sessionActivityMonitor(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    const currentTime = Date.now();
    const lastActivity = req.session.lastActivity || currentTime;
    
    // Check if session has timed out due to inactivity
    if (currentTime - lastActivity > securityConfig.sessionInactivityTimeout) {
      req.logout((err) => {
        if (err) {
          logger.error('Error logging out inactive session:', err);
        }
        req.session.destroy((err) => {
          if (err) {
            logger.error('Error destroying inactive session:', err);
          }
          res.status(401).json({ message: 'Session expired due to inactivity' });
        });
      });
      return;
    }
    
    // Update last activity timestamp
    req.session.lastActivity = currentTime;
  }
  next();
}

export function setupAuth(app: Express) {
  // Security headers with more secure CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...(process.env.CONNECT_SRC ? process.env.CONNECT_SRC.split(',') : [])],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Cookie parser middleware
  app.use(cookie());

  // Session configuration with enhanced security
  const sessionSettings: session.SessionOptions = {
    secret: securityConfig.sessionSecret,
    name: 'mentalhealthehr.sid', // Custom name to avoid default behavior
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: securityConfig.sessionMaxAge,
      secure: securityConfig.secure,
      httpOnly: true,
      sameSite: securityConfig.sameSite,
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : 'localhost',
      path: '/',
    },
    genid: (req) => {
      return randomBytes(32).toString('hex'); // Use a stronger ID generation
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Session activity monitor to handle timeouts
  app.use(sessionActivityMonitor);

  // CSRF protection with exclusions for specific endpoints
  const csrfProtection = csrf({ 
    cookie: {
      key: '_csrf',
      httpOnly: true,
      secure: securityConfig.secure,
      sameSite: securityConfig.sameSite,
      maxAge: 3600, // 1 hour
    },
    ignoreMethods: ['OPTIONS', 'HEAD'],
  });

  // Apply CSRF protection to all routes except those excluded
  app.use((req, res, next) => {
    if (securityConfig.csrfExclusion.includes(req.path)) {
      next();
    } else {
      csrfProtection(req, res, next);
    }
  });

  // Expose CSRF token to frontend
  app.get('/api/auth/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // Local Strategy with improved error handling
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Use generic IP in the strategy - we'll get the real IP in the route handler
        const genericIp = '127.0.0.1';
        
        // Check if login attempts should be blocked
        const attemptCheck = await securityService.checkLoginAttempts(genericIp);
        if (attemptCheck.blocked) {
          logger.warn(`Account locked due to too many failed attempts: ${username}`);
          return done(null, false, { message: "Account locked. Please try again later." });
        }

        const user = await storage.getUserByUsername(username);
        
        if (!user || !(await comparePasswords(password, user.passwordHash))) {
          // Record failed login attempt
          await securityService.recordLoginAttempt({
            username,
            ipAddress: genericIp,
            success: false
          });
          
          logger.info(`Failed login attempt for user: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }

        // Record successful login
        await securityService.recordLoginAttempt({
          username,
          ipAddress: genericIp,
          success: true
        });
        
        logger.info(`Successful login for user: ${username}`);
        return done(null, user);
      } catch (error) {
        logger.error(`Authentication error: ${error}`);
        return done(error);
      }
    })
  );

  // Google OAuth Strategy
  if (securityConfig.googleClientId && securityConfig.googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: securityConfig.googleClientId,
          clientSecret: securityConfig.googleClientSecret,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByEmail(profile.emails[0].value);
            
            if (!user) {
              user = await storage.createUser({
                username: profile.emails[0].value,
                email: profile.emails[0].value,
                role: "staff",
                passwordHash: await hashPassword(randomBytes(32).toString("hex")),
                googleId: profile.id,
              });
              logger.info(`New user created via Google OAuth: ${user.email}`);
            }

            return done(null, user);
          } catch (error) {
            logger.error(`Google OAuth error: ${error}`);
            return done(error);
          }
        }
      )
    );
  }

  // JWT Strategy for API authentication
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: securityConfig.jwtSecret,
      },
      async (payload, done) => {
        try {
          const user = await storage.getUser(payload.id);
          
          // Check if token is expired
          const currentTimestamp = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTimestamp) {
            logger.warn(`JWT token expired for user ID: ${payload.id}`);
            return done(null, false, { message: "Token expired" });
          }
          
          return done(null, user);
        } catch (error) {
          logger.error(`JWT authentication error: ${error}`);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      logger.error(`Error deserializing user ID ${id}: ${error}`);
      done(error);
    }
  });

  // Auth routes
  // Registration with rate limiting and better validation
  const registrationLimiter = RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 registrations per hour
    message: 'Too many accounts created from this IP, please try again after an hour',
  });
  
  app.post("/api/auth/register", registrationLimiter, async (req, res, next) => {
    try {
      const { username, password, email, role, firstName, lastName } = req.body;

      // Enhanced input validation
      if (!username || !password || !email) {
        return res.status(400).json({ 
          message: "Username, password, and email are required" 
        });
      }

      // Email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ 
          message: "Invalid email format" 
        });
      }

      // Validate password strength
      if (!validatePasswordStrength(password)) {
        return res.status(400).json({
          message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
        });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email address already in use" });
      }

      const user = await storage.createUser({
        username,
        email,
        role: role || 'user', // Default role if not provided
        firstName: firstName || '',
        lastName: lastName || '',
        passwordHash: await hashPassword(password),
      });

      // Log successful registration
      logger.info(`New user registered: ${username}`);

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Set last activity for session timeout monitoring
        if (req.session) {
          req.session.lastActivity = Date.now();
        }
        
        res.status(201).json(user);
      });
    } catch (error) {
      logger.error(`Registration error: ${error}`);
      next(error);
    }
  });

  // Login with rate limiting
  app.post("/api/auth/login", loginRateLimiter, (req, res, next) => {
    // Get the client IP
    const clientIp = securityService.getClientIp(req);
    
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Record the failed login with the correct IP
        try {
          await securityService.recordLoginAttempt({
            username: req.body.username,
            ipAddress: clientIp,
            userAgent: req.headers['user-agent'] as string,
            success: false
          });
        } catch (logErr) {
          logger.error('Failed to log login attempt:', logErr);
        }
        
        return res.status(401).json({ message: info.message });
      }
      
      req.login(user, async (err) => {
        if (err) return next(err);
        
        try {
          // Record successful login with the correct IP
          await securityService.recordLoginAttempt({
            username: user.username,
            ipAddress: clientIp,
            userAgent: req.headers['user-agent'] as string,
            success: true
          });
          
          // Create security audit log
          await securityService.createAuditLog(
            user.id,
            'LOGIN',
            clientIp,
            {
              method: 'password',
              userAgent: req.headers['user-agent'] || 'unknown'
            },
            'LOW'
          );
        } catch (logErr) {
          logger.error('Failed to create login records:', logErr);
        }
        
        // Set last activity for session timeout monitoring
        if (req.session) {
          req.session.lastActivity = Date.now();
          req.session.lastIpAddress = clientIp;
        }
        
        // Set session expiration
        if (req.session) {
          req.session.cookie.maxAge = securityConfig.sessionMaxAge;
        }
        
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Google OAuth routes
  if (securityConfig.googleClientId && securityConfig.googleClientSecret) {
    app.get("/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        // Set last activity for session timeout monitoring
        if (req.session) {
          req.session.lastActivity = Date.now();
        }
        
        res.redirect("/dashboard");
      }
    );
  }

  // JWT token generation with expiration
  app.post("/api/auth/token", loginRateLimiter, (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          role: user.role
        }, 
        securityConfig.jwtSecret, 
        {
          expiresIn: "24h",
        }
      );

      logger.info(`JWT token generated for user: ${user.username}`);
      res.json({ token, expiresIn: 86400 }); // 24 hours in seconds
    })(req, res, next);
  });

  // Logout with session cleanup
  app.post("/api/auth/logout", (req, res, next) => {
    // Log the logout event
    if (req.user) {
      const user = req.user as SelectUser;
      logger.info(`User logged out: ${user.username}`);
      
      // Get the client IP
      const clientIp = securityService.getClientIp(req);
      
      // Clear login attempts for this user
      securityService.clearLoginAttempts(clientIp, user.username)
        .catch(err => logger.error(`Failed to clear login attempts for ${user.username}:`, err));
      
      // Create security audit log
      if (user.id) {
        securityService.createAuditLog(
          user.id,
          'LOGOUT',
          clientIp,
          {
            userAgent: req.headers['user-agent'] || 'unknown'
          },
          'LOW'
        ).catch(err => logger.error('Failed to create logout audit log:', err));
      }
    }
    
    req.logout((err) => {
      if (err) return next(err);
      
      // Destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          logger.error(`Error destroying session: ${err}`);
          return next(err);
        }
        
        // Clear the session cookie
        res.clearCookie('mentalhealthehr.sid');
        res.sendStatus(200);
      });
    });
  });

  // Current user endpoint with enhanced security
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Update last activity timestamp
    if (req.session) {
      req.session.lastActivity = Date.now();
    }
    
    // Send user data without sensitive information
    const user = req.user as SelectUser;
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    
    res.json(safeUser);
  });

  // Session expiration check endpoint
  app.get("/api/auth/session-status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ valid: false, message: "Not authenticated" });
    }
    
    // Check session expiration
    if (req.session && req.session.lastActivity) {
      const currentTime = Date.now();
      const lastActivity = req.session.lastActivity;
      const timeRemaining = securityConfig.sessionInactivityTimeout - (currentTime - lastActivity);
      
      if (timeRemaining <= 0) {
        return res.status(401).json({ 
          valid: false, 
          message: "Session expired due to inactivity" 
        });
      }
      
      // Update last activity timestamp
      req.session.lastActivity = currentTime;
      return res.json({ 
        valid: true, 
        timeRemaining,
        expiresAt: new Date(currentTime + timeRemaining).toISOString()
      });
    }
    
    res.json({ valid: true });
  });
}