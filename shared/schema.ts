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
  password: text("password").notNull(),
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
  password: true,
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
