import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  LocalHospital as DiagnosisIcon,
  MedicalInformation as MedicalIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Assignment as AssessmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ArrowDropDown as ExpandIcon,
  ArrowRight as CollapseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Info as InfoIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { MOCK_HISTORY_EVENTS } from '../../../mockData/historyData';

// Table column definition
interface Column {
  id: 'timestamp' | 'user' | 'role' | 'eventType' | 'type' | 'title' | 'description';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => any;
}

// Define the columns for the audit log table
const columns: Column[] = [
  {
    id: 'timestamp',
    label: 'Date/Time',
    minWidth: 120,
    format: (value: string) => format(parseISO(value), 'MM/dd/yyyy h:mm a')
  },
  {
    id: 'user',
    label: 'User',
    minWidth: 120,
    format: (value: any) => value.name || 'System'
  },
  {
    id: 'role',
    label: 'Role',
    minWidth: 120,
    format: (value: any) => value.role || 'System'
  },
  {
    id: 'type',
    label: 'Category',
    minWidth: 100,
    format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
  },
  {
    id: 'eventType',
    label: 'Action',
    minWidth: 100,
    format: (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  },
  {
    id: 'title',
    label: 'Event',
    minWidth: 180
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 250
  },
];

// Props interface
interface AuditLogTableProps {
  clientId: string;
}

// Type for record change details
interface ChangeDetails {
  field: string;
  oldValue: any;
  newValue: any;
  section: string;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ clientId }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [orderBy, setOrderBy] = useState<keyof Column['id']>('timestamp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareData, setCompareData] = useState<ChangeDetails | null>(null);
  
  // Fetch audit log data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API fetch with timeout
    const timer = setTimeout(() => {
      // Filter for record change events
      const auditEvents = MOCK_HISTORY_EVENTS.filter(event => 
        event.clientId === clientId && 
        ['record', 'diagnosis', 'security', 'treatment', 'medication'].includes(event.type)
      );
      
      setEvents(auditEvents);
      setFilteredEvents(auditEvents);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [clientId]);
  
  // Handle search input
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredEvents(events);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.details.toLowerCase().includes(searchLower) ||
      event.user.name.toLowerCase().includes(searchLower) ||
      event.user.role.toLowerCase().includes(searchLower) ||
      event.type.toLowerCase().includes(searchLower) ||
      event.eventType.toLowerCase().includes(searchLower)
    );
    
    setFilteredEvents(filtered);
    setPage(0); // Reset to first page when filtering
  }, [searchText, events]);
  
  // Handle sorting
  const handleRequestSort = (property: keyof Column['id']) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    // Sort the data
    const sorted = [...filteredEvents].sort((a, b) => {
      let aValue = a[property];
      let bValue = b[property];
      
      // Handle nested properties
      if (property === 'user') {
        aValue = a.user.name;
        bValue = b.user.name;
      } else if (property === 'role') {
        aValue = a.user.role;
        bValue = b.user.role;
      }
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredEvents(sorted);
  };
  
  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  
  // Handle row expansion
  const toggleRowExpansion = (eventId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };
  
  // Handle opening the compare dialog
  const openCompareDialog = (changeDetails: ChangeDetails) => {
    setCompareData(changeDetails);
    setCompareDialogOpen(true);
  };
  
  // Get chip color based on event type
  const getEventTypeChip = (type: string, eventType: string) => {
    let color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' = 'default';
    
    if (type === 'record' && eventType === 'updated') {
      color = 'primary';
    } else if (type === 'security') {
      color = 'error';
    } else if (type === 'diagnosis') {
      color = 'warning';
    } else if (type === 'treatment') {
      color = 'secondary';
    } else if (type === 'medication') {
      color = 'info';
    }
    
    return (
      <Chip 
        size="small" 
        label={eventType.replace(/_/g, ' ')} 
        color={color}
        variant="outlined"
      />
    );
  };
  
  // Get icon for event type
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'record':
        return <EditIcon fontSize="small" />;
      case 'diagnosis':
        return <DiagnosisIcon fontSize="small" />;
      case 'security':
        return <SecurityIcon fontSize="small" />;
      case 'treatment':
        return <AssessmentIcon fontSize="small" />;
      case 'medication':
        return <MedicalIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };
  
  // Format field name for display
  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ');
  };
  
  // Render record changes or details
  const renderRecordChanges = (event: any) => {
    if (event.type === 'record' && event.metadata?.field) {
      return (
        <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Field Changed: {formatFieldName(event.metadata.field)}
            </Typography>
            <Button 
              size="small" 
              startIcon={<CompareIcon />}
              onClick={() => openCompareDialog(event.metadata as ChangeDetails)}
            >
              Compare Changes
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Previous Value:</Typography>
              <Typography variant="body2">
                {event.metadata.oldValue || <em>Empty</em>}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">New Value:</Typography>
              <Typography variant="body2">
                {event.metadata.newValue || <em>Empty</em>}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">Section:</Typography>
              <Typography variant="body2">
                {formatFieldName(event.metadata.section)}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }
    
    // For other event types, display the details
    return (
      <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 2 }}>
        <Typography variant="body2">{event.details}</Typography>
      </Box>
    );
  };
  
  // Compare Dialog Component
  const CompareChangesDialog = () => (
    <Dialog
      open={compareDialogOpen}
      onClose={() => setCompareDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Field Change Comparison: {compareData && formatFieldName(compareData.field)}
      </DialogTitle>
      <DialogContent dividers>
        {compareData && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Section: {formatFieldName(compareData.section)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Previous Value
                </Typography>
                <Typography variant="body1">
                  {compareData.oldValue || <em>Empty</em>}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  New Value
                </Typography>
                <Typography variant="body1">
                  {compareData.newValue || <em>Empty</em>}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCompareDialogOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Paper variant="outlined" sx={{ width: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Audit Log 
          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            ({filteredEvents.length} entries)
          </Typography>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search audit log..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <Button 
            size="small" 
            startIcon={<DownloadIcon />}
            variant="outlined"
          >
            Export
          </Button>
        </Box>
      </Box>
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="audit log table" size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40} />
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Loading audit data...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No audit records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((event) => {
                  const isExpanded = !!expandedRows[event.id];
                  
                  return (
                    <React.Fragment key={event.id}>
                      <TableRow hover tabIndex={-1}>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleRowExpansion(event.id)}
                            aria-label="expand row"
                          >
                            {isExpanded ? <ExpandIcon /> : <CollapseIcon />}
                          </IconButton>
                        </TableCell>
                        
                        <TableCell>
                          {columns[0].format
                            ? columns[0].format(event.timestamp)
                            : event.timestamp}
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title={event.user.role}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1, 
                                  bgcolor: theme.palette.primary.main,
                                  fontSize: '0.875rem' 
                                }}
                              >
                                {event.user.name.charAt(0)}
                              </Avatar>
                            </Tooltip>
                            {event.user.name}
                          </Box>
                        </TableCell>
                        
                        <TableCell>{event.user.role}</TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getEventTypeIcon(event.type)}
                            <Typography sx={{ ml: 1 }}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          {getEventTypeChip(event.type, event.eventType)}
                        </TableCell>
                        
                        <TableCell>{event.title}</TableCell>
                        
                        <TableCell>{event.description}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} sx={{ py: 0, borderBottom: isExpanded ? '1px solid' : 'none' }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            {renderRecordChanges(event)}
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredEvents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      <CompareChangesDialog />
    </Paper>
  );
};

export default AuditLogTable;

// Missing Avatar component declaration
const Avatar = ({ children, sx }: { children: React.ReactNode, sx: any }) => (
  <Box
    component="span"
    sx={{
      ...sx,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      color: 'white',
    }}
  >
    {children}
  </Box>
); 