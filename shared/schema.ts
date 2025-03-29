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
  isPrimary: z.boolean().default(false),
  priorAuthNumber: z.string().optional(),
  priorAuthStartDate: z.date().optional(),
  priorAuthEndDate: z.date().optional(),
  priorAuthVisitsApproved: z.number().optional(),
  priorAuthVisitsUsed: z.number().optional()
});

export const paymentCardSchema = z.object({
  cardholderName: z.string().optional(),
  cardType: z.string().optional(),
  lastFourDigits: z.string().optional(),
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

// Documentation/Notes model
export const documentation = pgTable("documentation", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  therapistId: integer("therapist_id").references(() => users.id).notNull(),
  sessionId: integer("session_id").references(() => sessions.id),
  title: text("title").notNull(),
  content: text("content"),
  type: text("type").notNull(), // Progress Note, Treatment Plan, Assessment, etc.
  status: text("status").default("draft").notNull(), // Draft, Complete, Signed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
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

// Leads model
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
  convertedToClientId: integer("converted_to_client_id").references(() => clients.id),
  marketingCampaignId: integer("marketing_campaign_id"),
  leadScore: integer("lead_score").default(0),
  conversionProbability: integer("conversion_probability").default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  tags: text("tags").array(),
});

// Marketing campaigns
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

// Contact history for leads
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
});

// Referral sources
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

// Create insert schemas for the new models
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
  conversionDate: true,
  convertedToClientId: true,
  leadScore: true,
  conversionProbability: true,
  tags: true,
});

// Adjust lead schema to handle nulls properly
insertLeadSchema.shape.source = z.string().nullable();
insertLeadSchema.shape.sourceId = z.number().nullable();
insertLeadSchema.shape.marketingCampaignId = z.number().nullable();

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
  stats: true,
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

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).pick({
  eventId: true,
  leadId: true,
  clientId: true,
  email: true,
  name: true,
  status: true,
  notes: true,
});

export const insertContactHistorySchema = createInsertSchema(contactHistory).pick({
  leadId: true,
  clientId: true,
  contactType: true,
  direction: true,
  subject: true,
  content: true,
  contactNumber: true,
  duration: true,
  notes: true,
  outcome: true,
  followUpDate: true,
  followUpType: true,
  completedById: true,
  campaignId: true,
});

export const insertReferralSourceSchema = createInsertSchema(referralSources).pick({
  name: true,
  type: true,
  details: true,
  activeStatus: true,
  contactPerson: true,
  contactEmail: true,
  contactPhone: true,
  notes: true,
  createdById: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Export types for new models
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

// Document template system with version control
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // Progress Note, Treatment Plan, Assessment, etc.
  status: text("status").default("draft").notNull(), // draft, active, inactive, archived
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  organizationId: integer("organization_id"), // For multi-tenant systems
  isGlobal: boolean("is_global").default(false).notNull(), // Whether this template is available to all users
  requiresApproval: boolean("requires_approval").default(false).notNull(), // Whether changes to this template need approval
  approvalStatus: text("approval_status").default("not-submitted").notNull(), // not-submitted, pending, approved, rejected
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  currentVersionId: integer("current_version_id"), // FK to be set after creation of the version
});

// Version history for document templates
export const templateVersions = pgTable("template_versions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => documentTemplates.id).notNull(),
  versionNumber: integer("version_number").notNull(),
  content: text("content").notNull(), // Could be JSON or HTML content
  metadata: jsonb("metadata").default({}), // Additional fields specific to template type
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isLatest: boolean("is_latest").default(false).notNull(),
  notes: text("notes"), // Change notes or comments for this version
  approvalStatus: text("approval_status").default("not-submitted").notNull(), // not-submitted, pending, approved, rejected
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
});

// Create insert schemas for document templates
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  name: true,
  description: true,
  type: true,
  status: true,
  createdById: true,
  organizationId: true,
  isGlobal: true,
  requiresApproval: true,
  approvalStatus: true,
  approvedById: true,
  approvedAt: true,
});

// Create insert schema for template versions
export const insertTemplateVersionSchema = createInsertSchema(templateVersions).pick({
  templateId: true,
  versionNumber: true,
  content: true,
  metadata: true,
  createdById: true,
  isLatest: true,
  notes: true,
  approvalStatus: true,
  approvedById: true,
  approvedAt: true,
  rejectionReason: true,
});

// Types for document templates and versions
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;

export type TemplateVersion = typeof templateVersions.$inferSelect;
export type InsertTemplateVersion = z.infer<typeof insertTemplateVersionSchema>;

// E-Signature system
export const signatureRequests = pgTable("signature_requests", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documentation.id).notNull(),
  requestedById: integer("requested_by_id").references(() => users.id).notNull(),
  requestedForId: integer("requested_for_id").references(() => clients.id).notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  status: text("status").default("pending").notNull(), // pending, completed, expired, rejected, cancelled
  message: text("message"), // Optional message to the signer
  remindersSent: integer("reminders_sent").default(0).notNull(),
  lastReminderSent: timestamp("last_reminder_sent"),
  accessCode: text("access_code"), // Optional security code
  accessUrl: text("access_url").notNull(), // Unique URL for signing
  completedAt: timestamp("completed_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  metadata: jsonb("metadata").default({}), // Additional config like required fields
});

export const signatureFields = pgTable("signature_fields", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => signatureRequests.id).notNull(),
  fieldType: text("field_type").notNull(), // signature, initial, date, checkbox, text
  label: text("label").notNull(),
  required: boolean("required").default(true).notNull(),
  pageNumber: integer("page_number").default(1).notNull(),
  xPosition: integer("x_position").notNull(), // X coordinate on the page
  yPosition: integer("y_position").notNull(), // Y coordinate on the page
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  value: text("value"), // The value after signing
  completedAt: timestamp("completed_at"),
  order: integer("order").default(0).notNull(), // Order in the signing flow
});

export const signatureEvents = pgTable("signature_events", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => signatureRequests.id).notNull(),
  eventType: text("event_type").notNull(), // viewed, signed, declined, reminded, etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata").default({}), // Additional data about the event
});

// Create insert schemas for e-signature tables
export const insertSignatureRequestSchema = createInsertSchema(signatureRequests).pick({
  documentId: true,
  requestedById: true,
  requestedForId: true,
  expiresAt: true,
  status: true,
  message: true,
  accessCode: true,
  accessUrl: true,
  metadata: true,
});

export const insertSignatureFieldSchema = createInsertSchema(signatureFields).pick({
  requestId: true,
  fieldType: true,
  label: true,
  required: true,
  pageNumber: true,
  xPosition: true,
  yPosition: true,
  width: true,
  height: true,
  value: true,
  order: true,
});

export const insertSignatureEventSchema = createInsertSchema(signatureEvents).pick({
  requestId: true,
  eventType: true,
  ipAddress: true,
  userAgent: true,
  metadata: true,
});

// Types for e-signature system
export type SignatureRequest = typeof signatureRequests.$inferSelect;
export type InsertSignatureRequest = z.infer<typeof insertSignatureRequestSchema>;

export type SignatureField = typeof signatureFields.$inferSelect;
export type InsertSignatureField = z.infer<typeof insertSignatureFieldSchema>;

export type SignatureEvent = typeof signatureEvents.$inferSelect;
export type InsertSignatureEvent = z.infer<typeof insertSignatureEventSchema>;

// Integrations for external services like Constant Contact
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(), // "constant_contact", "google_calendar", etc.
  userId: integer("user_id").references(() => users.id), // Which user this integration belongs to (null for practice-wide)
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
  metadata: jsonb("metadata"), // Additional service-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  serviceName: true,
  userId: true,
  accessToken: true,
  refreshToken: true,
  expiresAt: true,
  active: true,
  metadata: true,
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
