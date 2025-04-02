export const MOCK_DIAGNOSES = [
  {
    id: 'diag1',
    clientId: '1',
    code: 'F41.1',
    name: 'Generalized Anxiety Disorder',
    dateAssigned: '2023-03-15T11:30:00',
    assignedBy: 'Dr. Smith',
    status: 'active',
    primary: true,
    notes: 'Client presents with persistent excessive worry, restlessness, and difficulty concentrating. Symptoms have been present for more than 6 months and cause significant distress.',
    severity: 'moderate',
    specifier: '',
    treatmentResponses: [
      {
        date: '2023-04-26T15:30:00',
        response: 'partial',
        notes: 'Client reports some reduction in worry following CBT interventions and medication. Sleep improving, but still experiencing significant anxiety in work situations.'
      }
    ]
  },
  {
    id: 'diag2',
    clientId: '1',
    code: 'F41.9',
    name: 'Anxiety Disorder, Unspecified',
    dateAssigned: '2023-03-15T11:30:00',
    assignedBy: 'Dr. Smith',
    status: 'resolved',
    primary: false,
    notes: 'Initial diagnosis pending further assessment. Updated to more specific diagnosis after 1 month of treatment.',
    severity: 'moderate',
    specifier: '',
    treatmentResponses: []
  },
  {
    id: 'diag3',
    clientId: '1',
    code: 'Z72.820',
    name: 'Sleep Deprivation',
    dateAssigned: '2023-03-15T11:30:00',
    assignedBy: 'Dr. Smith',
    status: 'improving',
    primary: false,
    notes: 'Client reports difficulty falling and staying asleep due to anxious thoughts. Average 4-5 hours of disrupted sleep per night.',
    severity: 'moderate',
    specifier: '',
    treatmentResponses: [
      {
        date: '2023-04-12T11:00:00',
        response: 'improved',
        notes: 'Sleep duration increased to 6-7 hours with medication. Still some difficulty falling asleep.'
      },
      {
        date: '2023-05-10T14:00:00',
        response: 'significantly-improved',
        notes: 'Sleep quality and duration continue to improve with consistent sleep hygiene practices and medication.'
      }
    ]
  },
  {
    id: 'diag4',
    clientId: '2',
    code: 'F43.21',
    name: 'Adjustment Disorder with Depressed Mood',
    dateAssigned: '2023-04-10T09:30:00',
    assignedBy: 'Dr. Jones',
    status: 'active',
    primary: true,
    notes: 'Client experiencing persistent depressed mood, tearfulness, and difficulty adjusting following death of mother 2 months ago.',
    severity: 'moderate',
    specifier: '',
    treatmentResponses: []
  },
  {
    id: 'diag5',
    clientId: '3',
    code: 'F10.20',
    name: 'Alcohol Use Disorder, Moderate',
    dateAssigned: '2023-03-05T14:00:00',
    assignedBy: 'Dr. Smith',
    status: 'active',
    primary: true,
    notes: 'Client reports drinking 4-5 alcoholic beverages daily for past year. Has experienced tolerance, unsuccessful attempts to cut down, and continued use despite interpersonal problems.',
    severity: 'moderate',
    specifier: '',
    treatmentResponses: []
  },
  {
    id: 'diag6',
    clientId: '3',
    code: 'F91.1',
    name: 'Conduct Disorder, Childhood-onset type',
    dateAssigned: '2023-03-05T14:00:00',
    assignedBy: 'Dr. Smith',
    status: 'active',
    primary: false,
    notes: 'Client reports history of childhood behavioral problems including aggression toward others, destruction of property, and theft. Symptoms began around age 9.',
    severity: 'moderate',
    specifier: 'with limited prosocial emotions',
    treatmentResponses: []
  },
  {
    id: 'diag7',
    clientId: '4',
    code: 'F43.10',
    name: 'Post-Traumatic Stress Disorder',
    dateAssigned: '2023-04-24T16:15:00',
    assignedBy: 'Dr. Brown',
    status: 'active',
    primary: true,
    notes: 'Client experiences intrusive memories, nightmares, hypervigilance, and avoidance behaviors following military combat exposure.',
    severity: 'severe',
    specifier: 'with dissociative symptoms',
    treatmentResponses: []
  },
  {
    id: 'diag8',
    clientId: '6',
    code: 'F60.3',
    name: 'Borderline Personality Disorder',
    dateAssigned: '2023-04-27T09:30:00',
    assignedBy: 'Dr. Wilson',
    status: 'active',
    primary: true,
    notes: 'Client presents with emotional instability, impulsivity, unstable relationships, and chronic feelings of emptiness.',
    severity: 'moderate',
    specifier: '',
    treatmentResponses: []
  },
  {
    id: 'diag9',
    clientId: '8',
    code: 'F50.2',
    name: 'Bulimia Nervosa',
    dateAssigned: '2023-04-29T14:00:00',
    assignedBy: 'Dr. Brown',
    status: 'active',
    primary: true,
    notes: 'Client reports recurrent episodes of binge eating followed by compensatory behaviors such as self-induced vomiting. Presents with body image disturbance and excessive influence of body shape on self-evaluation.',
    severity: 'moderate',
    specifier: 'in partial remission',
    treatmentResponses: []
  }
]; 