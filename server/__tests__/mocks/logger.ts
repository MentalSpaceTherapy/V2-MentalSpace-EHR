/**
 * Mock logger for tests
 */

export const logger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  security: jest.fn(),
  audit: {
    auth: jest.fn(),
    access: jest.fn()
  }
};

export default logger; 