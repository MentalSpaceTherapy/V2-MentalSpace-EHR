import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
// Temporarily remove jsPDF import for build
// import { jsPDF } from 'jspdf';
import { Timeline as TimelineIcon, Receipt as AuditIcon } from '@mui/icons-material';

import { MOCK_HISTORY_EVENTS } from '../../../mockData/historyData';
import { HistoryFilters } from './HistoryFilters';
import TimelineView from './TimelineView';
import AuditLogTable from './AuditLogTable';

// Define proper types for the filters
interface DateRange {
  start: Date | null;
  end: Date | null;
}

// Fixed initialFilters with proper types
const initialFilters = {
  searchText: '',
  eventTypes: [] as string[],
  eventSubTypes: [] as string[],
  userIds: [] as string[],
  dateRange: {
    start: null,
    end: null
  } as DateRange,
  accessLevel: 'all' as const,
  savedFilter: ''
};

interface ClientHistoryTabProps {
  clientId: string;
  clientName?: string;
}

export const ClientHistoryTab: React.FC<ClientHistoryTabProps> = ({
  clientId,
  clientName = 'Client'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string, name: string, role: string }>>([]);
  const [exportSnackbar, setExportSnackbar] = useState(false);
  
  // Tab change handler
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Filter change handler
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };
  
  // Get unique users from history events for the filter dropdown
  useEffect(() => {
    const usersMap = new Map();
    
    MOCK_HISTORY_EVENTS
      .filter(event => event.clientId === clientId)
      .forEach(event => {
        if (event.user && event.user.id) {
          usersMap.set(event.user.id, {
            id: event.user.id,
            name: event.user.name,
            role: event.user.role
          });
        }
      });
    
    setAvailableUsers(Array.from(usersMap.values()));
    setLoading(false);
  }, [clientId]);
  
  // Export as CSV
  const exportCSV = () => {
    // Get filtered events
    const filteredEvents = MOCK_HISTORY_EVENTS
      .filter(event => event.clientId === clientId)
      .filter(event => {
        // Safe type checking
        if (Array.isArray(filters.eventTypes) && filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.type)) {
          return false;
        }
        
        if (Array.isArray(filters.userIds) && filters.userIds.length > 0 && !filters.userIds.includes(event.user.id)) {
          return false;
        }
        
        if (filters.dateRange.start && new Date(event.timestamp) < new Date(filters.dateRange.start)) {
          return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (new Date(event.timestamp) > endDate) {
            return false;
          }
        }
        
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
      });
    
    // Create CSV content
    const headers = ['Date', 'Time', 'User', 'Role', 'Category', 'Action', 'Title', 'Description'];
    
    const rows = filteredEvents.map(event => {
      const date = new Date(event.timestamp);
      
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        event.user.name,
        event.user.role,
        event.type,
        event.eventType,
        event.title,
        event.description
      ].map(cell => 
        // Escape quotes and wrap in quotes if the cell contains commas
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      );
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${clientName.replace(/\s+/g, '_')}_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportSnackbar(true);
  };
  
  // Export as PDF - Temporarily simplified for build issues
  const exportPDF = () => {
    // Show a message instead of generating a PDF
    alert('PDF export is temporarily unavailable. Please use CSV export instead.');
    setExportSnackbar(true);
  };
  
  // Handle export action
  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportCSV();
    } else {
      exportPDF();
    }
  };
  
  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <HistoryFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            availableUsers={availableUsers}
            onExport={handleExport}
          />
          
          <Paper variant="outlined">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                icon={<TimelineIcon />} 
                label="Timeline View" 
                iconPosition="start" 
              />
              <Tab 
                icon={<AuditIcon />} 
                label="Audit Log" 
                iconPosition="start" 
              />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              {activeTab === 0 && (
                <TimelineView 
                  clientId={clientId}
                  filters={filters}
                  onExport={handleExport}
                />
              )}
              
              {activeTab === 1 && (
                <AuditLogTable clientId={clientId} />
              )}
            </Box>
          </Paper>
          
          <Snackbar
            open={exportSnackbar}
            autoHideDuration={4000}
            onClose={() => setExportSnackbar(false)}
            message="Export successful"
          />
        </>
      )}
    </Box>
  );
};

export default ClientHistoryTab; 