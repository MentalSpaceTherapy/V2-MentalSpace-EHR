import React from 'react';
import { 
  Grid, 
  TextField, 
  InputAdornment,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  MedicalServices as MedicalIcon,
  Business as BusinessIcon,
  Today as DateIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Controller, useFormContext } from 'react-hook-form';
import { format } from 'date-fns';

export const PrimaryCareForm: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  const [hasProvider, setHasProvider] = React.useState(true);
  
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">
              Primary Care Provider Information
            </Typography>
            <FormControlLabel
              control={
                <Switch 
                  checked={hasProvider}
                  onChange={(e) => setHasProvider(e.target.checked)}
                  color="primary"
                />
              }
              label={hasProvider ? "Has Primary Care Provider" : "No Primary Care Provider"}
            />
          </Box>
          
          {hasProvider ? (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="primaryCareProvider.name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Provider Name"
                        fullWidth
                        required
                        error={!!errors.primaryCareProvider?.name}
                        helperText={errors.primaryCareProvider?.name?.message?.toString()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MedicalIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="primaryCareProvider.facility"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Facility/Practice Name"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="primaryCareProvider.phone"
                    control={control}
                    render={({ field: { onChange, ...field } }) => (
                      <TextField
                        {...field}
                        label="Phone Number"
                        fullWidth
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
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="primaryCareProvider.email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email Address"
                        type="email"
                        fullWidth
                        error={!!errors.primaryCareProvider?.email}
                        helperText={errors.primaryCareProvider?.email?.message?.toString()}
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
                
                <Grid item xs={12}>
                  <Controller
                    name="primaryCareProvider.address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Address"
                        fullWidth
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="primaryCareProvider.lastVisit"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <DatePicker
                        {...field}
                        label="Last Visit Date"
                        value={value ? new Date(value) : null}
                        onChange={(date) => {
                          onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DateIcon color="action" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography variant="body1" color="text.secondary">
                No primary care provider information provided.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                We recommend all clients have a primary care physician for their overall health management.
              </Typography>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
            <Typography variant="body2">
              <strong>Why we collect this:</strong> Having your primary care provider's information allows us to coordinate care when necessary, with your permission and in compliance with HIPAA regulations.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}; 