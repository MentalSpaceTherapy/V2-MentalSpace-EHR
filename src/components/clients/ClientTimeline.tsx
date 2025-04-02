import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  useTheme
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Note as NoteIcon,
  Receipt as ReceiptIcon,
  AssignmentInd as AssignmentIcon,
  MedicalServices as MedicalIcon,
  Upload as UploadIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  DownloadForOffline as ExportIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

// Mock data for client history
const MOCK_HISTORY = [
  {
    id: '1',
    date: '2023-05-01T14:30:00Z',
    type: 'appointment',
    title: 'Therapy Session',
    description: 'Weekly therapy session with Dr. Smith',
    user: 'Dr. Smith',
    metadata: {
      status: 'completed',
      duration: 50,
      notes: 'Patient reported decreased anxiety symptoms.'
    }
  },
  {
    id: '2',
    date: '2023-04-28T10:15:00Z',
    type: 'document',
    title: 'Insurance Verification',
    description: 'Insurance coverage verified and updated',
    user: 'Sarah Admin',
    metadata: {
      documentType: 'Insurance',
      insuranceProvider: 'Blue Cross Blue Shield'
    }
  },
  {
    id: '3',
    date: '2023-04-24T15:30:00Z',
    type: 'appointment',
    title: 'Therapy Session',
    description: 'Weekly therapy session with Dr. Smith',
    user: 'Dr. Smith',
    metadata: {
      status: 'completed',
      duration: 50,
      notes: 'Discussed cognitive behavioral techniques for managing anxiety.'
    }
  },
  {
    id: '4',
    date: '2023-04-20T09:45:00Z',
    type: 'note',
    title: 'Phone Call',
    description: 'Patient called to reschedule next appointment',
    user: 'Front Desk',
    metadata: {
      noteType: 'administrative',
      priority: 'low'
    }
  },
  {
    id: '5',
    date: '2023-04-17T14:30:00Z',
    type: 'appointment',
    title: 'Therapy Session',
    description: 'Weekly therapy session with Dr. Smith',
    user: 'Dr. Smith',
    metadata: {
      status: 'completed',
      duration: 50,
      notes: 'Patient reported improved sleep patterns.'
    }
  },
  {
    id: '6',
    date: '2023-04-12T11:20:00Z',
    type: 'billing',
    title: 'Payment Received',
    description: 'Insurance payment received for session on 4/3',
    user: 'Billing Dept',
    metadata: {
      amount: 125.00,
      payer: 'Blue Cross Blue Shield',
      claimNumber: 'BCBS-2023-04-001'
    }
  },
  {
    id: '7',
    date: '2023-04-10T14:30:00Z',
    type: 'appointment',
    title: 'Therapy Session',
    description: 'Weekly therapy session with Dr. Smith',
    user: 'Dr. Smith',
    metadata: {
      status: 'completed',
      duration: 50,
      notes: 'Continued work on anxiety management techniques.'
    }
  },
  {
    id: '8',
    date: '2023-04-03T14:30:00Z',
    type: 'appointment',
    title: 'Therapy Session',
    description: 'Weekly therapy session with Dr. Smith',
    user: 'Dr. Smith',
    metadata: {
      status: 'completed',
      duration: 50,
      notes: 'Initial assessment and treatment planning.'
    }
  },
  {
    id: '9',
    date: '2023-03-30T09:15:00Z',
    type: 'intake',
    title: 'Client Intake',
    description: 'New client intake and paperwork completed',
    user: 'Admin Staff',
    metadata: {
      referredBy: 'Dr. Johnson',
      initialDiagnosis: 'Anxiety, Depression'
    }
  }
];

// Define types
interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description: string;
  user: string;
  metadata: Record<string, any>;
}

interface ClientTimelineProps {
  clientId: string;
  limit?: number;
}

export const ClientTimeline: React.FC<ClientTimelineProps> = ({ 
  clientId,
  limit 
}) => {
  const theme = useTheme();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const timer = setTimeout(() => {
      setEvents(MOCK_HISTORY);
      setFilteredEvents(MOCK_HISTORY);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [clientId]);
  
  // Apply filters when they change
  useEffect(() => {
    let filtered = [...events];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }
    
    // Apply time filter
    if (timeFilter !== 'all') {
      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.date);
        switch (timeFilter) {
          case 'today':
            return isToday(eventDate);
          case 'yesterday':
            return isYesterday(eventDate);
          case 'thisWeek':
            return isThisWeek(eventDate);
          case 'thisMonth':
            return isThisMonth(eventDate);
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.user.toLowerCase().includes(term)
      );
    }
    
    // Apply limit if specified
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    setFilteredEvents(filtered);
  }, [events, filterType, timeFilter, searchTerm, limit]);
  
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value);
  };
  
  const handleTimeFilterChange = (event: SelectChangeEvent<string>) => {
    setTimeFilter(event.target.value);
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <EventIcon />;
      case 'note':
        return <NoteIcon />;
      case 'billing':
        return <ReceiptIcon />;
      case 'document':
        return <UploadIcon />;
      case 'assessment':
        return <AssignmentIcon />;
      case 'medication':
        return <MedicalIcon />;
      case 'message':
        return <MessageIcon />;
      case 'edit':
        return <EditIcon />;
      case 'intake':
        return <PersonAddIcon />;
      default:
        return <EventIcon />;
    }
  };
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'primary';
      case 'note':
        return 'info';
      case 'billing':
        return 'success';
      case 'document':
        return 'secondary';
      case 'assessment':
        return 'warning';
      case 'medication':
        return 'error';
      case 'message':
        return 'info';
      case 'edit':
        return 'default';
      case 'intake':
        return 'primary';
      default:
        return 'grey';
    }
  };
  
  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };
  
  // Render the metadata section based on event type
  const renderMetadata = (event: TimelineEvent) => {
    const { type, metadata } = event;
    
    switch (type) {
      case 'appointment':
        return (
          <Box sx={{ mt: 1 }}>
            <Chip 
              size="small" 
              label={`Status: ${metadata.status}`} 
              color={metadata.status === 'completed' ? 'success' : 'default'} 
              sx={{ mr: 1, mb: 1 }} 
            />
            {metadata.duration && (
              <Chip 
                size="small" 
                label={`Duration: ${metadata.duration} min`} 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }} 
              />
            )}
            {metadata.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {metadata.notes}
              </Typography>
            )}
          </Box>
        );
        
      case 'billing':
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Amount:</strong> ${metadata.amount?.toFixed(2)}
            </Typography>
            {metadata.payer && (
              <Typography variant="body2">
                <strong>Payer:</strong> {metadata.payer}
              </Typography>
            )}
            {metadata.claimNumber && (
              <Typography variant="body2">
                <strong>Claim #:</strong> {metadata.claimNumber}
              </Typography>
            )}
          </Box>
        );
        
      case 'document':
        return (
          <Box sx={{ mt: 1 }}>
            {metadata.documentType && (
              <Chip 
                size="small" 
                label={metadata.documentType} 
                variant="outlined" 
                sx={{ mr: 1 }} 
              />
            )}
          </Box>
        );
        
      case 'intake':
        return (
          <Box sx={{ mt: 1 }}>
            {metadata.referredBy && (
              <Typography variant="body2">
                <strong>Referred by:</strong> {metadata.referredBy}
              </Typography>
            )}
            {metadata.initialDiagnosis && (
              <Typography variant="body2">
                <strong>Initial diagnosis:</strong> {metadata.initialDiagnosis}
              </Typography>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Client History
        </Typography>
        
        <Button 
          startIcon={<ExportIcon />}
          size="small"
        >
          Export
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search timeline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <Select
            value={filterType}
            onChange={handleTypeFilterChange}
            displayEmpty
            startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Events</MenuItem>
            <MenuItem value="appointment">Appointments</MenuItem>
            <MenuItem value="note">Notes</MenuItem>
            <MenuItem value="billing">Billing</MenuItem>
            <MenuItem value="document">Documents</MenuItem>
            <MenuItem value="assessment">Assessments</MenuItem>
            <MenuItem value="medication">Medications</MenuItem>
            <MenuItem value="message">Messages</MenuItem>
            <MenuItem value="intake">Intake</MenuItem>
            <MenuItem value="edit">Changes</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <Select
            value={timeFilter}
            onChange={handleTimeFilterChange}
            displayEmpty
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="thisWeek">This Week</MenuItem>
            <MenuItem value="thisMonth">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {filteredEvents.length === 0 ? (
        <Typography align="center" sx={{ py: 4 }} color="text.secondary">
          No history events match your filters.
        </Typography>
      ) : (
        <Timeline position="right">
          {filteredEvents.map((event) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ maxWidth: '150px' }}>
                {formatEventDate(event.date)}
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <TimelineDot color={getEventColor(event.type) as any}>
                  {getEventIcon(event.type)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              
              <TimelineContent>
                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" component="div">
                        {event.title}
                      </Typography>
                      
                      <Typography variant="body2">
                        {event.description}
                      </Typography>
                    </Box>
                    
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  {renderMetadata(event)}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, backgroundColor: theme.palette.primary.main }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {event.user}
                    </Typography>
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Paper>
  );
};

export default ClientTimeline; 