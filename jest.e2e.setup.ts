import { beforeAll, afterAll } from '@jest/globals';
import { app, server } from './server/index';
import { dbHealthcheck } from './server/db';
import pkg from 'pg';
const { Pool } = pkg;

// Use test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://postgres:test@localhost:5432/mental_space_ehr_test';

let serverInstance: any;
// Create a pool specifically for tests that we can close later
const testPool = new Pool({ connectionString: process.env.DATABASE_URL });

beforeAll(async () => {
  // Check database connection
  const isHealthy = await dbHealthcheck();
  if (!isHealthy) {
    throw new Error('Cannot connect to test database');
  }
  
  // Start server
  serverInstance = server; // The server is already started in server/index.ts
  
  console.log(`E2E Test server running on port ${process.env.PORT}`);
});

afterAll(async () => {
  // Close server
  if (serverInstance) {
    await new Promise<void>((resolve) => {
      serverInstance.close(() => {
        resolve();
      });
    });
  }
  
  // Close test database pool
  await testPool.end();
  
  console.log('E2E Test server closed');
}); 