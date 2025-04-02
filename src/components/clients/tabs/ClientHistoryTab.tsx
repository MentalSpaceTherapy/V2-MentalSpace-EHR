import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  ArrowForward as ArrowForwardIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ReceiptLong as ReceiptLongIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isValid, subDays } from 'date-fns';
import { LoadingSpinner } from '../../LoadingSpinner';
import { ErrorMessage } from '../../ErrorMessage';
import { ClientTimeline } from '../ClientTimeline';
import { axios } from '../../../lib/axios';

// History event types
const EVENT_TYPES = {
  client_create: {
    label: 'Client Created',
    icon: <AddIcon color="success" />,
    color: 'success.main'
  },
  client_update: {
    label: 'Client Updated',
    icon: <EditIcon color="info" />,
    color: 'info.main'
  },
  session_scheduled: {
    label: 'Appointment Scheduled',
    icon: <EventIcon color="primary" />,
    color: 'primary.main'
  },
  session_completed: {
    label: 'Appointment Completed',
    icon: <EventIcon color="success" />,
    color: 'success.main'
  },
  session_cancelled: {
    label: 'Appointment Cancelled',
    icon: <EventIcon color="error" />,
    color: 'error.main'
  },
  note_added: {
    label: 'Note Added',
    icon: <EditIcon color="secondary" />,
    color: 'secondary.main'
  },
  message_sent: {
    label: 'Message Sent',
    icon: <EmailIcon />,
    color: 'info.dark'
  },
  document_created: {
    label: 'Document Created',
    icon: <ReceiptLongIcon />,
    color: 'warning.main'
  }
};

interface ClientHistoryTabProps {
  clientId?: string;
}

interface HistoryEvent {
  id: number;
  entityId: number;
  entityType: string;
  action: string;
  timestamp: string;
  userId: number;
  details: string;
  metadata?: any;
  userFullName?: string; // Name of the user who made the change
}

export const ClientHistoryTab: React.FC<ClientHistoryTabProps> = ({ clientId }) => {
  const theme = useTheme();
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: subDays(new Date(), 30), // Default to last 30 days
    endDate: new Date()
  });
  
  // Fetch history events
  const { 
    data: historyEvents, 
    isLoading, 
    isError,
    error, 
    refetch 
  } = useQuery(
    ['clientHistory', clientId, eventTypeFilter, dateRange],
    async () => {
      // Build query params
      const params = new URLSearchParams();
      
      if (eventTypeFilter && eventTypeFilter !== 'all') {
        params.append('action', eventTypeFilter);
      }
      
      if (dateRange.startDate) {
        params.append('from', dateRange.startDate.toISOString());
      }
      
      if (dateRange.endDate) {
        params.append('to', dateRange.endDate.toISOString());
      }
      
      const response = await axios.get(`/api/clients/${clientId}/history?${params.toString()}`);
      return response.data;
    },
    {
      enabled: !!clientId,
      refetchOnWindowFocus: false
    }
  );
  
  // Format event for timeline display
  const formatEventsForTimeline = (events: HistoryEvent[] = []) => {
    return events.map(event => {
      const eventType = EVENT_TYPES[event.action as keyof typeof EVENT_TYPES] || {
        label: 'Event',
        icon: <ArrowForwardIcon />,
        color: 'grey.500'
      };
      
      return {
        id: event.id,
        date: isValid(parseISO(event.timestamp)) 
          ? format(parseISO(event.timestamp), 'MMM d, yyyy h:mm a')
          : 'Unknown date',
        title: eventType.label,
        description: event.details,
        icon: eventType.icon,
        color: eventType.color,
        user: event.userFullName || 'System',
        metadata: event.metadata
      };
    });
  };
  
  const handleExport = () => {
    // Convert history events to CSV
    const headers = ['Date', 'Event Type', 'Description', 'User'];
    const csvRows = [
      headers.join(','),
      ...historyEvents.map((event: HistoryEvent) => {
        const eventType = EVENT_TYPES[event.action as keyof typeof EVENT_TYPES]?.label || 'Event';
        const date = isValid(parseISO(event.timestamp)) 
          ? format(parseISO(event.timestamp), 'yyyy-MM-dd HH:mm:ss')
          : 'Unknown date';
        
        return [
          `"${date}"`,
          `"${eventType}"`,
          `"${event.details.replace(/"/g, '""')}"`,
          `"${event.userFullName || 'System'}"`
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `client_${clientId}_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <Typography variant="h6">Client History</Typography>
            
            {historyEvents && historyEvents.length > 0 && (
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                variant="outlined"
              >
                Export History
              </Button>
            )}
          </Stack>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={eventTypeFilter}
                  label="Event Type"
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Events</MenuItem>
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From"
                  value={dateRange.startDate}
                  onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                  slotProps={{ textField: { size: 'small' } }}
                />
                
                <DatePicker
                  label="To"
                  value={dateRange.endDate}
                  onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </LocalizationProvider>
              
              <Button 
                variant="contained" 
                size="small"
                onClick={() => refetch()}
                startIcon={<FilterListIcon />}
              >
                Filter
              </Button>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <LoadingSpinner />
            </Box>
          ) : isError ? (
            <ErrorMessage error={error as Error} onRetry={() => refetch()} />
          ) : historyEvents && historyEvents.length > 0 ? (
            <ClientTimeline events={formatEventsForTimeline(historyEvents)} />
          ) : (
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <CardContent>
                <Typography color="textSecondary">
                  No history events found for this client.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientHistoryTab; 