/**
 * Mock for express-rate-limit
 * 
 * Provides a simple mock that passes all requests through without rate limiting
 */

// Simple middleware factory that passes through all requests
const rateLimit = (options) => {
  return (req, res, next) => {
    next();
  };
};

// Make it look like the real library
rateLimit.default = rateLimit;
rateLimit.MemoryStore = class MemoryStore {
  constructor(options) {
    this.options = options;
  }
  
  increment() { return true; }
  decrement() { return true; }
  resetKey() { return true; }
  resetAll() { return true; }
};

module.exports = rateLimit; 