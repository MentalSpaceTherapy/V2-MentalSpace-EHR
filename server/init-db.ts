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

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if we should use the refined schema
    const refinedSchemaPath = path.join(__dirname, 'db', 'schema-refined.sql');
    const standardSchemaPath = path.join(__dirname, 'schema.sql');
    
    let schemaPath;
    if (fs.existsSync(refinedSchemaPath)) {
      schemaPath = refinedSchemaPath;
      console.log('Using refined schema with improved constraints and relationships');
    } else {
      schemaPath = standardSchemaPath;
      console.log('Using standard schema (refined schema not found)');
    }
    
    // Read the schema file
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');

    // Read and execute the schema indexes file
    const indexesPath = path.join(__dirname, 'db', 'schema-indexes.sql');
    if (fs.existsSync(indexesPath)) {
      const indexes = fs.readFileSync(indexesPath, 'utf8');
      await pool.query(indexes);
      console.log('Database indexes created successfully');
    } else {
      console.warn('Schema indexes file not found at path:', indexesPath);
    }

    // Add some initial data if needed
    await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role)
      VALUES ('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'administrator')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('Initial data inserted successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
initDatabase().catch(console.error); 