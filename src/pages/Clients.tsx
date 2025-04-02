import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  Typography, 
  IconButton, 
  TextField, 
  InputAdornment, 
  Grid, 
  Tabs, 
  Tab, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  useTheme,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  ViewList as ViewListIcon, 
  ViewModule as ViewModuleIcon, 
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  SaveAlt as ExportIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  FilterAltOff as ClearFiltersIcon,
  Bookmark as BookmarkIcon,
  Person as PersonIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ClientsDataGrid } from '../components/clients/ClientsDataGrid';
import { ClientCard } from '../components/clients/ClientCard';
import { ClientFilterDrawer } from '../components/clients/ClientFilterDrawer';
import { PageHeader } from '../components/PageHeader';
import { ClientFormModal, ClientFormData } from '../components/clients/ClientFormModal';
import ClientSearchToolbar from '../components/clients/ClientSearchToolbar';
import ClientSearchService, { ClientSearchCriteria } from '../services/ClientSearchService';
import { v4 as uuidv4 } from 'uuid';
import DiagnosisFilterSection from '../components/clients/DiagnosisFilterSection';
import SavedFilters, { SavedFilter } from '../components/clients/SavedFilters';

// Simple debounce implementation
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

// Mock client data
const MOCK_CLIENTS = [
  { 
    id: '1', 
    firstName: 'John', 
    lastName: 'Doe', 
    email: 'john.doe@example.com', 
    phone: '(555) 123-4567', 
    status: 'active',
    dateOfBirth: '1985-06-15',
    nextAppointment: '2023-05-10T14:00:00',
    primaryTherapistName: 'Dr. Smith',
    tags: ['Anxiety', 'Depression'],
    alerts: [
      { type: 'warning', message: 'Insurance expiring in 30 days' }
    ],
    insuranceProvider: 'Blue Cross Blue Shield',
    lastAppointment: '2023-04-26T15:30:00',
    unpaidBalance: 250.00,
  },
  { 
    id: '2', 
    firstName: 'Jane', 
    lastName: 'Smith', 
    email: 'jane.smith@example.com', 
    phone: '(555) 987-6543', 
    status: 'onboarding',
    dateOfBirth: '1990-03-22',
    nextAppointment: '2023-05-12T10:30:00',
    primaryTherapistName: 'Dr. Jones',
    tags: ['Family Therapy', 'Grief'],
    alerts: [],
    insuranceProvider: 'Aetna',
    lastAppointment: null,
    unpaidBalance: 0,
  },
  { 
    id: '3', 
    firstName: 'Robert', 
    lastName: 'Johnson', 
    email: 'robert.j@example.com', 
    phone: '(555) 567-8901', 
    status: 'inactive',
    dateOfBirth: '1978-11-30',
    nextAppointment: null,
    primaryTherapistName: 'Dr. Smith',
    tags: ['Substance Abuse', 'Anger Management'],
    alerts: [
      { type: 'error', message: 'No appointment in 60+ days' }
    ],
    insuranceProvider: 'UnitedHealthcare',
    lastAppointment: '2023-03-05T14:00:00',
    unpaidBalance: 75.00,
  },
  { 
    id: '4', 
    firstName: 'Emily', 
    lastName: 'Williams', 
    email: 'emily.w@example.com', 
    phone: '(555) 234-5678', 
    status: 'active',
    dateOfBirth: '1992-08-17',
    nextAppointment: '2023-05-15T16:15:00',
    primaryTherapistName: 'Dr. Brown',
    tags: ['PTSD', 'Anxiety'],
    alerts: [],
    insuranceProvider: 'Cigna',
    lastAppointment: '2023-04-24T16:15:00',
    unpaidBalance: 0,
  },
  { 
    id: '5', 
    firstName: 'Michael', 
    lastName: 'Brown', 
    email: 'michael.b@example.com', 
    phone: '(555) 876-5432', 
    status: 'discharged',
    dateOfBirth: '1982-04-09',
    nextAppointment: null,
    primaryTherapistName: 'Dr. Jones',
    tags: ['Depression'],
    alerts: [],
    insuranceProvider: 'Medicare',
    lastAppointment: '2023-04-10T11:00:00',
    unpaidBalance: 0,
  },
  { 
    id: '6', 
    firstName: 'Sarah', 
    lastName: 'Miller', 
    email: 'sarah.m@example.com', 
    phone: '(555) 345-6789', 
    status: 'active',
    dateOfBirth: '1988-12-05',
    nextAppointment: '2023-05-18T09:30:00',
    primaryTherapistName: 'Dr. Wilson',
    tags: ['Relationship Issues', 'Self-Esteem'],
    alerts: [],
    insuranceProvider: 'Aetna',
    lastAppointment: '2023-04-27T09:30:00',
    unpaidBalance: 25.00,
  },
  { 
    id: '7', 
    firstName: 'David', 
    lastName: 'Garcia', 
    email: 'david.g@example.com', 
    phone: '(555) 789-0123', 
    status: 'on-hold',
    dateOfBirth: '1975-07-22',
    nextAppointment: null,
    primaryTherapistName: 'Dr. Smith',
    tags: ['Bipolar Disorder', 'Medication Management'],
    alerts: [
      { type: 'warning', message: 'Payment past due' }
    ],
    insuranceProvider: 'UnitedHealthcare',
    lastAppointment: '2023-04-15T13:45:00',
    unpaidBalance: 150.00,
  },
  { 
    id: '8', 
    firstName: 'Lisa', 
    lastName: 'Martinez', 
    email: 'lisa.m@example.com', 
    phone: '(555) 456-7890', 
    status: 'active',
    dateOfBirth: '1993-05-30',
    nextAppointment: '2023-05-20T14:00:00',
    primaryTherapistName: 'Dr. Brown',
    tags: ['Eating Disorder', 'Anxiety'],
    alerts: [],
    insuranceProvider: 'Cigna',
    lastAppointment: '2023-04-29T14:00:00',
    unpaidBalance: 0,
  },
  { 
    id: '9', 
    firstName: 'James', 
    lastName: 'Wilson', 
    email: 'james.w@example.com', 
    phone: '(555) 678-9012', 
    status: 'onboarding',
    dateOfBirth: '1980-02-14',
    nextAppointment: '2023-05-11T11:00:00',
    primaryTherapistName: 'Dr. Johnson',
    tags: ['Work Stress', 'Depression'],
    alerts: [],
    insuranceProvider: 'Blue Cross Blue Shield',
    lastAppointment: null,
    unpaidBalance: 0,
  },
  { 
    id: '10', 
    firstName: 'Jennifer', 
    lastName: 'Anderson', 
    email: 'jennifer.a@example.com', 
    phone: '(555) 890-1234', 
    status: 'active',
    dateOfBirth: '1986-09-20',
    nextAppointment: '2023-05-19T15:30:00',
    primaryTherapistName: 'Dr. Wilson',
    tags: ['Trauma', 'PTSD'],
    alerts: [],
    insuranceProvider: 'Medicaid',
    lastAppointment: '2023-04-28T15:30:00',
    unpaidBalance: 50.00,
  }
];

// Tab options
const tabs = [
  { value: 'all', label: 'All Clients' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'discharged', label: 'Discharged' },
  { value: 'on-hold', label: 'On Hold' }
];

// Sort options
const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)', field: 'lastName', direction: 'asc' },
  { value: 'name_desc', label: 'Name (Z-A)', field: 'lastName', direction: 'desc' },
  { value: 'date_asc', label: 'Date Added (Oldest)', field: 'dateAdded', direction: 'asc' },
  { value: 'date_desc', label: 'Date Added (Newest)', field: 'dateAdded', direction: 'desc' },
  { value: 'next_appt_asc', label: 'Next Appointment (Earliest)', field: 'nextAppointment', direction: 'asc' },
  { value: 'next_appt_desc', label: 'Next Appointment (Latest)', field: 'nextAppointment', direction: 'desc' }
];

const Clients = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for clients data and loading
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [sortOption, setSortOption] = useState('name_asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // State for UI
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Add state for client form modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientFormData> | null>(null);
  
  // Add new state variables
  const [searchCriteria, setSearchCriteria] = useState<ClientSearchCriteria>({});
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchService, setSearchService] = useState<ClientSearchService | null>(null);
  
  // Add state for expanded sections in filters
  const [expanded, setExpanded] = useState({
    diagnoses: false,
    tags: false,
    therapists: false,
    insurances: false,
    demographic: false,
    dates: false
  });
  
  // Load clients data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setClients(MOCK_CLIENTS);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // After loading clients
  useEffect(() => {
    if (clients.length > 0) {
      // Initialize search service with clients
      setSearchService(new ClientSearchService(clients));
    }
  }, [clients]);
  
  // Add enhanced filtering logic in a new useEffect
  useEffect(() => {
    if (!searchService) return;

    // Use the search service for advanced filtering with fuzzy matching
    let results = searchService.search(searchCriteria);
    
    // Apply additional sorting if needed
    const sortConfig = sortOptions.find(option => option.value === sortOption);
    if (sortConfig) {
      results.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];
        
        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        
        // Sort strings
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredClients(results);
    setTotalItems(results.length);
    
    // Determine active filters for display
    const activeFiltersList: string[] = [];
    
    if (searchCriteria.searchTerm) {
      activeFiltersList.push(`Search: "${searchCriteria.searchTerm}"`);
    }
    
    if (searchCriteria.statuses && searchCriteria.statuses.length > 0) {
      activeFiltersList.push(`Statuses (${searchCriteria.statuses.length})`);
    }
    
    if (searchCriteria.therapistIds && searchCriteria.therapistIds.length > 0) {
      activeFiltersList.push(`Therapists (${searchCriteria.therapistIds.length})`);
    }
    
    if (searchCriteria.tags && searchCriteria.tags.length > 0) {
      activeFiltersList.push(`Tags (${searchCriteria.tags.length})`);
    }
    
    if (searchCriteria.diagnosisCodes && searchCriteria.diagnosisCodes.length > 0) {
      activeFiltersList.push(`Diagnoses (${searchCriteria.diagnosisCodes.length})`);
    }
    
    if (searchCriteria.upcomingAppointment) {
      activeFiltersList.push(`Upcoming Appointments (${searchCriteria.nextDays || 7} days)`);
    }
    
    if (searchCriteria.upcomingBirthday) {
      activeFiltersList.push('Upcoming Birthdays');
    }
    
    if (searchCriteria.hasUnpaidBalance) {
      activeFiltersList.push('Has Unpaid Balance');
    }
    
    if (searchCriteria.dateRange && (searchCriteria.dateRange.start || searchCriteria.dateRange.end)) {
      const fieldLabel = searchCriteria.dateRange.field === 'nextAppointment' ? 'Next Appointment' :
                         searchCriteria.dateRange.field === 'lastAppointment' ? 'Last Appointment' :
                         searchCriteria.dateRange.field === 'dateOfBirth' ? 'Birthday' : 'Created Date';
                         
      activeFiltersList.push(`${fieldLabel} Date Range`);
    }
    
    setActiveFilters(activeFiltersList);
  }, [searchService, searchCriteria, sortOption]);
  
  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };
  
  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'grid' | 'cards' | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Handle sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };
  
  const handleSortChange = (option: string) => {
    setSortOption(option);
    handleSortMenuClose();
  };
  
  // Handle export menu
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchorEl(event.currentTarget);
  };
  
  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
  };
  
  // Add a handler for export function
  const handleExportClients = (format: string, fields: string[], options: Record<string, any>) => {
    if (!searchService || filteredClients.length === 0) return;
    
    try {
      // Get the export data as CSV
      const exportData = searchService.exportToCsv(filteredClients);
      
      // Create a download link
      const blob = new Blob([exportData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generate filename with timestamp if needed
      const timestamp = options.includeTimestamp ? 
        `_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}` : '';
      const filename = `client_export${timestamp}.csv`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Handle email option (in a real app this would interact with an API)
      if (options.sendEmail && options.emailAddress) {
        // This would typically be handled by sending the export to an API endpoint
        console.log(`Emailing export to ${options.emailAddress}`);
        alert(`Export would be emailed to ${options.emailAddress} in a production environment`);
      }
    } catch (error) {
      console.error('Error exporting client data', error);
      alert('An error occurred while exporting the client data');
    }
  };
  
  // Add handlers for saved filters
  const handleSaveFilter = (filter: SavedFilter) => {
    setSavedFilters([...savedFilters, filter]);
    
    // In a real app, this would save to an API
    localStorage.setItem('savedFilters', JSON.stringify([...savedFilters, filter]));
  };
  
  const handleUpdateFilter = (updatedFilter: SavedFilter) => {
    const updatedFilters = savedFilters.map(filter => 
      filter.id === updatedFilter.id ? updatedFilter : filter
    );
    setSavedFilters(updatedFilters);
    
    // In a real app, this would update via an API
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
  };
  
  const handleDeleteFilter = (id: string) => {
    const updatedFilters = savedFilters.filter(filter => filter.id !== id);
    setSavedFilters(updatedFilters);
    
    // In a real app, this would delete via an API
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
  };
  
  const handleSetDefaultFilter = (id: string) => {
    const updatedFilters = savedFilters.map(filter => ({
      ...filter,
      isDefault: filter.id === id
    }));
    setSavedFilters(updatedFilters);
    
    // In a real app, this would update via an API
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters));
  };
  
  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const savedFiltersFromStorage = localStorage.getItem('savedFilters');
    if (savedFiltersFromStorage) {
      try {
        const parsedFilters = JSON.parse(savedFiltersFromStorage);
        setSavedFilters(parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters from localStorage', error);
      }
    }
  }, []);
  
  // Handle opening the modal for adding a new client
  const handleAddClient = () => {
    setEditingClient(null);
    setFormModalOpen(true);
  };
  
  // Handle opening the modal for editing an existing client
  const handleEditClient = (clientId: string) => {
    // Find client data
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    // Transform to client form data format
    const clientFormData: Partial<ClientFormData> = {
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth || '',
      gender: client.gender || '',
      status: client.status,
      email: client.email || '',
      phone: client.phone || '',
      // Other fields would be populated here
    };
    
    setEditingClient(clientFormData);
    setFormModalOpen(true);
  };
  
  // Handle form submission
  const handleFormSubmit = async (data: ClientFormData) => {
    // In a real app, this would call your API to save the client
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (editingClient) {
          // Update existing client
          const updatedClients = clients.map(client => 
            client.id === editingClient.id ? { ...client, ...data, id: client.id } : client
          );
          setClients(updatedClients);
        } else {
          // Add new client
          const newClient = {
            ...data,
            id: `client-${Date.now()}`, // In a real app, this would come from the API
            status: data.status,
            // Default any other required fields
          };
          setClients([newClient, ...clients]);
        }
        resolve();
      }, 1000);
    });
  };
  
  // Handle client actions
  const handleClientAction = (action: string, clientId: string) => {
    switch (action) {
      case 'view':
        navigate(`/clients/${clientId}`);
        break;
      case 'edit':
        handleEditClient(clientId);
        break;
      case 'schedule':
        alert(`Schedule appointment for client ${clientId}`);
        break;
      case 'message':
        alert(`Send message to client ${clientId}`);
        break;
      case 'add-note':
        alert(`Add note for client ${clientId}`);
        break;
      case 'menu':
        alert(`Open menu for client ${clientId}`);
        break;
      default:
        break;
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentTab('all');
    setFilters({});
    
    // Also clear the search input field
    const searchInput = document.querySelector('input[placeholder="Search clients"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  };
  
  // Get pagination bounds for current view
  const getPaginatedClients = () => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filteredClients.slice(start, end);
  };
  
  // Add handler for toggling sections
  const handleToggleSection = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader 
        title="Clients" 
        description="Manage your client records and information"
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClient}
          >
            Add Client
          </Button>
        }
      />
      
      {/* Search and filters toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2
        }}>
          <ClientSearchToolbar
            totalClients={clients.length}
            displayedClients={filteredClients.length}
            clientsRef={filteredClients}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterDrawerOpen={() => setFilterDrawerOpen(true)}
            onClearFilters={handleClearFilters}
            activeFilters={activeFilters}
            onSortChange={handleSortChange}
            currentSort={sortOption}
            savedFilters={savedFilters}
            searchCriteria={searchCriteria}
            onUpdateSearchCriteria={setSearchCriteria}
            onExport={handleExportClients}
            onSaveFilter={handleSaveFilter}
            onDeleteFilter={handleDeleteFilter}
            onUpdateFilter={handleUpdateFilter}
            onSetDefaultFilter={handleSetDefaultFilter}
            quickFilterOptions={[
              {
                label: 'New Intakes',
                key: 'newIntakes',
                value: true,
                icon: <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              },
              {
                label: 'Missing Last Session',
                key: 'lastSessionDays',
                value: 30,
                icon: <TodayIcon fontSize="small" sx={{ mr: 1 }} />
              }
            ]}
          />
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexWrap: 'wrap', 
            justifyContent: { xs: 'flex-start', md: 'flex-end' } 
          }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              size="small"
            >
              Filter
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortMenuOpen}
              size="small"
            >
              Sort
            </Button>
            
            <Menu
              anchorEl={sortMenuAnchorEl}
              open={Boolean(sortMenuAnchorEl)}
              onClose={handleSortMenuClose}
            >
              {sortOptions.map((option) => (
                <MenuItem 
                  key={option.value} 
                  onClick={() => handleSortChange(option.value)}
                  selected={sortOption === option.value}
                >
                  <ListItemIcon>
                    {option.direction === 'asc' ? 
                      <ArrowUpIcon fontSize="small" /> : 
                      <ArrowDownIcon fontSize="small" />
                    }
                  </ListItemIcon>
                  <ListItemText>{option.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
            
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportMenuOpen}
              size="small"
            >
              Export
            </Button>
            
            <Menu
              anchorEl={exportMenuAnchorEl}
              open={Boolean(exportMenuAnchorEl)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={() => handleExportClients('csv', [], { includeTimestamp: true, sendEmail: false })}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as CSV</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExportClients('pdf', [], { includeTimestamp: true, sendEmail: false })}>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as PDF</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExportClients('excel', [], { includeTimestamp: true, sendEmail: false })}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as Excel</ListItemText>
              </MenuItem>
            </Menu>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="cards" aria-label="card view">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        
        {/* Tabs and active filters */}
        <Box sx={{ mt: 2 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map((tab) => (
              <Tab 
                key={tab.value} 
                value={tab.value} 
                label={tab.label} 
              />
            ))}
          </Tabs>
        </Box>
        
        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            
            {activeFilters.map((filter, index) => (
              <Chip 
                key={index} 
                label={filter} 
                size="small" 
                onDelete={() => {}}
                variant="outlined"
              />
            ))}
            
            <Button 
              startIcon={<ClearFiltersIcon />}
              size="small"
              onClick={handleClearFilters}
              color="error"
              variant="text"
            >
              Clear all
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Client list content */}
      <Paper sx={{ p: 0, height: viewMode === 'grid' ? 600 : 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <LoadingSpinner />
          </Box>
        ) : filteredClients.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No clients found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Box>
        ) : viewMode === 'grid' ? (
          <ClientsDataGrid
            clients={getPaginatedClients()}
            isLoading={loading}
            pagination={{
              page,
              pageSize,
              totalItems,
            }}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={() => {}}
            onFilterChange={() => {}}
            onRowClick={(id) => navigate(`/clients/${id}`)}
            onActionClick={handleClientAction}
          />
        ) : (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {getPaginatedClients().map(client => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={client.id}>
                  <ClientCard
                    client={client}
                    onAction={handleClientAction}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Card view pagination would go here */}
          </Box>
        )}
      </Paper>
      
      {/* Client Filter Drawer */}
      <ClientFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      >
        <DiagnosisFilterSection
          expanded={expanded.diagnoses}
          onToggle={() => handleToggleSection('diagnoses')}
          selectedDiagnoses={searchCriteria.diagnosisCodes || []}
          onDiagnosisChange={(diagnosisCodes) => 
            setSearchCriteria({...searchCriteria, diagnosisCodes})
          }
        />
      </ClientFilterDrawer>
      
      {/* Add ClientFormModal */}
      <ClientFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingClient || undefined}
        isEdit={!!editingClient}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
};

export default Clients; 