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
