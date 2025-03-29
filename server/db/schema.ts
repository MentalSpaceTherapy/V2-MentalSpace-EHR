// src/db/schema.ts
import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  first_name: text("first_name").notNull(),
  middle_name: text("middle_name"),
  last_name: text("last_name").notNull(),
  suffix: text("suffix"),
  type_of_clinician: text("type_of_clinician"),
  npi_number: text("npi_number"),
  supervisor_id: integer("supervisor_id"), // foreign key reference (optional)
  role: text("role"),
  email: text("email").notNull(),
  phone: text("phone"),
  can_receive_texts: boolean("can_receive_texts").default(false),
  work_phone: text("work_phone"),
  address: text("address"),
  city_state: text("city_state"),
  zip_code: text("zip_code"),
  license_state: text("license_state"),
  license_taxonomy: text("license_taxonomy"),
  license_expiration: text("license_expiration")
});