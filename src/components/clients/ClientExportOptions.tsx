import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  TextField,
  Alert,
} from '@mui/material';
import {
  SaveAlt as ExportIcon,
  InsertDriveFile as FileIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CloudDownload as CloudIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Client } from '../../services/ClientSearchService';

interface ClientExportOptionsProps {
  clients: Client[];
  onExport: (format: string, fields: string[], options: Record<string, any>) => void;
  disabled?: boolean;
}

const ClientExportOptions: React.FC<ClientExportOptionsProps> = ({
  clients,
  onExport,
  disabled = false,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [exportFields, setExportFields] = useState<string[]>([
    'id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth',
    'status',
    'primaryTherapistName',
    'insuranceProvider',
  ]);
  const [exportOptions, setExportOptions] = useState({
    includeHeader: true,
    includeEmptyFields: false,
    includeTimestamp: true,
    orientationPDF: 'portrait',
    compressionLevel: 'none',
    sendEmail: false,
    emailAddress: '',
  });

  // All available fields for export
  const availableFields = [
    { name: 'id', label: 'Client ID', category: 'basic' },
    { name: 'firstName', label: 'First Name', category: 'basic' },
    { name: 'lastName', label: 'Last Name', category: 'basic' },
    { name: 'email', label: 'Email', category: 'contact' },
    { name: 'phone', label: 'Phone', category: 'contact' },
    { name: 'dateOfBirth', label: 'Date of Birth', category: 'demographic' },
    { name: 'gender', label: 'Gender', category: 'demographic' },
    { name: 'maritalStatus', label: 'Marital Status', category: 'demographic' },
    { name: 'status', label: 'Client Status', category: 'basic' },
    { name: 'primaryTherapistName', label: 'Primary Therapist', category: 'clinical' },
    { name: 'insuranceProvider', label: 'Insurance Provider', category: 'insurance' },
    { name: 'nextAppointment', label: 'Next Appointment', category: 'scheduling' },
    { name: 'lastAppointment', label: 'Last Appointment', category: 'scheduling' },
    { name: 'unpaidBalance', label: 'Unpaid Balance', category: 'billing' },
    { name: 'tags', label: 'Tags', category: 'clinical' },
    { name: 'diagnosisCodes', label: 'Diagnosis Codes', category: 'clinical' },
    { name: 'address.street', label: 'Street Address', category: 'contact' },
    { name: 'address.city', label: 'City', category: 'contact' },
    { name: 'address.state', label: 'State', category: 'contact' },
    { name: 'address.zipCode', label: 'ZIP Code', category: 'contact' },
    { name: 'emergencyContact.name', label: 'Emergency Contact Name', category: 'contact' },
    { name: 'emergencyContact.phone', label: 'Emergency Contact Phone', category: 'contact' },
    { name: 'emergencyContact.relationship', label: 'Emergency Contact Relationship', category: 'contact' },
  ];

  // Group fields by category
  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof availableFields>);

  // Open the export menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Close the export menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Open the export options dialog for a specific format
  const handleOpenDialog = (format: 'csv' | 'pdf' | 'excel') => {
    setExportFormat(format);
    setDialogOpen(true);
    handleMenuClose();
  };

  // Close the export options dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Toggle field selection
  const handleFieldToggle = (field: string) => {
    setExportFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  // Toggle option
  const handleOptionToggle = (option: string, value: any) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  // Select all fields
  const handleSelectAllFields = () => {
    setExportFields(availableFields.map((field) => field.name));
  };

  // Clear all fields
  const handleClearAllFields = () => {
    setExportFields([]);
  };

  // Select fields by category
  const handleSelectCategory = (category: string) => {
    const categoryFields = fieldsByCategory[category].map((field) => field.name);
    setExportFields((prev) => [
      ...prev.filter((f) => !categoryFields.includes(f)),
      ...categoryFields,
    ]);
  };

  // Clear fields by category
  const handleClearCategory = (category: string) => {
    const categoryFields = fieldsByCategory[category].map((field) => field.name);
    setExportFields((prev) => prev.filter((f) => !categoryFields.includes(f)));
  };

  // Export the data
  const handleExport = () => {
    onExport(exportFormat, exportFields, exportOptions);
    handleCloseDialog();
  };

  // Get file extension for current format
  const getFileExtension = () => {
    switch (exportFormat) {
      case 'csv':
        return '.csv';
      case 'pdf':
        return '.pdf';
      case 'excel':
        return '.xlsx';
      default:
        return '';
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ExportIcon />}
        onClick={handleMenuOpen}
        disabled={disabled || clients.length === 0}
        size="small"
      >
        Export
      </Button>

      {/* Export Format Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog('csv')}>
          <ListItemIcon>
            <FileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export as CSV" />
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('excel')}>
          <ListItemIcon>
            <FileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export as Excel" />
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('pdf')}>
          <ListItemIcon>
            <FileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export as PDF" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => window.print()}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Print Results" />
        </MenuItem>
      </Menu>

      {/* Export Options Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Export {clients.length} Clients as {exportFormat.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Select the fields you want to include in your {exportFormat.toUpperCase()} export.
            The file will include {clients.length} client records.
          </Alert>

          <Box sx={{ display: 'flex', mb: 2 }}>
            <Button size="small" onClick={handleSelectAllFields} sx={{ mr: 1 }}>
              Select All Fields
            </Button>
            <Button size="small" onClick={handleClearAllFields}>
              Clear All Fields
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Field selection by category */}
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <Box key={category} sx={{ minWidth: 250, flex: '1 0 auto', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {category} Information
                  </Typography>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => handleSelectCategory(category)}
                      sx={{ minWidth: 0, mr: 0.5 }}
                    >
                      All
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleClearCategory(category)}
                      sx={{ minWidth: 0 }}
                    >
                      None
                    </Button>
                  </Box>
                </Box>
                <FormGroup>
                  {fields.map((field) => (
                    <FormControlLabel
                      key={field.name}
                      control={
                        <Checkbox
                          checked={exportFields.includes(field.name)}
                          onChange={() => handleFieldToggle(field.name)}
                          size="small"
                        />
                      }
                      label={field.label}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Export Options
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeHeader}
                  onChange={(e) => handleOptionToggle('includeHeader', e.target.checked)}
                  size="small"
                />
              }
              label="Include header row"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeEmptyFields}
                  onChange={(e) => handleOptionToggle('includeEmptyFields', e.target.checked)}
                  size="small"
                />
              }
              label="Include empty fields"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeTimestamp}
                  onChange={(e) => handleOptionToggle('includeTimestamp', e.target.checked)}
                  size="small"
                />
              }
              label="Include timestamp in filename"
            />
          </FormGroup>

          {exportFormat === 'pdf' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                PDF Options
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Orientation
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={exportOptions.orientationPDF === 'portrait' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleOptionToggle('orientationPDF', 'portrait')}
                  >
                    Portrait
                  </Button>
                  <Button
                    variant={exportOptions.orientationPDF === 'landscape' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleOptionToggle('orientationPDF', 'landscape')}
                  >
                    Landscape
                  </Button>
                </Box>
              </FormControl>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.sendEmail}
                  onChange={(e) => handleOptionToggle('sendEmail', e.target.checked)}
                  size="small"
                />
              }
              label="Email export file"
            />
            {exportOptions.sendEmail && (
              <TextField
                label="Email Address"
                value={exportOptions.emailAddress}
                onChange={(e) => handleOptionToggle('emailAddress', e.target.value)}
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Typography variant="body2">
              Filename: client_export_{exportOptions.includeTimestamp ? 'YYYY-MM-DD_HH-MM' : ''}{getFileExtension()}
            </Typography>
            <Typography variant="body2">
              Fields: {exportFields.length} selected of {availableFields.length} available
            </Typography>
            <Typography variant="body2">
              Records: {clients.length} clients
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={exportFields.length === 0}
          >
            Export {clients.length} Clients
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientExportOptions; 