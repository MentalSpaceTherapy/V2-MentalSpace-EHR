import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
  Paper
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { axios } from '../../lib/axios';

// Form steps
import PersonalInfoForm from './client-forms/PersonalInfoForm';
import ContactInfoForm from './client-forms/ContactInfoForm';
import InsuranceForm from './client-forms/InsuranceForm';
import EmergencyContactForm from './client-forms/EmergencyContactForm';
import PreferencesForm from './client-forms/PreferencesForm';

// Validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date().optional().nullable(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  status: z.string().default('active')
});

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  preferredContactMethod: z.enum(['email', 'phone', 'text', 'mail']).default('email')
});

const insuranceSchema = z.object({
  insuranceInfo: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
    copay: z.string().optional(),
    deductible: z.string().optional(),
    insurancePhone: z.string().optional(),
    effectiveDate: z.string().optional(),
    insuranceStatus: z.string().optional(),
    responsibleParty: z.string().optional()
  }).optional().nullable()
});

const emergencyContactSchema = z.object({
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional().nullable()
});

const preferencesSchema = z.object({
  communicationPreferences: z.object({
    allowEmail: z.boolean().default(true),
    allowSMS: z.boolean().default(false),
    allowVoicemail: z.boolean().default(true),
    allowMarketing: z.boolean().default(false),
    preferredTime: z.string().optional()
  }).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable()
});

// Combined schema
const clientFormSchema = personalInfoSchema
  .merge(contactInfoSchema)
  .merge(insuranceSchema)
  .merge(emergencyContactSchema)
  .merge(preferencesSchema);

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onClientAdded: (client: any) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  open,
  onClose,
  onClientAdded
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { label: 'Personal Info', component: PersonalInfoForm, schema: personalInfoSchema },
    { label: 'Contact Info', component: ContactInfoForm, schema: contactInfoSchema },
    { label: 'Insurance', component: InsuranceForm, schema: insuranceSchema },
    { label: 'Emergency Contact', component: EmergencyContactForm, schema: emergencyContactSchema },
    { label: 'Preferences', component: PreferencesForm, schema: preferencesSchema }
  ];
  
  // Set up form
  const methods = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      status: 'active',
      preferredContactMethod: 'email',
      communicationPreferences: {
        allowEmail: true,
        allowSMS: false,
        allowVoicemail: true,
        allowMarketing: false
      }
    }
  });
  
  // Create client mutation
  const createClient = useMutation(
    (data: ClientFormValues) => axios.post('/api/clients', data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['clients']);
        toast.success('Client created successfully');
        onClientAdded(response.data);
      },
      onError: (error: any) => {
        console.error('Error creating client:', error);
        toast.error(error.response?.data?.message || 'Failed to create client');
      }
    }
  );
  
  // Handle next step
  const handleNext = async () => {
    // Validate current step
    const currentSchema = steps[activeStep].schema;
    const isValid = await methods.trigger(Object.keys(currentSchema.shape) as any);
    
    if (isValid) {
      if (activeStep === steps.length - 1) {
        // Submit the form if on the last step
        handleSubmit();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };
  
  // Handle back
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = methods.getValues();
      createClient.mutate(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  // Render current step
  const CurrentStepComponent = steps[activeStep].component;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Add New Client</Typography>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <FormProvider {...methods}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: theme.palette.background.default 
            }}
          >
            <CurrentStepComponent />
          </Paper>
        </FormProvider>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleNext}
          disabled={createClient.isLoading}
        >
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClientModal; 