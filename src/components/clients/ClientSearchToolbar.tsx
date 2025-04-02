import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Typography,
  useTheme,
  Paper,
  Popover,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  FilterAltOff as ClearFiltersIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  FormatListBulleted as ListIcon,
  ViewColumn as ColumnsIcon,
  FilterAlt as FilterIcon,
  Today as TodayIcon,
  Cake as CakeIcon,
  Assignment as DiagnosisIcon,
  Person as TherapistIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import ClientExportOptions from './ClientExportOptions';
import SavedFilters from './SavedFilters';
import { ClientSearchCriteria, Client } from '../../services/ClientSearchService';

// Interface for the toolbar props
interface ClientSearchToolbarProps {
  totalClients: number;
  displayedClients: number;
  clientsRef: Client[];
  viewMode: 'grid' | 'cards';
  onViewModeChange: (mode: 'grid' | 'cards') => void;
  onFilterDrawerOpen: () => void;
  onClearFilters: () => void;
  activeFilters: string[];
  onSortChange: (sortOption: string) => void;
  currentSort: string;
  savedFilters: any[];
  searchCriteria: ClientSearchCriteria;
  onUpdateSearchCriteria: (criteria: ClientSearchCriteria) => void;
  onExport: (format: string, fields: string[], options: Record<string, any>) => void;
  onSaveFilter: (filter: any) => void;
  onDeleteFilter: (id: string) => void;
  onUpdateFilter: (filter: any) => void;
  onSetDefaultFilter: (id: string) => void;
  quickFilterOptions?: {
    label: string;
    key: string;
    value: any;
    icon?: React.ReactNode;
  }[];
}

const ClientSearchToolbar: React.FC<ClientSearchToolbarProps> = ({
  totalClients,
  displayedClients,
  clientsRef,
  viewMode,
  onViewModeChange,
  onFilterDrawerOpen,
  onClearFilters,
  activeFilters,
  onSortChange,
  currentSort,
  savedFilters,
  searchCriteria,
  onUpdateSearchCriteria,
  onExport,
  onSaveFilter,
  onDeleteFilter,
  onUpdateFilter,
  onSetDefaultFilter,
  quickFilterOptions = [],
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState(searchCriteria.searchTerm || '');
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [quickFilterAnchorEl, setQuickFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [dateRangePopoverAnchorEl, setDateRangePopoverAnchorEl] = useState<null | HTMLElement>(null);

  // Default sort options
  const sortOptions = [
    { value: 'name_asc', label: 'Name: A to Z', field: 'lastName', direction: 'asc' },
    { value: 'name_desc', label: 'Name: Z to A', field: 'lastName', direction: 'desc' },
    { value: 'date_asc', label: 'Date Added: Oldest First', field: 'createdAt', direction: 'asc' },
    { value: 'date_desc', label: 'Date Added: Newest First', field: 'createdAt', direction: 'desc' },
    { value: 'appointment_asc', label: 'Next Appointment: Soonest First', field: 'nextAppointment', direction: 'asc' },
    { value: 'appointment_desc', label: 'Next Appointment: Latest First', field: 'nextAppointment', direction: 'desc' },
    { value: 'status_asc', label: 'Status: Active First', field: 'status', direction: 'asc' },
    { value: 'status_desc', label: 'Status: Inactive First', field: 'status', direction: 'desc' },
  ];

  // Update search term when criteria changes
  useEffect(() => {
    setSearchTerm(searchCriteria.searchTerm || '');
  }, [searchCriteria.searchTerm]);

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onUpdateSearchCriteria({ ...searchCriteria, searchTerm: value });
  };

  // Handle clearing search term
  const handleClearSearch = () => {
    setSearchTerm('');
    onUpdateSearchCriteria({ ...searchCriteria, searchTerm: '' });
  };

  // Handle sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };

  // Handle quick filter menu
  const handleQuickFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setQuickFilterAnchorEl(event.currentTarget);
  };

  const handleQuickFilterClose = () => {
    setQuickFilterAnchorEl(null);
  };

  // Handle quick filter selection
  const handleQuickFilterSelect = (key: string, value: any) => {
    onUpdateSearchCriteria({ ...searchCriteria, [key]: value });
    handleQuickFilterClose();
  };

  // Handle date range selection
  const openDateRangePopover = (event: React.MouseEvent<HTMLElement>) => {
    setDateRangePopoverAnchorEl(event.currentTarget);
  };

  const closeDateRangePopover = () => {
    setDateRangePopoverAnchorEl(null);
  };

  // Handle date range changes
  const handleDateRangeChange = (field: 'start' | 'end', date: Date | null) => {
    if (!searchCriteria.dateRange) {
      searchCriteria.dateRange = { field: 'nextAppointment' };
    }
    
    onUpdateSearchCriteria({
      ...searchCriteria,
      dateRange: {
        ...searchCriteria.dateRange,
        [field]: date,
      },
    });
  };

  // Handle date field change
  const handleDateFieldChange = (field: 'nextAppointment' | 'lastAppointment' | 'dateOfBirth' | 'createdAt') => {
    if (!searchCriteria.dateRange) {
      searchCriteria.dateRange = {};
    }
    
    onUpdateSearchCriteria({
      ...searchCriteria,
      dateRange: {
        ...searchCriteria.dateRange,
        field,
      },
    });
  };

  // Handle upcoming appointments quick filter
  const handleUpcomingAppointmentsToggle = () => {
    onUpdateSearchCriteria({
      ...searchCriteria,
      upcomingAppointment: !searchCriteria.upcomingAppointment,
      nextDays: 7, // Default to next 7 days
    });
  };

  // Handle upcoming birthday quick filter
  const handleUpcomingBirthdayToggle = () => {
    onUpdateSearchCriteria({
      ...searchCriteria,
      upcomingBirthday: !searchCriteria.upcomingBirthday,
    });
  };

  // Count active quick filters
  const countActiveQuickFilters = () => {
    let count = 0;
    if (searchCriteria.upcomingAppointment) count++;
    if (searchCriteria.upcomingBirthday) count++;
    if (searchCriteria.dateRange?.start || searchCriteria.dateRange?.end) count++;
    
    // Count other quick filters that may be active
    if (quickFilterOptions) {
      quickFilterOptions.forEach(option => {
        if (searchCriteria[option.key as keyof ClientSearchCriteria]) count++;
      });
    }
    
    return count;
  };

  // Save current filters
  const handleSaveFilterSelect = (filter: any) => {
    onUpdateSearchCriteria(filter.filters);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Top row with search and view options */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          <TextField
            placeholder="Search clients by name, email, phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            sx={{ maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                    aria-label="clear search"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <Tooltip title="Open Advanced Filters">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={onFilterDrawerOpen}
              size="small"
            >
              Filters
            </Button>
          </Tooltip>

          <Badge badgeContent={countActiveQuickFilters()} color="primary">
            <Button
              variant="outlined"
              size="small"
              onClick={handleQuickFilterOpen}
              startIcon={<FilterIcon />}
            >
              Quick Filters
            </Button>
          </Badge>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ClientExportOptions
            clients={clientsRef}
            onExport={onExport}
            disabled={clientsRef.length === 0}
          />

          <Divider orientation="vertical" flexItem />

          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            size="small"
            endIcon={<ArrowDownIcon />}
          >
            Sort
          </Button>

          <Divider orientation="vertical" flexItem />

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && onViewModeChange(value)}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <Tooltip title="Table View">
                <ViewListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="cards" aria-label="card view">
              <Tooltip title="Card View">
                <ViewModuleIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Lower row with saved filters and active filters */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SavedFilters
            savedFilters={savedFilters}
            currentFilters={searchCriteria}
            onFilterSelect={handleSaveFilterSelect}
            onFilterSave={onSaveFilter}
            onFilterUpdate={onUpdateFilter}
            onFilterDelete={onDeleteFilter}
            onSetDefaultFilter={onSetDefaultFilter}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {activeFilters.length > 0 ? (
              activeFilters.map((filter, index) => (
                <Chip key={index} label={filter} size="small" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active filters
              </Typography>
            )}
            {activeFilters.length > 0 && (
              <Chip
                label="Clear All"
                size="small"
                onDelete={onClearFilters}
                deleteIcon={<ClearFiltersIcon />}
                color="default"
                variant="outlined"
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary">
            Showing {displayedClients} of {totalClients} clients
          </Typography>
        </Box>
      </Box>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchorEl}
        open={Boolean(sortMenuAnchorEl)}
        onClose={handleSortMenuClose}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={currentSort === option.value}
            onClick={() => {
              onSortChange(option.value);
              handleSortMenuClose();
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Quick Filters Menu */}
      <Menu
        anchorEl={quickFilterAnchorEl}
        open={Boolean(quickFilterAnchorEl)}
        onClose={handleQuickFilterClose}
        PaperProps={{ sx: { width: 250 } }}
      >
        <MenuItem
          onClick={handleUpcomingAppointmentsToggle}
          selected={searchCriteria.upcomingAppointment}
        >
          <ListIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">Upcoming Appointments (7 days)</Typography>
        </MenuItem>
        
        <MenuItem
          onClick={handleUpcomingBirthdayToggle}
          selected={searchCriteria.upcomingBirthday}
        >
          <CakeIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">Upcoming Birthdays</Typography>
        </MenuItem>
        
        <MenuItem onClick={openDateRangePopover}>
          <TodayIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">Date Range Filter</Typography>
        </MenuItem>
        
        <Divider />
        
        {/* Include any additional quick filter options provided as props */}
        {quickFilterOptions.map((option) => (
          <MenuItem
            key={option.key}
            onClick={() => handleQuickFilterSelect(option.key, option.value)}
            selected={searchCriteria[option.key as keyof ClientSearchCriteria] === option.value}
          >
            {option.icon || <FilterIcon sx={{ mr: 1 }} fontSize="small" />}
            <Typography variant="body2">{option.label}</Typography>
          </MenuItem>
        ))}
        
        {/* Extra filters */}
        <MenuItem
          onClick={() => handleQuickFilterSelect('hasUnpaidBalance', !searchCriteria.hasUnpaidBalance)}
          selected={searchCriteria.hasUnpaidBalance}
        >
          <FilterIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">Has Unpaid Balance</Typography>
        </MenuItem>
        
        <MenuItem
          onClick={() => handleQuickFilterSelect('newIntakes', !searchCriteria.newIntakes)}
          selected={searchCriteria.newIntakes}
        >
          <TherapistIcon sx={{ mr: 1 }} fontSize="small" />
          <Typography variant="body2">New Intakes</Typography>
        </MenuItem>
      </Menu>

      {/* Date Range Popover */}
      <Popover
        open={Boolean(dateRangePopoverAnchorEl)}
        anchorEl={dateRangePopoverAnchorEl}
        onClose={closeDateRangePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Date Range Filter
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Filter By
            </Typography>
            <ToggleButtonGroup
              value={searchCriteria.dateRange?.field || 'nextAppointment'}
              exclusive
              onChange={(_, value) => value && handleDateFieldChange(value)}
              size="small"
              fullWidth
            >
              <ToggleButton value="nextAppointment">
                Next Appt
              </ToggleButton>
              <ToggleButton value="lastAppointment">
                Last Appt
              </ToggleButton>
              <ToggleButton value="dateOfBirth">
                Birthday
              </ToggleButton>
              <ToggleButton value="createdAt">
                Created
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={searchCriteria.dateRange?.start || null}
              onChange={(date) => handleDateRangeChange('start', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={searchCriteria.dateRange?.end || null}
              onChange={(date) => handleDateRangeChange('end', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              onClick={() => {
                onUpdateSearchCriteria({
                  ...searchCriteria,
                  dateRange: { field: searchCriteria.dateRange?.field || 'nextAppointment' }, // Keep field but reset dates
                });
              }}
              sx={{ mr: 1 }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={closeDateRangePopover}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Paper>
  );
};

export default ClientSearchToolbar; 