import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Autocomplete,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore,
  FilterAlt as FilterAltIcon,
  Bookmark as BookmarkIcon,
  SaveAlt as SaveFilterIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, isValid } from 'date-fns';

// Mock data for staff members and tags
const MOCK_STAFF = [
  { id: 1, firstName: 'Dr.', lastName: 'Smith', role: 'Therapist' },
  { id: 2, firstName: 'Dr.', lastName: 'Jones', role: 'Psychiatrist' },
  { id: 3, firstName: 'Dr.', lastName: 'Brown', role: 'Therapist' },
  { id: 4, firstName: 'Dr.', lastName: 'Wilson', role: 'Therapist' }
];

const MOCK_TAGS = [
  { id: '1', name: 'Anxiety' },
  { id: '2', name: 'Depression' },
  { id: '3', name: 'PTSD' },
  { id: '4', name: 'Bipolar Disorder' },
  { id: '5', name: 'Family Therapy' },
  { id: '6', name: 'Grief' },
  { id: '7', name: 'Substance Abuse' },
  { id: '8', name: 'Anger Management' }
];

// Mock useQuery hook
const useQuery = (queryKey: string[], fetchFn: () => any) => {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    if (queryKey[0] === 'staffMembers') {
      setData({ data: MOCK_STAFF });
    } else if (queryKey[0] === 'tags') {
      setData({ data: MOCK_TAGS });
    }
  }, [queryKey[0]]);
  
  return { data };
};

// Mock axios 
const axios = {
  get: (url: string) => {
    if (url === '/api/staff') {
      return Promise.resolve({ data: MOCK_STAFF });
    } else if (url === '/api/tags') {
      return Promise.resolve({ data: MOCK_TAGS });
    }
    return Promise.reject(new Error('Not found'));
  }
};

interface ClientFilters {
  status?: string;
  search?: string;
  tags?: string[];
  assignedTeam?: number[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  lastAppointmentRange?: {
    from?: string;
    to?: string;
  };
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

interface Tag {
  id: string;
  name: string;
}

interface ClientFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ClientFilters;
  onApplyFilters: (filters: ClientFilters) => void;
}

export const ClientFilterDrawer: React.FC<ClientFilterDrawerProps> = ({
  open,
  onClose,
  filters,
  onApplyFilters
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<ClientFilters>(filters);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    status: true,
    assignedTo: true,
    tags: true,
    demographics: false,
    appointments: false,
    financial: false,
  });
  
  // Reset local filters when drawer opens or filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);
  
  // Fetch staff members for therapist filter
  const { data: staffMembers } = useQuery(
    ['staffMembers'],
    async () => {
      const response = await axios.get('/api/staff');
      return response.data;
    },
    {
      staleTime: 300000, // 5 minutes
      enabled: open // Only fetch when drawer is open
    }
  );
  
  // Fetch available tags
  const { data: tags } = useQuery(
    ['tags'],
    async () => {
      const response = await axios.get('/api/tags');
      return response.data;
    },
    {
      staleTime: 300000, // 5 minutes
      enabled: open // Only fetch when drawer is open
    }
  );
  
  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setLocalFilters({});
  };
  
  // Update local filters
  const updateFilter = (key: keyof ClientFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle section toggle
  const handleToggleSection = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle status checkbox change
  const handleStatusChange = (status: string) => {
    setLocalFilters(prev => {
      const statuses = prev.statuses || [];
      if (statuses.includes(status)) {
        return { ...prev, statuses: statuses.filter((s: string) => s !== status) };
      } else {
        return { ...prev, statuses: [...statuses, status] };
      }
    });
  };
  
  // Handle therapist selection
  const handleTherapistChange = (event: React.ChangeEvent<HTMLInputElement>, therapistId: string) => {
    setLocalFilters(prev => {
      const assignedTo = prev.assignedTeam || [];
      if (event.target.checked) {
        return { ...prev, assignedTeam: [...assignedTo, parseInt(therapistId)] };
      } else {
        return { ...prev, assignedTeam: assignedTo.filter((id: number) => id !== parseInt(therapistId)) };
      }
    });
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date || !isValid(date)) return '';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450 },
          p: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filter Clients
        </Typography>
        
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Saved Filters Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Saved Filters
        </Typography>
        
        <List dense disablePadding>
          {/* MOCK_SAVED_FILTERS.map(filter => (
            <ListItem key={filter.id} disablePadding>
              <ListItemButton 
                onClick={() => {
                  // In a real app, this would load the saved filter
                  alert(`Load saved filter: ${filter.name}`);
                }}
              >
                <ListItemIcon>
                  <BookmarkIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary={filter.name} />
              </ListItemButton>
            </ListItem>
          )) */}
        </List>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Client Status Section */}
      <Box sx={{ mb: 3 }}>
        <ListItemButton onClick={() => handleToggleSection('status')} sx={{ px: 0 }}>
          <ListItemText primary={<Typography variant="subtitle2">Client Status</Typography>} />
          {expanded.status ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expanded.status} timeout="auto" unmountOnExit>
          <FormControl component="fieldset" sx={{ ml: 2, mt: 1 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={(localFilters.statuses || []).includes('active')}
                    onChange={() => handleStatusChange('active')}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={(localFilters.statuses || []).includes('inactive')}
                    onChange={() => handleStatusChange('inactive')}
                  />
                }
                label="Inactive"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={(localFilters.statuses || []).includes('onboarding')}
                    onChange={() => handleStatusChange('onboarding')}
                  />
                }
                label="Onboarding"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={(localFilters.statuses || []).includes('discharged')}
                    onChange={() => handleStatusChange('discharged')}
                  />
                }
                label="Discharged"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={(localFilters.statuses || []).includes('on-hold')}
                    onChange={() => handleStatusChange('on-hold')}
                  />
                }
                label="On Hold"
              />
            </FormGroup>
          </FormControl>
        </Collapse>
      </Box>
      
      {/* Assigned To Section */}
      <Box sx={{ mb: 3 }}>
        <ListItemButton onClick={() => handleToggleSection('assignedTo')} sx={{ px: 0 }}>
          <ListItemText primary={<Typography variant="subtitle2">Assigned Therapist</Typography>} />
          {expanded.assignedTo ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expanded.assignedTo} timeout="auto" unmountOnExit>
          <FormControl component="fieldset" sx={{ ml: 2, mt: 1 }}>
            <FormGroup>
              {staffMembers?.data?.map((member: StaffMember) => (
                <FormControlLabel
                  key={member.id}
                  control={
                    <Checkbox 
                      checked={(localFilters.assignedTeam || []).includes(member.id)}
                      onChange={(e) => handleTherapistChange(e, member.id.toString())}
                    />
                  }
                  label={`${member.firstName} ${member.lastName} (${member.role})`}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Collapse>
      </Box>
      
      {/* Tags Section */}
      <Box sx={{ mb: 3 }}>
        <ListItemButton onClick={() => handleToggleSection('tags')} sx={{ px: 0 }}>
          <ListItemText primary={<Typography variant="subtitle2">Tags</Typography>} />
          {expanded.tags ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expanded.tags} timeout="auto" unmountOnExit>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Autocomplete
              multiple
              options={tags?.data?.map((tag: Tag) => tag.name) || []}
              value={localFilters.tags || []}
              onChange={(_, value) => updateFilter('tags', value as string[])}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" placeholder="Select tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
              size="small"
            />
          </Box>
        </Collapse>
      </Box>
      
      {/* Demographics Section */}
      <Box sx={{ mb: 3 }}>
        <ListItemButton onClick={() => handleToggleSection('demographics')} sx={{ px: 0 }}>
          <ListItemText primary={<Typography variant="subtitle2">Demographics</Typography>} />
          {expanded.demographics ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expanded.demographics} timeout="auto" unmountOnExit>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Age Range
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TextField
                label="Min"
                type="number"
                value={localFilters.ageRange?.min || ''}
                onChange={(e) => updateFilter('ageRange', { ...localFilters.ageRange, min: e.target.value ? parseInt(e.target.value) : undefined })}
                size="small"
                sx={{ width: '80px' }}
              />
              <Typography variant="body2">to</Typography>
              <TextField
                label="Max"
                type="number"
                value={localFilters.ageRange?.max || ''}
                onChange={(e) => updateFilter('ageRange', { ...localFilters.ageRange, max: e.target.value ? parseInt(e.target.value) : undefined })}
                size="small"
                sx={{ width: '80px' }}
              />
            </Box>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup
                value={localFilters.gender || ''}
                onChange={(e) => updateFilter('gender', e.target.value)}
              >
                <FormControlLabel value="" control={<Radio size="small" />} label="Any" />
                <FormControlLabel value="male" control={<Radio size="small" />} label="Male" />
                <FormControlLabel value="female" control={<Radio size="small" />} label="Female" />
                <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
              </RadioGroup>
            </FormControl>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <TextField
                label="ZIP Code"
                value={localFilters.zipCode || ''}
                onChange={(e) => updateFilter('zipCode', e.target.value)}
                size="small"
              />
            </FormControl>
          </Box>
        </Collapse>
      </Box>
      
      {/* Appointments Section */}
      <Box sx={{ mb: 3 }}>
        <ListItemButton onClick={() => handleToggleSection('appointments')} sx={{ px: 0 }}>
          <ListItemText primary={<Typography variant="subtitle2">Appointments</Typography>} />
          {expanded.appointments ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expanded.appointments} timeout="auto" unmountOnExit>
          <Box sx={{ ml: 2, mt: 1 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Appointment Status</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={localFilters.hasUpcomingAppointment || false}
                      onChange={(e) => updateFilter('hasUpcomingAppointment', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Has upcoming appointment"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={localFilters.missedLastAppointment || false}
                      onChange={(e) => updateFilter('missedLastAppointment', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Missed last appointment"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={localFilters.noRecentAppointment || false}
                      onChange={(e) => updateFilter('noRecentAppointment', e.target.checked)}
                      size="small"
                    />
                  }
                  label="No appointment in last 30 days"
                />
              </FormGroup>
            </FormControl>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Last Appointment Date Range
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <DatePicker 
                  label="From"
                  value={localFilters.lastAppointmentRange?.from ? new Date(localFilters.lastAppointmentRange.from) : null}
                  onChange={(date) => updateFilter('lastAppointmentRange', { ...localFilters.lastAppointmentRange, from: date ? date.toISOString() : undefined })}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker 
                  label="To"
                  value={localFilters.lastAppointmentRange?.to ? new Date(localFilters.lastAppointmentRange.to) : null}
                  onChange={(date) => updateFilter('lastAppointmentRange', { ...localFilters.lastAppointmentRange, to: date ? date.toISOString() : undefined })}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Stack>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Next Appointment Date Range
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <DatePicker 
                  label="From"
                  value={localFilters.nextAppointmentRange?.from ? new Date(localFilters.nextAppointmentRange.from) : null}
                  onChange={(date) => updateFilter('nextAppointmentRange', { ...localFilters.nextAppointmentRange, from: date ? date.toISOString() : undefined })}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker 
                  label="To"
                  value={localFilters.nextAppointmentRange?.to ? new Date(localFilters.nextAppointmentRange.to) : null}
                  onChange={(date) => updateFilter('nextAppointmentRange', { ...localFilters.nextAppointmentRange, to: date ? date.toISOString() : undefined })}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Stack>
            </Box>
          </Box>
        </Collapse>
      </Box>
      
      {/* Financial Section */}
      <Box sx={{ mb: 3 }}>
        <ListItemButton onClick={() => handleToggleSection('financial')} sx={{ px: 0 }}>
          <ListItemText primary={<Typography variant="subtitle2">Financial</Typography>} />
          {expanded.financial ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={expanded.financial} timeout="auto" unmountOnExit>
          <Box sx={{ ml: 2, mt: 1 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={localFilters.hasUnpaidBalance || false}
                      onChange={(e) => updateFilter('hasUnpaidBalance', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Has unpaid balance"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={localFilters.insuranceExpiringSoon || false}
                      onChange={(e) => updateFilter('insuranceExpiringSoon', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Insurance expiring soon"
                />
              </FormGroup>
            </FormControl>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Outstanding Balance
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Min ($)"
                  type="number"
                  value={localFilters.balanceMin || ''}
                  onChange={(e) => updateFilter('balanceMin', e.target.value)}
                  size="small"
                  sx={{ width: '100px' }}
                />
                <Typography variant="body2">to</Typography>
                <TextField
                  label="Max ($)"
                  type="number"
                  value={localFilters.balanceMax || ''}
                  onChange={(e) => updateFilter('balanceMax', e.target.value)}
                  size="small"
                  sx={{ width: '100px' }}
                />
              </Box>
            </Box>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Insurance Provider</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('BCBS')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'BCBS']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'BCBS'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="Blue Cross Blue Shield"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('Aetna')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'Aetna']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'Aetna'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="Aetna"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('Cigna')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'Cigna']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'Cigna'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="Cigna"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('UnitedHealthcare')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'UnitedHealthcare']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'UnitedHealthcare'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="UnitedHealthcare"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('Medicare')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'Medicare']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'Medicare'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="Medicare"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('Medicaid')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'Medicaid']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'Medicaid'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="Medicaid"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={(localFilters.insuranceProviders || []).includes('SelfPay')}
                      onChange={(e) => {
                        const providers = localFilters.insuranceProviders || [];
                        if (e.target.checked) {
                          updateFilter('insuranceProviders', [...providers, 'SelfPay']);
                        } else {
                          updateFilter('insuranceProviders', providers.filter((p: string) => p !== 'SelfPay'));
                        }
                      }}
                      size="small"
                    />
                  }
                  label="Self Pay"
                />
              </FormGroup>
            </FormControl>
          </Box>
        </Collapse>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
        <Button
          startIcon={<DeleteIcon />}
          onClick={handleResetFilters}
          color="inherit"
        >
          Reset
        </Button>
        
        <Box>
          <Button 
            startIcon={<SaveFilterIcon />}
            onClick={() => {
              // In a real app, this would save the current filter configuration
              alert('Filter would be saved in a real app');
            }}
            sx={{ mr: 1 }}
          >
            Save Filter
          </Button>
          
          <Button
            variant="contained"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ClientFilterDrawer; 