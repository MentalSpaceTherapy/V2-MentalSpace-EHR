/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@shared/schema$': '<rootDir>/server/__tests__/mocks/schema.ts',
    '^express-rate-limit$': '<rootDir>/server/__tests__/mocks/express-rate-limit.js'
  },
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['./server/jest.setup.ts']
}; 