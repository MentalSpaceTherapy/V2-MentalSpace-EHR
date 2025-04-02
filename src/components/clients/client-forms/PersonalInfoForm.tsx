import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Controller, useFormContext } from 'react-hook-form';
import { format, isValid, parse } from 'date-fns';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'transgender', label: 'Transgender' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'discharged', label: 'Discharged' },
];

const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'domestic-partnership', label: 'Domestic Partnership' },
];

export const PersonalInfoForm: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                fullWidth
                required
                autoFocus
                error={!!errors.firstName}
                helperText={errors.firstName?.message?.toString()}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                fullWidth
                required
                error={!!errors.lastName}
                helperText={errors.lastName?.message?.toString()}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <DatePicker
                {...field}
                label="Date of Birth"
                value={value ? new Date(value) : null}
                onChange={(date) => {
                  onChange(date ? format(date, 'yyyy-MM-dd') : '');
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth?.message?.toString(),
                  },
                }}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl 
                fullWidth 
                required
                error={!!errors.gender}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  {...field}
                  labelId="gender-label"
                  label="Gender"
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender.message?.toString()}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl 
                fullWidth 
                required
                error={!!errors.status}
              >
                <InputLabel id="status-label">Client Status</InputLabel>
                <Select
                  {...field}
                  labelId="status-label"
                  label="Client Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message?.toString()}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <FormControl 
                fullWidth
                error={!!errors.maritalStatus}
              >
                <InputLabel id="marital-status-label">Marital Status</InputLabel>
                <Select
                  {...field}
                  labelId="marital-status-label"
                  label="Marital Status"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {maritalStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.maritalStatus && (
                  <FormHelperText>{errors.maritalStatus.message?.toString()}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}; 