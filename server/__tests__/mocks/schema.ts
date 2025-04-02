/**
 * Mock @shared/schema module for tests
 */

// Basic mock schema types that can be extended as needed
export const users = {
  id: { type: 'number', primaryKey: true },
  username: { type: 'string', unique: true },
  email: { type: 'string', unique: true },
  password: { type: 'string' },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  role: { type: 'string' },
  enabled: { type: 'boolean', defaultValue: true },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' }
};

export const clients = {
  id: { type: 'number', primaryKey: true },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string' },
  phoneNumber: { type: 'string' },
  dateOfBirth: { type: 'date' },
  address: { type: 'string' },
  city: { type: 'string' },
  state: { type: 'string' },
  zipCode: { type: 'string' },
  insuranceProvider: { type: 'string' },
  insuranceId: { type: 'string' },
  emergencyContactName: { type: 'string' },
  emergencyContactPhone: { type: 'string' },
  primaryTherapistId: { type: 'number', references: { table: 'users', field: 'id' } },
  status: { type: 'string', defaultValue: 'active' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
  notes: { type: 'string' }
};

export const sessions = {
  id: { type: 'number', primaryKey: true },
  clientId: { type: 'number', references: { table: 'clients', field: 'id' } },
  therapistId: { type: 'number', references: { table: 'users', field: 'id' } },
  startTime: { type: 'date' },
  endTime: { type: 'date' },
  status: { type: 'string', defaultValue: 'scheduled' },
  notes: { type: 'string' },
  type: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' }
};

export const documentation = {
  id: { type: 'number', primaryKey: true },
  clientId: { type: 'number', references: { table: 'clients', field: 'id' } },
  therapistId: { type: 'number', references: { table: 'users', field: 'id' } },
  sessionId: { type: 'number', references: { table: 'sessions', field: 'id' } },
  title: { type: 'string' },
  content: { type: 'string' },
  type: { type: 'string' },
  status: { type: 'string', defaultValue: 'draft' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' }
};

export const notifications = {
  id: { type: 'number', primaryKey: true },
  userId: { type: 'number', references: { table: 'users', field: 'id' } },
  message: { type: 'string' },
  type: { type: 'string' },
  read: { type: 'boolean', defaultValue: false },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' }
};

export const messages = {
  id: { type: 'number', primaryKey: true },
  senderId: { type: 'number', references: { table: 'users', field: 'id' } },
  recipientId: { type: 'number', references: { table: 'users', field: 'id' } },
  content: { type: 'string' },
  read: { type: 'boolean', defaultValue: false },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' }
};

// Additional schemas required by the application - simplified for tests
export const leads = {};
export const marketingCampaigns = {};
export const marketingEvents = {};
export const eventRegistrations = {};
export const contactHistory = {};
export const referralSources = {};
export const documentTemplates = {};
export const templateVersions = {};
export const signatureRequests = {};
export const signatureFields = {};
export const signatureEvents = {};
export const invoices = {};
export const payments = {};
export const subscriptions = {};
export const billingCodes = {};
export const insuranceProviders = {};
export const insuranceClaims = {};
export const appointments = {};
export const cancellations = {};
export const waitlist = {};
export const reminders = {};
export const notes = {};
export const tasks = {};
export const forms = {};
export const formSubmissions = {};
export const attachments = {};
export const assessments = {};
export const treatmentPlans = {};
export const progressNotes = {};
export const medications = {};
export const diagnoses = {};
export const clientGoals = {};
export const messageTemplates = {};
export const auditLogs = {};
export const userSettings = {};
export const systemSettings = {};

export default {
  users,
  clients,
  sessions,
  documentation,
  notifications,
  messages,
  leads,
  marketingCampaigns,
  marketingEvents,
  eventRegistrations,
  contactHistory,
  referralSources,
  documentTemplates,
  templateVersions,
  signatureRequests,
  signatureFields,
  signatureEvents,
  invoices,
  payments,
  subscriptions,
  billingCodes,
  insuranceProviders,
  insuranceClaims,
  appointments,
  cancellations,
  waitlist,
  reminders,
  notes,
  tasks,
  forms,
  formSubmissions,
  attachments,
  assessments,
  treatmentPlans,
  progressNotes,
  medications,
  diagnoses,
  clientGoals,
  messageTemplates,
  auditLogs,
  userSettings,
  systemSettings
}; 