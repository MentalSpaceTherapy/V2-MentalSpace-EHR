import session from 'express-session';
import { DatabaseStorage } from './database-storage';
import { PaginationParams } from './utils/pagination';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  passwordHash: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  primaryTherapistId?: number;
  referralSourceId?: number;
  referralNotes?: string;
  leadId?: number;
  conversionDate?: Date;
  originalMarketingCampaignId?: number;
  gender?: string;
  pronouns?: string;
  emergencyContact?: any;
  insuranceInfo?: any;
  secondaryInsurance?: any;
  notes?: string;
  lastAppointment?: Date;
  nextAppointment?: Date;
  preferredContactMethod?: string;
  communicationPreferences?: any;
  assignedTeam?: number[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientFilters {
  therapistId?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  assignedTeam?: number[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  lastAppointmentRange?: {
    from?: string;
    to?: string;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface Session {
  id: number;
  clientId: number;
  therapistId: number;
  startTime: Date;
  endTime: Date;
  sessionType: string;
  medium: string;
  status: string;
}

export interface SessionFilters {
  clientId?: number;
  therapistId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export interface StaffFilters {
  role?: string;
  status?: string;
  search?: string;
}

export interface Documentation {
  id: number;
  clientId: number;
  therapistId: number;
  sessionId?: number;
  title: string;
  content?: string;
  type: string;
  status: string;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

export interface DocumentationFilters {
  clientId?: number;
  therapistId?: number;
  sessionId?: number;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Message {
  id: number;
  clientId: number;
  therapistId: number;
  content: string;
  subject?: string;
  category?: string;
  sender: "client" | "therapist";
  isRead: boolean;
  status: string;
  createdAt: Date;
  attachments?: any[];
}

export interface MessageFilters {
  clientId?: number;
  therapistId?: number;
  isRead?: boolean;
  category?: string;
  sender?: "client" | "therapist";
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PasswordResetToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface InsertPasswordResetToken {
  userId: number;
  token: string;
  expiresAt: Date;
}

export interface TwoFactorAuth {
  id: number;
  userId: number;
  secret: string;
  enabled: boolean;
  recoveryCodes: string[]; // Hashed recovery codes
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertTwoFactorAuth {
  userId: number;
  secret: string;
  enabled: boolean;
  recoveryCodes: string[];
}

export interface SecurityAuditLog {
  id?: number;
  userId: number;
  action: string;
  ipAddress: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp?: Date;
  isResolved?: boolean;
  resolvedBy?: number | null;
  resolvedAt?: Date | null;
}

export interface LoginAttemptCheck {
  blocked: boolean;
  remainingLockTime?: number;
  attemptCount?: number;
}

export interface LoginAttempt {
  id?: number;
  username?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp?: Date;
  success: boolean;
  attemptCount?: number;
}

export interface HistoryEvent {
  id: number;
  entityId: number;
  entityType: string;
  action: string;
  timestamp: Date;
  userId: number;
  details: string;
  metadata?: any;
}

export interface AuditLog {
  id?: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  timestamp?: Date;
  details: string;
  metadata?: any;
}

export interface InsertAuditLog {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  metadata?: any;
}

// Define the interface for the storage class
export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUser(id: number, userData: Partial<any>): Promise<User | undefined>;
  deleteUserByUsername(username: string): Promise<void>;
  verifyUserPassword(userId: number, password: string): Promise<boolean>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClients(filters?: ClientFilters, pagination?: PaginationParams): Promise<PaginatedResult<Client>>;
  createClient(clientData: any): Promise<Client>;
  updateClient(id: number, clientData: any): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  getClientHistory(clientId: number): Promise<HistoryEvent[]>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  getSessions(filters?: SessionFilters, pagination?: PaginationParams): Promise<PaginatedResult<Session>>;
  createSession(sessionData: any): Promise<Session>;
  updateSession(id: number, sessionData: any): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // Documentation methods
  getDocument(id: number): Promise<Documentation | undefined>;
  getDocuments(filters?: DocumentationFilters, pagination?: PaginationParams): Promise<PaginatedResult<Documentation>>;
  createDocument(documentData: any): Promise<Documentation>;
  updateDocument(id: number, documentData: any): Promise<Documentation | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessages(filters?: MessageFilters, pagination?: PaginationParams): Promise<PaginatedResult<Message>>;
  createMessage(messageData: any): Promise<Message>;
  updateMessage(id: number, messageData: any): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Staff methods
  getStaffMembers(filters?: StaffFilters, pagination?: PaginationParams): Promise<PaginatedResult<Staff>>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaffMember(staffData: any): Promise<Staff>;
  updateStaffMember(id: number, staffData: any): Promise<Staff | undefined>;
  deleteStaffMember(id: number): Promise<boolean>;
  
  // Password reset token methods
  createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  
  // 2FA methods
  enableTwoFactorAuth(data: InsertTwoFactorAuth): Promise<TwoFactorAuth>;
  getTwoFactorAuth(userId: number): Promise<TwoFactorAuth | undefined>;
  disableTwoFactorAuth(userId: number): Promise<void>;
  updateTwoFactorRecoveryCodes(userId: number, recoveryCodes: string[]): Promise<TwoFactorAuth | undefined>;
  consumeRecoveryCode(userId: number, codeIndex: number): Promise<void>;
  
  // Security audit methods
  createSecurityAuditLog(log: SecurityAuditLog): Promise<SecurityAuditLog>;
  getSecurityAuditLogs(filters?: {
    userId?: number;
    action?: string;
    severity?: string;
    from?: Date;
    to?: Date;
    isResolved?: boolean;
  }): Promise<SecurityAuditLog[]>;
  resolveSecurityAuditLog(id: number, resolvedBy: number): Promise<boolean>;
  
  // Login attempts tracking
  recordLoginAttempt(attempt: LoginAttempt): Promise<void>;
  checkLoginAttempts(ipAddress: string): Promise<LoginAttemptCheck>;
  clearLoginAttempts(ipAddress: string, username?: string): Promise<void>;
  
  // Audit log methods
  createAuditLogEntry(logData: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: {
    userId?: number;
    entityType?: string;
    entityId?: number;
    action?: string;
    from?: Date;
    to?: Date;
  }): Promise<AuditLog[]>;
}

// Create and export an instance of the DatabaseStorage class
// This assumes that DatabaseStorage implements IStorage
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Cast to IStorage to resolve type mismatch - the implementation should ensure all methods are properly implemented
export const storage: IStorage = new DatabaseStorage(dbUrl) as IStorage;

// Security audit methods
async function createSecurityAuditLog(log: SecurityAuditLog): Promise<SecurityAuditLog> {
  const result = await this.db.query(
    `INSERT INTO security_audit 
     (user_id, action, ip_address, details, severity) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [log.userId, log.action, log.ipAddress, log.details, log.severity]
  );
  
  return {
    id: result.rows[0].id,
    userId: result.rows[0].user_id,
    action: result.rows[0].action,
    ipAddress: result.rows[0].ip_address,
    details: result.rows[0].details,
    severity: result.rows[0].severity as 'LOW' | 'MEDIUM' | 'HIGH',
    timestamp: result.rows[0].timestamp,
    isResolved: result.rows[0].is_resolved,
    resolvedBy: result.rows[0].resolved_by,
    resolvedAt: result.rows[0].resolved_at
  };
}

async function getSecurityAuditLogs(filters?: {
  userId?: number;
  action?: string;
  severity?: string;
  from?: Date;
  to?: Date;
  isResolved?: boolean;
}): Promise<SecurityAuditLog[]> {
  let query = `
    SELECT * FROM security_audit 
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;
  
  if (filters) {
    if (filters.userId !== undefined) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }
    
    if (filters.action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(filters.action);
    }
    
    if (filters.severity) {
      query += ` AND severity = $${paramIndex++}`;
      params.push(filters.severity);
    }
    
    if (filters.from) {
      query += ` AND timestamp >= $${paramIndex++}`;
      params.push(filters.from);
    }
    
    if (filters.to) {
      query += ` AND timestamp <= $${paramIndex++}`;
      params.push(filters.to);
    }
    
    if (filters.isResolved !== undefined) {
      query += ` AND is_resolved = $${paramIndex++}`;
      params.push(filters.isResolved);
    }
  }
  
  query += ` ORDER BY timestamp DESC`;
  
  const result = await this.db.query(query, params);
  
  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    action: row.action,
    ipAddress: row.ip_address,
    details: row.details,
    severity: row.severity as 'LOW' | 'MEDIUM' | 'HIGH',
    timestamp: row.timestamp,
    isResolved: row.is_resolved,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at
  }));
}

async function resolveSecurityAuditLog(id: number, resolvedBy: number): Promise<boolean> {
  const result = await this.db.query(
    `UPDATE security_audit 
     SET is_resolved = true, resolved_by = $1, resolved_at = NOW() 
     WHERE id = $2 
     RETURNING id`,
    [resolvedBy, id]
  );
  
  return result.rowCount > 0;
}

// Login attempts tracking
async function recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
  // First check if there's a recent attempt from this IP/username
  const existingQuery = attempt.username 
    ? `SELECT * FROM login_attempts 
       WHERE ip_address = $1 AND username = $2 
       AND timestamp > NOW() - INTERVAL '30 minutes'
       ORDER BY timestamp DESC LIMIT 1`
    : `SELECT * FROM login_attempts 
       WHERE ip_address = $1 
       AND timestamp > NOW() - INTERVAL '30 minutes'
       ORDER BY timestamp DESC LIMIT 1`;
  
  const existingParams = attempt.username 
    ? [attempt.ipAddress, attempt.username]
    : [attempt.ipAddress];
  
  const existingResult = await this.db.query(existingQuery, existingParams);
  
  if (existingResult.rows.length > 0 && !attempt.success) {
    // Increment the attempt count for unsuccessful attempts
    await this.db.query(
      `UPDATE login_attempts 
       SET attempt_count = attempt_count + 1, timestamp = NOW() 
       WHERE id = $1`,
      [existingResult.rows[0].id]
    );
  } else {
    // Insert a new record
    await this.db.query(
      `INSERT INTO login_attempts 
       (username, ip_address, user_agent, success, attempt_count) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        attempt.username || null, 
        attempt.ipAddress, 
        attempt.userAgent || null, 
        attempt.success, 
        attempt.attemptCount || 1
      ]
    );
  }
}

async function checkLoginAttempts(ipAddress: string): Promise<LoginAttemptCheck> {
  // Get the maximum allowed attempts from environment or default to 5
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
  
  // Get the lockout duration from environment or default to 15 minutes (900 seconds)
  const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || '900');
  
  // Check for recent failed attempts
  const result = await this.db.query(
    `SELECT 
       SUM(attempt_count) as total_attempts,
       MAX(timestamp) as last_attempt
     FROM login_attempts 
     WHERE ip_address = $1 
       AND success = false 
       AND timestamp > NOW() - INTERVAL '30 minutes'`,
    [ipAddress]
  );
  
  const totalAttempts = parseInt(result.rows[0]?.total_attempts) || 0;
  const lastAttempt = result.rows[0]?.last_attempt;
  
  // If no attempts or under the limit, not blocked
  if (!lastAttempt || totalAttempts < maxAttempts) {
    return { 
      blocked: false,
      attemptCount: totalAttempts
    };
  }
  
  // Calculate time since last attempt
  const timeSinceLastAttempt = Math.floor(
    (Date.now() - new Date(lastAttempt).getTime()) / 1000
  );
  
  // If lockout duration has passed, not blocked
  if (timeSinceLastAttempt >= lockoutDuration) {
    return { 
      blocked: false,
      attemptCount: totalAttempts
    };
  }
  
  // Still in lockout period
  return {
    blocked: true,
    remainingLockTime: lockoutDuration - timeSinceLastAttempt,
    attemptCount: totalAttempts
  };
}

async function clearLoginAttempts(ipAddress: string, username?: string): Promise<void> {
  const query = username
    ? `DELETE FROM login_attempts WHERE ip_address = $1 AND username = $2`
    : `DELETE FROM login_attempts WHERE ip_address = $1`;
  
  const params = username ? [ipAddress, username] : [ipAddress];
  
  await this.db.query(query, params);
} 