import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    // Add lastActivity timestamp for session timeout tracking
    lastActivity?: number;
    // Track login attempts for rate limiting
    loginAttempts?: number;
    // Track last password change for password expiration
    lastPasswordChange?: number;
    // Track last IP address for security monitoring
    lastIpAddress?: string;
    // Track if 2FA has been completed for this session
    twoFactorAuthenticated?: boolean;
  }
}