import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  useTheme,
  Alert,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CompleteIcon,
} from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form steps
import { PersonalInfoForm } from './client-forms/PersonalInfoForm';
import { ContactInfoForm } from './client-forms/ContactInfoForm';
import { InsuranceInfoForm } from './client-forms/InsuranceInfoForm';
import { EmergencyContactForm } from './client-forms/EmergencyContactForm';
import { PrimaryCareForm } from './client-forms/PrimaryCareForm';
import { CustomFieldsForm } from './client-forms/CustomFieldsForm';

// Types for client data
export interface ClientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  status: string;
  maritalStatus: string;
  
  // Contact Information
  email: string;
  phone: string;
  address: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferredContact: string[];
  contactNotes?: string;
  
  // Insurance Information
  insuranceProvider: string;
  policyNumber: string;
  groupNumber?: string;
  policyHolder: {
    isSelf: boolean;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    relationship?: string;
  };
  
  // Emergency Contact
  emergencyContact: {
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Primary Care Provider
  primaryCareProvider: {
    name: string;
    facility?: string;
    phone?: string;
    email?: string;
    address?: string;
    lastVisit?: string;
  };
  
  // Custom Fields
  customFields: Record<string, any>;
}

// Validation schemas for each step
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  status: z.string().min(1, 'Status is required'),
  maritalStatus: z.string().optional(),
});

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    unit: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  preferredContact: z.array(z.string()).min(1, 'At least one contact method is required'),
  contactNotes: z.string().optional(),
});

const insuranceInfoSchema = z.object({
  insuranceProvider: z.string().min(1, 'Insurance provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
  policyHolder: z.object({
    isSelf: z.boolean(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    relationship: z.string().optional().nullable(),
  })
  .refine(data => {
    // If policyHolder is not self, require these fields
    if (!data.isSelf) {
      return !!(data.firstName && data.lastName && data.dateOfBirth && data.relationship);
    }
    return true;
  }, {
    message: "Policy holder information is required when not self",
    path: ["isSelf"],
  }),
});

const emergencyContactSchema = z.object({
  emergencyContact: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
  }),
});

const primaryCareSchema = z.object({
  primaryCareProvider: z.object({
    name: z.string().min(1, 'Provider name is required'),
    facility: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    address: z.string().optional(),
    lastVisit: z.string().optional(),
  }),
});

const customFieldsSchema = z.object({
  customFields: z.record(z.any()),
});

// Combined schema for the entire form
const clientFormSchema = z.object({
  ...personalInfoSchema.shape,
  ...contactInfoSchema.shape,
  ...insuranceInfoSchema.shape,
  ...emergencyContactSchema.shape,
  ...primaryCareSchema.shape,
  ...customFieldsSchema.shape,
});

// Default values for the form
const defaultValues: ClientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  status: 'active',
  maritalStatus: '',
  
  email: '',
  phone: '',
  address: {
    street: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  },
  preferredContact: ['email'],
  contactNotes: '',
  
  insuranceProvider: '',
  policyNumber: '',
  groupNumber: '',
  policyHolder: {
    isSelf: true,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    relationship: '',
  },
  
  emergencyContact: {
    firstName: '',
    lastName: '',
    relationship: '',
    phone: '',
    email: '',
  },
  
  primaryCareProvider: {
    name: '',
    facility: '',
    phone: '',
    email: '',
    address: '',
    lastVisit: '',
  },
  
  customFields: {},
};

// Step definitions
const steps = [
  {
    label: 'Personal Information',
    description: 'Basic client details',
    component: PersonalInfoForm,
    schema: personalInfoSchema,
  },
  {
    label: 'Contact Information',
    description: 'Address and contact preferences',
    component: ContactInfoForm,
    schema: contactInfoSchema,
  },
  {
    label: 'Insurance',
    description: 'Insurance and billing details',
    component: InsuranceInfoForm,
    schema: insuranceInfoSchema,
  },
  {
    label: 'Emergency Contact',
    description: 'Emergency contact information',
    component: EmergencyContactForm,
    schema: emergencyContactSchema,
  },
  {
    label: 'Primary Care',
    description: 'Primary care provider details',
    component: PrimaryCareForm,
    schema: primaryCareSchema,
  },
  {
    label: 'Additional Information',
    description: 'Practice-specific custom fields',
    component: CustomFieldsForm,
    schema: customFieldsSchema,
  },
];

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ClientFormData>;
  isEdit?: boolean;
  onSubmit: (data: ClientFormData) => Promise<void>;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  open,
  onClose,
  initialData,
  isEdit = false,
  onSubmit,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create form methods with validation
  const methods = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { ...defaultValues, ...initialData },
    mode: 'onChange',
  });
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      methods.reset({ ...defaultValues, ...initialData });
      setActiveStep(0);
      setError(null);
    }
  }, [open, initialData, methods]);
  
  // Handle step change
  const handleNext = async () => {
    // Get current step schema
    const currentSchema = steps[activeStep].schema;
    
    // Get form values
    const formValues = methods.getValues();
    
    // Validate current step
    try {
      await currentSchema.parseAsync(formValues);
      // If valid, move to next step
      setActiveStep((prevStep) => prevStep + 1);
    } catch (err) {
      // Trigger field validations
      methods.trigger();
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleFormSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'An error occurred while saving the client.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Compute current progress
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Dialog 
      open={open} 
      onClose={!isSubmitting ? onClose : undefined}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        {isEdit ? 'Edit Client' : 'Add New Client'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ px: 3, pb: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 2, height: 6, borderRadius: 3 }}
        />
        
        <Stepper activeStep={activeStep} orientation="horizontal" alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel>
                <Typography variant="caption">{step.label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent dividers>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)} id="client-form">
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary">
                {steps[activeStep].label}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {steps[activeStep].description}
              </Typography>
              
              {/* Render current step component */}
              {activeStep === 0 && <PersonalInfoForm />}
              {activeStep === 1 && <ContactInfoForm />}
              {activeStep === 2 && <InsuranceInfoForm />}
              {activeStep === 3 && <EmergencyContactForm />}
              {activeStep === 4 && <PrimaryCareForm />}
              {activeStep === 5 && <CustomFieldsForm />}
            </Box>
          </form>
        </FormProvider>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={isSubmitting}
            startIcon={<BackIcon />}
            variant="outlined"
          >
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            endIcon={<NextIcon />}
            disabled={isSubmitting}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            form="client-form"
            variant="contained"
            color="primary"
            endIcon={<CompleteIcon />}
            disabled={isSubmitting}
            sx={{ ml: 1 }}
          >
            {isEdit ? 'Update Client' : 'Add Client'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 