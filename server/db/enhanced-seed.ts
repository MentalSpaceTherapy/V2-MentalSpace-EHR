/**
 * Enhanced seed file for the Mental Space EHR system
 * 
 * This seed file creates a more comprehensive set of development data 
 * with realistic patient histories, appointment patterns, and demo data
 * for all major features.
 */

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

// Helper to generate random dates within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate random integer within a range
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to pick random items from an array
function randomPick<T>(arr: T[], count: number = 1): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, count);
}

// Diagnoses for realistic client records
const diagnoses = [
  { name: 'Major Depressive Disorder', code: 'F33.1' },
  { name: 'Generalized Anxiety Disorder', code: 'F41.1' },
  { name: 'Post-Traumatic Stress Disorder', code: 'F43.10' },
  { name: 'Bipolar I Disorder', code: 'F31.1' },
  { name: 'Attention-Deficit/Hyperactivity Disorder', code: 'F90.0' },
  { name: 'Obsessive-Compulsive Disorder', code: 'F42.2' },
  { name: 'Adjustment Disorder with Mixed Anxiety and Depression', code: 'F43.23' },
  { name: 'Social Anxiety Disorder', code: 'F40.10' },
  { name: 'Insomnia Disorder', code: 'G47.00' },
  { name: 'Substance Use Disorder, Alcohol, Moderate', code: 'F10.20' }
];

// Insurance providers
const insuranceProviders = [
  'Blue Cross Blue Shield',
  'Aetna',
  'UnitedHealthcare',
  'Cigna',
  'Humana',
  'Kaiser Permanente',
  'Medicare',
  'Medicaid',
  'Tricare',
  'Self-Pay'
];

// Enhanced seed function
async function enhancedSeed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting enhanced database seeding process...');
    
    // Create seed data in transactions to ensure data consistency
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Generate staff accounts
      console.log('Creating staff accounts...');
      
      // Create default passwords
      const adminPassword = await hashPassword('Admin123!');
      const clinicianPassword = await hashPassword('Clinician123!');
      const internPassword = await hashPassword('Intern123!');
      const billerPassword = await hashPassword('Biller123!');
      
      // Clear existing test data
      await client.query(`
        DELETE FROM event_registrations;
        DELETE FROM marketing_events;
        DELETE FROM contact_history;
        DELETE FROM leads;
        DELETE FROM messages;
        DELETE FROM documentation;
        DELETE FROM sessions;
        DELETE FROM clients;
        DELETE FROM staff;
        DELETE FROM users WHERE email LIKE '%example.com';
      `);
      
      // Insert demo users
      const userInsertResult = await client.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, role, created_at)
        VALUES 
          ('demo_admin', 'admin@example.com', $1, 'Admin', 'User', 'administrator', NOW() - INTERVAL '60 days'),
          ('demo_supervisor', 'supervisor@example.com', $2, 'Sarah', 'Johnson', 'supervisor', NOW() - INTERVAL '59 days'),
          ('demo_clinician1', 'clinician1@example.com', $2, 'Michael', 'Smith', 'clinician', NOW() - INTERVAL '58 days'),
          ('demo_clinician2', 'clinician2@example.com', $2, 'Jennifer', 'Davis', 'clinician', NOW() - INTERVAL '57 days'),
          ('demo_intern1', 'intern1@example.com', $3, 'David', 'Wilson', 'intern', NOW() - INTERVAL '45 days'),
          ('demo_intern2', 'intern2@example.com', $3, 'Jessica', 'Brown', 'intern', NOW() - INTERVAL '30 days'),
          ('demo_biller', 'biller@example.com', $4, 'Robert', 'Miller', 'biller', NOW() - INTERVAL '55 days'),
          ('demo_receptionist', 'receptionist@example.com', $3, 'Amanda', 'Taylor', 'receptionist', NOW() - INTERVAL '54 days'),
          ('demo_practice_admin', 'practice@example.com', $1, 'James', 'Wilson', 'practice_administrator', NOW() - INTERVAL '60 days')
        RETURNING id, username, role;
      `, [adminPassword, clinicianPassword, internPassword, billerPassword]);
      
      console.log(`Created ${userInsertResult.rowCount} demo users`);
      
      // Store user IDs for reference
      const adminId = userInsertResult.rows.find(u => u.username === 'demo_admin')?.id;
      const supervisorId = userInsertResult.rows.find(u => u.username === 'demo_supervisor')?.id;
      const clinician1Id = userInsertResult.rows.find(u => u.username === 'demo_clinician1')?.id;
      const clinician2Id = userInsertResult.rows.find(u => u.username === 'demo_clinician2')?.id;
      const intern1Id = userInsertResult.rows.find(u => u.username === 'demo_intern1')?.id;
      const intern2Id = userInsertResult.rows.find(u => u.username === 'demo_intern2')?.id;
      
      // Create staff records
      await client.query(`
        INSERT INTO staff (
          first_name, last_name, email, role, roles, type_of_clinician, 
          npi_number, supervisor_id, phone, status
        ) VALUES
          ('Sarah', 'Johnson', 'supervisor@example.com', 'supervisor', 
           ARRAY['supervisor', 'clinician'], 'Licensed Psychologist', 
           '1234567890', NULL, '555-111-2222', 'active'),
          ('Michael', 'Smith', 'clinician1@example.com', 'clinician', 
           ARRAY['clinician'], 'Licensed Marriage and Family Therapist', 
           '2345678901', $1, '555-222-3333', 'active'),
          ('Jennifer', 'Davis', 'clinician2@example.com', 'clinician', 
           ARRAY['clinician'], 'Licensed Social Worker', 
           '3456789012', $1, '555-333-4444', 'active'),
          ('David', 'Wilson', 'intern1@example.com', 'intern', 
           ARRAY['intern'], 'Psychology Intern', 
           NULL, $2, '555-444-5555', 'active'),
          ('Jessica', 'Brown', 'intern2@example.com', 'intern', 
           ARRAY['intern'], 'Counseling Intern', 
           NULL, $3, '555-555-6666', 'active'),
          ('Robert', 'Miller', 'biller@example.com', 'biller', 
           ARRAY['biller'], NULL, 
           NULL, NULL, '555-666-7777', 'active'),
          ('Amanda', 'Taylor', 'receptionist@example.com', 'receptionist', 
           ARRAY['receptionist'], NULL, 
           NULL, NULL, '555-777-8888', 'active'),
          ('James', 'Wilson', 'practice@example.com', 'practice_administrator', 
           ARRAY['practice_administrator'], NULL, 
           NULL, NULL, '555-888-9999', 'active')
      `, [supervisorId, clinician1Id, clinician2Id]);
      
      console.log('Created staff records');
      
      // Create clients
      console.log('Creating client records...');
      
      // Generate 40 clients
      const clientValues = [];
      const clientParams = [];
      let paramCounter = 1;
      
      // Therapist assignments
      const therapistIds = [supervisorId, clinician1Id, clinician2Id, intern1Id, intern2Id];
      
      // Status distribution - mostly active clients
      const statuses = ['active', 'active', 'active', 'active', 'inactive', 'inactive', 'archived'];
      
      // Create 40 clients with random data
      for (let i = 0; i < 40; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const primaryTherapistId = therapistIds[Math.floor(Math.random() * therapistIds.length)];
        
        const firstName = `FirstName${i + 1}`;
        const lastName = `LastName${i + 1}`;
        const email = `client${i + 1}@example.com`;
        const phone = `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Random birthdate between 18 and 80 years ago
        const today = new Date();
        const birthYear = today.getFullYear() - Math.floor(18 + Math.random() * 62);
        const birthMonth = Math.floor(Math.random() * 12);
        const birthDay = Math.floor(1 + Math.random() * 28);
        const dob = new Date(birthYear, birthMonth, birthDay);
        
        // Random created date in the last 2 years
        const createdAt = randomDate(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), new Date());
        
        // Select random insurance
        const insuranceProvider = insuranceProviders[Math.floor(Math.random() * insuranceProviders.length)];
        const insurancePolicyNumber = `POL${Math.floor(10000000 + Math.random() * 90000000)}`;
        
        // Build client creation SQL
        clientValues.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);
        clientParams.push(
          firstName, lastName, email, phone, dob.toISOString().split('T')[0], primaryTherapistId, 
          status, createdAt.toISOString(), insuranceProvider
        );
      }
      
      const clientInsertQuery = `
        INSERT INTO clients (
          first_name, last_name, email, phone, date_of_birth, 
          primary_therapist_id, status, created_at, insurance_provider
        ) VALUES ${clientValues.join(', ')}
        RETURNING id, first_name, last_name, primary_therapist_id
      `;
      
      const clientResults = await client.query(clientInsertQuery, clientParams);
      console.log(`Created ${clientResults.rowCount} client records`);
      
      // Create sessions/appointments
      console.log('Creating session records...');
      
      // Session types
      const sessionTypes = ['Individual', 'Group', 'Family', 'Couples', 'Assessment', 'Intake'];
      const mediumTypes = ['telehealth', 'in_person'];
      
      // Session statuses
      const sessionStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
      const sessionStatusWeights = [0.2, 0.1, 0.5, 0.1, 0.1]; // Probability weights
      
      // Create 200 sessions
      const sessionValues = [];
      const sessionParams = [];
      paramCounter = 1;
      
      // Get client IDs
      const clientIds = clientResults.rows.map(c => c.id);
      
      // Create past, current, and future sessions
      for (let i = 0; i < 200; i++) {
        // Select random client and their primary therapist
        const randomClientIndex = Math.floor(Math.random() * clientResults.rows.length);
        const clientId = clientResults.rows[randomClientIndex].id;
        let therapistId = clientResults.rows[randomClientIndex].primary_therapist_id;
        
        // 20% chance of session being with a different therapist
        if (Math.random() < 0.2) {
          const otherTherapists = therapistIds.filter(id => id !== therapistId);
          therapistId = otherTherapists[Math.floor(Math.random() * otherTherapists.length)];
        }
        
        // Determine if past, current, or future session
        let dayOffset;
        let sessionStatus;
        
        if (i < 120) { // 60% past sessions
          dayOffset = -randomInt(1, 180);
          sessionStatus = 'completed';
        } else if (i < 180) { // 30% future sessions
          dayOffset = randomInt(1, 60);
          
          // Select random status based on weights for future sessions
          const r = Math.random();
          let cumulativeProbability = 0;
          for (let j = 0; j < sessionStatusWeights.length; j++) {
            cumulativeProbability += sessionStatusWeights[j];
            if (r <= cumulativeProbability) {
              sessionStatus = sessionStatuses[j];
              break;
            }
          }
          
          // Future sessions can only be scheduled or confirmed
          if (sessionStatus === 'completed' || sessionStatus === 'cancelled' || sessionStatus === 'no_show') {
            sessionStatus = Math.random() < 0.7 ? 'scheduled' : 'confirmed';
          }
        } else { // 10% same-day sessions
          dayOffset = 0;
          sessionStatus = Math.random() < 0.5 ? 'scheduled' : 'confirmed';
        }
        
        // Generate session time
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + dayOffset);
        baseDate.setHours(9 + Math.floor(Math.random() * 8), Math.random() < 0.5 ? 0 : 30, 0, 0);
        
        const startTime = new Date(baseDate);
        const endTime = new Date(baseDate);
        endTime.setMinutes(endTime.getMinutes() + 50); // 50-minute sessions
        
        // Random session type and medium
        const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
        const medium = mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
        
        // Create session SQL
        sessionValues.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);
        sessionParams.push(
          clientId, therapistId, startTime.toISOString(), endTime.toISOString(),
          sessionType, medium, sessionStatus
        );
      }
      
      const sessionInsertQuery = `
        INSERT INTO sessions (
          client_id, therapist_id, start_time, end_time,
          session_type, medium, status
        ) VALUES ${sessionValues.join(', ')}
        RETURNING id, client_id, therapist_id, start_time, status
      `;
      
      const sessionResults = await client.query(sessionInsertQuery, sessionParams);
      console.log(`Created ${sessionResults.rowCount} session records`);
      
      // Create documentation for sessions
      console.log('Creating documentation records...');
      
      // Documentation types
      const docTypes = ['progress_note', 'treatment_plan', 'assessment', 'intake', 'discharge_summary'];
      
      // Get completed sessions
      const completedSessions = sessionResults.rows.filter(s => s.status === 'completed');
      
      // Create documentation for 80% of completed sessions
      const docSessionsCount = Math.floor(completedSessions.length * 0.8);
      const docSessions = randomPick(completedSessions, docSessionsCount);
      
      const docValues = [];
      const docParams = [];
      paramCounter = 1;
      
      for (const session of docSessions) {
        const clientId = session.client_id;
        const therapistId = session.therapist_id;
        const sessionId = session.id;
        const sessionDate = new Date(session.start_time);
        
        // Documentation is typically created 0-3 days after the session
        const createdAt = new Date(sessionDate);
        createdAt.setDate(createdAt.getDate() + randomInt(0, 3));
        
        let title, docType;
        
        // Determine doc type - mostly progress notes
        const typeRand = Math.random();
        if (typeRand < 0.7) {
          docType = 'progress_note';
          title = `Progress Note - ${sessionDate.toISOString().split('T')[0]}`;
        } else if (typeRand < 0.85) {
          docType = 'treatment_plan';
          title = `Treatment Plan - ${sessionDate.toISOString().split('T')[0]}`;
        } else {
          docType = docTypes[Math.floor(Math.random() * docTypes.length)];
          title = `${docType.charAt(0).toUpperCase() + docType.slice(1).replace('_', ' ')} - ${sessionDate.toISOString().split('T')[0]}`;
        }
        
        // Some docs are still in draft status
        const status = Math.random() < 0.9 ? 'complete' : 'draft';
        
        // Insert document
        docValues.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);
        docParams.push(
          clientId, therapistId, sessionId, title, docType, status, createdAt.toISOString()
        );
      }
      
      if (docValues.length > 0) {
        const docInsertQuery = `
          INSERT INTO documentation (
            client_id, therapist_id, session_id, title, type, status, created_at
          ) VALUES ${docValues.join(', ')}
        `;
        
        await client.query(docInsertQuery, docParams);
        console.log(`Created ${docValues.length} documentation records`);
      }
      
      // Create messages
      console.log('Creating message records...');
      
      // Get active clients
      const activeClients = clientResults.rows.filter(c => {
        const client = clientResults.rows.find(r => r.id === c.id);
        return client && (
          client.status === 'active' || Math.random() < 0.3 // Include some inactive clients
        );
      });
      
      const messageValues = [];
      const messageParams = [];
      paramCounter = 1;
      
      // Create 100 messages
      for (let i = 0; i < 100; i++) {
        // Select random client and their therapist
        const randomClientIndex = Math.floor(Math.random() * activeClients.length);
        const clientId = activeClients[randomClientIndex].id;
        const therapistId = activeClients[randomClientIndex].primary_therapist_id;
        
        // Determine message direction
        const isFromClient = Math.random() < 0.5;
        const sender = isFromClient ? 'client' : 'therapist';
        
        // Determine if read or unread (most therapist messages are read, most client messages are unread)
        const isRead = isFromClient ? Math.random() < 0.3 : Math.random() < 0.8;
        
        // Random date in the last 30 days
        const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
        
        // Message categories
        const categories = ['Clinical', 'Administrative', 'Billing', 'General'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Placeholder subject and content
        const subject = `Message subject ${i + 1}`;
        const content = `This is placeholder content for message ${i + 1}.`;
        
        // Create message SQL
        messageValues.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);
        messageParams.push(
          clientId, therapistId, subject, content, category, sender, isRead, createdAt.toISOString()
        );
      }
      
      if (messageValues.length > 0) {
        const messageInsertQuery = `
          INSERT INTO messages (
            client_id, therapist_id, subject, content, category, sender, is_read, created_at
          ) VALUES ${messageValues.join(', ')}
        `;
        
        await client.query(messageInsertQuery, messageParams);
        console.log(`Created ${messageValues.length} message records`);
      }
      
      await client.query('COMMIT');
      console.log('Enhanced seed data committed to database successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating enhanced seed data:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Enhanced seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Only run when called directly (not imported)
if (require.main === module) {
  enhancedSeed().catch(error => {
    console.error('Seed error:', error);
    process.exit(1);
  });
}

export { enhancedSeed }; 