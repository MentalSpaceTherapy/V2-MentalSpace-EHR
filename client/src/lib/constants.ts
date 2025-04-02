// User roles
export const USER_ROLES = {
  ADMIN: "Admin",
  CLINICIAN: "Clinician",
  RECEPTIONIST: "Receptionist",
  BILLING: "Billing",
  THERAPIST: "Therapist",
  NURSE: "Nurse",
  CASE_MANAGER: "Case Manager",
  OTHER: "Other"
} as const;

// User role categories
export const ROLE_CATEGORIES = {
  CLINICAL: "Clinical",
  ADMINISTRATIVE: "Administrative",
  SUPPORT: "Support"
} as const;

// Role permissions and descriptions
export const ROLE_DETAILS = {
  [USER_ROLES.ADMIN]: {
    category: ROLE_CATEGORIES.ADMINISTRATIVE,
    description: "Full system access and management capabilities",
    permissions: ["manage_users", "manage_settings", "view_reports"]
  },
  [USER_ROLES.CLINICIAN]: {
    category: ROLE_CATEGORIES.CLINICAL,
    description: "Primary care provider with patient management access",
    permissions: ["manage_patients", "view_records", "write_notes"]
  },
  [USER_ROLES.RECEPTIONIST]: {
    category: ROLE_CATEGORIES.SUPPORT,
    description: "Front desk and appointment management",
    permissions: ["manage_appointments", "view_schedule", "basic_patient_info"]
  },
  [USER_ROLES.BILLING]: {
    category: ROLE_CATEGORIES.ADMINISTRATIVE,
    description: "Financial and billing management",
    permissions: ["manage_billing", "view_financials", "process_payments"]
  },
  [USER_ROLES.THERAPIST]: {
    category: ROLE_CATEGORIES.CLINICAL,
    description: "Mental health specialist with therapy-specific access",
    permissions: ["manage_patients", "view_records", "write_notes", "manage_sessions"]
  },
  [USER_ROLES.NURSE]: {
    category: ROLE_CATEGORIES.CLINICAL,
    description: "Nursing staff with clinical support access",
    permissions: ["manage_patients", "view_records", "write_notes", "manage_medications"]
  },
  [USER_ROLES.CASE_MANAGER]: {
    category: ROLE_CATEGORIES.SUPPORT,
    description: "Case management and coordination",
    permissions: ["manage_cases", "view_records", "coordinate_care"]
  },
  [USER_ROLES.OTHER]: {
    category: ROLE_CATEGORIES.SUPPORT,
    description: "General support staff",
    permissions: ["basic_access"]
  }
} as const;

// License types for therapists
export const LICENSE_TYPES = [
  "Licensed Professional Counselor (LPC)",
  "Licensed Clinical Social Worker (LCSW)",
  "Licensed Marriage and Family Therapist (LMFT)",
  "Licensed Mental Health Counselor (LMHC)",
  "Licensed Clinical Mental Health Counselor (LCMHC)",
  "Licensed Psychologist (PhD or PsyD)",
  "Psychiatrist (MD or DO)",
  "Psychiatric Mental Health Nurse Practitioner (PMHNP)",
  "Licensed Associate Counselor (LAC)",
  "Licensed Master Social Worker (LMSW)",
  "Licensed Independent Clinical Social Worker (LICSW)",
  "Certified Alcohol and Drug Counselor (CADC)",
];

// Session types
export const SESSION_TYPES = [
  "Individual Therapy",
  "Group Therapy",
  "Family Therapy",
  "Couples Therapy",
  "CBT Session",
  "Intake Assessment",
  "Crisis Intervention",
  "Medication Management",
];

// Session medium
export const SESSION_MEDIUMS = ["Telehealth", "In-person"];

// Session status
export const SESSION_STATUS = [
  "Scheduled",
  "Confirmed", 
  "Completed", 
  "No-Show", 
  "Cancelled",
  "Pending",
];

// Documentation types
export const DOCUMENTATION_TYPES = [
  "Intake Form",
  "Progress Note",
  "Treatment Plan", 
  "Contact Note",
  "Cancellation/Missed Appointment",
  "Consultation",
  "Miscellaneous",
];

// Documentation status
export const DOCUMENTATION_STATUS = [
  "Draft",
  "In Progress",
  "Complete",
  "Signed",
  "Overdue",
  "Due Today",
];

// Notification types
export const NOTIFICATION_TYPES = [
  "System",
  "Client",
  "Document",
  "Schedule",
  "Billing",
  "Message",
];

// Default avatar URL
export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
