#!/usr/bin/env tsx

/**
 * Database Demo Runner
 * This script demonstrates the database migrations and seed functionality
 */

import { runMigrations, createMigration } from './migrate';
import { seed, createInitialSchemaMigration } from './seed';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import readline from 'readline';
import { blue, green, red, yellow, cyan, bold } from '../utils/console-colors';

// Load environment variables
dotenv.config();

// Create a readline interface for interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function prompt(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Print a header with the script name
console.log(bold(blue('\n=== MentalSpace EHR Database Demo Runner ===\n')));

// Define the main function
async function main() {
  try {
    console.log(cyan('This script demonstrates the database migration and seeding functionality.'));
    console.log(cyan('It will guide you through various options to manage your database.\n'));
    
    while (true) {
      console.log(bold('Available Actions:'));
      console.log('1. Initialize Schema (Reset Database)');
      console.log('2. Apply Pending Migrations');
      console.log('3. Seed Database with Sample Data');
      console.log('4. Check Migration Status');
      console.log('5. Create a New Migration');
      console.log('6. Complete Database Reset and Setup (1+2+3)');
      console.log('0. Exit\n');
      
      const choice = await prompt(bold('Enter your choice (0-6): '));
      
      switch (choice) {
        case '1':
          console.log(yellow('\nInitializing database schema...'));
          execSync('npm run init-db', { stdio: 'inherit' });
          console.log(green('Database schema initialized successfully.\n'));
          break;
          
        case '2':
          console.log(yellow('\nApplying pending migrations...'));
          await runMigrations();
          console.log(green('Migrations applied successfully.\n'));
          break;
          
        case '3':
          console.log(yellow('\nSeeding database with sample data...'));
          await seed();
          console.log(green('Database seeded successfully.\n'));
          break;
          
        case '4':
          console.log(yellow('\nChecking migration status...'));
          execSync('npm run db:migrate:status', { stdio: 'inherit' });
          break;
          
        case '5':
          const migrationName = await prompt(bold('Enter migration name (e.g., add_user_roles): '));
          console.log(yellow(`\nCreating new migration: ${migrationName}...`));
          await createMigration(migrationName);
          console.log(green('Migration created successfully.\n'));
          break;
          
        case '6':
          console.log(yellow('\nPerforming complete database reset and setup...'));
          
          console.log(cyan('Step 1: Initializing database schema...'));
          execSync('npm run init-db', { stdio: 'inherit' });
          
          console.log(cyan('Step 2: Applying pending migrations...'));
          await runMigrations();
          
          console.log(cyan('Step 3: Seeding database with sample data...'));
          await seed();
          
          console.log(green('Complete database setup successful!\n'));
          break;
          
        case '0':
          console.log(blue('\nExiting. Goodbye!\n'));
          rl.close();
          return;
          
        default:
          console.log(red('Invalid choice. Please try again.\n'));
      }
    }
  } catch (error) {
    console.error(red('Error:'), error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(red('Unhandled error:'), error);
  process.exit(1);
}); 