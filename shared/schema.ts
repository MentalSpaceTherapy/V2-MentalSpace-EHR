import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Custom Zod schemas for complex nested data
export const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional()
});

export const insuranceInfoSchema = z.object({
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  copay: z.string().optional(),
  deductible: z.string().optional(),
  insurancePhone: z.string().optional(),
  effectiveDate: z.string().optional(),
  insuranceStatus: z.string().optional(),
  responsibleParty: z.string().optional()
});

export const paymentCardSchema = z.object({
  nickname: z.string().optional(),
  lastFourDigits: z.string().optional(),
  cardType: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  isDefault: z.boolean().default(false),
  billingAddress: z.string().optional(),
  billingZip: z.string().optional()
});

// User model for therapists, admin staff, billing staff, etc.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  licenseType: text("license_type"),
  licenseNumber: text("license_number"),
  licenseExpirationDate: timestamp("license_expiration_date"),
  profileImageUrl: text("profile_image_url"),
  status: text("status").default("active").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  passwordHash: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  licenseType: true,
  licenseNumber: true,
  licenseExpirationDate: true,
  profileImageUrl: true,
});

// Report templates - defined early to avoid circular references
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // Standard, Custom
  category: text("category").notNull(), // Clinical, Financial, Operational, Marketing, Performance, etc.
  config: jsonb("config").default({}), // Report configuration (columns, filters, etc.)
  isPublic: boolean("is_public").default(false),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastRunAt: timestamp("last_run_at"),
  schedule: text("schedule"), // Optional cron schedule for automated reports
  exportFormats: text("export_formats").array(), // PDF, CSV, Excel, etc.
});

// Saved reports (generated reports)
export const savedReports = pgTable("saved_reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  templateId: integer("template_id").references(() => reportTemplates.id).notNull(),
  data: jsonb("data").default({}), // The actual report data
  parameters: jsonb("parameters").default({}), // Parameters used to generate the report
  format: text("format").notNull(), // PDF, CSV, Excel, etc.
  fileUrl: text("file_url"), // URL to the generated file
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration date
  isArchived: boolean("is_archived").default(false),
  size: integer("size"), // File size in bytes
  status: text("status").default("completed").notNull(), // pending, completed, failed
  errorMessage: text("error_message"), // Error message if status is failed
});

// Analytics dashboards
export const analyticsDashboards = pgTable("analytics_dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout").default({}), // Dashboard layout configuration
  widgets: jsonb("widgets").default([]), // List of widgets on the dashboard
  isDefault: boolean("is_default").default(false),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(false),
  category: text("category"), // Practice, Clinical, Financial, etc.
});

// Referral sources - defined early to avoid circular references
export const referralSources = pgTable("referral_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Healthcare Provider, Community Organization, Former Client, Business, Educational Institution, Other
  details: jsonb("details").default({}),
  activeSince: timestamp("active_since").defaultNow(),
  activeStatus: text("active_status").default("active").notNull(), // Active, Inactive, Potential
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketing campaigns - defined early to avoid circular references
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Email, SMS, Social, Multi-channel
  status: text("status").default("draft").notNull(), // Draft, Scheduled, Running, Completed, Paused
  description: text("description"),
  audience: text("audience"), // Target audience description
  content: jsonb("content").default({}), // Campaign content (templates, messages, etc.)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  tags: text("tags").array(),
  stats: jsonb("stats").default({}), // Campaign performance statistics
  
  // Integration with Constant Contact
  ccCampaignId: text("cc_campaign_id"), // Constant Contact campaign ID
  ccListIds: text("cc_list_ids").array(), // Constant Contact list IDs used in this campaign
  ccTemplateId: text("cc_template_id"), // Constant Contact template ID
  
  // Tracking and analytics
  totalSent: integer("total_sent").default(0),
  totalOpened: integer("total_opened").default(0),
  totalClicked: integer("total_clicked").default(0),
  totalBounced: integer("total_bounced").default(0),
  totalUnsubscribed: integer("total_unsubscribed").default(0),
  
  // Referral source connection
  referralSourceId: integer("referral_source_id").references(() => referralSources.id),
});

// Leads model - defined early to avoid circular references
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  source: text("source"), // Where lead came from (website, referral, etc.)
  sourceId: integer("source_id"), // Reference to referral_sources if applicable
  status: text("status").default("new").notNull(), // new, contacted, qualified, converted, etc.
  notes: text("notes"),
  stage: text("stage").default("inquiry").notNull(), // inquiry, consultation, assessment, etc.
  assignedToId: integer("assigned_to_id").references(() => users.id),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  lastContactDate: timestamp("last_contact_date").defaultNow().notNull(),
  interestedServices: jsonb("interested_services").default([]),
  demographicInfo: jsonb("demographic_info").default({}),
  conversionDate: timestamp("conversion_date"), // When lead was converted to client
  marketingCampaignId: integer("marketing_campaign_id"),
  leadScore: integer("lead_score").default(0),
  conversionProbability: integer("conversion_probability").default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  tags: text("tags").array(),
});

// Client/Patient model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  status: text("status").default("active").notNull(),
  primaryTherapistId: integer("primary_therapist_id").references(() => users.id),
  referralSourceId: integer("referral_source_id").references(() => referralSources.id), // Connect clients to referral sources
  referralNotes: text("referral_notes"), // Notes about how the client was referred
  leadId: integer("lead_id").references(() => leads.id), // Connect clients to their original lead record
  conversionDate: timestamp("conversion_date"), // When they were converted from lead to client
  originalMarketingCampaignId: integer("original_marketing_campaign_id").references(() => marketingCampaigns.id), // Track which campaign brought them in
});

export const insertClientSchema = createInsertSchema(clients).pick({
  firstName: true, 
  lastName: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  address: true,
  status: true,
  primaryTherapistId: true,
  referralSourceId: true,
  referralNotes: true,
  leadId: true,
  conversionDate: true,
  originalMarketingCampaignId: true,
});

// Documentation/Notes model - defined early to avoid circular references
export const documentation = pgTable("documentation", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  therapistId: integer("therapist_id").references(() => users.id).notNull(),
  sessionId: integer("session_id"), // We'll set this reference later
  title: text("title").notNull(),
  content: text("content"),
  type: text("type").notNull(), // Progress Note, Treatment Plan, Assessment, etc.
  status: text("status").default("draft").notNull(), // Draft, Complete, Signed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
});

// Session/Appointment model
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  therapistId: integer("therapist_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  sessionType: text("session_type").notNull(), // Individual, Group, Family, etc.
  medium: text("medium").notNull(), // Telehealth, In-person
  status: text("status").default("scheduled").notNull(), // Scheduled, Confirmed, Completed, No-Show, Cancelled
  notes: text("notes"),
  location: text("location"), // Physical location or virtual meeting link
  cptCode: text("cpt_code"), // Billing code for the session
  reminderSent: boolean("reminder_sent").default(false), // Track if reminder was sent
  reminderTime: timestamp("reminder_time"), // When reminder should be sent
  externalCalendarEventId: text("external_calendar_event_id"), // ID from external calendar (Google, Outlook)
  externalCalendarType: text("external_calendar_type"), // Type of external calendar (google, outlook, etc.)
  billingStatus: text("billing_status").default("unbilled"), // unbilled, billed, paid, etc.
  documentationStatus: text("documentation_status").default("pending"), // pending, completed
  documentationId: integer("documentation_id").references(() => documentation.id), // Link to documentation/notes
  recurrenceRule: text("recurrence_rule"), // For recurring appointments (iCal format)
  recurrenceEndDate: timestamp("recurrence_end_date"), // End date for recurring appointments
  cancelReason: text("cancel_reason"), // Reason if cancelled or no-show
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Note: originally we tried to set up a circular reference here
// but it's actually not needed as we defined the sessionId column without a reference

export const insertSessionSchema = createInsertSchema(sessions).pick({
  clientId: true,
  therapistId: true,
  startTime: true,
  endTime: true,
  sessionType: true,
  medium: true,
  status: true,
  notes: true,
  location: true,
  cptCode: true,
  reminderTime: true,
  externalCalendarEventId: true,
  externalCalendarType: true,
  recurrenceRule: true,
  recurrenceEndDate: true,
});

export const insertDocumentationSchema = createInsertSchema(documentation).pick({
  clientId: true,
  therapistId: true,
  sessionId: true,
  title: true,
  content: true,
  type: true,
  status: true,
  dueDate: true,
});

// Notification model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // System, Client, Document, etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  link: text("link"), // Optional link to navigate to on click
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  link: true,
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  name: true,
  email: true,
  phone: true,
  source: true,
  sourceId: true,
  status: true,
  notes: true,
  stage: true,
  assignedToId: true,
  interestedServices: true,
  demographicInfo: true,
  marketingCampaignId: true,
  tags: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).pick({
  name: true,
  type: true,
  status: true,
  description: true,
  audience: true,
  content: true,
  startDate: true,
  endDate: true,
  createdById: true,
  tags: true,
  ccCampaignId: true,
  ccListIds: true,
  ccTemplateId: true,
  referralSourceId: true,
});

// Marketing events
export const marketingEvents = pgTable("marketing_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Webinar, Workshop, Conference, Open House, Group Session
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // Duration in minutes
  location: text("location").notNull(),
  capacity: integer("capacity").default(0),
  status: text("status").default("upcoming").notNull(), // Upcoming, In Progress, Completed, Cancelled
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingEventSchema = createInsertSchema(marketingEvents).pick({
  name: true,
  type: true,
  description: true,
  date: true,
  duration: true,
  location: true,
  capacity: true,
  status: true,
  createdById: true,
});

// Event registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => marketingEvents.id).notNull(),
  leadId: integer("lead_id").references(() => leads.id),
  clientId: integer("client_id").references(() => clients.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  status: text("status").default("registered").notNull(), // registered, attended, cancelled, no-show
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).pick({
  eventId: true,
  leadId: true,
  clientId: true,
  email: true,
  name: true,
  status: true,
  notes: true,
});

// Contact history for leads and clients
export const contactHistory = pgTable("contact_history", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  clientId: integer("client_id").references(() => clients.id),
  contactType: text("contact_type").notNull(), // Email, Phone, In-Person, Video, Text, Social Media
  direction: text("direction").notNull(), // inbound, outbound
  subject: text("subject"),
  content: text("content"),
  contactNumber: integer("contact_number").default(1), // 1st, 2nd, 3rd contact, etc.
  date: timestamp("date").defaultNow().notNull(),
  duration: integer("duration"), // Duration in minutes if applicable
  notes: text("notes"),
  outcome: text("outcome"), // Positive, Neutral, Negative, No Response
  followUpDate: timestamp("follow_up_date"),
  followUpType: text("follow_up_type"),
  completedById: integer("completed_by_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id),
  // Track email campaign metrics
  emailOpened: boolean("email_opened").default(false),
  emailClicked: boolean("email_clicked").default(false),
  emailDelivered: boolean("email_delivered").default(true),
  emailBounced: boolean("email_bounced").default(false),
  // For marketing connections
  constantContactActivityId: text("constant_contact_activity_id"), // Track connection to Constant Contact
});

export const insertContactHistorySchema = createInsertSchema(contactHistory).pick({
  leadId: true,
  clientId: true,
  contactType: true,
  direction: true,
  subject: true,
  content: true,
  contactNumber: true,
  date: true,
  duration: true,
  notes: true,
  outcome: true,
  followUpDate: true,
  followUpType: true,
  completedById: true,
  campaignId: true,
  emailOpened: true,
  emailClicked: true,
  emailDelivered: true,
  emailBounced: true,
  constantContactActivityId: true,
});

export const insertReferralSourceSchema = createInsertSchema(referralSources).pick({
  name: true,
  type: true,
  details: true,
  activeSince: true,
  activeStatus: true,
  contactPerson: true,
  contactEmail: true,
  contactPhone: true,
  notes: true,
  createdById: true,
});

// Messages model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  therapistId: integer("therapist_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  subject: text("subject"), // Optional subject line
  category: text("category").default("Clinical"), // "Clinical", "Billing", "Administrative"
  sender: text("sender").notNull(), // "client" or "therapist"
  isRead: boolean("is_read").default(false).notNull(),
  status: text("status").default("sent").notNull(), // sent, delivered, read, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  attachments: jsonb("attachments").default([]), // Array of attachment info
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  clientId: true,
  therapistId: true,
  content: true,
  subject: true,
  category: true,
  sender: true,
  isRead: true,
  status: true,
  attachments: true,
});

// Extended client schema with additional fields
export const extendedClientSchema = insertClientSchema.extend({
  // Personal information
  middleName: z.string().optional(),
  preferredName: z.string().optional(),
  administrativeSex: z.enum(["male", "female", "unknown"]).optional(),
  genderIdentity: z.string().optional(),
  sexualOrientation: z.string().optional(),
  preferredPronouns: z.string().optional(),
  race: z.string().optional(),
  ethnicity: z.string().optional(),
  language: z.string().optional(),
  maritalStatus: z.string().optional(),
  
  // Contact information
  mobilePhone: z.string().optional(),
  homePhone: z.string().optional(),
  workPhone: z.string().optional(),
  otherPhone: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  timeZone: z.string().optional(),
  
  // Employment/referral
  employment: z.string().optional(),
  referralSource: z.string().optional(),
  
  // Emergency contacts - array of contacts
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  
  // Legacy single emergency contact fields (for backwards compatibility)
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  
  // Insurance information - array of insurance plans
  insuranceInformation: z.array(insuranceInfoSchema).optional(),
  
  // Legacy single insurance fields (for backwards compatibility)
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceGroupNumber: z.string().optional(),
  insuranceCopay: z.string().optional(),
  insuranceDeductible: z.string().optional(),
  responsibleParty: z.string().optional(),
  
  // Payment methods
  paymentCards: z.array(paymentCardSchema).optional(),
  
  // Clinical information
  diagnosisCodes: z.array(z.string()).optional(),
  medicationList: z.string().optional(),
  allergies: z.string().optional(),
  smokingStatus: z.string().optional(),
  
  // Consent & privacy
  hipaaConsentSigned: z.boolean().optional(),
  consentForTreatmentSigned: z.boolean().optional(),
  consentForCommunication: z.array(z.string()).optional(),
  
  // Notes
  notes: z.string().optional(),
  billingNotes: z.string().optional(),
  privateNotes: z.string().optional(),
});

// Document Templates
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // Progress Note, Treatment Plan, Assessment, etc.
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  defaultContent: text("default_content"), // Default template content
  status: text("status").default("active").notNull(), // Active, Inactive, Draft
  tags: text("tags").array(), // For categorization/filtering
  isSystem: boolean("is_system").default(false), // Whether it's a built-in template or user-created
});

// Template versions for tracking changes
export const templateVersions = pgTable("template_versions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => documentTemplates.id).notNull(),
  versionNumber: integer("version_number").notNull(),
  content: text("content").notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"), // Notes about changes in this version
  status: text("status").default("draft").notNull(), // Draft, Approved, Deprecated
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  name: true,
  description: true,
  type: true,
  createdById: true,
  defaultContent: true,
  status: true,
  tags: true,
  isSystem: true,
});

export const insertTemplateVersionSchema = createInsertSchema(templateVersions).pick({
  templateId: true,
  versionNumber: true,
  content: true,
  createdById: true,
  notes: true,
  status: true,
  approvedById: true,
  approvedAt: true,
});

// E-signature system
export const signatureRequests = pgTable("signature_requests", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documentation.id).notNull(),
  requestedById: integer("requested_by_id").references(() => users.id).notNull(),
  requestedForId: integer("requested_for_id").references(() => clients.id).notNull(),
  status: text("status").default("pending").notNull(), // Pending, Signed, Rejected, Expired
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  signatureToken: text("signature_token").notNull(), // Unique token for the e-signing link
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  notes: text("notes"),
});

// Track fields that need signatures 
export const signatureFields = pgTable("signature_fields", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => signatureRequests.id).notNull(),
  fieldType: text("field_type").notNull(), // Signature, Initial, Date, Text
  label: text("label").notNull(),
  required: boolean("required").default(true),
  xPosition: integer("x_position"), // Position data for rendering
  yPosition: integer("y_position"),
  pageNumber: integer("page_number").default(1),
  width: integer("width"),
  height: integer("height"),
  completedAt: timestamp("completed_at"),
  value: text("value"), // The signed/entered value
});

// Audit trail for signature events
export const signatureEvents = pgTable("signature_events", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => signatureRequests.id).notNull(),
  eventType: text("event_type").notNull(), // Viewed, Signed, Rejected, Reminder Sent
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  eventData: jsonb("event_data").default({}), // Additional event details
});

export const insertSignatureRequestSchema = createInsertSchema(signatureRequests).pick({
  documentId: true,
  requestedById: true,
  requestedForId: true,
  status: true,
  expiresAt: true,
  signatureToken: true,
  notes: true,
});

export const insertSignatureFieldSchema = createInsertSchema(signatureFields).pick({
  requestId: true,
  fieldType: true,
  label: true,
  required: true,
  xPosition: true,
  yPosition: true,
  pageNumber: true,
  width: true,
  height: true,
  value: true,
});

export const insertSignatureEventSchema = createInsertSchema(signatureEvents).pick({
  requestId: true,
  eventType: true,
  ipAddress: true,
  userAgent: true,
  eventData: true,
});

// External integrations table
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  providerName: text("provider_name").notNull(), // Constant Contact, Google Calendar, etc.
  providerUserId: text("provider_user_id"), // ID of the user in the provider's system
  accessToken: text("access_token"), // OAuth access token
  refreshToken: text("refresh_token"), // OAuth refresh token
  tokenExpiresAt: timestamp("token_expires_at"),
  scopes: text("scopes").array(), // OAuth scopes granted
  status: text("status").default("active").notNull(), // Active, Revoked, Expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").default({}), // Additional provider-specific data
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  providerName: true,
  providerUserId: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiresAt: true,
  scopes: true,
  status: true,
  metadata: true,
});

// OAuth state tracking
export const oauthStates = pgTable("oauth_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  state: text("state").notNull(), // Random state value for CSRF protection
  providerName: text("provider_name").notNull(), // Name of the OAuth provider
  redirectUri: text("redirect_uri"), // Where to return after OAuth
  scopes: text("scopes").array(), // Requested OAuth scopes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // States should expire after a short time
  used: boolean("used").default(false), // Whether the state has been used
  usedAt: timestamp("used_at"), // When the state was used
});

export const insertOAuthStateSchema = createInsertSchema(oauthStates).pick({
  userId: true,
  state: true,
  providerName: true,
  redirectUri: true,
  scopes: true,
  expiresAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ExtendedClient = z.infer<typeof extendedClientSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Documentation = typeof documentation.$inferSelect;
export type InsertDocumentation = z.infer<typeof insertDocumentationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type InsuranceInfo = z.infer<typeof insuranceInfoSchema>;
export type PaymentCard = z.infer<typeof paymentCardSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type MarketingEvent = typeof marketingEvents.$inferSelect;
export type InsertMarketingEvent = z.infer<typeof insertMarketingEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type ContactHistoryRecord = typeof contactHistory.$inferSelect;
export type InsertContactHistory = z.infer<typeof insertContactHistorySchema>;

export type ReferralSource = typeof referralSources.$inferSelect;
export type InsertReferralSource = z.infer<typeof insertReferralSourceSchema>;

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;

export type TemplateVersion = typeof templateVersions.$inferSelect;
export type InsertTemplateVersion = z.infer<typeof insertTemplateVersionSchema>;

export type SignatureRequest = typeof signatureRequests.$inferSelect;
export type InsertSignatureRequest = z.infer<typeof insertSignatureRequestSchema>;

export type SignatureField = typeof signatureFields.$inferSelect;
export type InsertSignatureField = z.infer<typeof insertSignatureFieldSchema>;

export type SignatureEvent = typeof signatureEvents.$inferSelect;
export type InsertSignatureEvent = z.infer<typeof insertSignatureEventSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type OAuthState = typeof oauthStates.$inferSelect;
export type InsertOAuthState = z.infer<typeof insertOAuthStateSchema>;

// Report template insertion schema
export const insertReportTemplateSchema = createInsertSchema(reportTemplates).pick({
  name: true,
  description: true,
  type: true,
  category: true,
  config: true,
  isPublic: true,
  createdById: true,
  schedule: true,
  exportFormats: true,
});

// Saved report insertion schema
export const insertSavedReportSchema = createInsertSchema(savedReports).pick({
  name: true,
  templateId: true,
  data: true,
  parameters: true,
  format: true,
  fileUrl: true,
  createdById: true,
  expiresAt: true,
  size: true,
  status: true,
  errorMessage: true,
});

// Analytics dashboard insertion schema
export const insertAnalyticsDashboardSchema = createInsertSchema(analyticsDashboards).pick({
  name: true,
  description: true,
  layout: true,
  widgets: true,
  isDefault: true,
  createdById: true,
  isPublic: true,
  category: true,
});

// Export types for new report-related tables
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

export type SavedReport = typeof savedReports.$inferSelect;
export type InsertSavedReport = z.infer<typeof insertSavedReportSchema>;

export type AnalyticsDashboard = typeof analyticsDashboards.$inferSelect;
export type InsertAnalyticsDashboard = z.infer<typeof insertAnalyticsDashboardSchema>;

// Staff model
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  suffix: text("suffix"),
  
  // Clinician Info
  typeOfClinician: text("type_of_clinician"),
  npiNumber: text("npi_number"),
  supervisorId: integer("supervisor_id"),
  
  // Role & Credentials
  role: text("role"),
  roles: text("roles").array(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  canReceiveSMS: boolean("can_receive_texts").default(false),
  workPhone: text("work_phone"),
  homePhone: text("home_phone"),
  
  // Address
  address1: text("address1"),
  address2: text("address2"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  
  // License Info
  licenseState: text("license_state"),
  licenseType: text("license_type"),
  licenseNumber: text("license_number"),
  licenseExpiration: timestamp("license_expiration"),
  
  // Additional fields
  formalName: text("formal_name"),
  title: text("professional_title"),
  languages: text("languages").array(),
  status: text("status").default("active").notNull(),
  profileImage: text("profile_image"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffSchema = createInsertSchema(staff).pick({
  firstName: true,
  middleName: true,
  lastName: true,
  suffix: true,
  typeOfClinician: true,
  npiNumber: true,
  supervisorId: true,
  role: true,
  roles: true,
  email: true,
  phone: true,
  canReceiveSMS: true,
  workPhone: true,
  homePhone: true,
  address1: true,
  address2: true,
  city: true,
  state: true,
  zipCode: true,
  licenseState: true,
  licenseType: true,
  licenseNumber: true,
  licenseExpiration: true,
  formalName: true,
  title: true,
  languages: true,
  status: true,
  profileImage: true,
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;