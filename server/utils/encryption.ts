import crypto from 'crypto';
import { logger } from '../logger';

// Get encryption key from environment variable - this should be a 32-byte key (64 hex chars)
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // If key is a hex string, convert to Buffer
  if (key.length === 64 && /^[0-9a-f]+$/i.test(key)) {
    return Buffer.from(key, 'hex');
  }
  
  // If key is not in proper format, derive a key using PBKDF2
  logger.warn('ENCRYPTION_KEY is not in proper format (32-byte hex). Deriving key using PBKDF2.');
  const derivedKey = crypto.pbkdf2Sync(
    key, 
    'mental-space-ehr-salt', // This should ideally be an environment variable too
    10000, 
    32, 
    'sha256'
  );
  return derivedKey;
};

/**
 * Encrypt sensitive data
 * Uses AES-256-GCM which provides encryption and authentication
 * 
 * @param data String data to encrypt
 * @returns Object containing initialization vector, encrypted data, and auth tag
 */
export function encrypt(data: string): { iv: string; encryptedData: string; tag: string } {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher with key, iv
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag (ensures integrity)
    const tag = cipher.getAuthTag().toString('hex');
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      tag
    };
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * 
 * @param encryptedData The encrypted data in hex format
 * @param iv Initialization vector in hex format
 * @param tag Authentication tag in hex format
 * @returns Decrypted string
 */
export function decrypt(encryptedData: string, iv: string, tag: string): string {
  try {
    // Create decipher with key, iv
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      getEncryptionKey(), 
      Buffer.from(iv, 'hex')
    );
    
    // Set auth tag
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
  }
}

/**
 * Creates an encryption object to be stored in the database
 * 
 * @param data Sensitive data to encrypt
 * @returns JSON object with all encryption components
 */
export function encryptForStorage(data: string): string {
  const encrypted = encrypt(data);
  return JSON.stringify(encrypted);
}

/**
 * Decrypts data retrieved from database storage
 * 
 * @param storedData JSON string containing encryption components
 * @returns Decrypted string
 */
export function decryptFromStorage(storedData: string): string {
  try {
    const { iv, encryptedData, tag } = JSON.parse(storedData);
    return decrypt(encryptedData, iv, tag);
  } catch (error) {
    logger.error('Error decrypting from storage:', error);
    throw new Error('Failed to decrypt stored data');
  }
}

/**
 * Encrypts an object for storage by converting to JSON first
 * 
 * @param data Object to encrypt
 * @returns Encrypted string for storage
 */
export function encryptObject<T>(data: T): string {
  return encryptForStorage(JSON.stringify(data));
}

/**
 * Decrypts and parses a stored object
 * 
 * @param storedData Encrypted string from storage
 * @returns Decrypted object
 */
export function decryptObject<T>(storedData: string): T {
  try {
    const decrypted = decryptFromStorage(storedData);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    logger.error('Error decrypting object:', error);
    throw new Error('Failed to decrypt and parse object');
  }
}

/**
 * Hash sensitive data for non-reversible storage
 * Use this for data that doesn't need to be decrypted but should be searchable
 * 
 * @param data Data to hash
 * @returns Hashed string
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
} 