import React from 'react';

// Define note template structure
interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: {
    title: string;
    key: string;
    placeholder: string;
    required?: boolean;
  }[];
  defaultContent: string;
}

// Note templates
export const NOTE_TEMPLATES: Record<string, NoteTemplate> = {
  progressNote: {
    id: 'progressNote',
    name: 'Progress Note',
    description: 'Standard therapy session note',
    icon: 'Note',
    sections: [
      {
        title: 'Subjective',
        key: 'subjective',
        placeholder: 'Client\'s statements, complaints, and reported experiences',
        required: true,
      },
      {
        title: 'Objective',
        key: 'objective',
        placeholder: 'Observations, assessment results, mental status examination',
        required: true,
      },
      {
        title: 'Assessment',
        key: 'assessment',
        placeholder: 'Clinical impressions, diagnoses, interpretation of findings',
        required: true,
      },
      {
        title: 'Plan',
        key: 'plan',
        placeholder: 'Treatment recommendations, interventions, follow-up plans',
        required: true,
      },
    ],
    defaultContent: `<h3>Subjective</h3>
<p>Client reports...</p>

<h3>Objective</h3>
<p>Mental status examination: Client presented as...</p>

<h3>Assessment</h3>
<p>Client continues to experience symptoms consistent with...</p>

<h3>Plan</h3>
<p>1. Continue weekly therapy sessions</p>
<p>2. Focus on...</p>
<p>3. Next appointment scheduled for...</p>`,
  },
  
  intakeAssessment: {
    id: 'intakeAssessment',
    name: 'Intake Assessment',
    description: 'Initial client evaluation',
    icon: 'AssignmentInd',
    sections: [
      {
        title: 'Presenting Problem',
        key: 'presentingProblem',
        placeholder: 'Reason for seeking treatment, current symptoms, and concerns',
        required: true,
      },
      {
        title: 'History',
        key: 'history',
        placeholder: 'Relevant personal, family, treatment, and medical history',
        required: true,
      },
      {
        title: 'Mental Status Examination',
        key: 'mentalStatus',
        placeholder: 'Observations of appearance, behavior, mood, affect, etc.',
        required: true,
      },
      {
        title: 'Risk Assessment',
        key: 'riskAssessment',
        placeholder: 'Evaluation of risk factors, including suicidal/homicidal ideation',
        required: true,
      },
      {
        title: 'Diagnosis',
        key: 'diagnosis',
        placeholder: 'Diagnostic impressions and differential diagnoses',
        required: true,
      },
      {
        title: 'Treatment Recommendations',
        key: 'treatment',
        placeholder: 'Proposed treatment plan and recommendations',
        required: true,
      },
    ],
    defaultContent: `<h3>Presenting Problem</h3>
<p>Client presents with...</p>

<h3>History</h3>
<p>Client reports history of...</p>

<h3>Mental Status Examination</h3>
<p>Appearance: </p>
<p>Behavior: </p>
<p>Mood/Affect: </p>
<p>Speech: </p>
<p>Thought Process/Content: </p>
<p>Cognition: </p>
<p>Insight/Judgment: </p>

<h3>Risk Assessment</h3>
<p>Suicidal Ideation: </p>
<p>Homicidal Ideation: </p>
<p>Self-harm: </p>
<p>Risk Level: </p>

<h3>Diagnosis</h3>
<p>Impression: </p>
<p>Differential Diagnosis: </p>

<h3>Treatment Recommendations</h3>
<p>1. </p>
<p>2. </p>
<p>3. </p>`,
  },
  
  treatmentPlanReview: {
    id: 'treatmentPlanReview',
    name: 'Treatment Plan Review',
    description: 'Review and update of treatment goals',
    icon: 'Assignment',
    sections: [
      {
        title: 'Progress Review',
        key: 'progressReview',
        placeholder: 'Review of progress since last treatment plan',
        required: true,
      },
      {
        title: 'Goals Status',
        key: 'goalsStatus',
        placeholder: 'Status of previous treatment goals (met, ongoing, modified)',
        required: true,
      },
      {
        title: 'Updated Goals',
        key: 'updatedGoals',
        placeholder: 'New or revised treatment goals',
        required: true,
      },
      {
        title: 'Interventions',
        key: 'interventions',
        placeholder: 'Treatment methods and interventions to be utilized',
        required: true,
      },
      {
        title: 'Client Input',
        key: 'clientInput',
        placeholder: 'Client\'s input and agreement with treatment plan',
        required: true,
      },
    ],
    defaultContent: `<h3>Progress Review</h3>
<p>Since the last treatment plan, client has...</p>

<h3>Goals Status</h3>
<p>Goal 1: [Met/Ongoing/Modified]</p>
<p>Goal 2: [Met/Ongoing/Modified]</p>
<p>Goal 3: [Met/Ongoing/Modified]</p>

<h3>Updated Goals</h3>
<p>1. </p>
<p>2. </p>
<p>3. </p>

<h3>Interventions</h3>
<p>1. </p>
<p>2. </p>
<p>3. </p>

<h3>Client Input</h3>
<p>Client reports...</p>`,
  },
  
  medicationManagement: {
    id: 'medicationManagement',
    name: 'Medication Management',
    description: 'Medication review and adjustments',
    icon: 'MedicalServices',
    sections: [
      {
        title: 'Current Medications',
        key: 'currentMedications',
        placeholder: 'List of current medications, dosages, and frequency',
        required: true,
      },
      {
        title: 'Medication Response',
        key: 'medicationResponse',
        placeholder: 'Client\'s response to current medications',
        required: true,
      },
      {
        title: 'Side Effects',
        key: 'sideEffects',
        placeholder: 'Reported side effects or adverse reactions',
        required: true,
      },
      {
        title: 'Changes',
        key: 'changes',
        placeholder: 'Changes to medication regimen',
        required: true,
      },
      {
        title: 'Plan',
        key: 'plan',
        placeholder: 'Follow-up plan and monitoring',
        required: true,
      },
    ],
    defaultContent: `<h3>Current Medications</h3>
<p>1. </p>
<p>2. </p>

<h3>Medication Response</h3>
<p>Client reports...</p>

<h3>Side Effects</h3>
<p>Client denies/reports the following side effects:</p>

<h3>Changes</h3>
<p>Based on client's presentation and reported symptoms:</p>
<p>1. Continue... </p>
<p>2. Increase/Decrease... </p>
<p>3. Discontinue... </p>
<p>4. Add... </p>

<h3>Plan</h3>
<p>Follow up in [timeframe]</p>
<p>Monitoring for...</p>`,
  },
  
  phoneContact: {
    id: 'phoneContact',
    name: 'Phone Contact',
    description: 'Documentation of phone communication',
    icon: 'Phone',
    sections: [
      {
        title: 'Reason for Contact',
        key: 'reasonForContact',
        placeholder: 'Purpose of the phone communication',
        required: true,
      },
      {
        title: 'Discussion',
        key: 'discussion',
        placeholder: 'Summary of the phone conversation',
        required: true,
      },
      {
        title: 'Action Taken',
        key: 'actionTaken',
        placeholder: 'Actions taken as a result of the call',
        required: true,
      },
      {
        title: 'Follow-up',
        key: 'followUp',
        placeholder: 'Necessary follow-up steps',
        required: false,
      },
    ],
    defaultContent: `<h3>Reason for Contact</h3>
<p>Client called regarding...</p>

<h3>Discussion</h3>
<p>During the call, client reported...</p>

<h3>Action Taken</h3>
<p>In response to client's concerns, I...</p>

<h3>Follow-up</h3>
<p>Next steps include...</p>`,
  },
  
  dischargeNote: {
    id: 'dischargeNote',
    name: 'Discharge Summary',
    description: 'Treatment completion and discharge',
    icon: 'ExitToApp',
    sections: [
      {
        title: 'Reason for Discharge',
        key: 'reasonForDischarge',
        placeholder: 'Reason for discontinuing treatment',
        required: true,
      },
      {
        title: 'Treatment Summary',
        key: 'treatmentSummary',
        placeholder: 'Summary of treatment provided',
        required: true,
      },
      {
        title: 'Progress Assessment',
        key: 'progressAssessment',
        placeholder: 'Assessment of client progress and goal achievement',
        required: true,
      },
      {
        title: 'Current Status',
        key: 'currentStatus',
        placeholder: 'Client\'s current status at discharge',
        required: true,
      },
      {
        title: 'Recommendations',
        key: 'recommendations',
        placeholder: 'Post-discharge recommendations and referrals',
        required: true,
      },
    ],
    defaultContent: `<h3>Reason for Discharge</h3>
<p>Client is being discharged due to...</p>

<h3>Treatment Summary</h3>
<p>Client participated in [treatment modality] from [start date] to [end date].</p>
<p>Treatment focused on...</p>

<h3>Progress Assessment</h3>
<p>Client made [significant/moderate/minimal] progress in the following areas:</p>
<p>1. </p>
<p>2. </p>
<p>3. </p>

<h3>Current Status</h3>
<p>At the time of discharge, client presents as...</p>
<p>Symptoms have [improved/remained stable/worsened].</p>

<h3>Recommendations</h3>
<p>1. </p>
<p>2. </p>
<p>3. </p>`,
  },
};

// Get template by ID
export const getTemplateById = (id: string): NoteTemplate | undefined => {
  return NOTE_TEMPLATES[id];
};

// Get all templates as array
export const getAllTemplates = (): NoteTemplate[] => {
  return Object.values(NOTE_TEMPLATES);
};

export default {
  NOTE_TEMPLATES,
  getTemplateById,
  getAllTemplates,
}; 