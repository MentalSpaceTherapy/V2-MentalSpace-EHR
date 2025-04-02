import React, { useState, useEffect, useMemo, ErrorInfo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Today as TodayIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewModule as GridViewIcon,
  List as ListViewIcon
} from '@mui/icons-material';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth, isSameDay } from 'date-fns';

import { TimelineEvent } from './TimelineEvent';
import { MOCK_HISTORY_EVENTS, EVENT_TYPE_CONFIG } from '../../../mockData/historyData';
import type { HistoryFilters } from './HistoryFilters';

interface TimelineViewProps {
  clientId: string;
  filters: HistoryFilters;
  onExport: (format: 'csv' | 'pdf') => void;
}

// Enum for view mode
enum ViewMode {
  Timeline = 'timeline',
  List = 'list',
  Grid = 'grid'
}

// Safely access EVENT_TYPE_CONFIG with type check
const getEventColor = (type: string): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'grey' => {
  const config = EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG];
  const color = config?.color as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | undefined;
  return color || 'grey'; // Use 'grey' instead of 'default' which is not valid for TimelineDot
};

// Create an ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in TimelineView component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  clientId,
  filters,
  onExport
}) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.Timeline);
  const [viewMenuAnchorEl, setViewMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Fetch events based on client ID and filters
  useEffect(() => {
    setLoading(true);
    
    // Simulate API fetch with timeout
    const timer = setTimeout(() => {
      // Apply filters to the mock data
      let filteredData = MOCK_HISTORY_EVENTS.filter(event => event.clientId === clientId);
      setEvents(filteredData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [clientId]);
  
  // Handle view menu
  const handleViewMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setViewMenuAnchorEl(event.currentTarget);
  };
  
  const handleViewMenuClose = () => {
    setViewMenuAnchorEl(null);
  };
  
  const handleViewChange = (viewMode: ViewMode) => {
    setCurrentView(viewMode);
    handleViewMenuClose();
  };
  
  // Apply filters to events
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];
    
    return events.filter(event => {
      // Filter by event type
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.type)) {
        return false;
      }
      
      // Filter by user
      if (filters.userIds.length > 0 && !filters.userIds.includes(event.user.id)) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateRange.start && new Date(event.timestamp) < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end) {
        // End of the selected day
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (new Date(event.timestamp) > endDate) {
          return false;
        }
      }
      
      // Filter by search text
      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.details.toLowerCase().includes(searchTerm) ||
          event.user.name.toLowerCase().includes(searchTerm) ||
          event.user.role.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [events, filters]);
  
  // Group events by date for timeline view
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(event);
    });
    
    return groups;
  }, [filteredEvents]);
  
  // Get sorted dates for timeline view
  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents)
      .map(dateKey => new Date(dateKey))
      .sort((a, b) => b.getTime() - a.getTime()); // Newest first
  }, [groupedEvents]);
  
  // Format date for display
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE'); // Day name
    }
    return format(date, 'MMMM d, yyyy');
  };
  
  // Render timeline view
  const renderTimelineView = () => {
    if (sortedDates.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No history events match your filter criteria.
        </Alert>
      );
    }
    
    return (
      <Timeline position="right">
        {sortedDates.map(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayEvents = groupedEvents[dateKey];
          
          return (
            <React.Fragment key={dateKey}>
              <TimelineItem>
                <TimelineOppositeContent sx={{ flex: 0.2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {formatDateHeader(date)}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    <TodayIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="caption" color="text.secondary">
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              
              {dayEvents.map(event => (
                <TimelineItem key={event.id}>
                  <TimelineOppositeContent sx={{ flex: 0.2 }} color="text.secondary">
                    {format(parseISO(event.timestamp), 'h:mm a')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getEventColor(event.type)}>
                      {/* We'll use the icon from the TimelineEvent component */}
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <TimelineEvent event={event} />
                  </TimelineContent>
                </TimelineItem>
              ))}
            </React.Fragment>
          );
        })}
      </Timeline>
    );
  };
  
  // Render list view
  const renderListView = () => {
    if (filteredEvents.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No history events match your filter criteria.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {sortedDates.map(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayEvents = groupedEvents[dateKey];
          
          return (
            <Box key={dateKey} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {formatDateHeader(date)} 
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''})
                </Typography>
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {dayEvents.map(event => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </Box>
          );
        })}
      </Box>
    );
  };
  
  // Render grid view
  const renderGridView = () => {
    if (filteredEvents.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No history events match your filter criteria.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </Typography>
        
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: 2,
            mt: 2
          }}
        >
          {filteredEvents.map(event => (
            <Box key={event.id} sx={{ height: '100%' }}>
              <TimelineEvent event={event} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  };
  
  // Render the appropriate view based on current selection
  const renderView = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    switch (currentView) {
      case ViewMode.Timeline:
        return renderTimelineView();
      case ViewMode.List:
        return renderListView();
      case ViewMode.Grid:
        return renderGridView();
      default:
        return renderTimelineView();
    }
  };
  
  // Wrap the return statement with the ErrorBoundary
  return (
    <ErrorBoundary 
      fallback={
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            Something went wrong displaying the timeline.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Paper>
      }
    >
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Client History
            {filteredEvents.length > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                ({filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''})
              </Typography>
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={currentView === ViewMode.Timeline ? <DayViewIcon /> : 
                        currentView === ViewMode.List ? <ListViewIcon /> : 
                        <GridViewIcon />}
              onClick={handleViewMenuOpen}
            >
              {currentView === ViewMode.Timeline ? 'Timeline' : 
               currentView === ViewMode.List ? 'List' : 'Grid'} View
            </Button>
            
            <Menu
              anchorEl={viewMenuAnchorEl}
              open={Boolean(viewMenuAnchorEl)}
              onClose={handleViewMenuClose}
            >
              <MenuItem 
                onClick={() => handleViewChange(ViewMode.Timeline)}
                selected={currentView === ViewMode.Timeline}
              >
                <ListItemIcon>
                  <DayViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Timeline View</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleViewChange(ViewMode.List)}
                selected={currentView === ViewMode.List}
              >
                <ListItemIcon>
                  <ListViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>List View</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleViewChange(ViewMode.Grid)}
                selected={currentView === ViewMode.Grid}
              >
                <ListItemIcon>
                  <GridViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Grid View</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {renderView()}
      </Paper>
    </ErrorBoundary>
  );
};

export default TimelineView; 