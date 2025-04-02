import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Message as MessageIcon,
  NoteAdd as NoteAddIcon,
  Print as PrintIcon,
  DeleteOutline as DeleteIcon,
  Warning as WarningIcon,
  HealthAndSafety as InsuranceIcon,
  Psychology as ClinicalIcon,
  EventNote as AppointmentsIcon,
  Description as DocumentsIcon,
  Payments as BillingIcon,
  Comment as NotesIcon,
  MedicalInformation as MedicalIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ClientStatusBadge } from '../components/clients/ClientStatusBadge';
import { ClientTimeline } from '../components/clients/ClientTimeline';
import { ClientDemographicsTab } from '../components/clients/tabs/ClientDemographicsTab';
import { ClientInsuranceTab } from '../components/clients/tabs/ClientInsuranceTab';
import { ClientClinicalTab } from '../components/clients/tabs/ClientClinicalTab';
import { ClientAppointmentsTab } from '../components/clients/tabs/ClientAppointmentsTab';
import { ClientDocumentsTab } from '../components/clients/tabs/ClientDocumentsTab';
import { ClientBillingTab } from '../components/clients/tabs/ClientBillingTab';
import { ClientNotesTab } from '../components/clients/tabs/ClientNotesTab';
import { ClientFormModal, ClientFormData } from '../components/clients/ClientFormModal';
import ClientHistoryTab from '../components/clients/history/ClientHistoryTab';

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
    address: '123 Main St, Anytown, CA 90210',
    emergencyContact: 'Jane Doe (Wife) - (555) 987-6543',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceId: 'BCBS12345678',
    notes: 'Patient has been in therapy for anxiety and depression since January 2023.',
    alerts: [
      { type: 'warning', message: 'Insurance expiring in 30 days' }
    ],
    tags: ['Anxiety', 'Depression', 'Weekly Sessions'],
    lastAppointment: '2023-04-26T15:30:00',
    unpaidBalance: 250.00,
    appointmentHistory: [
      { date: '2023-04-26T15:30:00', type: 'Therapy Session', provider: 'Dr. Smith', status: 'Completed', duration: 50 },
      { date: '2023-04-19T15:30:00', type: 'Therapy Session', provider: 'Dr. Smith', status: 'Completed', duration: 50 },
      { date: '2023-04-12T15:30:00', type: 'Therapy Session', provider: 'Dr. Smith', status: 'Completed', duration: 50 },
      { date: '2023-04-05T15:30:00', type: 'Therapy Session', provider: 'Dr. Smith', status: 'Canceled', duration: 0 },
      { date: '2023-03-29T15:30:00', type: 'Therapy Session', provider: 'Dr. Smith', status: 'Completed', duration: 50 },
    ],
    documents: [
      { id: 'doc1', name: 'Intake Form', dateUploaded: '2023-01-15T10:30:00', type: 'pdf', size: '1.2 MB' },
      { id: 'doc2', name: 'Insurance Card', dateUploaded: '2023-01-15T10:32:00', type: 'jpg', size: '450 KB' },
      { id: 'doc3', name: 'Release of Information', dateUploaded: '2023-01-22T14:15:00', type: 'pdf', size: '850 KB' },
      { id: 'doc4', name: 'Treatment Plan', dateUploaded: '2023-02-05T09:45:00', type: 'pdf', size: '1.5 MB' },
    ],
    clinicalInfo: {
      diagnoses: ['F41.1 - Generalized Anxiety Disorder', 'F33.1 - Major Depressive Disorder, Recurrent, Moderate'],
      medications: ['Sertraline 50mg daily', 'Lorazepam 0.5mg as needed'],
      allergies: 'Penicillin',
      riskFactors: ['Suicidal ideation (passive)', 'Family history of depression'],
      treatmentGoals: [
        'Reduce anxiety symptoms by implementing cognitive behavioral techniques',
        'Improve sleep quality and establish regular sleep schedule',
        'Develop effective stress management strategies'
      ]
    }
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
    address: '456 Oak Ave, Cityville, NY 10001',
    emergencyContact: 'Robert Smith (Husband) - (555) 222-3333',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET98765432',
    notes: 'New patient intake completed on April 28, 2023. First session scheduled.'
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
    address: '789 Pine St, Townsburg, TX 75001',
    emergencyContact: 'Susan Johnson (Sister) - (555) 444-5555',
    insuranceProvider: 'UnitedHealthcare',
    insuranceId: 'UHC45678901',
    notes: 'Patient has not scheduled an appointment in 3 months. Follow-up call attempted on March 15.'
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
    address: '321 Cedar Ln, Villagetown, FL 33101',
    emergencyContact: 'Michael Williams (Father) - (555) 777-8888',
    insuranceProvider: 'Cigna',
    insuranceId: 'CIG56789012',
    notes: 'Weekly therapy sessions for PTSD. Good progress noted in last session.'
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
    address: '654 Maple Dr, Hamletown, WA 98001',
    emergencyContact: 'Lisa Brown (Wife) - (555) 666-7777',
    insuranceProvider: 'Medicare',
    insuranceId: 'MED67890123',
    notes: 'Successfully completed 12-week program. Discharged on April 1, 2023 with follow-up resources.'
  }
];

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy');
};

// Format datetime for display
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const foundClient = MOCK_CLIENTS.find(c => c.id === id);
      if (foundClient) {
        setClient(foundClient);
      }
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleAction = (action: string) => {
    handleMenuClose();
    
    switch (action) {
      case 'edit':
        setIsEditModalOpen(true);
        break;
      case 'schedule':
        // This would navigate to scheduling page in a real app
        alert('Navigate to scheduling for client: ' + id);
        break;
      case 'message':
        // This would open messaging interface in a real app
        alert('Open messaging for client: ' + id);
        break;
      case 'print':
        window.print();
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
          alert('Client would be deleted in a real app');
          navigate('/clients');
        }
        break;
      default:
        break;
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = (updatedClient: ClientFormData) => {
    // In a real app, this would save the data to the backend
    // For now, just update the local state
    setClient({
      ...client,
      ...updatedClient
    });
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  if (!client) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Client not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clients')}
            sx={{ mt: 2 }}
          >
            Back to Clients
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clients')}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Back to Clients
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  bgcolor: theme.palette.primary.main,
                  mr: 3
                }}
              >
                {client.firstName?.charAt(0) || ''}{client.lastName?.charAt(0) || ''}
              </Avatar>
              
              <Box>
                <Typography variant="h4" component="h1">
                  {client.firstName} {client.lastName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ClientStatusBadge status={client.status} size="medium" />
                  
                  {client.dateOfBirth && (
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      {formatDate(client.dateOfBirth)} ({calculateAge(client.dateOfBirth)} years)
                    </Typography>
                  )}
                  
                  {client.tags && client.tags.length > 0 && (
                    <Box sx={{ ml: 2 }}>
                      {client.tags.map((tag: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          sx={{ ml: 0.5 }} 
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            
            <Box>
              {client.alerts && client.alerts.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {client.alerts.map((alert: any, index: number) => (
                    <Chip 
                      key={index}
                      icon={<WarningIcon />}
                      label={alert.message}
                      color={
                        alert.type === 'error' ? 'error' : 
                        alert.type === 'warning' ? 'warning' : 
                        alert.type === 'success' ? 'success' : 'info'
                      }
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => handleAction('schedule')}
                  sx={{ mr: 1 }}
                >
                  Schedule
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={() => handleAction('message')}
                  sx={{ mr: 1 }}
                >
                  Message
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => handleAction('edit')}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleAction('print')}>
                    <ListItemIcon>
                      <PrintIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Print Profile</ListItemText>
                  </MenuItem>
                  
                  <MenuItem onClick={() => handleAction('add-note')}>
                    <ListItemIcon>
                      <NoteAddIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Add Note</ListItemText>
                  </MenuItem>
                  
                  <Divider />
                  
                  <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete Client</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
          
          {/* Quick info cards */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Contact Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{client.phone || 'No phone provided'}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{client.email || 'No email provided'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Next Appointment
                  </Typography>
                  
                  {client.nextAppointment ? (
                    <>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDateTime(client.nextAppointment)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        with {client.primaryTherapistName}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2">No upcoming appointments</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Visit
                  </Typography>
                  
                  {client.lastAppointment ? (
                    <Typography variant="body2">
                      {formatDateTime(client.lastAppointment)}
                    </Typography>
                  ) : (
                    <Typography variant="body2">No previous visits</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Balance
                  </Typography>
                  
                  {client.unpaidBalance ? (
                    <Typography variant="body1" fontWeight="bold" color={client.unpaidBalance > 0 ? 'error.main' : 'inherit'}>
                      ${client.unpaidBalance.toFixed(2)}
                    </Typography>
                  ) : (
                    <Typography variant="body2">No balance due</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="client details tabs"
              >
                <Tab label="Demographics" id="client-tab-0" aria-controls="client-tabpanel-0" />
                <Tab label="Insurance" id="client-tab-1" aria-controls="client-tabpanel-1" />
                <Tab label="Clinical" id="client-tab-2" aria-controls="client-tabpanel-2" />
                <Tab label="Appointments" id="client-tab-3" aria-controls="client-tabpanel-3" />
                <Tab label="Documents" id="client-tab-4" aria-controls="client-tabpanel-4" />
                <Tab label="Billing" id="client-tab-5" aria-controls="client-tabpanel-5" />
                <Tab label="Notes" id="client-tab-6" aria-controls="client-tabpanel-6" />
                <Tab label="Timeline" id="client-tab-7" aria-controls="client-tabpanel-7" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <ClientDemographicsTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <ClientInsuranceTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <ClientClinicalTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <ClientAppointmentsTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <ClientDocumentsTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={5}>
              <ClientBillingTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={6}>
              <ClientNotesTab clientId={client.id} clientData={client} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={7}>
              <Box>
                <ClientHistoryTab clientId={client.id} clientName={`${client.firstName} ${client.lastName}`} />
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <ClientFormModal 
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditSubmit}
        initialData={client as ClientFormData}
        isEditMode={true}
      />
    </Container>
  );
};

export default ClientDetails; 