import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  InputAdornment,
  Paper,
  Typography,
  Divider,
  Box
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Contacts as ContactsIcon
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

// Relationship options
const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'relative', label: 'Other Relative' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'other', label: 'Other' }
];

export const EmergencyContactForm: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    
    // Remove all non-digits
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // If less than 4 digits, just return what was entered
    if (phoneNumber.length < 4) return phoneNumber;
    
    // If less than 7 digits, format as (XXX) XXX
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    
    // Format as (XXX) XXX-XXXX
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Emergency Contact
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide someone we can contact in case of an emergency.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="emergencyContact.firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    required
                    error={!!errors.emergencyContact?.firstName}
                    helperText={errors.emergencyContact?.firstName?.message?.toString()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="emergencyContact.lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    required
                    error={!!errors.emergencyContact?.lastName}
                    helperText={errors.emergencyContact?.lastName?.message?.toString()}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="emergencyContact.relationship"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    required
                    error={!!errors.emergencyContact?.relationship}
                  >
                    <InputLabel id="emergency-relationship-label">Relationship</InputLabel>
                    <Select
                      {...field}
                      labelId="emergency-relationship-label"
                      label="Relationship"
                    >
                      {relationshipOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.emergencyContact?.relationship && (
                      <FormHelperText>
                        {errors.emergencyContact?.relationship?.message?.toString()}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="emergencyContact.phone"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    required
                    error={!!errors.emergencyContact?.phone}
                    helperText={errors.emergencyContact?.phone?.message?.toString()}
                    onChange={(e) => {
                      const formattedValue = formatPhoneNumber(e.target.value);
                      onChange(formattedValue);
                    }}
                    placeholder="(XXX) XXX-XXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="emergencyContact.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    fullWidth
                    error={!!errors.emergencyContact?.email}
                    helperText={errors.emergencyContact?.email?.message?.toString()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
          <Typography variant="body2">
            <strong>Note:</strong> The emergency contact will only be contacted in case of a medical 
            emergency or if we are concerned about the client's wellbeing and cannot reach them directly.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}; 