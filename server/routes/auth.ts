import express from 'express';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { hashPassword, verifyPassword, comparePasswords, validatePasswordStrength, generatePasswordResetToken, generateTOTPSecret, verifyTOTPToken, generateRecoveryCodes, hashRecoveryCode, verifyRecoveryCode } from '../utils/auth';
import { validateLogin, validateRegistration } from '../middleware/validation';
import passport from 'passport';
import { checkSchema, validationResult } from 'express-validator';
import { sendEmail } from '../services/email';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../logger';
import { isAuthenticated, hasRole, Role } from '../middleware/roleAccess';

// Extend Express.Session
declare module 'express-session' {
  interface Session {
    userId?: number;
    role?: string;
    twoFactorAuthenticated?: boolean;
    lastActivity?: number;
  }
}

const router = express.Router();

// Rate limiting for login and registration (disabled in test environment)
const authLimiter = process.env.NODE_ENV === 'test' 
  ? (req: express.Request, res: express.Response, next: express.NextFunction) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: 'Too many attempts, please try again later'
    });

// Rate limiters
const passwordResetLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 60, // per hour
});

const passwordResetSubmitLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 60, // per hour
});

router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      logger.audit.auth('login_failed', null, { 
        reason: 'missing_fields',
        ip: req.ip
      });
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      logger.audit.auth('login_failed', null, { 
        username,
        reason: 'invalid_username',
        ip: req.ip
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      logger.audit.auth('login_failed', user.id, { 
        username,
        reason: 'invalid_password',
        ip: req.ip
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    
    // Log successful login
    logger.audit.auth('login_success', user.id, {
      username: user.username,
      role: user.role,
      ip: req.ip,
      method: 'password'
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName || !role) {
      logger.audit.auth('registration_failed', null, {
        reason: 'missing_fields',
        ip: req.ip
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      logger.audit.auth('registration_failed', null, {
        username,
        reason: 'username_exists',
        ip: req.ip
      });
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      logger.audit.auth('registration_failed', null, {
        email,
        reason: 'email_exists',
        ip: req.ip
      });
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Validate password strength
    if (!validatePasswordStrength(password)) {
      logger.audit.auth('registration_failed', null, {
        username,
        reason: 'weak_password',
        ip: req.ip
      });
      return res.status(400).json({ message: 'Password does not meet strength requirements' });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      username,
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role
    });
    
    // Log successful registration
    logger.audit.auth('registration_success', user.id, {
      username: user.username,
      email: user.email,
      role: user.role,
      ip: req.ip
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  const userId = req.session.user?.id;
  const username = req.session.user?.username;
  
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    if (userId) {
      logger.audit.auth('logout', userId, {
        username,
        ip: req.ip
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.session.user);
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    // Rate limit check by IP
    try {
      await passwordResetLimiter.consume(req.ip);
    } catch (error) {
      logger.warn(`Too many password reset requests from IP: ${req.ip}`);
      logger.audit.auth('password_reset_request_rate_limited', null, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(429).json({
        message: 'Too many password reset requests. Please try again later.'
      });
    }

    const { email } = req.body;

    if (!email) {
      logger.audit.auth('password_reset_request_failed', null, {
        reason: 'missing_email',
        ip: req.ip
      });
      
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await storage.getUserByEmail(email);

    // Don't reveal if email exists or not for security (prevent enumeration)
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      logger.audit.auth('password_reset_request_nonexistent', null, {
        email,
        ip: req.ip
      });
      
      return res.status(200).json({
        message: 'If your email exists in our system, you will receive a password reset link shortly.'
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in the database
    await storage.createPasswordResetToken({
      userId: user.id,
      token: resetToken,
      expiresAt: resetTokenExpiration
    });

    // Generate reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email with reset link
    try {
      await sendEmail({
        to: email,
        subject: 'Reset your password',
        text: `You requested a password reset. Please click the link below to reset your password. This link is valid for 1 hour.\n\n${resetUrl}`,
        html: `
          <p>You requested a password reset.</p>
          <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
        `
      });

      logger.info(`Password reset email sent to: ${email}`);
      logger.audit.auth('password_reset_email_sent', user.id, {
        username: user.username,
        email: user.email,
        ip: req.ip,
        tokenExpiresAt: resetTokenExpiration
      });
    } catch (emailError) {
      logger.error(`Failed to send password reset email: ${emailError}`);
      logger.audit.auth('password_reset_email_failed', user.id, {
        username: user.username,
        email: user.email,
        ip: req.ip,
        error: emailError.message
      });
      
      return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }

    res.status(200).json({
      message: 'If your email exists in our system, you will receive a password reset link shortly.'
    });
  } catch (error) {
    logger.error(`Password reset request error: ${error}`);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

// Verify token validity (without resetting password)
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      logger.audit.auth('password_reset_token_verification_failed', null, {
        reason: 'missing_token',
        ip: req.ip
      });
      
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Find token in database
    const resetToken = await storage.getPasswordResetToken(token);

    if (!resetToken) {
      logger.audit.auth('password_reset_token_verification_failed', null, {
        reason: 'invalid_token',
        ip: req.ip,
        token: token.substring(0, 8) + '...' // Only log a portion of the token for security
      });
      
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      await storage.deletePasswordResetToken(token);
      
      logger.audit.auth('password_reset_token_verification_failed', resetToken.userId, {
        reason: 'expired_token',
        ip: req.ip,
        token: token.substring(0, 8) + '...' // Only log a portion of the token for security
      });
      
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    // Token is valid
    logger.audit.auth('password_reset_token_verification_success', resetToken.userId, {
      ip: req.ip,
      token: token.substring(0, 8) + '...' // Only log a portion of the token for security
    });
    
    res.status(200).json({ message: 'Token is valid', userId: resetToken.userId });
  } catch (error) {
    logger.error(`Password reset token verification error: ${error}`);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

// Reset password with token
router.post('/reset-password', 
  checkSchema({
    token: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Reset token is required'
      }
    },
    password: {
      in: ['body'],
      isLength: {
        options: { min: 8 },
        errorMessage: 'Password must be at least 8 characters long'
      },
      custom: {
        options: (value) => {
          if (!validatePasswordStrength(value)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
          }
          return true;
        }
      }
    },
    confirmPassword: {
      in: ['body'],
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords do not match');
          }
          return true;
        }
      }
    }
  }),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.audit.auth('password_reset_failed', null, {
          reason: 'validation_errors',
          errors: errors.array(),
          ip: req.ip
        });
        
        return res.status(400).json({ errors: errors.array() });
      }

      // Rate limit check by IP
      try {
        await passwordResetSubmitLimiter.consume(req.ip);
      } catch (error) {
        logger.warn(`Too many password reset submissions from IP: ${req.ip}`);
        logger.audit.auth('password_reset_rate_limited', null, {
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
        
        return res.status(429).json({
          message: 'Too many password reset attempts. Please try again later.'
        });
      }

      const { token, password } = req.body;

      // Find token in database
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        logger.audit.auth('password_reset_failed', null, {
          reason: 'invalid_token',
          ip: req.ip,
          token: token.substring(0, 8) + '...' // Only log a portion of the token for security
        });
        
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        
        logger.audit.auth('password_reset_failed', resetToken.userId, {
          reason: 'expired_token',
          ip: req.ip,
          token: token.substring(0, 8) + '...' // Only log a portion of the token for security
        });
        
        return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);

      // Get user details before updating password
      const user = await storage.getUser(resetToken.userId);

      // Update user's password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);

      // Delete the used token
      await storage.deletePasswordResetToken(token);

      logger.info(`Password reset completed for user ID: ${resetToken.userId}`);
      logger.audit.auth('password_reset_success', resetToken.userId, {
        username: user?.username,
        ip: req.ip
      });

      res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
      logger.error(`Password reset error: ${error}`);
      res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
  }
);

// Change password (while logged in)
router.post('/change-password',
  isAuthenticated,
  checkSchema({
    currentPassword: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Current password is required'
      }
    },
    newPassword: {
      in: ['body'],
      isLength: {
        options: { min: 8 },
        errorMessage: 'New password must be at least 8 characters long'
      },
      custom: {
        options: (value) => {
          if (!validatePasswordStrength(value)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
          }
          return true;
        }
      }
    },
    confirmPassword: {
      in: ['body'],
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('Passwords do not match');
          }
          return true;
        }
      }
    }
  }),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.audit.auth('password_change_failed', req.user?.id || null, {
          reason: 'validation_errors',
          errors: errors.array(),
          ip: req.ip
        });
        
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get user to verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        logger.audit.auth('password_change_failed', userId, {
          reason: 'user_not_found',
          ip: req.ip
        });
        
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValid = await storage.verifyUserPassword(userId, currentPassword);
      if (!isValid) {
        logger.warn(`Failed password change attempt - incorrect current password - User ID: ${userId}`);
        logger.audit.auth('password_change_failed', userId, {
          username: user.username,
          reason: 'incorrect_current_password',
          ip: req.ip
        });
        
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Check if new password is same as old password
      if (currentPassword === newPassword) {
        logger.audit.auth('password_change_failed', userId, {
          username: user.username,
          reason: 'same_password',
          ip: req.ip
        });
        
        return res.status(400).json({ message: 'New password must be different from current password' });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user's password
      await storage.updateUserPassword(userId, hashedPassword);

      logger.info(`Password changed successfully for user ID: ${userId}`);
      logger.audit.auth('password_change_success', userId, {
        username: user.username,
        ip: req.ip
      });

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error(`Password change error: ${error}`);
      res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
  }
);

// Setup 2FA
router.post('/2fa/setup',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if 2FA is already enabled
      const existingAuth = await storage.getTwoFactorAuth(userId);
      if (existingAuth && existingAuth.enabled) {
        return res.status(400).json({ message: '2FA is already enabled for this account' });
      }
      
      // Generate new TOTP secret
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { secret, secretUrl, qrCodeUrl } = await generateTOTPSecret(user.username);
      
      // Generate recovery codes
      const recoveryCodes = generateRecoveryCodes(10);
      
      // Hash recovery codes for secure storage
      const hashedCodes = await Promise.all(
        recoveryCodes.map(code => hashRecoveryCode(code))
      );
      
      // Store 2FA data (not enabled yet)
      await storage.enableTwoFactorAuth({
        userId,
        secret,
        enabled: false, // Not enabled until verified
        recoveryCodes: hashedCodes
      });
      
      // Return setup data
      res.json({
        secret,
        secretUrl,
        qrCodeUrl,
        recoveryCodes, // Send plain text recovery codes to user once
      });
    } catch (error) {
      logger.error(`2FA setup error: ${error}`);
      res.status(500).json({ message: 'Failed to set up 2FA. Please try again later.' });
    }
  }
);

// Verify and enable 2FA
router.post('/2fa/verify',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;
      
      if (!token) {
        return res.status(400).json({ message: 'Verification code is required' });
      }
      
      // Get 2FA setup
      const twoFactorAuth = await storage.getTwoFactorAuth(userId);
      if (!twoFactorAuth) {
        return res.status(400).json({ message: '2FA has not been set up for this account' });
      }
      
      // Verify token
      const isValid = verifyTOTPToken(token, twoFactorAuth.secret);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      
      // Enable 2FA
      await storage.enableTwoFactorAuth({
        ...twoFactorAuth,
        enabled: true
      });
      
      // Log successful 2FA setup
      logger.info(`2FA enabled for user ID: ${userId}`);
      
      res.json({ message: '2FA has been successfully enabled' });
    } catch (error) {
      logger.error(`2FA verification error: ${error}`);
      res.status(500).json({ message: 'Failed to verify 2FA. Please try again later.' });
    }
  }
);

// Disable 2FA
router.post('/2fa/disable',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const userId = req.user.id;
      
      // Verify current password
      const isPasswordValid = await storage.verifyUserPassword(userId, password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Get 2FA setup
      const twoFactorAuth = await storage.getTwoFactorAuth(userId);
      if (!twoFactorAuth || !twoFactorAuth.enabled) {
        return res.status(400).json({ message: '2FA is not enabled for this account' });
      }
      
      // Verify token
      const isValid = verifyTOTPToken(token, twoFactorAuth.secret);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      
      // Disable 2FA
      await storage.disableTwoFactorAuth(userId);
      
      // Log 2FA disabling
      logger.info(`2FA disabled for user ID: ${userId}`);
      
      res.json({ message: '2FA has been successfully disabled' });
    } catch (error) {
      logger.error(`2FA disable error: ${error}`);
      res.status(500).json({ message: 'Failed to disable 2FA. Please try again later.' });
    }
  }
);

// Authenticate with 2FA
router.post('/2fa/authenticate',
  async (req, res, next) => {
    try {
      const { username, password, token } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // First, check username and password
      const user = await storage.getUserByUsername(username);
      if (!user || !(await storage.verifyUserPassword(user.id, password))) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Check if 2FA is enabled for this user
      const twoFactorAuth = await storage.getTwoFactorAuth(user.id);
      
      if (!twoFactorAuth || !twoFactorAuth.enabled) {
        // 2FA not enabled, authenticate normally
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Set session data
          if (req.session) {
            req.session.lastActivity = Date.now();
          }
          
          res.json({ 
            user,
            requires2FA: false
          });
        });
        return;
      }
      
      // If 2FA is enabled but no token provided, ask for it
      if (!token) {
        return res.status(200).json({ 
          message: '2FA verification required',
          requires2FA: true,
          userId: user.id
        });
      }
      
      // Verify TOTP token
      const isValid = verifyTOTPToken(token, twoFactorAuth.secret);
      
      if (!isValid) {
        return res.status(401).json({ 
          message: 'Invalid verification code',
          requires2FA: true
        });
      }
      
      // Authentication successful
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Set session data
        if (req.session) {
          req.session.lastActivity = Date.now();
          req.session.twoFactorAuthenticated = true;
        }
        
        logger.info(`User authenticated with 2FA: ${username}`);
        res.json({ 
          user,
          requires2FA: false
        });
      });
    } catch (error) {
      logger.error(`2FA authentication error: ${error}`);
      res.status(500).json({ message: 'An error occurred during authentication' });
    }
  }
);

// Use recovery code
router.post('/2fa/recovery',
  async (req, res, next) => {
    try {
      const { username, password, recoveryCode } = req.body;
      
      if (!username || !password || !recoveryCode) {
        return res.status(400).json({ 
          message: 'Username, password, and recovery code are required' 
        });
      }
      
      // First, check username and password
      const user = await storage.getUserByUsername(username);
      if (!user || !(await storage.verifyUserPassword(user.id, password))) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Check if 2FA is enabled for this user
      const twoFactorAuth = await storage.getTwoFactorAuth(user.id);
      
      if (!twoFactorAuth || !twoFactorAuth.enabled) {
        return res.status(400).json({ message: '2FA is not enabled for this account' });
      }
      
      // Verify recovery code
      const codeIndex = await verifyRecoveryCode(recoveryCode, twoFactorAuth.recoveryCodes);
      
      if (codeIndex === -1) {
        return res.status(401).json({ message: 'Invalid recovery code' });
      }
      
      // Mark recovery code as used
      await storage.consumeRecoveryCode(user.id, codeIndex);
      
      // Authentication successful
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Set session data
        if (req.session) {
          req.session.lastActivity = Date.now();
          req.session.twoFactorAuthenticated = true;
        }
        
        logger.info(`User authenticated with recovery code: ${username}`);
        res.json({ 
          user,
          requires2FA: false,
          recoveryCodesRemaining: twoFactorAuth.recoveryCodes.length - 1
        });
      });
    } catch (error) {
      logger.error(`Recovery code authentication error: ${error}`);
      res.status(500).json({ message: 'An error occurred during recovery code authentication' });
    }
  }
);

// Generate new recovery codes
router.post('/2fa/recovery-codes',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;
      
      // Get 2FA setup
      const twoFactorAuth = await storage.getTwoFactorAuth(userId);
      if (!twoFactorAuth || !twoFactorAuth.enabled) {
        return res.status(400).json({ message: '2FA is not enabled for this account' });
      }
      
      // Verify token
      const isValid = verifyTOTPToken(token, twoFactorAuth.secret);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      
      // Generate new recovery codes
      const recoveryCodes = generateRecoveryCodes(10);
      
      // Hash recovery codes for secure storage
      const hashedCodes = await Promise.all(
        recoveryCodes.map(code => hashRecoveryCode(code))
      );
      
      // Update recovery codes
      await storage.updateTwoFactorRecoveryCodes(userId, hashedCodes);
      
      // Log recovery codes regeneration
      logger.info(`Recovery codes regenerated for user ID: ${userId}`);
      
      res.json({
        recoveryCodes,
        message: 'New recovery codes generated successfully'
      });
    } catch (error) {
      logger.error(`Recovery codes generation error: ${error}`);
      res.status(500).json({ message: 'Failed to generate new recovery codes. Please try again later.' });
    }
  }
);

export default router; 