import React, { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Paper,
  Divider,
  Grid
} from '@mui/material';
import ClientPersonalInfoForm from './client-forms/PersonalInfoForm';
import ClientContactInfoForm from './client-forms/ContactInfoForm';
import InsuranceForm from './client-forms/InsuranceForm';
import EmergencyContactForm from './client-forms/EmergencyContactForm';
import PreferencesForm from './client-forms/PreferencesForm';
import MedicalHistoryForm from './client-forms/MedicalHistoryForm';

// Define the validation schema for each step
const personalInfoSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dateOfBirth: yup.date()
    .nullable()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  gender: yup.string().required('Gender is required'),
  status: yup.string().required('Status is required'),
  maritalStatus: yup.string(),
  occupation: yup.string(),
});

const contactInfoSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  alternatePhone: yup.string(),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  preferredContactMethod: yup.string().required('Preferred contact method is required'),
});

const insuranceSchema = yup.object().shape({
  insuranceProvider: yup.string(),
  insuranceId: yup.string(),
  groupNumber: yup.string(),
  policyHolder: yup.string(),
  policyHolderRelationship: yup.string(),
  policyHolderDateOfBirth: yup.date().nullable(),
  copay: yup.number().transform((value) => (isNaN(value) ? undefined : value)),
  secondaryInsurance: yup.boolean(),
  secondaryInsuranceProvider: yup.string().when('secondaryInsurance', {
    is: true,
    then: (schema) => schema.required('Secondary insurance provider is required')
  }),
  secondaryInsuranceId: yup.string().when('secondaryInsurance', {
    is: true,
    then: (schema) => schema.required('Secondary insurance ID is required')
  }),
});

const emergencyContactSchema = yup.object().shape({
  emergencyContactName: yup.string().required('Emergency contact name is required'),
  emergencyContactPhone: yup.string().required('Emergency contact phone is required'),
  emergencyContactRelationship: yup.string().required('Emergency contact relationship is required'),
  emergencyContactAddress: yup.string(),
});

const medicalHistorySchema = yup.object().shape({
  primaryCareProvider: yup.string(),
  primaryCareProviderPhone: yup.string(),
  allergies: yup.string(),
  medications: yup.string(),
  existingConditions: yup.string(),
  previousTreatments: yup.string(),
});

const preferencesSchema = yup.object().shape({
  preferredTherapist: yup.string(),
  preferredAppointmentDays: yup.array().of(yup.string()),
  preferredAppointmentTime: yup.string(),
  communicationPreferences: yup.object().shape({
    allowEmails: yup.boolean(),
    allowTexts: yup.boolean(),
    allowVoiceCalls: yup.boolean(),
  }),
  notes: yup.string(),
});

// Combine all schemas
const clientSchema = yup.object().shape({
  ...personalInfoSchema.fields,
  ...contactInfoSchema.fields,
  ...insuranceSchema.fields,
  ...emergencyContactSchema.fields,
  ...medicalHistorySchema.fields,
  ...preferencesSchema.fields,
});

// Steps for the form
const steps = [
  'Personal Information',
  'Contact Details',
  'Insurance',
  'Emergency Contact',
  'Medical History',
  'Preferences',
];

// Schema map for validation
const schemaMap = {
  0: personalInfoSchema,
  1: contactInfoSchema,
  2: insuranceSchema,
  3: emergencyContactSchema,
  4: medicalHistorySchema,
  5: preferencesSchema,
};

export interface ClientFormValues {
  // Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  status: string;
  maritalStatus?: string;
  occupation?: string;
  
  // Contact Info
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  preferredContactMethod: 'email' | 'phone' | 'text' | 'mail';
  
  // Insurance
  insuranceProvider?: string;
  insuranceId?: string;
  groupNumber?: string;
  policyHolder?: string;
  policyHolderRelationship?: string;
  policyHolderDateOfBirth?: Date | null;
  copay?: number;
  secondaryInsurance?: boolean;
  secondaryInsuranceProvider?: string;
  secondaryInsuranceId?: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  emergencyContactAddress?: string;
  
  // Medical History
  primaryCareProvider?: string;
  primaryCareProviderPhone?: string;
  allergies?: string;
  medications?: string;
  existingConditions?: string;
  previousTreatments?: string;
  
  // Preferences
  preferredTherapist?: string;
  preferredAppointmentDays?: string[];
  preferredAppointmentTime?: string;
  communicationPreferences?: {
    allowEmails: boolean;
    allowTexts: boolean;
    allowVoiceCalls: boolean;
  };
  notes?: string;
}

interface ClientFormProps {
  initialData?: Partial<ClientFormValues>;
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  therapistOptions?: Array<{ id: string; name: string }>;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  therapistOptions = [],
}) => {
  const [activeStep, setActiveStep] = useState(0);
  
  const methods = useForm<ClientFormValues>({
    defaultValues: {
      // Personal Info
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      dateOfBirth: initialData?.dateOfBirth || null,
      gender: initialData?.gender || '',
      status: initialData?.status || 'active',
      maritalStatus: initialData?.maritalStatus || '',
      occupation: initialData?.occupation || '',
      
      // Contact Info
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      alternatePhone: initialData?.alternatePhone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zipCode: initialData?.zipCode || '',
      preferredContactMethod: initialData?.preferredContactMethod || 'email',
      
      // Insurance
      insuranceProvider: initialData?.insuranceProvider || '',
      insuranceId: initialData?.insuranceId || '',
      groupNumber: initialData?.groupNumber || '',
      policyHolder: initialData?.policyHolder || '',
      policyHolderRelationship: initialData?.policyHolderRelationship || '',
      policyHolderDateOfBirth: initialData?.policyHolderDateOfBirth || null,
      copay: initialData?.copay,
      secondaryInsurance: initialData?.secondaryInsurance || false,
      secondaryInsuranceProvider: initialData?.secondaryInsuranceProvider || '',
      secondaryInsuranceId: initialData?.secondaryInsuranceId || '',
      
      // Emergency Contact
      emergencyContactName: initialData?.emergencyContactName || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      emergencyContactRelationship: initialData?.emergencyContactRelationship || '',
      emergencyContactAddress: initialData?.emergencyContactAddress || '',
      
      // Medical History
      primaryCareProvider: initialData?.primaryCareProvider || '',
      primaryCareProviderPhone: initialData?.primaryCareProviderPhone || '',
      allergies: initialData?.allergies || '',
      medications: initialData?.medications || '',
      existingConditions: initialData?.existingConditions || '',
      previousTreatments: initialData?.previousTreatments || '',
      
      // Preferences
      preferredTherapist: initialData?.preferredTherapist || '',
      preferredAppointmentDays: initialData?.preferredAppointmentDays || [],
      preferredAppointmentTime: initialData?.preferredAppointmentTime || '',
      communicationPreferences: initialData?.communicationPreferences || {
        allowEmails: true,
        allowTexts: false,
        allowVoiceCalls: false,
      },
      notes: initialData?.notes || '',
    },
    resolver: yupResolver(clientSchema), // Full validation on submit
    mode: 'onBlur',
  });
  
  const { handleSubmit, trigger, formState: { errors } } = methods;
  
  const handleNext = async () => {
    // Validate current step
    const currentSchema = schemaMap[activeStep as keyof typeof schemaMap];
    const isValid = await trigger(Object.keys(currentSchema.fields) as any);
    
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const onFormSubmit = (data: ClientFormValues) => {
    onSubmit(data);
  };
  
  const hasStepErrors = () => {
    const currentSchema = schemaMap[activeStep as keyof typeof schemaMap];
    const currentFields = Object.keys(currentSchema.fields);
    
    return currentFields.some(field => 
      errors[field as keyof ClientFormValues] !== undefined
    );
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ClientPersonalInfoForm />;
      case 1:
        return <ClientContactInfoForm />;
      case 2:
        return <InsuranceForm />;
      case 3:
        return <EmergencyContactForm />;
      case 4:
        return <MedicalHistoryForm />;
      case 5:
        return <PreferencesForm therapistOptions={therapistOptions} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialData?.id ? 'Edit Client' : 'Add New Client'}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Divider sx={{ mb: 3 }} />
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
            <Button
              disabled={activeStep === 0 || isLoading}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Box>
              <Button 
                onClick={onCancel} 
                sx={{ mr: 1 }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Client'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={hasStepErrors() || isLoading}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </FormProvider>
    </Paper>
  );
};

export default ClientForm; 