import React, { useState, useEffect } from 'react';
import {
  Grid,
  MenuItem,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  Box,
  Autocomplete
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { useFormContext, Controller } from 'react-hook-form';

// Mock Google Maps Places API if not available
const useGoogleMapsAutocomplete = () => {
  const [predictions, setPredictions] = useState<Array<{ description: string; place_id: string }>>([]);

  // Mock predictions based on input
  const getPlacePredictions = (input: string) => {
    // Mock some predictions based on input
    const mockPredictions = [
      { description: `${input} Main St, New York, NY 10001, USA`, place_id: 'place1' },
      { description: `${input} Broadway, New York, NY 10003, USA`, place_id: 'place2' },
      { description: `${input} 5th Avenue, New York, NY 10016, USA`, place_id: 'place3' },
    ];
    setPredictions(mockPredictions);
    return mockPredictions;
  };

  // Mock place details from place_id
  const getPlaceDetails = (placeId: string) => {
    // Mock response with address components
    return {
      formatted_address: predictions.find(p => p.place_id === placeId)?.description || '',
      address_components: [
        { long_name: '123', short_name: '123', types: ['street_number'] },
        { long_name: 'Main St', short_name: 'Main St', types: ['route'] },
        { long_name: 'New York', short_name: 'NY', types: ['locality'] },
        { long_name: 'New York', short_name: 'NY', types: ['administrative_area_level_1'] },
        { long_name: '10001', short_name: '10001', types: ['postal_code'] },
        { long_name: 'United States', short_name: 'US', types: ['country'] },
      ]
    };
  };

  return { predictions, getPlacePredictions, getPlaceDetails };
};

// Contact preference options
const contactPreferenceOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'mail', label: 'Postal Mail' },
];

// US states for dropdown
const usStates = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

// Countries list (abbreviated)
const countries = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Mexico', label: 'Mexico' },
  // Add more countries as needed
];

export const ContactInfoForm: React.FC = () => {
  const { control, setValue, getValues, formState: { errors } } = useFormContext();
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const { predictions, getPlacePredictions, getPlaceDetails } = useGoogleMapsAutocomplete();

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

  // Handle address search
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    if (query.length > 3) {
      getPlacePredictions(query);
    }
  };

  // Handle address selection
  const handleAddressSelect = (placeId: string) => {
    const details = getPlaceDetails(placeId);
    
    // Find components
    const getComponent = (type: string) => {
      const component = details.address_components.find(c => c.types.includes(type));
      return component ? component.long_name : '';
    };
    
    // Update form values
    setValue('address.street', `${getComponent('street_number')} ${getComponent('route')}`.trim());
    setValue('address.city', getComponent('locality'));
    setValue('address.state', getComponent('administrative_area_level_1'));
    setValue('address.zipCode', getComponent('postal_code'));
    setValue('address.country', getComponent('country'));
    
    setAddressSearchQuery('');
  };

  const handleUseMyLocation = () => {
    // In a real app, this would use the browser's geolocation API
    // and then reverse geocode to get the address
    
    // Mock location for demo
    setValue('address.street', '123 Current Location St');
    setValue('address.city', 'New York');
    setValue('address.state', 'NY');
    setValue('address.zipCode', '10001');
    setValue('address.country', 'United States');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Enter the client's contact details and address information.
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message as string}
              type="email"
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message as string}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Address Information
          </Typography>
          
          <Box sx={{ mb: 3, position: 'relative' }}>
            <TextField
              fullWidth
              label="Search for address"
              value={addressSearchQuery}
              onChange={(e) => handleAddressSearch(e.target.value)}
              placeholder="Start typing to search for an address..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Use my current location">
                      <IconButton onClick={handleUseMyLocation}>
                        <MyLocationIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Address predictions dropdown */}
            {addressSearchQuery.length > 3 && predictions.length > 0 && (
              <Paper 
                elevation={3} 
                sx={{
                  position: 'absolute',
                  zIndex: 10,
                  width: '100%',
                  maxHeight: 200,
                  overflow: 'auto',
                  mt: 0.5
                }}
              >
                {predictions.map((prediction) => (
                  <Box
                    key={prediction.place_id}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => handleAddressSelect(prediction.place_id)}
                  >
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    <Typography variant="body2">{prediction.description}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address"
                    fullWidth
                    required
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message?.toString()}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Apartment/Unit"
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    required
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message?.toString()}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={usStates}
                    getOptionLabel={(option) => 
                      typeof option === 'string' ? option : option.label
                    }
                    isOptionEqualToValue={(option, value) => 
                      option.value === value || option.value === value?.value
                    }
                    value={field.value ? 
                      usStates.find(state => state.value === field.value) || null 
                      : null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.value : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="State/Province"
                        required
                        error={!!errors.address?.state}
                        helperText={errors.address?.state?.message?.toString()}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="address.zipCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ZIP/Postal Code"
                    fullWidth
                    required
                    error={!!errors.address?.zipCode}
                    helperText={errors.address?.zipCode?.message?.toString()}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="address.country"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={countries}
                    getOptionLabel={(option) => 
                      typeof option === 'string' ? option : option.label
                    }
                    isOptionEqualToValue={(option, value) => 
                      option.value === value || option.value === value?.value
                    }
                    value={field.value ? 
                      countries.find(country => country.value === field.value) || null 
                      : null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.value : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country"
                        required
                        error={!!errors.address?.country}
                        helperText={errors.address?.country?.message?.toString()}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <FormControl 
          component="fieldset" 
          error={!!errors.preferredContact}
          sx={{ mb: 3 }}
        >
          <FormLabel component="legend">Preferred Contact Method(s)</FormLabel>
          <FormGroup>
            <Grid container>
              <Controller
                name="preferredContact"
                control={control}
                render={({ field }) => (
                  <>
                    {contactPreferenceOptions.map((option) => (
                      <Grid item xs={6} key={option.value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onChange={(e) => {
                                const currentValues = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentValues, option.value]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((value) => value !== option.value)
                                  );
                                }
                              }}
                            />
                          }
                          label={option.label}
                        />
                      </Grid>
                    ))}
                  </>
                )}
              />
            </Grid>
          </FormGroup>
          {errors.preferredContact && (
            <FormHelperText>{errors.preferredContact.message?.toString()}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="contactNotes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Contact Notes"
              multiline
              rows={3}
              fullWidth
              placeholder="Any special instructions for contacting this client..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CommentIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default ContactInfoForm; 