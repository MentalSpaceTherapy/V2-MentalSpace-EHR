/**
 * Client type representing a patient in the system
 */
export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  address: string | null;
  primaryTherapistId: number | null;
  dateOfBirth?: Date | string | null;
  createdAt: string;
  updatedAt: string;
  
  // Additional properties
  lastSession?: Date | string | null;
  nextSession?: Date | string | null;
  balance?: number;
  therapistName?: string;
  sessionsAttended?: number;
  
  // Demographic information
  middleName?: string;
  preferredName?: string;
  mobilePhone?: string;
  homePhone?: string;
  workPhone?: string;
  otherPhone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  timeZone?: string;
  administrativeSex?: "male" | "female" | "unknown";
  genderIdentity?: string;
  sexualOrientation?: string;
  race?: string;
  ethnicity?: string;
  language?: string;
  maritalStatus?: string;
  employment?: string;
  referralSource?: string;
  
  // Emergency contact information
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Insurance information
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  insuranceCopay?: string;
  insuranceDeductible?: string;
  responsibleParty?: string;
  
  // Medical information
  diagnosisCodes?: string[];
  medicationList?: string;
  allergies?: string;
  smokingStatus?: string;
  
  // Consent information
  hipaaConsentSigned?: boolean;
  consentForTreatmentSigned?: boolean;
  consentForCommunication?: string[];
  
  // Notes
  notes?: string;
  billingNotes?: string;
  privateNotes?: string;
  
  // Billing information
  lastPaymentAmount?: number;
  lastPaymentDate?: Date | string;
  
  // Related entities
  emergencyContacts?: EmergencyContact[];
  insuranceInformation?: InsuranceInfo[];
  paymentCards?: PaymentCard[];
  
  // Preferences
  preferredPronouns?: string;
}

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  id: number;
  clientId: number;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

/**
 * Insurance information
 */
export interface InsuranceInfo {
  id: number;
  clientId: number;
  provider: string;
  policyNumber: string;
  groupNumber: string;
  copay: string;
  deductible: string;
  isPrimary: boolean;
}

/**
 * Payment card information
 */
export interface PaymentCard {
  id: number;
  clientId: number;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
} 