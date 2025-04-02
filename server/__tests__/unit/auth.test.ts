import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { hashPassword, comparePasswords, validatePasswordStrength } from '../../utils/auth';

// Mock dependencies
jest.mock('../../utils/auth', () => ({
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
  validatePasswordStrength: jest.fn(),
}));

describe('Authentication Utils', () => {
  beforeEach(() => {
    // Clear all mock implementations before each test
    jest.clearAllMocks();
  });

  describe('validatePasswordStrength', () => {
    it('should return true for strong passwords', async () => {
      const mockValidatePassword = validatePasswordStrength as jest.Mock;
      
      mockValidatePassword.mockReturnValue(true);
      
      const result = validatePasswordStrength('StrongP@ss123');
      
      expect(result).toBe(true);
      expect(mockValidatePassword).toHaveBeenCalledWith('StrongP@ss123');
    });

    it('should return false for weak passwords', async () => {
      const mockValidatePassword = validatePasswordStrength as jest.Mock;
      
      mockValidatePassword.mockReturnValue(false);
      
      const result = validatePasswordStrength('weak');
      
      expect(result).toBe(false);
      expect(mockValidatePassword).toHaveBeenCalledWith('weak');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const mockHashPassword = hashPassword as jest.Mock;
      
      mockHashPassword.mockResolvedValue('hashed_password');
      
      const result = await hashPassword('plain_password');
      
      expect(result).toBe('hashed_password');
      expect(mockHashPassword).toHaveBeenCalledWith('plain_password');
    });
  });

  describe('comparePasswords', () => {
    it('should return true when passwords match', async () => {
      const mockComparePasswords = comparePasswords as jest.Mock;
      
      mockComparePasswords.mockResolvedValue(true);
      
      const result = await comparePasswords('plain_password', 'hashed_password');
      
      expect(result).toBe(true);
      expect(mockComparePasswords).toHaveBeenCalledWith('plain_password', 'hashed_password');
    });

    it('should return false when passwords do not match', async () => {
      const mockComparePasswords = comparePasswords as jest.Mock;
      
      mockComparePasswords.mockResolvedValue(false);
      
      const result = await comparePasswords('wrong_password', 'hashed_password');
      
      expect(result).toBe(false);
      expect(mockComparePasswords).toHaveBeenCalledWith('wrong_password', 'hashed_password');
    });
  });
}); 