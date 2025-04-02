import { logger } from '../logger';

/**
 * Utilities for securely handling sensitive data in memory
 * Helps prevent sensitive information from lingering in memory
 */

/**
 * Securely wipe a buffer by overwriting its contents
 * @param buffer Buffer to wipe
 */
export function wipeBuffer(buffer: Buffer): void {
  if (!buffer || !buffer.length) return;
  
  try {
    // First pass: overwrite with 0s
    buffer.fill(0);
    
    // Second pass: overwrite with 1s (0xFF)
    buffer.fill(0xFF);
    
    // Final pass: overwrite with 0s again
    buffer.fill(0);
  } catch (error) {
    logger.error('Error wiping buffer:', error);
  }
}

/**
 * Class for storing sensitive strings with secure wiping
 */
export class SecureString {
  private _buffer: Buffer | null;
  
  constructor(value: string) {
    // Convert string to buffer to have more control over memory
    this._buffer = Buffer.from(value, 'utf8');
  }
  
  /**
   * Get the string value (use with caution)
   */
  getValue(): string {
    if (!this._buffer) {
      throw new Error('SecureString has been disposed');
    }
    return this._buffer.toString('utf8');
  }
  
  /**
   * Use the value with a callback, then optionally wipe after use
   * @param callback Function that uses the sensitive string
   * @param wipeAfterUse Whether to wipe the string after use
   */
  use<T>(callback: (value: string) => T, wipeAfterUse = false): T {
    if (!this._buffer) {
      throw new Error('SecureString has been disposed');
    }
    
    try {
      const value = this._buffer.toString('utf8');
      const result = callback(value);
      return result;
    } finally {
      if (wipeAfterUse) {
        this.dispose();
      }
    }
  }
  
  /**
   * Securely dispose of the string by wiping the internal buffer
   */
  dispose(): void {
    if (this._buffer) {
      wipeBuffer(this._buffer);
      this._buffer = null;
    }
  }
}

/**
 * Wipe sensitive data from objects by recursively overwriting properties
 * @param obj Object containing sensitive data
 * @param properties Array of property names to wipe (or '*' for all)
 */
export function wipeObjectProperties(obj: Record<string, any>, properties: string[] | '*'): void {
  if (!obj) return;
  
  try {
    const allProperties = properties === '*';
    
    // Helper function to determine if a property should be wiped
    const shouldWipe = (prop: string): boolean => {
      return allProperties || (Array.isArray(properties) && properties.includes(prop));
    };
    
    // Recursively wipe object properties
    const wipeRecursive = (current: Record<string, any>, path: string = ''): void => {
      if (!current || typeof current !== 'object') return;
      
      Object.keys(current).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        const value = current[key];
        
        if (shouldWipe(key) || shouldWipe(fullPath)) {
          // Handle different types of sensitive data
          if (typeof value === 'string') {
            // Overwrite strings with empty string
            current[key] = '';
          } else if (Buffer.isBuffer(value)) {
            // Wipe buffers
            wipeBuffer(value);
          } else if (Array.isArray(value)) {
            // Clear arrays
            current[key] = [];
          } else if (value && typeof value === 'object') {
            // Clear objects
            Object.keys(value).forEach(k => {
              delete value[k];
            });
          } else if (typeof value === 'number') {
            // Reset numbers to 0
            current[key] = 0;
          } else if (typeof value === 'boolean') {
            // Reset booleans to false
            current[key] = false;
          }
        } else if (value && typeof value === 'object') {
          // Recurse into nested objects
          wipeRecursive(value, fullPath);
        }
      });
    };
    
    wipeRecursive(obj);
  } catch (error) {
    logger.error('Error wiping object properties:', error);
  }
}

/**
 * Create a function that securely processes sensitive data and wipes it after use
 * @param processor Function that processes sensitive data
 * @returns Function that securely processes sensitive data
 */
export function createSecureProcessor<T, R>(
  processor: (data: T) => R
): (data: T, wipe?: boolean) => R {
  return (data: T, wipe = true): R => {
    try {
      // Process the data
      const result = processor(data);
      return result;
    } finally {
      // Wipe the data if requested
      if (wipe && data && typeof data === 'object') {
        wipeObjectProperties(data as any, '*');
      }
    }
  };
} 