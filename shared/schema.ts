import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Documentation = typeof documentation.$inferSelect;
export type InsertDocumentation = z.infer<typeof insertDocumentationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
