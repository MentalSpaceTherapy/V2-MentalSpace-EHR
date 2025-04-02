import pkg from 'pg';
const { Pool } = pkg;
import { hashPassword } from '../utils/auth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main seed function
async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Seeding database with development data...');
    
    // Create seed data in transactions to ensure data consistency
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Seed users with different roles
      const adminPassword = await hashPassword('Admin123!');
      const clinicianPassword = await hashPassword('Clinician123!');
      const internPassword = await hashPassword('Intern123!');
      const billerPassword = await hashPassword('Biller123!');
      
      // Clear existing test data in reverse order of dependencies
      await client.query(`
        DELETE FROM event_registrations WHERE email LIKE '%example.com';
        DELETE FROM signature_fields;
        DELETE FROM signature_events;
        DELETE FROM signature_requests;
        DELETE FROM contact_history;
        DELETE FROM messages;
        DELETE FROM documentation;
        DELETE FROM sessions;
        DELETE FROM marketing_events WHERE name LIKE 'Demo%';
        DELETE FROM leads WHERE email LIKE '%example.com';
        DELETE FROM clients WHERE email LIKE '%example.com';
        DELETE FROM users WHERE username LIKE 'demo_%' OR email LIKE '%example.com';
      `);
      
      // Insert users
      const usersResult = await client.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, role, created_at)
        VALUES 
          ('demo_admin', 'admin@example.com', $1, 'Admin', 'User', 'administrator', NOW() - INTERVAL '30 days'),
          ('demo_clinician', 'clinician@example.com', $2, 'Doctor', 'Smith', 'clinician', NOW() - INTERVAL '28 days'),
          ('demo_supervisor', 'supervisor@example.com', $2, 'Sarah', 'Johnson', 'supervisor', NOW() - INTERVAL '28 days'),
          ('demo_intern', 'intern@example.com', $3, 'Intern', 'Jones', 'intern', NOW() - INTERVAL '14 days'),
          ('demo_biller', 'biller@example.com', $4, 'Finance', 'Officer', 'biller', NOW() - INTERVAL '25 days'),
          ('demo_practice_admin', 'practice@example.com', $1, 'Practice', 'Manager', 'practice_administrator', NOW() - INTERVAL '30 days'),
          ('demo_scheduler', 'scheduler@example.com', $3, 'Schedule', 'Coordinator', 'scheduler', NOW() - INTERVAL '21 days'),
          ('demo_admin_clinician', 'admin_clinician@example.com', $2, 'Chief', 'Practitioner', 'admin_clinician', NOW() - INTERVAL '29 days')
        RETURNING id, username, role;
      `, [adminPassword, clinicianPassword, internPassword, billerPassword]);
      
      console.log(`Created ${usersResult.rowCount} demo users`);
      
      // Get user IDs for reference in other tables
      const adminUserId = usersResult.rows.find(u => u.username === 'demo_admin')?.id;
      const clinicianUserId = usersResult.rows.find(u => u.username === 'demo_clinician')?.id;
      const supervisorId = usersResult.rows.find(u => u.username === 'demo_supervisor')?.id;
      const internUserId = usersResult.rows.find(u => u.username === 'demo_intern')?.id;
      
      // Seed referral sources
      await client.query(`
        INSERT INTO referral_sources (name, type, active_status, created_by_id)
        VALUES 
          ('Psychology Today', 'Online Directory', 'active', $1),
          ('Local Hospital', 'Healthcare Provider', 'active', $1),
          ('Community Center', 'Community Organization', 'active', $1),
          ('Client Referral', 'Client', 'active', $1),
          ('School District', 'Educational', 'active', $1)
        RETURNING id;
      `, [adminUserId]);
      
      // Seed marketing campaign
      const campaignsResult = await client.query(`
        INSERT INTO marketing_campaigns (name, type, status, created_by_id, start_date, end_date)
        VALUES 
          ('Summer Wellness 2023', 'Email', 'completed', $1, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days'),
          ('Fall Mental Health Awareness', 'Multi-channel', 'active', $1, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
          ('New Client Welcome', 'Email', 'active', $1, NOW() - INTERVAL '120 days', NULL)
        RETURNING id;
      `, [adminUserId]);
      
      const campaignIds = campaignsResult.rows.map(row => row.id);
      
      // Seed clients
      const clientsResult = await client.query(`
        INSERT INTO clients (
          first_name, last_name, email, phone, primary_therapist_id, status, date_of_birth, 
          address, city, state, zip_code, created_at,
          gender, insurance_provider, insurance_policy_number
        )
        VALUES 
          ('John', 'Doe', 'john.doe@example.com', '555-123-4567', $1, 'active', '1985-05-15', 
           '123 Main St', 'Springfield', 'IL', '62701', NOW() - INTERVAL '60 days',
           'Male', 'Blue Cross', 'BC12345678'),
          ('Jane', 'Smith', 'jane.smith@example.com', '555-765-4321', $1, 'active', '1990-08-20', 
           '456 Oak Ave', 'Springfield', 'IL', '62704', NOW() - INTERVAL '45 days',
           'Female', 'Aetna', 'AE87654321'),
          ('Michael', 'Johnson', 'michael.j@example.com', '555-222-3333', $2, 'active', '1978-11-30', 
           '789 Pine Blvd', 'Springfield', 'IL', '62702', NOW() - INTERVAL '30 days',
           'Male', 'UnitedHealth', 'UH55443322'),
          ('Emily', 'Williams', 'emily.w@example.com', '555-444-5555', $2, 'active', '1995-02-10', 
           '101 Cedar Ln', 'Springfield', 'IL', '62703', NOW() - INTERVAL '21 days',
           'Female', 'Cigna', 'CI99887766'),
          ('Robert', 'Brown', 'robert.b@example.com', '555-666-7777', $1, 'inactive', '1982-07-25', 
           '202 Maple Dr', 'Springfield', 'IL', '62704', NOW() - INTERVAL '90 days',
           'Male', 'Medicare', 'MC11223344')
        RETURNING id, first_name, last_name;
      `, [clinicianUserId, supervisorId]);
      
      console.log(`Created ${clientsResult.rowCount} demo clients`);
      
      const clientIds = clientsResult.rows.map(row => row.id);
      
      // Seed sessions/appointments
      await client.query(`
        INSERT INTO sessions (
          client_id, therapist_id, start_time, end_time, 
          session_type, medium, status, notes
        )
        VALUES 
          -- Past sessions
          ($1, $6, NOW() - INTERVAL '30 days' + TIME '10:00', NOW() - INTERVAL '30 days' + TIME '11:00', 
           'Individual', 'telehealth', 'completed', 'Initial assessment completed. Client reporting moderate anxiety.'),
          ($1, $6, NOW() - INTERVAL '23 days' + TIME '10:00', NOW() - INTERVAL '23 days' + TIME '11:00', 
           'Individual', 'telehealth', 'completed', 'Continued discussion of anxiety management techniques.'),
          ($1, $6, NOW() - INTERVAL '16 days' + TIME '10:00', NOW() - INTERVAL '16 days' + TIME '11:00', 
           'Individual', 'telehealth', 'completed', 'Client reports improved sleep after implementing suggested techniques.'),
          ($1, $6, NOW() - INTERVAL '9 days' + TIME '10:00', NOW() - INTERVAL '9 days' + TIME '11:00', 
           'Individual', 'telehealth', 'completed', 'Significant progress with anxiety symptoms.'),
          
          -- For other clients with different clinicians
          ($2, $6, NOW() - INTERVAL '28 days' + TIME '14:00', NOW() - INTERVAL '28 days' + TIME '15:00', 
           'Individual', 'in_person', 'completed', 'Initial consultation with focus on depression symptoms.'),
          ($2, $6, NOW() - INTERVAL '21 days' + TIME '14:00', NOW() - INTERVAL '21 days' + TIME '15:00', 
           'Individual', 'in_person', 'completed', 'Discussed potential CBT approaches.'),
          ($3, $7, NOW() - INTERVAL '25 days' + TIME '11:00', NOW() - INTERVAL '25 days' + TIME '12:00', 
           'Individual', 'telehealth', 'completed', 'First session on stress management.'),
          ($4, $7, NOW() - INTERVAL '20 days' + TIME '13:00', NOW() - INTERVAL '20 days' + TIME '14:00', 
           'Individual', 'telehealth', 'completed', 'Intake assessment for new client.'),
          ($3, $7, NOW() - INTERVAL '18 days' + TIME '11:00', NOW() - INTERVAL '18 days' + TIME '12:00', 
           'Individual', 'telehealth', 'completed', 'Follow-up on stress reduction techniques.'),
          
          -- Intern-led sessions with supervision
          ($2, $8, NOW() - INTERVAL '14 days' + TIME '15:00', NOW() - INTERVAL '14 days' + TIME '16:00', 
           'Individual', 'in_person', 'completed', 'Session conducted by intern with supervisor review.'),
          ($4, $8, NOW() - INTERVAL '10 days' + TIME '16:00', NOW() - INTERVAL '10 days' + TIME '17:00', 
           'Individual', 'telehealth', 'completed', 'Client reporting good progress with coping strategies.'),
          
          -- Future sessions
          ($1, $6, NOW() + INTERVAL '1 days' + TIME '10:00', NOW() + INTERVAL '1 days' + TIME '11:00', 
           'Individual', 'telehealth', 'scheduled', 'Follow-up session'),
          ($2, $6, NOW() + INTERVAL '2 days' + TIME '14:00', NOW() + INTERVAL '2 days' + TIME '15:00', 
           'Individual', 'in_person', 'scheduled', 'Follow-up session'),
          ($3, $7, NOW() + INTERVAL '3 days' + TIME '11:00', NOW() + INTERVAL '3 days' + TIME '12:00', 
           'Individual', 'telehealth', 'scheduled', 'Progress evaluation'),
          ($4, $8, NOW() + INTERVAL '4 days' + TIME '13:00', NOW() + INTERVAL '4 days' + TIME '14:00', 
           'Individual', 'telehealth', 'scheduled', 'Continued therapy with intern'),
          
          -- Session with no-show
          ($5, $6, NOW() - INTERVAL '15 days' + TIME '9:00', NOW() - INTERVAL '15 days' + TIME '10:00', 
           'Individual', 'in_person', 'no_show', 'Client did not attend. Attempted follow-up call.')
        RETURNING id;
      `, [...clientIds, clinicianUserId, supervisorId, internUserId]);
      
      // Seed documentation
      await client.query(`
        INSERT INTO documentation (
          client_id, therapist_id, title, content, type, status,
          created_at, due_date, completed_at
        )
        VALUES 
          -- Progress notes for client 1
          ($1, $6, 'Initial Assessment', 'Client presents with symptoms of generalized anxiety...', 'progress_note', 'complete',
           NOW() - INTERVAL '30 days', NULL, NOW() - INTERVAL '30 days'),
          ($1, $6, 'Therapy Session #2', 'Client reports continued anxiety but has been practicing mindfulness...', 'progress_note', 'complete',
           NOW() - INTERVAL '23 days', NULL, NOW() - INTERVAL '23 days'),
          ($1, $6, 'Therapy Session #3', 'Client showing improvement in anxiety symptoms...', 'progress_note', 'complete',
           NOW() - INTERVAL '16 days', NULL, NOW() - INTERVAL '16 days'),
          ($1, $6, 'Therapy Session #4', 'Significant progress noted in managing daily anxiety...', 'progress_note', 'complete',
           NOW() - INTERVAL '9 days', NULL, NOW() - INTERVAL '9 days'),
          
          -- Treatment plan
          ($1, $6, 'Treatment Plan - Anxiety', 'DIAGNOSIS: Generalized Anxiety Disorder (F41.1)\\n\\nGOALS:\\n1. Reduce overall anxiety levels\\n2. Improve sleep quality\\n3. Develop effective coping strategies\\n\\nINTERVENTIONS:\\n- Weekly individual CBT sessions\\n- Daily mindfulness practice\\n- Progressive muscle relaxation training', 'treatment_plan', 'complete',
           NOW() - INTERVAL '30 days', NULL, NOW() - INTERVAL '29 days'),
          
          -- Progress notes for other clients
          ($2, $6, 'Initial Assessment - Depression', 'Client presents with symptoms of major depressive disorder...', 'progress_note', 'complete',
           NOW() - INTERVAL '28 days', NULL, NOW() - INTERVAL '28 days'),
          ($2, $6, 'Therapy Session #2 - Depression', 'Client reports continued low mood but slight improvement...', 'progress_note', 'complete',
           NOW() - INTERVAL '21 days', NULL, NOW() - INTERVAL '21 days'),
          
          -- Notes from supervisor
          ($3, $7, 'Initial Stress Assessment', 'Client reporting high work-related stress levels...', 'progress_note', 'complete',
           NOW() - INTERVAL '25 days', NULL, NOW() - INTERVAL '25 days'),
          ($3, $7, 'Stress Management Follow-up', 'Client implementing new boundaries at work with some success...', 'progress_note', 'complete',
           NOW() - INTERVAL '18 days', NULL, NOW() - INTERVAL '18 days'),
          
          -- Intern documentation with supervision needed
          ($2, $8, 'Therapy Session with Intern', 'Client continued to work on depressive symptoms...', 'progress_note', 'draft',
           NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days', NULL),
          ($4, $8, 'Coping Skills Session', 'Reviewed and practiced coping skills for anxiety...', 'progress_note', 'draft',
           NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', NULL),
          
          -- Assessment
          ($4, $7, 'Comprehensive Psychological Assessment', 'TEST ADMINISTERED: Beck Depression Inventory, Beck Anxiety Inventory, PHQ-9\\n\\nRESULTS:\\nBDI: 20 (Moderate depression)\\nBAI: 18 (Moderate anxiety)\\nPHQ-9: 15 (Moderately severe depression)\\n\\nCLINICAL IMPRESSION:\\nClient meets criteria for Major Depressive Disorder with comorbid Generalized Anxiety.', 'assessment', 'complete',
           NOW() - INTERVAL '20 days', NULL, NOW() - INTERVAL '18 days')
      `, [...clientIds, clinicianUserId, supervisorId, internUserId]);
      
      // Seed messages
      await client.query(`
        INSERT INTO messages (
          client_id, therapist_id, content, subject, 
          category, sender, is_read, created_at
        )
        VALUES 
          -- Messages for client 1
          ($1, $6, 'I wanted to check if our session is still on for tomorrow at 10am?', 'Tomorrow''s Session', 
           'Clinical', 'client', true, NOW() - INTERVAL '2 days'),
          ($1, $6, 'Yes, we are confirmed for tomorrow at 10am. Looking forward to seeing you!', 'Re: Tomorrow''s Session', 
           'Clinical', 'therapist', true, NOW() - INTERVAL '2 days'),
          ($1, $6, 'I''ve been practicing the breathing exercises and they seem to help.', 'Breathing Exercises', 
           'Clinical', 'client', true, NOW() - INTERVAL '5 days'),
          ($1, $6, 'That''s wonderful to hear. We''ll discuss more techniques in our next session.', 'Re: Breathing Exercises', 
           'Clinical', 'therapist', true, NOW() - INTERVAL '5 days'),
          
          -- Messages for client 2
          ($2, $6, 'Do I need to bring anything for our first appointment?', 'First Appointment', 
           'Administrative', 'client', true, NOW() - INTERVAL '29 days'),
          ($2, $6, 'Just yourself and any questions you have. I''ve sent the intake forms via email.', 'Re: First Appointment', 
           'Administrative', 'therapist', true, NOW() - INTERVAL '29 days'),
          
          -- Messages with unread status for demo
          ($3, $7, 'I''m having a difficult day and wanted to reach out.', 'Difficult Day', 
           'Clinical', 'client', false, NOW() - INTERVAL '1 day'),
          ($4, $8, 'I need to reschedule our appointment next week.', 'Reschedule Request', 
           'Administrative', 'client', false, NOW() - INTERVAL '6 hours')
      `, [...clientIds, clinicianUserId, supervisorId, internUserId]);
      
      // Create leads
      await client.query(`
        INSERT INTO leads (
          name, email, phone, source, 
          status, stage, assigned_to_id, notes,
          date_added, lead_score
        )
        VALUES 
          ('Alex Wilson', 'alex.wilson@example.com', '555-111-2222', 'Website Form', 
           'new', 'inquiry', $1, 'Interested in therapy for teenage child.',
           NOW() - INTERVAL '5 days', 75),
          ('Maria Garcia', 'maria.garcia@example.com', '555-333-4444', 'Psychology Today', 
           'contacted', 'consultation', $1, 'Looking for anxiety treatment, already contacted once.',
           NOW() - INTERVAL '10 days', 85),
          ('David Lee', 'david.lee@example.com', '555-555-6666', 'Referral', 
           'qualified', 'assessment', $2, 'Referred by Dr. Johnson, needs depression treatment.',
           NOW() - INTERVAL '15 days', 90),
          ('Sarah Miller', 'sarah.miller@example.com', '555-777-8888', 'Google Ads', 
           'new', 'inquiry', $1, 'Requested information about group therapy options.',
           NOW() - INTERVAL '2 days', 60),
          ('James Taylor', 'james.taylor@example.com', '555-999-0000', 'Instagram', 
           'contacted', 'consultation', $2, 'Has insurance questions, scheduled for phone consultation.',
           NOW() - INTERVAL '7 days', 70)
      `, [clinicianUserId, supervisorId]);
      
      // Create marketing events
      await client.query(`
        INSERT INTO marketing_events (
          name, type, description, date,
          location, capacity, status, created_by_id
        )
        VALUES 
          ('Demo Workshop: Stress Management', 'Workshop', 'A free workshop on managing everyday stress', NOW() + INTERVAL '14 days',
           'Main Office - Conference Room A', 20, 'upcoming', $1),
          ('Demo Webinar: Parenting Strategies', 'Webinar', 'Online webinar discussing effective parenting strategies', NOW() + INTERVAL '21 days',
           'Zoom Meeting', 100, 'upcoming', $1),
          ('Demo Open House', 'Open House', 'Tour our facilities and meet our therapists', NOW() + INTERVAL '30 days',
           'Main Office', 50, 'upcoming', $1),
          ('Demo Past Seminar: Anxiety Management', 'Seminar', 'Educational seminar on anxiety management techniques', NOW() - INTERVAL '20 days',
           'Community Center', 35, 'completed', $1)
      `, [adminUserId]);
      
      await client.query('COMMIT');
      console.log('Seed data inserted successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error seeding database:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Helper function to create schema migrations from our existing schema files
async function createInitialSchemaMigration() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Check if we already have an initial schema migration
  const existingMigrations = fs.readdirSync(migrationsDir).filter(file => file.includes('initial_schema'));
  if (existingMigrations.length > 0) {
    console.log('Initial schema migration already exists:', existingMigrations[0]);
    return;
  }
  
  // Create an initial schema migration from our refined schema
  const refinedSchemaPath = path.join(__dirname, 'schema-refined.sql');
  if (!fs.existsSync(refinedSchemaPath)) {
    console.error('Refined schema file not found at:', refinedSchemaPath);
    return;
  }
  
  const schemaContent = fs.readFileSync(refinedSchemaPath, 'utf8');
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const migrationFilename = `${timestamp}_initial_schema.sql`;
  const migrationPath = path.join(migrationsDir, migrationFilename);
  
  // Create the migration file
  fs.writeFileSync(
    migrationPath,
    `-- Migration: initial_schema
-- Created at: ${new Date().toISOString()}
-- Description: Initial database schema
    
${schemaContent}
`
  );
  
  console.log(`Created initial schema migration: ${migrationPath}`);
}

// Only run when called directly (not imported)
if (require.main === module) {
  const command = process.argv[2] || 'seed';
  
  switch (command) {
    case 'seed':
      seed().catch(console.error);
      break;
    case 'init-migration':
      createInitialSchemaMigration().catch(console.error);
      break;
    default:
      console.log(`
Usage:
  npm run seed                - Seed the database with development data
  npm run seed init-migration - Create a migration file from the current schema
      `);
  }
}

export { seed, createInitialSchemaMigration }; 