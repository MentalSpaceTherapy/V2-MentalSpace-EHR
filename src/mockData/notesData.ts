export const MOCK_NOTES = [
  {
    id: 'note1',
    clientId: '1',
    createdAt: '2023-03-15T11:30:00',
    updatedAt: '2023-03-15T11:45:00',
    title: 'Initial Assessment',
    content: `Client presented for initial assessment. Reports symptoms of anxiety including racing thoughts, difficulty sleeping, and persistent worry. States that symptoms began approximately 6 months ago following a job change. No previous psychiatric history reported.

Client describes feeling overwhelmed with daily responsibilities and struggling to maintain work-life balance. Denies suicidal ideation or intent. No current substance use. 

Mental status examination: Alert and oriented x3. Mood anxious, affect congruent. Speech normal rate and rhythm. Thought process logical and goal-directed. No evidence of thought disorder or perceptual disturbances.

Initial impression: Generalized Anxiety Disorder
Plan: Begin weekly therapy sessions. Conduct further assessment of anxiety symptoms and coping strategies. Provide psychoeducation on anxiety.`,
    type: 'progress',
    appointmentId: 'appt3',
    author: 'Dr. Smith',
    status: 'signed',
    signedBy: 'Dr. Smith',
    signedAt: '2023-03-15T12:00:00',
    tags: ['initial assessment', 'anxiety'],
    visibility: 'clinical-staff'
  },
  {
    id: 'note2',
    clientId: '1',
    createdAt: '2023-04-12T11:30:00',
    updatedAt: '2023-04-12T12:00:00',
    title: 'Medication Management',
    content: `Client reports partial improvement in anxiety symptoms since starting sertraline 50mg daily three weeks ago. Sleep has improved, but still experiencing racing thoughts and worry, particularly in the evening.

No significant side effects reported other than mild nausea during the first week, which has now resolved. No suicidal ideation.

Discussed expected timeline for full medication effects. Will increase sertraline to 75mg daily for two weeks, then to 100mg daily if tolerated well. Reviewed possible side effects to monitor.

Client demonstrates good understanding of medication regimen and appears compliant with treatment plan.

Plan: Follow up in 3 weeks to assess response to increased dosage. Continue weekly therapy sessions with Dr. Smith.`,
    type: 'medication',
    appointmentId: 'appt5',
    author: 'Dr. Johnson',
    status: 'signed',
    signedBy: 'Dr. Johnson',
    signedAt: '2023-04-12T12:15:00',
    tags: ['medication', 'anxiety', 'sertraline'],
    visibility: 'clinical-staff'
  },
  {
    id: 'note3',
    clientId: '1',
    createdAt: '2023-04-26T16:30:00',
    updatedAt: '2023-04-26T17:00:00',
    title: 'Therapy Session Notes',
    content: `Session focused on identifying and challenging automatic negative thoughts related to work performance. Client reported high anxiety during team meetings and fear of negative evaluation from colleagues.

Used cognitive restructuring to address thoughts like "If I make a mistake, everyone will think I'm incompetent." Client was able to identify this as a cognitive distortion (all-or-nothing thinking) and generate more balanced perspectives.

Introduced breathing exercises for in-the-moment anxiety management. Client practiced 4-7-8 breathing technique during session and reported decreased subjective anxiety.

Client reports improved sleep since medication adjustment but still experiencing morning anxiety. Will continue to monitor medication effects.

Homework: Daily thought record focusing on work-related anxiety; practice breathing exercises when noticing increased anxiety.

Plan: Continue weekly sessions, focusing on developing additional coping strategies for workplace anxiety.`,
    type: 'progress',
    appointmentId: 'appt1',
    author: 'Dr. Smith',
    status: 'signed',
    signedBy: 'Dr. Smith',
    signedAt: '2023-04-26T17:30:00',
    tags: ['CBT', 'anxiety', 'coping skills'],
    visibility: 'clinical-staff'
  },
  {
    id: 'note4',
    clientId: '1',
    createdAt: '2023-05-10T15:00:00',
    updatedAt: '2023-05-10T15:30:00',
    title: 'Therapy Session Notes',
    content: `Client arrived on time and appeared more relaxed than previous sessions. Reports "feeling more like myself" over the past week. Has been consistently using thought records and identified several patterns of catastrophic thinking related to work performance.

Client successfully utilized breathing techniques during a stressful presentation at work and reported that it helped manage anxiety symptoms. Discussed a recent interaction with supervisor where client was able to ask for clarification rather than assuming negative evaluation.

Medication seems to be helpful at current dosage (sertraline 100mg daily). Client reports improved sleep quality and decreased frequency of anxious thoughts.

Session focused on developing a hierarchy of anxiety-provoking situations at work to begin graduated exposure. Client identified speaking in large meetings as most anxiety-provoking.

Homework: Continue thought records; begin progressive muscle relaxation practice; create detailed anxiety hierarchy for workplace situations.

Plan: Begin exposure exercises in next session; continue building coping skills toolkit.`,
    type: 'progress',
    appointmentId: 'appt2',
    author: 'Dr. Smith',
    status: 'signed',
    signedBy: 'Dr. Smith',
    signedAt: '2023-05-10T16:00:00',
    tags: ['CBT', 'anxiety', 'exposure therapy'],
    visibility: 'clinical-staff'
  },
  {
    id: 'note5',
    clientId: '1',
    createdAt: '2023-03-15T13:00:00',
    updatedAt: '2023-03-15T13:10:00',
    title: 'Phone Call',
    content: `Brief phone contact with client to confirm insurance details and schedule next appointment. Client reports understanding treatment plan and is motivated to begin therapy process. No clinical concerns noted during call.`,
    type: 'contact',
    appointmentId: null,
    author: 'Administrative Staff',
    status: 'signed',
    signedBy: 'Administrative Staff',
    signedAt: '2023-03-15T13:15:00',
    tags: ['phone call', 'administrative'],
    visibility: 'all-staff'
  },
  {
    id: 'note6',
    clientId: '2',
    createdAt: '2023-04-10T10:30:00',
    updatedAt: '2023-04-10T11:00:00',
    title: 'Initial Assessment',
    content: `Client presented for initial assessment seeking support for grief following the recent loss of her mother. Reports symptoms including persistent sadness, difficulty concentrating, disrupted sleep patterns, and decreased interest in previously enjoyed activities.

Loss occurred 2 months ago after mother's prolonged illness. Client described close relationship with mother and feels she is struggling to adjust to life without her. Currently living alone, but reports good support from siblings who live nearby.

Mental status examination: Alert and oriented x3. Mood depressed, affect constricted but appropriate to content. No evidence of psychosis or thought disorder. Denies suicidal ideation or intent.

Initial impression: Adjustment Disorder with Depressed Mood vs. Complicated Grief
Plan: Begin weekly therapy sessions focused on grief processing. Provide psychoeducation on normal grief responses. Assess for development of Major Depressive Disorder at future sessions.`,
    type: 'progress',
    appointmentId: 'appt9',
    author: 'Dr. Jones',
    status: 'signed',
    signedBy: 'Dr. Jones',
    signedAt: '2023-04-10T11:30:00',
    tags: ['initial assessment', 'grief'],
    visibility: 'clinical-staff'
  }
]; 