import React from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
  FilterAltOff as ResetIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { HISTORY_ACCESS_LEVELS, EVENT_TYPE_CONFIG } from '../../../mockData/historyData';

// Define filter state shape
export interface HistoryFilters {
  searchText: string;
  eventTypes: string[];
  eventSubTypes: string[];
  userIds: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  accessLevel: 'all' | 'clinical' | 'administrative' | 'security' | 'communication';
  savedFilter: string;
}

// Define props
interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFilterChange: (newFilters: HistoryFilters) => void;
  availableUsers: Array<{ id: string, name: string, role: string }>;
  onExport: (format: 'csv' | 'pdf') => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  filters,
  onFilterChange,
  availableUsers,
  onExport
}) => {
  const theme = useTheme();
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  
  // Handle search text change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchText: e.target.value
    });
  };
  
  // Handle event type filter change
  const handleEventTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedTypes = event.target.value as string[];
    onFilterChange({
      ...filters,
      eventTypes: selectedTypes
    });
  };
  
  // Handle access level filter change
  const handleAccessLevelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const level = event.target.value as HistoryFilters['accessLevel'];
    
    // Get the event types for the selected access level
    let selectedEventTypes: string[] = [];
    
    switch (level) {
      case 'clinical':
        selectedEventTypes = HISTORY_ACCESS_LEVELS.CLINICAL;
        break;
      case 'administrative':
        selectedEventTypes = HISTORY_ACCESS_LEVELS.ADMINISTRATIVE;
        break;
      case 'security':
        selectedEventTypes = HISTORY_ACCESS_LEVELS.SECURITY;
        break;
      case 'communication':
        selectedEventTypes = HISTORY_ACCESS_LEVELS.COMMUNICATION;
        break;
      default:
        selectedEventTypes = [];
        break;
    }
    
    onFilterChange({
      ...filters,
      accessLevel: level,
      eventTypes: level === 'all' ? [] : selectedEventTypes
    });
  };
  
  // Handle user filter change
  const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onFilterChange({
      ...filters,
      userIds: event.target.value as string[]
    });
  };
  
  // Handle date range changes
  const handleStartDateChange = (date: Date | null) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: date
      }
    });
  };
  
  const handleEndDateChange = (date: Date | null) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        end: date
      }
    });
  };
  
  // Handle saved filter selection
  const handleSavedFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const filterName = event.target.value as string;
    
    // In a real app, this would load saved filter configurations
    const savedFilters: { [key: string]: Partial<HistoryFilters> } = {
      'recent-clinical': {
        accessLevel: 'clinical',
        eventTypes: HISTORY_ACCESS_LEVELS.CLINICAL,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          end: new Date()
        }
      },
      'record-changes': {
        eventTypes: ['record'],
      },
      'security-audit': {
        eventTypes: ['security'],
      }
    };
    
    // Apply saved filter if it exists
    if (filterName && savedFilters[filterName]) {
      onFilterChange({
        ...filters,
        ...savedFilters[filterName],
        savedFilter: filterName
      });
    } else {
      // Just update the saved filter name
      onFilterChange({
        ...filters,
        savedFilter: filterName
      });
    }
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    onFilterChange({
      searchText: '',
      eventTypes: [],
      eventSubTypes: [],
      userIds: [],
      dateRange: {
        start: null,
        end: null
      },
      accessLevel: 'all',
      savedFilter: ''
    });
  };
  
  // Toggle advanced filter visibility
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.eventTypes.length > 0) count++;
    if (filters.userIds.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1 }} />
          History Filters
          {getActiveFilterCount() > 0 && (
            <Chip 
              label={`${getActiveFilterCount()} active`} 
              size="small" 
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search timeline events..."
              value={filters.searchText}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.searchText ? (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => onFilterChange({ ...filters, searchText: '' })}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.accessLevel}
                onChange={handleAccessLevelChange as any}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="clinical">Clinical</MenuItem>
                <MenuItem value="administrative">Administrative</MenuItem>
                <MenuItem value="security">Security & Audit</MenuItem>
                <MenuItem value="communication">Communications</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <DatePicker
              label="From Date"
              value={filters.dateRange.start}
              onChange={handleStartDateChange}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <DatePicker
              label="To Date"
              value={filters.dateRange.end}
              onChange={handleEndDateChange}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant={showAdvancedFilters ? "contained" : "outlined"}
              color="primary"
              onClick={toggleAdvancedFilters}
              startIcon={<FilterIcon />}
              size="small"
            >
              {showAdvancedFilters ? "Less" : "More"}
            </Button>
          </Grid>
        </Grid>
        
        <Accordion 
          expanded={showAdvancedFilters} 
          onChange={() => toggleAdvancedFilters()}
          disableGutters
          elevation={0}
          sx={{ 
            mt: 2, 
            '&:before': { display: 'none' },
            borderTop: showAdvancedFilters ? `1px solid ${theme.palette.divider}` : 'none',
            borderBottom: showAdvancedFilters ? `1px solid ${theme.palette.divider}` : 'none',
          }}
        >
          <AccordionDetails>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Event Types</InputLabel>
                  <Select
                    multiple
                    value={filters.eventTypes}
                    onChange={handleEventTypeChange as any}
                    label="Event Types"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip 
                            key={value} 
                            label={EVENT_TYPE_CONFIG[value]?.label || value} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                      <MenuItem key={type} value={type}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Users</InputLabel>
                  <Select
                    multiple
                    value={filters.userIds}
                    onChange={handleUserChange as any}
                    label="Users"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const user = availableUsers.find(u => u.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={user?.name || value} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {availableUsers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Saved Filters</InputLabel>
                  <Select
                    value={filters.savedFilter}
                    onChange={handleSavedFilterChange as any}
                    label="Saved Filters"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="recent-clinical">Recent Clinical Events</MenuItem>
                    <MenuItem value="record-changes">Record Changes</MenuItem>
                    <MenuItem value="security-audit">Security Audit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={9} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  size="small"
                >
                  Save Filter
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  size="small"
                  onClick={handleResetFilters}
                  color="inherit"
                >
                  Reset
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => onExport('csv')}
                  size="small"
                >
                  Export CSV
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => onExport('pdf')}
                  size="small"
                >
                  Export PDF
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </LocalizationProvider>
  );
};

export default HistoryFilters; 