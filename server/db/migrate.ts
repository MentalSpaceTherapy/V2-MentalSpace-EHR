import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration table name to track applied migrations
const MIGRATION_TABLE = 'schema_migrations';

// Interface for migration metadata
interface MigrationInfo {
  id: number;
  name: string;
  filename: string;
  applied: boolean;
  appliedAt?: Date;
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Ensure migration tracking table exists
    await ensureMigrationTableExists(pool);

    // Get available migrations
    const migrations = await getAvailableMigrations();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(pool);
    
    // Determine which migrations need to be applied
    const pendingMigrations = migrations.filter(migration => {
      return !appliedMigrations.some(appliedMigration => 
        appliedMigration.name === migration.name
      );
    });

    console.log(`Found ${migrations.length} total migrations, ${pendingMigrations.length} pending.`);

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to apply.');
      return;
    }

    // Apply pending migrations in order
    for (const migration of pendingMigrations) {
      console.log(`Applying migration: ${migration.name}`);
      const startTime = Date.now();
      
      // Read migration file
      const migrationPath = path.join(__dirname, 'migrations', migration.filename);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Apply the migration
        await client.query(sql);

        // Record the migration as applied
        await client.query(
          `INSERT INTO ${MIGRATION_TABLE} (name, applied_at) VALUES ($1, NOW())`,
          [migration.name]
        );

        await client.query('COMMIT');
        
        const duration = Date.now() - startTime;
        console.log(`✓ Applied migration: ${migration.name} (${duration}ms)`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${migration.name}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function ensureMigrationTableExists(pool: pkg.Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )
  `);
}

async function getAvailableMigrations(): Promise<MigrationInfo[]> {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure order
  
  return files.map((filename, index) => {
    const name = filename.replace(/\.sql$/, '');
    return {
      id: index + 1,
      name,
      filename,
      applied: false
    };
  });
}

async function getAppliedMigrations(pool: pkg.Pool): Promise<MigrationInfo[]> {
  const result = await pool.query(`
    SELECT id, name, applied_at 
    FROM ${MIGRATION_TABLE}
    ORDER BY id
  `);
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    filename: `${row.name}.sql`,
    applied: true,
    appliedAt: row.applied_at
  }));
}

async function createMigration(name: string) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const filename = `${timestamp}_${name}.sql`;
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const migrationPath = path.join(migrationsDir, filename);
  const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}
-- Description: 

-- Up migration
-- Add your SQL statements here

-- Examples:
-- CREATE TABLE example (id SERIAL PRIMARY KEY, name TEXT);
-- ALTER TABLE users ADD COLUMN new_field TEXT;
-- CREATE INDEX idx_example_name ON example(name);

`;

  fs.writeFileSync(migrationPath, template);
  console.log(`Created new migration: ${migrationPath}`);
}

function printUsage() {
  console.log(`
Usage:
  npm run migrate           - Apply all pending migrations
  npm run migrate:create    - Create a new migration file
  npm run migrate:status    - Show migration status
  
Example:
  npm run migrate:create -- add_user_sessions
  `);
}

// Handle different commands
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'up';
  
  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'create':
      if (!args[1]) {
        console.error('Error: Migration name is required');
        printUsage();
        process.exit(1);
      }
      await createMigration(args[1]);
      break;
    case 'status':
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      try {
        await ensureMigrationTableExists(pool);
        const available = await getAvailableMigrations();
        const applied = await getAppliedMigrations(pool);
        
        console.log('Migration Status:');
        console.log('=================');
        
        for (const migration of available) {
          const isApplied = applied.some(m => m.name === migration.name);
          const appliedMigration = applied.find(m => m.name === migration.name);
          const status = isApplied 
            ? `✓ Applied at ${appliedMigration?.appliedAt?.toISOString()}`
            : '✗ Pending';
          
          console.log(`[${migration.id}] ${migration.name}: ${status}`);
        }
      } finally {
        await pool.end();
      }
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Only run when called directly (not imported)
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { runMigrations, createMigration }; 