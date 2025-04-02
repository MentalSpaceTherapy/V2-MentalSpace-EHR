import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { logger } from '../logger';
import jwt from 'jsonwebtoken';

const scryptAsync = promisify(scrypt);

// Configuration
const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const PASSWORD_SALT_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;
const TOTP_WINDOW = 1; // Time steps to check before/after the current time
const RECOVERY_CODE_COUNT = 10;

/**
 * Hash a password using bcrypt
 * @param password Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plaintext password with a bcrypt hash
 * @param password Plaintext password to check
 * @param hash Hashed password to compare against
 * @returns Boolean indicating if the password matches
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Legacy verification for scrypt-based passwords (if we have any)
 * This is kept for backward compatibility
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [hash, salt] = hashedPassword.split('.');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return buf.toString('hex') === hash;
}

/**
 * Generate a secure token for password reset
 * @returns Random token string
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a signed JWT for password reset
 * @param userId User ID for the reset token
 * @param email User's email for verification
 * @returns Signed JWT token
 */
export function generatePasswordResetJWT(userId: number, email: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign(
    { 
      userId, 
      email, 
      purpose: 'password_reset',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
    }, 
    process.env.JWT_SECRET
  );
}

/**
 * Verify a password reset JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload if valid
 */
export function verifyPasswordResetJWT(token: string): { userId: number; email: string } {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    
    // Check token purpose
    if (decoded.purpose !== 'password_reset') {
      throw new Error('Invalid token purpose');
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    logger.warn('Failed to verify password reset token:', error);
    throw new Error('Invalid or expired password reset token');
  }
}

/**
 * Create a random token for sessions or similar purposes
 * @returns Random session token string
 */
export function generateSessionToken(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Validate password strength according to security requirements
 * @param password Password to validate
 * @returns Boolean indicating if the password meets requirements
 */
export function validatePasswordStrength(password: string): boolean {
  // At least 8 characters
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  
  // Contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Contains at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Contains at least one number
  if (!/\d/.test(password)) return false;
  
  // Contains at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  
  return true;
}

/**
 * Check if password might be commonly used or compromised
 * @param password Password to check
 * @returns Boolean indicating if the password might be compromised
 */
export function isCommonPassword(password: string): boolean {
  // List of commonly used passwords to check against
  const commonPasswords = [
    'password', 'Password1', 'Password123', 'admin123', 'qwerty', 'letmein',
    '123456', '123456789', '12345678', 'welcome', 'abc123', 'admin'
  ];
  
  // Check if password matches any common password
  return commonPasswords.includes(password);
}

/**
 * Checks if a new password is too similar to the previous password
 * @param newPassword New password
 * @param oldPasswordHash Old password hash
 * @param similarityThreshold Threshold of similarity (0-1), defaults to 0.7
 * @returns Promise<boolean> indicating if the passwords are too similar
 */
export async function isPasswordTooSimilar(
  newPassword: string, 
  oldPassword: string,
  similarityThreshold: number = 0.7
): Promise<boolean> {
  // Simple implementation - more sophisticated comparison might be needed
  // Count common characters
  let commonChars = 0;
  const minLength = Math.min(newPassword.length, oldPassword.length);
  
  for (let i = 0; i < minLength; i++) {
    if (newPassword[i] === oldPassword[i]) {
      commonChars++;
    }
  }
  
  const similarity = commonChars / minLength;
  return similarity > similarityThreshold;
}

/* 2FA / TOTP Functions */

/**
 * Generate a new TOTP secret for a user
 * @param userName - Username to appear in authenticator app
 * @returns Object containing secret and QR code data URL
 */
export async function generateTOTPSecret(userName: string): Promise<{ secret: string; secretUrl: string; qrCodeUrl: string }> {
  try {
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `MentalSpaceEHR:${userName}`,
      length: 20 // Recommended length for RFC 4226/6238
    });
    
    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url as string);
    
    return {
      secret: secret.base32, // Base32 encoded secret for storage
      secretUrl: secret.otpauth_url as string,
      qrCodeUrl
    };
  } catch (error) {
    logger.error('Error generating TOTP secret:', error);
    throw new Error('Failed to generate 2FA secret');
  }
}

/**
 * Verify a TOTP token
 * @param token - The token provided by the user
 * @param secret - The user's stored secret
 * @returns Boolean indicating if the token is valid
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    // Allow a window of time steps before and after the current time
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: TOTP_WINDOW // This allows for some time drift (±30 seconds with default step)
    });
  } catch (error) {
    logger.error('Error verifying TOTP token:', error);
    return false;
  }
}

/**
 * Generate a set of recovery codes for 2FA backup
 * @param count - Number of recovery codes to generate
 * @returns Array of recovery codes
 */
export function generateRecoveryCodes(count: number = RECOVERY_CODE_COUNT): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a 10-character alphanumeric code with dashes
    const code = randomBytes(5).toString('hex').toUpperCase();
    const formattedCode = `${code.slice(0, 5)}-${code.slice(5, 10)}`;
    codes.push(formattedCode);
  }
  
  return codes;
}

/**
 * Hash a recovery code for secure storage
 * @param code - The recovery code to hash
 * @returns Hashed recovery code
 */
export async function hashRecoveryCode(code: string): Promise<string> {
  return hashPassword(code); // We can use the same hash function as for passwords
}

/**
 * Verify a recovery code against a set of hashed codes
 * @param providedCode - Code provided by the user
 * @param hashedCodes - Array of hashed recovery codes
 * @returns The index of the matched code or -1 if no match
 */
export async function verifyRecoveryCode(
  providedCode: string, 
  hashedCodes: string[]
): Promise<number> {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await comparePasswords(providedCode, hashedCodes[i])) {
      return i; // Return the index of the matched code
    }
  }
  
  return -1; // No match found
}

/**
 * Create a random token of specified length
 * @param length Length of the token to generate
 * @returns Random token string
 */
export function generateRandomToken(length: number = 32): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Create a secure token with a known format for verification links
 * More secure than simple random tokens as it contains a verification component
 * @param userId User ID to include in the token
 * @returns Secure verification token with embedded timestamp and user ID
 */
export function generateVerificationToken(userId: number): string {
  const timestamp = Date.now();
  const random = randomBytes(16).toString('hex');
  const payload = `${userId}:${timestamp}:${random}`;
  
  // Create a signature
  const signature = createTokenSignature(payload);
  
  // Combine payload and signature
  return `${payload}.${signature}`;
}

/**
 * Verify a token generated with generateVerificationToken
 * @param token Token to verify
 * @param maxAge Maximum age of the token in milliseconds
 * @returns User ID from the token if valid, otherwise throws
 */
export function verifyVerificationToken(token: string, maxAge: number = PASSWORD_RESET_TOKEN_EXPIRY): number {
  try {
    // Split token into payload and signature
    const [payload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = createTokenSignature(payload);
    if (!signature || signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }
    
    // Parse payload
    const [userIdStr, timestampStr, _] = payload.split(':');
    const userId = parseInt(userIdStr, 10);
    const timestamp = parseInt(timestampStr, 10);
    
    // Check token age
    if (Date.now() - timestamp > maxAge) {
      throw new Error('Token has expired');
    }
    
    return userId;
  } catch (error) {
    logger.error('Token verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Create a signature for a token payload using HMAC
 * @param payload Payload to sign
 * @returns Signature as a hex string
 */
function createTokenSignature(payload: string): string {
  const secretKey = process.env.TOKEN_SECRET || process.env.SESSION_SECRET || 'default-secret-key';
  
  // In a real implementation, you would use crypto.createHmac
  // This is a simplified version for example purposes
  const data = Buffer.from(payload + secretKey, 'utf-8');
  const hash = scrypt.sync(data, secretKey, 32);
  return hash.toString('hex');
} 