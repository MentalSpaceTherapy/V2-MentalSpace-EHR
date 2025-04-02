import { logger } from '../logger';
import { Role } from '../middleware/roleAccess';
import fs from 'fs';
import path from 'path';

/**
 * Generate demo audit logs for each role to test logging functionality
 */

// Create demo users for each role
const demoUsers = [
  { id: 1, username: 'admin_user', role: Role.ADMIN, name: 'Admin User' },
  { id: 2, username: 'practice_admin', role: Role.PRACTICE_ADMIN, name: 'Practice Administrator' },
  { id: 3, username: 'admin_clinician', role: Role.ADMIN_CLINICIAN, name: 'Administrator Clinician' },
  { id: 4, username: 'supervisor', role: Role.SUPERVISOR, name: 'Clinical Supervisor' },
  { id: 5, username: 'clinician', role: Role.CLINICIAN, name: 'Staff Clinician' },
  { id: 6, username: 'intern', role: Role.INTERN, name: 'Clinical Intern' },
  { id: 7, username: 'scheduler', role: Role.SCHEDULER, name: 'Practice Scheduler' },
  { id: 8, username: 'biller', role: Role.BILLER, name: 'Practice Biller' }
];

// Define role action types
interface RoleAction {
  action: string;
  resource: string;
  success: boolean;
}

// Define common resources and actions for each role
const roleActions: Record<string, RoleAction[]> = {
  [Role.ADMIN]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_system_settings', resource: '/api/admin/settings', success: true },
    { action: 'edit_system_settings', resource: '/api/admin/settings', success: true },
    { action: 'create_user', resource: '/api/admin/users', success: true },
    { action: 'delete_user', resource: '/api/admin/users/10', success: true },
    { action: 'backup_database', resource: '/api/admin/backup', success: true },
    { action: 'view_audit_logs', resource: '/api/admin/audit-logs', success: true }
  ],
  [Role.PRACTICE_ADMIN]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_practice_settings', resource: '/api/practice/settings', success: true },
    { action: 'edit_practice_settings', resource: '/api/practice/settings', success: true },
    { action: 'create_staff', resource: '/api/practice/staff', success: true },
    { action: 'view_billing_reports', resource: '/api/billing/reports', success: true },
    { action: 'view_audit_logs', resource: '/api/admin/audit-logs', success: false },
    { action: 'run_practice_report', resource: '/api/reports/practice/utilization', success: true }
  ],
  [Role.ADMIN_CLINICIAN]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_client_records', resource: '/api/clients/123', success: true },
    { action: 'edit_client_records', resource: '/api/clients/123', success: true },
    { action: 'view_practice_reports', resource: '/api/reports/practice', success: true },
    { action: 'approve_clinical_documentation', resource: '/api/documentation/456/approve', success: true },
    { action: 'create_treatment_plan', resource: '/api/clients/123/treatment-plan', success: true },
    { action: 'approve_intern_notes', resource: '/api/documentation/789/review', success: true }
  ],
  [Role.SUPERVISOR]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_supervisee_clients', resource: '/api/supervision/supervisees/4/clients', success: true },
    { action: 'approve_intern_notes', resource: '/api/documentation/789/review', success: true },
    { action: 'conduct_supervision', resource: '/api/supervision/sessions/create', success: true },
    { action: 'view_client_records', resource: '/api/clients/123', success: true },
    { action: 'edit_practice_settings', resource: '/api/practice/settings', success: false },
    { action: 'sign_supervision_form', resource: '/api/supervision/forms/101/sign', success: true }
  ],
  [Role.CLINICIAN]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_own_clients', resource: '/api/clients', success: true },
    { action: 'create_session_note', resource: '/api/documentation/session-notes', success: true },
    { action: 'create_treatment_plan', resource: '/api/clients/123/treatment-plan', success: true },
    { action: 'schedule_appointment', resource: '/api/appointments', success: true },
    { action: 'view_practice_reports', resource: '/api/reports/practice', success: false },
    { action: 'message_client', resource: '/api/messages/client/123', success: true }
  ],
  [Role.INTERN]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_own_clients', resource: '/api/clients', success: true },
    { action: 'create_session_note', resource: '/api/documentation/session-notes', success: true },
    { action: 'create_treatment_plan', resource: '/api/clients/123/treatment-plan', success: false },
    { action: 'submit_note_for_approval', resource: '/api/documentation/789/submit', success: true },
    { action: 'schedule_supervision', resource: '/api/supervision/request', success: true },
    { action: 'submit_hours_log', resource: '/api/interns/hours-log', success: true }
  ],
  [Role.SCHEDULER]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_schedule', resource: '/api/schedule', success: true },
    { action: 'create_appointment', resource: '/api/appointments', success: true },
    { action: 'reschedule_appointment', resource: '/api/appointments/567', success: true },
    { action: 'view_client_contact_info', resource: '/api/clients/123/contact', success: true },
    { action: 'view_client_records', resource: '/api/clients/123', success: false },
    { action: 'send_appointment_reminder', resource: '/api/reminders/appointment/567', success: true }
  ],
  [Role.BILLER]: [
    { action: 'login', resource: '/api/auth/login', success: true },
    { action: 'view_client_billing', resource: '/api/clients/123/billing', success: true },
    { action: 'create_invoice', resource: '/api/billing/invoices', success: true },
    { action: 'process_payment', resource: '/api/billing/payments', success: true },
    { action: 'view_insurance_claims', resource: '/api/billing/insurance-claims', success: true },
    { action: 'submit_insurance_claim', resource: '/api/billing/insurance-claims/submit', success: true },
    { action: 'view_client_records', resource: '/api/clients/123', success: false }
  ]
};

// Simulate various authentication events
const authEvents = [
  { action: 'login_success', details: { method: 'password' } },
  { action: 'login_failed', details: { method: 'password', reason: 'invalid_password' } },
  { action: 'password_reset_requested', details: {} },
  { action: 'password_reset_completed', details: {} },
  { action: '2fa_setup', details: { method: 'totp' } },
  { action: '2fa_verification', details: { method: 'totp', success: true } },
  { action: '2fa_verification_failed', details: { method: 'totp', reason: 'invalid_code' } },
  { action: 'account_locked', details: { reason: 'too_many_attempts' } },
  { action: 'logout', details: { sessionDuration: '01:24:35' } }
];

// Generate authentication demo logs
const generateAuthLogs = () => {
  console.log('Generating demo authentication logs...');
  
  demoUsers.forEach(user => {
    // Generate standard auth logs for each user
    authEvents.forEach(event => {
      if (event.action.includes('failed') || event.action.includes('locked')) {
        // Skip some failure events for some users to make it realistic
        if (Math.random() > 0.3) return;
      }
      
      logger.audit.auth(
        event.action, 
        event.action.includes('failed') || event.action.includes('requested') ? null : user.id, 
        { 
          username: user.username,
          role: user.role,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110 Safari/537.36',
          ...event.details
        }
      );
    });
  });
};

// Generate access logs for each role
const generateAccessLogs = () => {
  console.log('Generating demo access logs for each role...');
  
  demoUsers.forEach(user => {
    // Get actions for this user's role
    const actions = roleActions[user.role] || [];
    
    // Log each action
    actions.forEach((actionInfo: RoleAction) => {
      logger.audit.access(
        actionInfo.action,
        user.id,
        actionInfo.resource,
        actionInfo.success,
        {
          username: user.username,
          role: user.role,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          method: actionInfo.action.startsWith('view') ? 'GET' : 
                 actionInfo.action.startsWith('edit') || actionInfo.action.startsWith('update') ? 'PUT' :
                 actionInfo.action.startsWith('create') ? 'POST' : 
                 actionInfo.action.startsWith('delete') ? 'DELETE' : 'GET',
          timestamp: new Date().toISOString()
        }
      );
    });
    
    // Add some cross-role access attempts that should fail
    if (user.role !== Role.ADMIN) {
      logger.audit.access(
        'attempt_admin_action',
        user.id,
        '/api/admin/settings',
        false,
        {
          username: user.username,
          role: user.role,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          method: 'GET',
          requiredRole: Role.ADMIN,
          timestamp: new Date().toISOString()
        }
      );
    }
  });
};

// Main function to generate all demo logs
const generateDemoLogs = () => {
  const logsDir = path.join(process.cwd(), 'logs');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Clear existing log files
  try {
    fs.unlinkSync(path.join(logsDir, 'auth_audit.log'));
    fs.unlinkSync(path.join(logsDir, 'security_audit.log'));
    console.log('Existing log files cleared.');
  } catch (err) {
    console.log('No existing log files to clear or error clearing logs.');
  }
  
  // Generate the demo logs
  generateAuthLogs();
  generateAccessLogs();
  
  console.log('Demo logs generated successfully.');
  console.log(`Log files can be found in: ${logsDir}`);
};

// Run the demo log generator if this file is executed directly
if (require.main === module) {
  generateDemoLogs();
}

export { generateDemoLogs }; 