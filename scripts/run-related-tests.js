#!/usr/bin/env node

/**
 * This script analyzes Git changes and runs tests related to the modified files.
 * It's useful for running only the tests that might be affected by your changes.
 * 
 * Usage:
 * node scripts/run-related-tests.js
 * 
 * Options:
 * --all: Run all tests regardless of changes
 * --unit: Force run unit tests
 * --integration: Force run integration tests
 * --e2e: Force run e2e tests
 * --frontend: Force run frontend tests
 * --backend: Force run backend tests
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all'),
  unit: args.includes('--unit'),
  integration: args.includes('--integration'),
  e2e: args.includes('--e2e'),
  frontend: args.includes('--frontend'),
  backend: args.includes('--backend')
};

// Helper to run a command and return its output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return '';
  }
}

// Get changed files since last commit
function getChangedFiles() {
  const stagedFiles = runCommand('git diff --cached --name-only');
  const unstagedFiles = runCommand('git diff --name-only');
  const allChangedFiles = [...stagedFiles.split('\n'), ...unstagedFiles.split('\n')]
    .filter(file => file.trim() !== '');
  
  // Remove duplicates
  return [...new Set(allChangedFiles)];
}

// Check if we need to run specific tests based on changed files
function analyzeDependencies(changedFiles) {
  const result = {
    runUnitTests: options.unit,
    runIntegrationTests: options.integration,
    runE2ETests: options.e2e,
    runFrontendTests: options.frontend,
    runBackendTests: options.backend,
    affectedFiles: changedFiles
  };

  // If --all flag is used, run everything
  if (options.all) {
    return {
      ...result,
      runUnitTests: true,
      runIntegrationTests: true,
      runE2ETests: true,
      runFrontendTests: true,
      runBackendTests: true
    };
  }

  // Analyze each file to determine what tests to run
  changedFiles.forEach(file => {
    // Skip test files themselves
    if (file.includes('__tests__') && file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
      // If test file changed, run that specific type of test
      if (file.includes('.unit.test.')) result.runUnitTests = true;
      if (file.includes('.integration.test.')) result.runIntegrationTests = true;
      if (file.includes('.e2e.test.')) result.runE2ETests = true;
      
      // Run frontend or backend tests based on location
      if (file.startsWith('client/')) result.runFrontendTests = true;
      if (file.startsWith('server/')) result.runBackendTests = true;
      
      return;
    }

    // Package.json changes might affect dependencies
    if (file === 'package.json' || file === 'package-lock.json') {
      result.runUnitTests = true;
      return;
    }

    // Build config changes
    if (file.includes('tsconfig.json') || file.includes('vite.config.ts')) {
      result.runUnitTests = true;
      return;
    }

    // Jest config changes
    if (file.includes('jest.config') || file.includes('vitest.config')) {
      result.runUnitTests = true;
      result.runIntegrationTests = true;
      result.runE2ETests = true;
      return;
    }

    // Server changes
    if (file.startsWith('server/')) {
      result.runBackendTests = true;
      
      // API changes likely affect integration tests
      if (file.includes('routes/') || file.includes('controllers/')) {
        result.runIntegrationTests = true;
      }
      
      // Core server functionality might affect E2E tests
      if (file === 'server/index.ts' || file.includes('server/app.ts')) {
        result.runE2ETests = true;
      }
    }

    // Client changes
    if (file.startsWith('client/')) {
      result.runFrontendTests = true;
      
      // Component changes might affect E2E tests
      if (file.includes('components/') || file.includes('pages/')) {
        result.runE2ETests = true;
      }
    }
  });

  return result;
}

// Run the appropriate tests based on analysis
function runTests(testConfig) {
  console.log('\n=== Test Run Plan ===');
  console.log(`Changed files: ${testConfig.affectedFiles.length}`);
  console.log(`Run unit tests: ${testConfig.runUnitTests ? 'Yes' : 'No'}`);
  console.log(`Run integration tests: ${testConfig.runIntegrationTests ? 'Yes' : 'No'}`);
  console.log(`Run E2E tests: ${testConfig.runE2ETests ? 'Yes' : 'No'}`);
  console.log(`Run frontend tests: ${testConfig.runFrontendTests ? 'Yes' : 'No'}`);
  console.log(`Run backend tests: ${testConfig.runBackendTests ? 'Yes' : 'No'}`);
  console.log('=====================\n');

  // Get confirmation from user
  console.log('Press Enter to continue or Ctrl+C to cancel...');
  process.stdin.once('data', () => {
    console.log('\nRunning tests...\n');
    
    // Run the tests
    if (testConfig.runBackendTests) {
      if (testConfig.runUnitTests) {
        console.log('\n=== Running Backend Unit Tests ===\n');
        runCommand('npm run test:unit');
      }
      
      if (testConfig.runIntegrationTests) {
        console.log('\n=== Running Integration Tests ===\n');
        runCommand('npm run test:integration');
      }
    }
    
    if (testConfig.runFrontendTests) {
      console.log('\n=== Running Frontend Tests ===\n');
      runCommand('npm run test:frontend');
    }
    
    if (testConfig.runE2ETests) {
      console.log('\n=== Running E2E Tests ===\n');
      runCommand('npm run test:e2e');
    }
    
    console.log('\n=== Test Run Complete ===\n');
    process.exit(0);
  });
}

// Main execution
const changedFiles = getChangedFiles();
if (changedFiles.length === 0 && !options.all) {
  console.log('No changes detected. Use --all to run all tests anyway.');
  process.exit(0);
}

const testConfig = analyzeDependencies(changedFiles);
runTests(testConfig); 