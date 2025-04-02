import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Tab,
  Tabs,
  useTheme,
  LinearProgress,
  Badge,
} from '@mui/material';
import { 
  Description as DocumentIcon,
  NoteAdd as NoteAddIcon,
  Today as TodayIcon,
  Assignment as AssignmentIcon,
  AssignmentInd as IntakeIcon,
  MedicalInformation as TreatmentPlanIcon,
  Event as AppointmentIcon,
  Phone as PhoneIcon,
  Group as ConsultationIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CompletedIcon,
  InfoOutlined as PendingIcon,
  ErrorOutline as UrgentIcon,
  Add as AddIcon,
  PieChart as ChartIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  FolderOpen as FolderIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';

// Sample data for testing
const PENDING_DOCUMENTS = [
  { id: '1', type: 'intake', title: 'Initial Assessment', clientName: 'John Smith', dueDate: '2023-05-15', status: 'pending' },
  { id: '2', type: 'progress', title: 'Weekly Session', clientName: 'Sarah Johnson', dueDate: '2023-05-12', status: 'urgent' },
  { id: '3', type: 'treatment', title: 'Treatment Plan Update', clientName: 'Michael Brown', dueDate: '2023-05-20', status: 'pending' },
  { id: '4', type: 'contact', title: 'Phone Call Follow-up', clientName: 'Emily Wilson', dueDate: '2023-05-10', status: 'urgent' },
  { id: '5', type: 'progress', title: 'Bi-weekly Check-in', clientName: 'Robert Davis', dueDate: '2023-05-18', status: 'pending' },
];

const RECENT_DOCUMENTS = [
  { id: '101', type: 'intake', title: 'Comprehensive Assessment', clientName: 'Thomas Anderson', date: '2023-05-08', status: 'completed' },
  { id: '102', type: 'progress', title: 'Therapy Session', clientName: 'Jessica Martinez', date: '2023-05-07', status: 'completed' },
  { id: '103', type: 'contact', title: 'Client Email Response', clientName: 'David Wilson', date: '2023-05-06', status: 'completed' },
  { id: '104', type: 'treatment', title: 'Treatment Plan Review', clientName: 'Linda Johnson', date: '2023-05-05', status: 'completed' },
  { id: '105', type: 'consultation', title: 'Team Consultation', clientName: 'James Brown', date: '2023-05-04', status: 'completed' },
];

// Note types for the quick create buttons
const NOTE_TYPES = [
  { id: 'intake', label: 'Intake Assessment', icon: <IntakeIcon color="primary" />, color: '#3f51b5' },
  { id: 'treatment', label: 'Treatment Plan', icon: <TreatmentPlanIcon color="secondary" />, color: '#9c27b0' },
  { id: 'progress', label: 'Progress Note', icon: <AssignmentIcon sx={{ color: '#4caf50' }} />, color: '#4caf50' },
  { id: 'missed', label: 'Missed Appointment', icon: <AppointmentIcon sx={{ color: '#f44336' }} />, color: '#f44336' },
  { id: 'contact', label: 'Contact Note', icon: <PhoneIcon sx={{ color: '#00bcd4' }} />, color: '#00bcd4' },
  { id: 'consultation', label: 'Consultation', icon: <ConsultationIcon sx={{ color: '#ff9800' }} />, color: '#ff9800' },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: <DocumentIcon sx={{ color: '#607d8b' }} />, color: '#607d8b' },
];

// Stats for dashboard
const DOCUMENT_STATS = [
  { label: 'Documents Created', value: 248, icon: <DocumentIcon />, color: '#4caf50' },
  { label: 'Pending Signatures', value: 12, icon: <PendingIcon />, color: '#ff9800' },
  { label: 'Upcoming Due', value: 8, icon: <ClockIcon />, color: '#f44336' },
  { label: 'Completed This Week', value: 35, icon: <CompletedIcon />, color: '#2196f3' },
];

// Interface for document types
interface DocumentItem {
  id: string;
  type: string;
  title: string;
  clientName: string;
  dueDate?: string;
  date?: string;
  status: string;
}

const Documentation: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateDocument = (type: string) => {
    setSelectedDocType(type);
    // In a real app, this would navigate to the create form for this type
    console.log(`Creating new ${type} document`);
    
    // Navigate to the appropriate form based on type
    if (type === 'intake') {
      navigate('/documentation/intake/new');
    } else if (type === 'treatment') {
      navigate('/documentation/treatment-plan/new');
    } else if (type === 'progress') {
      navigate('/documentation/progress-note/new');
    } else {
      navigate(`/documentation/${type}/new`);
    }
  };

  const handleViewDocument = (doc: DocumentItem) => {
    // In a real app, this would navigate to the document details
    console.log(`Viewing document: ${doc.id}`);
    navigate(`/documentation/${doc.type}/${doc.id}`);
  };

  // Get color for status indicator
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'urgent': return theme.palette.error.main;
      case 'pending': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  // Get icon for document type
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'intake': return <IntakeIcon />;
      case 'treatment': return <TreatmentPlanIcon />;
      case 'progress': return <AssignmentIcon />;
      case 'missed': return <AppointmentIcon />;
      case 'contact': return <PhoneIcon />;
      case 'consultation': return <ConsultationIcon />;
      default: return <DocumentIcon />;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader 
        title="Documentation" 
        description="Manage clinical documentation and notes"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<NoteAddIcon />}
              onClick={handleMenuOpen}
            >
              Create Note
            </Button>
          </Box>
        }
      />

      {/* Create Document Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            width: 300,
            maxHeight: 400,
            borderRadius: 2,
            p: 1
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Create New Document
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {NOTE_TYPES.map((type) => (
          <MenuItem 
            key={type.id} 
            onClick={() => {
              handleCreateDocument(type.id);
              handleMenuClose();
            }}
            sx={{ 
              borderRadius: 1,
              mb: 0.5,
              py: 1.2,
              '&:hover': {
                backgroundColor: `${type.color}10`,
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {type.icon}
            </ListItemIcon>
            <ListItemText primary={type.label} />
          </MenuItem>
        ))}
      </Menu>

      {/* Document Stats */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        {DOCUMENT_STATS.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${stat.color}40`,
                    '& .stat-icon': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <Box sx={{ position: 'absolute', right: -15, top: -15, opacity: 0.08 }}>
                  <Box className="stat-icon" sx={{ 
                    fontSize: 100, 
                    color: stat.color,
                    transition: 'transform 0.3s ease',
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Quick Create Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Create
        </Typography>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Grid container spacing={2}>
            {NOTE_TYPES.map((type, index) => (
              <Grid item key={type.id} xs={6} sm={4} md={3} lg={true}>
                <motion.div
                  custom={index}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    sx={{ 
                      borderRadius: 2,
                      borderBottom: `3px solid ${type.color}`,
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      py: 2,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: `${type.color}10`,
                      }
                    }}
                    onClick={() => handleCreateDocument(type.id)}
                    elevation={0}
                    variant="outlined"
                  >
                    <Box sx={{ mb: 1, color: type.color }}>
                      {React.cloneElement(type.icon as React.ReactElement, { fontSize: 'large' })}
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {type.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Document Lists */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="To-Do Documents" />
          <Tab label="Recent Documents" />
          <Tab label="Drafts" />
        </Tabs>

        {activeTab === 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <Grid container spacing={2}>
              {PENDING_DOCUMENTS.map((doc, index) => (
                <Grid item xs={12} md={6} key={doc.id}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        cursor: 'pointer',
                        overflow: 'visible',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }
                      }}
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Box sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        left: 16, 
                        backgroundColor: getStatusColor(doc.status),
                        color: '#fff',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {doc.status}
                      </Box>

                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={2} sm={1}>
                            <Avatar 
                              sx={{ 
                                bgcolor: `${getStatusColor(doc.status)}20`,
                                color: getStatusColor(doc.status)
                              }}
                            >
                              {getDocumentTypeIcon(doc.type)}
                            </Avatar>
                          </Grid>
                          <Grid item xs={10} sm={11}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                  {doc.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Client: {doc.clientName}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight={500} color={doc.status === 'urgent' ? 'error.main' : 'text.primary'}>
                                  Due: {formatDate(doc.dueDate || '')}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={doc.type} 
                                  sx={{ 
                                    borderRadius: 1, 
                                    mt: 0.5,
                                    textTransform: 'capitalize',
                                    bgcolor: 'background.paper' 
                                  }} 
                                  variant="outlined" 
                                />
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                        <Button 
                          size="small" 
                          color="primary" 
                          endIcon={<ArrowIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(doc);
                          }}
                        >
                          View & Complete
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <Grid container spacing={2}>
              {RECENT_DOCUMENTS.map((doc, index) => (
                <Grid item xs={12} md={6} key={doc.id}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }
                      }}
                      onClick={() => handleViewDocument(doc)}
                    >
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={2} sm={1}>
                            <Avatar 
                              sx={{ 
                                bgcolor: theme.palette.primary.light + '20',
                                color: theme.palette.primary.main
                              }}
                            >
                              {getDocumentTypeIcon(doc.type)}
                            </Avatar>
                          </Grid>
                          <Grid item xs={10} sm={11}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                  {doc.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Client: {doc.clientName}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight={500}>
                                  Created: {formatDate(doc.date || '')}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={doc.type} 
                                  sx={{ 
                                    borderRadius: 1, 
                                    mt: 0.5,
                                    textTransform: 'capitalize',
                                    bgcolor: 'background.paper' 
                                  }} 
                                  variant="outlined" 
                                />
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                        <Button 
                          size="small" 
                          endIcon={<ArrowIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(doc);
                          }}
                        >
                          View Document
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, flexDirection: 'column' }}>
            <FolderIcon fontSize="large" sx={{ mb: 2, color: 'text.secondary', fontSize: 50, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Draft Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 2 }}>
              Saved drafts will appear here. Create a new document and save it as a draft to continue later.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<NoteAddIcon />}
              onClick={handleMenuOpen}
            >
              Create New Document
            </Button>
          </Box>
        )}
      </Box>

      {/* Compliance Section */}
      <Paper 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          mb: 4,
          backgroundImage: `linear-gradient(120deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Documentation Compliance
          </Typography>
          <Button variant="outlined" size="small" endIcon={<ChartIcon />}>
            View Full Report
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Compliance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  92%
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                  +2.5%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={92} 
                sx={{ 
                  mt: 1, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: theme.palette.primary.main + '20',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.primary.main
                  }
                }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                24h Documentation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  96%
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                  +1.2%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={96} 
                sx={{ 
                  mt: 1, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: theme.palette.success.main + '20',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.success.main
                  }
                }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Treatment Plan Updates
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  88%
                </Typography>
                <Typography variant="body2" color="error.main" sx={{ ml: 1 }}>
                  -1.5%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={88} 
                sx={{ 
                  mt: 1, 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: theme.palette.warning.main + '20',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.warning.main
                  }
                }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pending Co-Signatures
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent="8" color="error" sx={{ mr: 1 }}>
                  <WarningIcon color="warning" />
                </Badge>
                <Typography variant="body2" color="text.primary">
                  Require immediate attention
                </Typography>
              </Box>
              <Button 
                variant="text" 
                size="small" 
                sx={{ mt: 1 }}
                endIcon={<ArrowIcon fontSize="small" />}
              >
                Review Pending Signatures
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Documentation; 