import React, { useState } from 'react';
import { 
  Grid, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  LibraryAdd as TemplateIcon
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

// Types for custom fields
interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required: boolean;
  options?: string[]; // For select type
  value?: any;
}

// Predefined field templates
const fieldTemplates = [
  {
    id: 'referral-source',
    name: 'referralSource',
    type: 'select' as const,
    label: 'Referral Source',
    required: false,
    options: [
      'Self-referred',
      'Doctor Referral',
      'Insurance Company',
      'Friend/Family',
      'Online Search',
      'Social Media',
      'Other Professional',
      'Other'
    ]
  },
  {
    id: 'previous-therapy',
    name: 'previousTherapy',
    type: 'boolean' as const,
    label: 'Previous Therapy Experience',
    required: false
  },
  {
    id: 'preferred-therapy-type',
    name: 'preferredTherapyType',
    type: 'select' as const,
    label: 'Preferred Therapy Type',
    required: false,
    options: [
      'Individual',
      'Couples',
      'Family',
      'Group',
      'No Preference'
    ]
  },
  {
    id: 'session-frequency',
    name: 'sessionFrequency',
    type: 'select' as const,
    label: 'Preferred Session Frequency',
    required: false,
    options: [
      'Weekly',
      'Bi-weekly',
      'Monthly',
      'As needed'
    ]
  },
  {
    id: 'virtual-session-preference',
    name: 'virtualSessionPreference',
    type: 'boolean' as const,
    label: 'Prefers Virtual Sessions',
    required: false
  }
];

export const CustomFieldsForm: React.FC = () => {
  const { control, setValue, getValues, formState: { errors } } = useFormContext();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Get all custom fields from form
  const currentCustomFields = getValues('customFields') || {};
  
  // Add a new custom field
  const handleAddField = (template?: CustomField) => {
    const newField: CustomField = template || {
      id: `custom-field-${Date.now()}`,
      name: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false
    };
    
    setCustomFields([...customFields, newField]);
    
    // Initialize field value in form
    setValue(`customFields.${newField.name}`, newField.value || '');
  };
  
  // Remove a custom field
  const handleRemoveField = (fieldId: string) => {
    const updatedFields = customFields.filter(field => field.id !== fieldId);
    setCustomFields(updatedFields);
    
    // Find the removed field to get its name
    const removedField = customFields.find(field => field.id === fieldId);
    if (removedField) {
      // Create a new customFields object without the removed field
      const currentFields = getValues('customFields') || {};
      const { [removedField.name]: _, ...remainingFields } = currentFields;
      setValue('customFields', remainingFields);
    }
  };
  
  // Update field properties
  const handleUpdateField = (fieldId: string, updates: Partial<CustomField>) => {
    const updatedFields = customFields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setCustomFields(updatedFields);
  };
  
  // Render field based on type
  const renderFieldInput = (field: CustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={`customFields.${field.name}`}
            control={control}
            render={({ field: { onChange, value, ...restField } }) => (
              <TextField
                {...restField}
                label={field.label}
                variant="outlined"
                fullWidth
                required={field.required}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );
        
      case 'number':
        return (
          <Controller
            name={`customFields.${field.name}`}
            control={control}
            render={({ field: { onChange, value, ...restField } }) => (
              <TextField
                {...restField}
                label={field.label}
                variant="outlined"
                type="number"
                fullWidth
                required={field.required}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );
        
      case 'date':
        return (
          <Controller
            name={`customFields.${field.name}`}
            control={control}
            render={({ field: { onChange, value, ...restField } }) => (
              <TextField
                {...restField}
                label={field.label}
                variant="outlined"
                type="date"
                fullWidth
                required={field.required}
                value={value || ''}
                onChange={onChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        );
        
      case 'boolean':
        return (
          <Controller
            name={`customFields.${field.name}`}
            control={control}
            render={({ field: { onChange, value, ...restField } }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...restField}
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    color="primary"
                  />
                }
                label={field.label}
              />
            )}
          />
        );
        
      case 'select':
        return (
          <Controller
            name={`customFields.${field.name}`}
            control={control}
            render={({ field: { onChange, value, ...restField } }) => (
              <FormControl fullWidth variant="outlined" required={field.required}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  {...restField}
                  label={field.label}
                  value={value || ''}
                  onChange={onChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {field.options?.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        );
        
      default:
        return <Typography color="error">Invalid field type</Typography>;
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">
            Practice-Specific Information
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<TemplateIcon />}
              onClick={() => setShowTemplates(!showTemplates)}
              sx={{ mr: 1 }}
            >
              {showTemplates ? 'Hide Templates' : 'Show Templates'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddField()}
            >
              Add Custom Field
            </Button>
          </Box>
        </Box>
        
        {showTemplates && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Available Field Templates
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {fieldTemplates.map((template) => (
                <Chip
                  key={template.id}
                  label={template.label}
                  onClick={() => handleAddField(template)}
                  clickable
                  color="primary"
                  variant="outlined"
                  icon={<AddIcon />}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Click on a template to add it to your form.
            </Typography>
          </Paper>
        )}
        
        {customFields.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body1" color="text.secondary">
              No custom fields added yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Add Custom Field" or select from templates to add practice-specific information.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {customFields.map((field) => (
              <Grid item xs={12} md={6} key={field.id}>
                <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveField(field.id)}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  
                  <Box sx={{ mb: 2 }}>
                    {renderFieldInput(field)}
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed #ddd',
                    pt: 1,
                    mt: 1
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={<Typography variant="caption">Required</Typography>}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
          <Typography variant="body2">
            <strong>Note:</strong> Custom fields allow you to collect practice-specific information. 
            These fields are fully customizable and can be set up to meet your practice's unique needs.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}; 