export const MOCK_HISTORY_EVENTS = [
  // Appointments
  {
    id: 'evt1',
    clientId: '1',
    timestamp: '2023-05-01T14:30:00Z',
    type: 'appointment',
    eventType: 'completed',
    title: 'Therapy Session Completed',
    description: 'Weekly therapy session with Dr. Smith',
    details: 'Patient reported decreased anxiety symptoms.',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      appointmentId: 'appt1',
      status: 'completed',
      duration: 50,
      location: 'Office A'
    }
  },
  {
    id: 'evt2',
    clientId: '1',
    timestamp: '2023-04-28T10:15:00Z',
    type: 'document',
    eventType: 'uploaded',
    title: 'Insurance Card Uploaded',
    description: 'Insurance card scanned and uploaded to system',
    details: 'Front and back of BCBS insurance card uploaded and verified',
    user: {
      id: 'user2',
      name: 'Sarah Admin',
      role: 'Administrative Staff'
    },
    metadata: {
      documentId: 'doc4',
      documentType: 'insurance',
      category: 'insurance',
      fileType: 'jpg'
    }
  },
  {
    id: 'evt3',
    clientId: '1',
    timestamp: '2023-04-24T15:30:00Z',
    type: 'appointment',
    eventType: 'completed',
    title: 'Therapy Session Completed',
    description: 'Weekly therapy session with Dr. Smith',
    details: 'Discussed cognitive behavioral techniques for managing anxiety in workplace situations.',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      appointmentId: 'appt3',
      status: 'completed',
      duration: 50,
      location: 'Office A'
    }
  },
  
  // Clinical Notes
  {
    id: 'evt4',
    clientId: '1',
    timestamp: '2023-04-26T16:30:00Z',
    type: 'note',
    eventType: 'created',
    title: 'Progress Note Created',
    description: 'Therapy session progress note added',
    details: 'Session focused on identifying and challenging automatic negative thoughts related to work performance.',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      noteId: 'note3',
      noteType: 'progress',
      appointmentId: 'appt1'
    }
  },
  {
    id: 'evt5',
    clientId: '1',
    timestamp: '2023-04-26T17:30:00Z',
    type: 'note',
    eventType: 'signed',
    title: 'Progress Note Signed',
    description: 'Therapy session progress note signed',
    details: 'Note signed and locked for April 26 therapy session',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      noteId: 'note3',
      noteType: 'progress',
      appointmentId: 'appt1'
    }
  },
  
  // Billing Events
  {
    id: 'evt6',
    clientId: '1',
    timestamp: '2023-04-12T11:20:00Z',
    type: 'billing',
    eventType: 'payment',
    title: 'Insurance Payment Received',
    description: 'Payment received from insurance provider',
    details: 'Blue Cross Blue Shield payment for April 3rd session',
    user: {
      id: 'user3',
      name: 'Billing Department',
      role: 'Billing Staff'
    },
    metadata: {
      billingId: 'bill3',
      amount: 125.00,
      payer: 'Blue Cross Blue Shield',
      claimNumber: 'BCBS-2023-04-001'
    }
  },
  {
    id: 'evt7',
    clientId: '1',
    timestamp: '2023-04-06T14:15:00Z',
    type: 'billing',
    eventType: 'claim_submitted',
    title: 'Insurance Claim Submitted',
    description: 'Claim submitted to insurance provider',
    details: 'Claim submitted to BCBS for April 3rd therapy session',
    user: {
      id: 'user3',
      name: 'Billing Department',
      role: 'Billing Staff'
    },
    metadata: {
      billingId: 'bill4',
      amount: 125.00,
      claimId: 'clm_mnopqr789',
      insuranceProvider: 'Blue Cross Blue Shield'
    }
  },
  
  // Record Changes and Audit Events
  {
    id: 'evt8',
    clientId: '1',
    timestamp: '2023-04-20T09:45:00Z',
    type: 'record',
    eventType: 'updated',
    title: 'Contact Information Updated',
    description: 'Client phone number updated',
    details: 'Phone number changed from (555) 111-2222 to (555) 123-4567',
    user: {
      id: 'user2',
      name: 'Sarah Admin',
      role: 'Administrative Staff'
    },
    metadata: {
      field: 'phone',
      oldValue: '(555) 111-2222',
      newValue: '(555) 123-4567',
      section: 'contact_information'
    }
  },
  {
    id: 'evt9',
    clientId: '1',
    timestamp: '2023-04-15T11:10:00Z',
    type: 'diagnosis',
    eventType: 'added',
    title: 'Diagnosis Added',
    description: 'New diagnosis added to client record',
    details: 'F41.1 - Generalized Anxiety Disorder added as primary diagnosis',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      diagnosisId: 'diag1',
      code: 'F41.1',
      name: 'Generalized Anxiety Disorder',
      status: 'active',
      primary: true
    }
  },
  
  // System and Security Events
  {
    id: 'evt10',
    clientId: '1',
    timestamp: '2023-04-18T13:22:00Z',
    type: 'security',
    eventType: 'record_accessed',
    title: 'Record Accessed',
    description: 'Client record accessed by Dr. Johnson',
    details: 'Clinical notes section accessed by provider not assigned to client',
    user: {
      id: 'user4',
      name: 'Dr. Johnson',
      role: 'Psychiatrist'
    },
    metadata: {
      section: 'clinical_notes',
      accessType: 'view',
      reasonProvided: 'Medication consultation'
    }
  },
  {
    id: 'evt11',
    clientId: '1',
    timestamp: '2023-04-17T09:15:00Z',
    type: 'message',
    eventType: 'sent',
    title: 'Appointment Reminder Sent',
    description: 'Email reminder sent for upcoming appointment',
    details: 'Automated email reminder for April 24th appointment',
    user: {
      id: 'system',
      name: 'System',
      role: 'Automated Process'
    },
    metadata: {
      messageType: 'email',
      appointmentId: 'appt3',
      subject: 'Appointment Reminder: April 24th at 3:30 PM'
    }
  },
  
  // Initial Intake
  {
    id: 'evt12',
    clientId: '1',
    timestamp: '2023-03-30T09:15:00Z',
    type: 'intake',
    eventType: 'completed',
    title: 'Client Intake Completed',
    description: 'New client intake process completed',
    details: 'Client intake forms completed and reviewed. Initial assessment scheduled.',
    user: {
      id: 'user2',
      name: 'Sarah Admin',
      role: 'Administrative Staff'
    },
    metadata: {
      referredBy: 'Dr. Jennifer Wilson',
      referralReason: 'Anxiety and depression symptoms',
      priorityLevel: 'Standard'
    }
  },
  {
    id: 'evt13',
    clientId: '1',
    timestamp: '2023-03-30T09:20:00Z',
    type: 'document',
    eventType: 'signed',
    title: 'Consent Forms Signed',
    description: 'Treatment consent forms signed by client',
    details: 'HIPAA privacy notice and consent for treatment signed electronically',
    user: {
      id: 'user2',
      name: 'Sarah Admin',
      role: 'Administrative Staff'
    },
    metadata: {
      documentIds: ['doc2', 'doc3'],
      documentTypes: ['consent', 'hipaa'],
      signMethod: 'electronic'
    }
  },
  
  // Assessment Events
  {
    id: 'evt14',
    clientId: '1',
    timestamp: '2023-03-15T11:45:00Z',
    type: 'assessment',
    eventType: 'completed',
    title: 'GAD-7 Assessment Completed',
    description: 'Anxiety assessment completed',
    details: 'Client scored 16/21 on GAD-7, indicating severe anxiety',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      assessmentType: 'GAD-7',
      score: 16,
      interpretation: 'Severe Anxiety',
      category: 'Initial Assessment'
    }
  },
  {
    id: 'evt15',
    clientId: '1',
    timestamp: '2023-03-15T12:00:00Z',
    type: 'assessment',
    eventType: 'completed',
    title: 'PHQ-9 Assessment Completed',
    description: 'Depression assessment completed',
    details: 'Client scored 8/27 on PHQ-9, indicating mild depression',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      assessmentType: 'PHQ-9',
      score: 8,
      interpretation: 'Mild Depression',
      category: 'Initial Assessment'
    }
  },
  
  // Treatment Plan Events
  {
    id: 'evt16',
    clientId: '1',
    timestamp: '2023-03-20T14:00:00Z',
    type: 'treatment',
    eventType: 'created',
    title: 'Treatment Plan Created',
    description: 'Initial treatment plan developed',
    details: 'CBT-focused treatment plan created for anxiety management',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      treatmentApproach: 'CBT',
      primaryDiagnosis: 'F41.1',
      goalCount: 3,
      reviewDate: '2023-06-20T14:00:00Z'
    }
  },
  {
    id: 'evt17',
    clientId: '1',
    timestamp: '2023-04-26T16:00:00Z',
    type: 'treatment',
    eventType: 'updated',
    title: 'Treatment Plan Updated',
    description: 'Treatment plan updated with progress notes',
    details: 'Updated goal progress and added new interventions for sleep management',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      treatmentApproach: 'CBT',
      updatedSections: ['goals', 'interventions'],
      updatedBy: 'Dr. Smith'
    }
  },
  
  // Medication Events
  {
    id: 'evt18',
    clientId: '1',
    timestamp: '2023-04-12T11:30:00Z',
    type: 'medication',
    eventType: 'prescribed',
    title: 'Medication Prescribed',
    description: 'Sertraline dosage increased',
    details: 'Sertraline increased from 50mg to 75mg daily',
    user: {
      id: 'user4',
      name: 'Dr. Johnson',
      role: 'Psychiatrist'
    },
    metadata: {
      medication: 'Sertraline',
      oldDosage: '50mg daily',
      newDosage: '75mg daily',
      reason: 'Partial response to current dosage',
      sideEffects: 'Initial nausea now resolved'
    }
  },
  
  // Consultation Events
  {
    id: 'evt19',
    clientId: '1',
    timestamp: '2023-04-05T13:00:00Z',
    type: 'consultation',
    eventType: 'conducted',
    title: 'Provider Consultation',
    description: 'Consultation between treatment providers',
    details: 'Dr. Smith consulted with Dr. Johnson regarding medication options',
    user: {
      id: 'user1',
      name: 'Dr. Smith',
      role: 'Therapist'
    },
    metadata: {
      consultationType: 'internal',
      providers: ['Dr. Smith', 'Dr. Johnson'],
      topic: 'Medication management',
      outcome: 'Recommendation for psychiatric evaluation'
    }
  },
  
  // Client Communication
  {
    id: 'evt20',
    clientId: '1',
    timestamp: '2023-04-20T09:30:00Z',
    type: 'communication',
    eventType: 'call',
    title: 'Phone Call from Client',
    description: 'Client called to reschedule appointment',
    details: 'Client requested to reschedule April 22nd appointment due to work conflict',
    user: {
      id: 'user5',
      name: 'Front Desk',
      role: 'Receptionist'
    },
    metadata: {
      communicationType: 'phone',
      duration: '4 minutes',
      callOutcome: 'Appointment rescheduled to April 24th',
      appointmentId: 'appt3'
    }
  }
];

// Define user access levels for filtering
export const HISTORY_ACCESS_LEVELS = {
  CLINICAL: ['note', 'assessment', 'diagnosis', 'treatment', 'medication', 'consultation'],
  ADMINISTRATIVE: ['record', 'billing', 'appointment', 'intake', 'document'],
  SECURITY: ['security', 'audit'],
  COMMUNICATION: ['message', 'communication']
};

// Define event type categories and colors for UI display
export const EVENT_TYPE_CONFIG = {
  appointment: { 
    label: 'Appointment', 
    color: 'primary',
    icon: 'Event'
  },
  note: { 
    label: 'Clinical Note', 
    color: 'info',
    icon: 'Note'
  },
  billing: { 
    label: 'Billing & Insurance', 
    color: 'success',
    icon: 'Receipt'
  },
  document: { 
    label: 'Document', 
    color: 'secondary',
    icon: 'Upload'
  },
  assessment: { 
    label: 'Assessment', 
    color: 'warning',
    icon: 'Assignment'
  },
  diagnosis: { 
    label: 'Diagnosis', 
    color: 'error',
    icon: 'LocalHospital'
  },
  record: { 
    label: 'Record Change', 
    color: 'default',
    icon: 'Edit'
  },
  security: { 
    label: 'Security & Access', 
    color: 'error',
    icon: 'Security'
  },
  message: { 
    label: 'Message', 
    color: 'info',
    icon: 'Message'
  },
  intake: { 
    label: 'Intake', 
    color: 'primary',
    icon: 'PersonAdd'
  },
  treatment: { 
    label: 'Treatment Plan', 
    color: 'secondary',
    icon: 'Assignment'
  },
  medication: { 
    label: 'Medication', 
    color: 'error',
    icon: 'Medication'
  },
  consultation: { 
    label: 'Consultation', 
    color: 'info',
    icon: 'Group'
  },
  communication: { 
    label: 'Communication', 
    color: 'primary',
    icon: 'Phone'
  }
}; 