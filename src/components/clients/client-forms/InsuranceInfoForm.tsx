import React, { useState } from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Divider,
  Box,
  Collapse,
  Paper,
  Button,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  CreditCard as InsuranceCardIcon,
  ContentCopy as CopyIcon,
  CardMembership as PolicyIcon,
  Person as PersonIcon,
  Groups as GroupIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { format } from 'date-fns';

// Mock insurance providers list
const insuranceProviders = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealthcare',
  'Humana',
  'Kaiser Permanente',
  'Medicare',
  'Medicaid',
  'Tricare',
  'Oxford Health Plans',
  'Anthem',
  'Optum',
  'Other'
];

// Relationship options
const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'other', label: 'Other' }
];

export const InsuranceInfoForm: React.FC = () => {
  const { control, setValue, formState: { errors } } = useFormContext();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Watch for policy holder type changes
  const policyHolderIsSelf = useWatch({
    control,
    name: 'policyHolder.isSelf',
    defaultValue: true
  });
  
  // Format policy/group numbers
  const formatPolicyNumber = (value: string) => {
    // Remove any non-alphanumeric characters
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  };
  
  // Mock verification of insurance info
  const verifyInsurance = () => {
    // Simulating API call to verify insurance
    setShowVerificationSuccess(false);
    setVerificationError(null);
    
    // Just a mock check - in reality this would call your verification API
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.3) {
        setShowVerificationSuccess(true);
      } else {
        setVerificationError('Unable to verify insurance information. Please check the policy number and try again.');
      }
    }, 1500);
  };
  
  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Controller
              name="insuranceProvider"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.insuranceProvider}>
                  <InputLabel id="insurance-provider-label">Insurance Provider</InputLabel>
                  <Select
                    {...field}
                    labelId="insurance-provider-label"
                    label="Insurance Provider"
                    required
                  >
                    {insuranceProviders.map((provider) => (
                      <MenuItem key={provider} value={provider}>
                        {provider}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.insuranceProvider && (
                    <FormHelperText>{errors.insuranceProvider.message?.toString()}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="policyNumber"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <TextField
                {...field}
                label="Policy Number"
                fullWidth
                required
                onChange={(e) => {
                  const formattedValue = formatPolicyNumber(e.target.value);
                  onChange(formattedValue);
                }}
                error={!!errors.policyNumber}
                helperText={errors.policyNumber?.message?.toString()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PolicyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="groupNumber"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <TextField
                {...field}
                label="Group Number (if applicable)"
                fullWidth
                onChange={(e) => {
                  const formattedValue = formatPolicyNumber(e.target.value);
                  onChange(formattedValue);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 1, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Policy Holder Information
            </Typography>
            
            <Controller
              name="policyHolder.isSelf"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  value={field.value.toString()}
                  onChange={(e) => {
                    const value = e.target.value === 'true';
                    field.onChange(value);
                    
                    // If changing to self, clear other policy holder fields
                    if (value) {
                      setValue('policyHolder.firstName', '');
                      setValue('policyHolder.lastName', '');
                      setValue('policyHolder.dateOfBirth', '');
                      setValue('policyHolder.relationship', '');
                    }
                  }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Client is the policy holder"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Someone else is the policy holder"
                  />
                </RadioGroup>
              )}
            />
          </Box>
          
          <Collapse in={!policyHolderIsSelf}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="policyHolder.firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Policy Holder First Name"
                        fullWidth
                        required={!policyHolderIsSelf}
                        error={!policyHolderIsSelf && !!errors.policyHolder?.firstName}
                        helperText={
                          !policyHolderIsSelf && 
                          errors.policyHolder?.firstName?.message?.toString()
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="policyHolder.lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Policy Holder Last Name"
                        fullWidth
                        required={!policyHolderIsSelf}
                        error={!policyHolderIsSelf && !!errors.policyHolder?.lastName}
                        helperText={
                          !policyHolderIsSelf && 
                          errors.policyHolder?.lastName?.message?.toString()
                        }
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="policyHolder.dateOfBirth"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <DatePicker
                        {...field}
                        label="Policy Holder Date of Birth"
                        value={value ? new Date(value) : null}
                        onChange={(date) => {
                          onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: !policyHolderIsSelf,
                            error: !policyHolderIsSelf && !!errors.policyHolder?.dateOfBirth,
                            helperText: 
                              !policyHolderIsSelf && 
                              errors.policyHolder?.dateOfBirth?.message?.toString(),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="policyHolder.relationship"
                    control={control}
                    render={({ field }) => (
                      <FormControl 
                        fullWidth 
                        required={!policyHolderIsSelf}
                        error={!policyHolderIsSelf && !!errors.policyHolder?.relationship}
                      >
                        <InputLabel id="relationship-label">Relationship to Client</InputLabel>
                        <Select
                          {...field}
                          labelId="relationship-label"
                          label="Relationship to Client"
                        >
                          <MenuItem value="">
                            <em>Select...</em>
                          </MenuItem>
                          {relationshipOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {!policyHolderIsSelf && errors.policyHolder?.relationship && (
                          <FormHelperText>
                            {errors.policyHolder?.relationship?.message?.toString()}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={verifyInsurance}
              startIcon={<InsuranceCardIcon />}
            >
              Verify Insurance Information
            </Button>
          </Box>
          
          {showVerificationSuccess && (
            <Alert 
              severity="success" 
              sx={{ mt: 2 }}
              action={
                <IconButton
                  aria-label="copy"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    const info = `Provider: ${useWatch({ control, name: 'insuranceProvider' })}, Policy #: ${useWatch({ control, name: 'policyNumber' })}`;
                    copyToClipboard(info);
                  }}
                >
                  <CopyIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Insurance information verified successfully!
            </Alert>
          )}
          
          {verificationError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {verificationError}
            </Alert>
          )}
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}; 