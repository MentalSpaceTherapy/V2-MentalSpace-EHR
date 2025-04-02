// src/db/schema.ts
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

// Report templates
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
  referralSourceId: integer("referral_source_id").references(() => referralSources.id),
  referralNotes: text("referral_notes"),
  leadId: integer("lead_id").references(() => leads.id),
  conversionDate: timestamp("conversion_date"),
  originalMarketingCampaignId: integer("original_marketing_campaign_id").references(() => marketingCampaigns.id),
});

// Documentation/Notes model
export const documentation = pgTable("documentation", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  therapistId: integer("therapist_id").references(() => users.id).notNull(),
  sessionId: integer("session_id"),
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
  reminderSent: boolean("reminder_sent").default(false),
  reminderTime: timestamp("reminder_time"),
  externalCalendarEventId: text("external_calendar_event_id"),
  externalCalendarType: text("external_calendar_type"),
  billingStatus: text("billing_status").default("unbilled"),
  documentationStatus: text("documentation_status").default("pending"),
  documentationId: integer("documentation_id").references(() => documentation.id),
  recurrenceRule: text("recurrence_rule"),
  recurrenceEndDate: timestamp("recurrence_end_date"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Staff model
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  suffix: text("suffix"),
  typeOfClinician: text("type_of_clinician"),
  npiNumber: text("npi_number"),
  supervisorId: integer("supervisor_id").references(() => staff.id),
  role: text("role").notNull(),
  roles: text("roles").array(),
  email: text("email").notNull(),
  phone: text("phone"),
  canReceiveSMS: boolean("can_receive_texts").default(false),
  workPhone: text("work_phone"),
  homePhone: text("home_phone"),
  address: text("address"),
  cityState: text("city_state"),
  zipCode: text("zip_code"),
  licenseState: text("license_state"),
  licenseType: text("license_type"),
  licenseNumber: text("license_number"),
  licenseExpiration: timestamp("license_expiration"),
  formalName: text("formal_name"),
  title: text("professional_title"),
  languages: text("languages").array(),
  status: text("status").default("active").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertStaffSchema = createInsertSchema(staff);