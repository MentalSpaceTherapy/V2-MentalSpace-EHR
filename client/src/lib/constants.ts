// User roles
export const USER_ROLES = {
  PRACTICE_ADMIN: "Practice Administrator",
  CLINICIAN: "Clinician",
  INTERN: "Intern / Assistant / Associate",
  SUPERVISOR: "Supervisor",
  CLINICAL_ADMIN: "Clinical Administrator",
  SCHEDULER: "Practice Scheduler",
  BILLER_ASSIGNED: "Biller for Assigned Patients Only",
  PRACTICE_BILLER: "Practice Biller",
};

// User role categories
export const ROLE_CATEGORIES = {
  PRACTICE_ADMINISTRATION: "Practice Administration",
  CLINICAL_ACCESS: "Clinical Access",
  SCHEDULING_ACCESS: "Scheduling Access",
  BILLING_ACCESS: "Billing Access"
};

// Role permissions and descriptions
export const ROLE_DETAILS = {
  [USER_ROLES.PRACTICE_ADMIN]: {
    category: ROLE_CATEGORIES.PRACTICE_ADMINISTRATION,
    description: "A TherapyNotes Practice Administrator can add and edit TherapyNotes users, change user roles, reset passwords, and set account access settings."
  },
  [USER_ROLES.CLINICIAN]: {
    category: ROLE_CATEGORIES.CLINICAL_ACCESS,
    description: "Clinicians provide services to a client. They can view and edit their own schedule, complete notes and manage records of patients assigned to them, provide access to their assigned patients' records for other clinicians but cannot remove that access."
  },
  [USER_ROLES.INTERN]: {
    category: ROLE_CATEGORIES.CLINICAL_ACCESS,
    description: "The Intern role is similar to a Clinician but with limitations. Interns do not have an NPI and can only bill to insurance under a Supervisor's credentials. Their formal name for signing notes must include \"Intern\". These accounts are offered at a reduced rate."
  },
  [USER_ROLES.SUPERVISOR]: {
    category: ROLE_CATEGORIES.CLINICAL_ACCESS,
    description: "A Supervisor can be assigned to individual clinicians and interns, granting full access to their supervisees' patient's notes, including the option to approve and co-sign notes. If a Supervisor also has the Clinician role, their supervisees can bill with the Supervisor's credentials."
  },
  [USER_ROLES.CLINICAL_ADMIN]: {
    category: ROLE_CATEGORIES.CLINICAL_ACCESS,
    description: "A Clinical Administrator must also have the Clinician role. They can access any patient's records and can give other clinicians access to any patient records. Clinical Administrators are the only users able to delete signed notes and revoke a Clinician's access to patient charts."
  },
  [USER_ROLES.SCHEDULER]: {
    category: ROLE_CATEGORIES.SCHEDULING_ACCESS,
    description: "A Scheduler can schedule, reschedule, and cancel appointments for any clinician. They can add, edit, or remove new patients. A Scheduler can create Missed Appointment, Contact, and Miscellaneous notes. They cannot create clinical notes or have their own calendars unless they also have the Clinician role."
  },
  [USER_ROLES.BILLER_ASSIGNED]: {
    category: ROLE_CATEGORIES.BILLING_ACCESS,
    description: "Clinicians with this role can collect and enter copay information, including by processing patient credit cards. They can enter patient custom rates and insurance information, and verify insurance benefits. They cannot handle insurance claims or access practice-wide billing reports."
  },
  [USER_ROLES.PRACTICE_BILLER]: {
    category: ROLE_CATEGORIES.BILLING_ACCESS,
    description: "A Practice Biller has full billing access to all patients in the practice. They can verify patient insurance benefits, generate and track claims, enter patient and insurance payments, and run billing reports. A Practice Biller can create Contact and Miscellaneous notes, as well as edit Patient Billing Comments and Policy Comments. They cannot see clinical notes or have their own calendar unless they also have the Clinician role."
  }
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
