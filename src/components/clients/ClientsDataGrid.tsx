import React, { useState } from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams, 
  GridSortModel,
  GridFilterModel,
  GridToolbar,
} from '@mui/x-data-grid';
import { 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  Avatar, 
  Typography,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ClientStatusBadge } from './ClientStatusBadge';

// Define the client interface
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  status: string;
  nextAppointment: string | null;
  primaryTherapistName: string | null;
  lastAppointment: string | null;
  insuranceProvider: string | null;
  tags?: string[];
}

interface ClientsDataGridProps {
  clients: Client[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortModel: GridSortModel) => void;
  onFilterChange: (filterModel: GridFilterModel) => void;
  onRowClick: (id: string) => void;
  onActionClick?: (action: string, client: Client) => void;
}

export const ClientsDataGrid: React.FC<ClientsDataGridProps> = ({
  clients,
  isLoading,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange,
  onRowClick,
  onActionClick,
}) => {
  const theme = useTheme();
  
  // Column definitions
  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Client>) => {
        const client = params.row;
        const initials = `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase();
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 35, height: 35 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body1">{client.firstName} {client.lastName}</Typography>
              {client.dateOfBirth && (
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(client.dateOfBirth), 'MMM d, yyyy')}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <ClientStatusBadge status={params.value} />,
    },
    {
      field: 'contact',
      headerName: 'Contact',
      width: 200,
      renderCell: (params: GridRenderCellParams<Client>) => {
        const client = params.row;
        return (
          <Box>
            {client.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" noWrap>{client.email}</Typography>
              </Box>
            )}
            {client.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2">{client.phone}</Typography>
              </Box>
            )}
          </Box>
        );
      },
      valueGetter: (params) => `${params.row.email || ''} ${params.row.phone || ''}`,
    },
    {
      field: 'nextAppointment',
      headerName: 'Next Appointment',
      width: 180,
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2">No upcoming</Typography>;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
            <Typography variant="body2">
              {format(new Date(params.value), 'MMM d, yyyy h:mm a')}
            </Typography>
          </Box>
        );
      },
      valueFormatter: (params) => 
        params.value ? format(new Date(params.value), 'MMM d, yyyy h:mm a') : 'No upcoming',
    },
    {
      field: 'primaryTherapistName',
      headerName: 'Therapist',
      width: 150,
      valueFormatter: (params) => params.value || 'Unassigned',
    },
    {
      field: 'insuranceProvider',
      headerName: 'Insurance',
      width: 150,
      valueFormatter: (params) => params.value || 'None',
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params) => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
          return null;
        }
        
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {params.value.slice(0, 2).map((tag: string) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
            {params.value.length > 2 && (
              <Chip 
                label={`+${params.value.length - 2} more`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="More actions">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onActionClick) {
                  onActionClick('menu', params.row);
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Row height increased for better readability
  const rowHeight = 70;

  return (
    <DataGrid
      rows={clients}
      columns={columns}
      loading={isLoading}
      rowHeight={rowHeight}
      
      // Pagination
      paginationMode="server"
      page={pagination.page}
      pageSize={pagination.pageSize}
      rowCount={pagination.totalItems}
      rowsPerPageOptions={[10, 20, 50, 100]}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      
      // Sorting and filtering
      sortingMode="server"
      onSortModelChange={onSortChange}
      filterMode="server"
      onFilterModelChange={onFilterChange}
      
      // Toolbar with export and filtering options
      components={{ Toolbar: GridToolbar }}
      componentsProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 500 },
        },
      }}
      
      // Row click handling
      onRowClick={(params) => onRowClick(params.id.toString())}
      
      // Styling
      sx={{
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'action.hover',
          cursor: 'pointer',
        },
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
      }}
      disableSelectionOnClick
      disableColumnMenu
    />
  );
}; 