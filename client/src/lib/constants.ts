// User roles
export const USER_ROLES = {
  ADMIN: "Administrator",
  THERAPIST: "Therapist",
  BILLING: "Billing Staff",
  FRONT_DESK: "Front Desk",
};

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
