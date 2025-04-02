import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  EventNote as AppointmentIcon,
  Add as AddIcon,
  Event as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Schedule as ScheduledIcon,
  Cancel as CanceledIcon,
  ConfirmationNumber as BilledIcon,
  Notes as NotesIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

interface AppointmentsTabProps {
  appointments: any[];
  clientId: string;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ appointments, clientId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const today = startOfDay(new Date());
  
  // Filter appointments
  const upcomingAppointments = appointments
    .filter(appointment => 
      appointment.status !== 'canceled' && 
      isAfter(parseISO(appointment.startTime), today)
    )
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    
  const pastAppointments = appointments
    .filter(appointment => 
      isBefore(parseISO(appointment.startTime), today) || 
      appointment.status === 'canceled'
    )
    .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
  
  const formatDate = (dateTime: string) => {
    return format(parseISO(dateTime), 'MM/dd/yyyy');
  };
  
  const formatTime = (dateTime: string) => {
    return format(parseISO(dateTime), 'h:mm a');
  };
  
  const getStatusChip = (status: string) => {
    let color;
    let icon;
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch (status) {
      case 'completed':
        color = 'success';
        icon = <CompletedIcon />;
        break;
      case 'scheduled':
        color = 'primary';
        icon = <ScheduledIcon />;
        break;
      case 'canceled':
        color = 'error';
        icon = <CanceledIcon />;
        break;
      default:
        color = 'default';
        icon = <AppointmentIcon />;
    }
    
    return (
      <Chip 
        label={label} 
        color={color as any}
        size="small"
        icon={icon}
        variant="outlined"
      />
    );
  };
  
  const ScheduleAppointmentDialog = () => (
    <Dialog
      open={scheduleDialogOpen}
      onClose={() => setScheduleDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Schedule New Appointment
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Time"
              type="time"
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                defaultValue="individual"
              >
                <MenuItem value="individual">Individual Therapy</MenuItem>
                <MenuItem value="group">Group Therapy</MenuItem>
                <MenuItem value="family">Family Therapy</MenuItem>
                <MenuItem value="initial-consultation">Initial Consultation</MenuItem>
                <MenuItem value="medication-review">Medication Review</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Location</InputLabel>
              <Select
                label="Location"
                defaultValue="Office A"
              >
                <MenuItem value="Office A">Office A</MenuItem>
                <MenuItem value="Office B">Office B</MenuItem>
                <MenuItem value="Office C">Office C</MenuItem>
                <MenuItem value="Office D">Office D</MenuItem>
                <MenuItem value="Virtual">Virtual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Therapist</InputLabel>
              <Select
                label="Therapist"
                defaultValue="Dr. Smith"
              >
                <MenuItem value="Dr. Smith">Dr. Smith</MenuItem>
                <MenuItem value="Dr. Jones">Dr. Jones</MenuItem>
                <MenuItem value="Dr. Johnson">Dr. Johnson</MenuItem>
                <MenuItem value="Dr. Brown">Dr. Brown</MenuItem>
                <MenuItem value="Dr. Wilson">Dr. Wilson</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Duration</InputLabel>
              <Select
                label="Duration"
                defaultValue="60"
              >
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="45">45 minutes</MenuItem>
                <MenuItem value="60">60 minutes</MenuItem>
                <MenuItem value="90">90 minutes</MenuItem>
                <MenuItem value="120">120 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              placeholder="Enter any notes or special instructions for this appointment..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScheduleDialogOpen(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setScheduleDialogOpen(false)}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <AppointmentIcon sx={{ mr: 1 }} color="primary" />
          Appointments
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setScheduleDialogOpen(true)}
        >
          Schedule Appointment
        </Button>
      </Box>
      
      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>
        
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabValue === 0 ? (
                upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{formatDate(appointment.startTime)}</TableCell>
                      <TableCell>{formatTime(appointment.startTime)}</TableCell>
                      <TableCell>
                        {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace(/-/g, ' ')}
                      </TableCell>
                      <TableCell>{appointment.therapistName}</TableCell>
                      <TableCell>{appointment.location}</TableCell>
                      <TableCell>{getStatusChip(appointment.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton size="small" color="error">
                            <CanceledIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No upcoming appointments scheduled
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<CalendarIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => setScheduleDialogOpen(true)}
                      >
                        Schedule Now
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              ) : (
                pastAppointments.length > 0 ? (
                  pastAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{formatDate(appointment.startTime)}</TableCell>
                      <TableCell>{formatTime(appointment.startTime)}</TableCell>
                      <TableCell>
                        {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace(/-/g, ' ')}
                      </TableCell>
                      <TableCell>{appointment.therapistName}</TableCell>
                      <TableCell>{appointment.location}</TableCell>
                      <TableCell>{getStatusChip(appointment.status)}</TableCell>
                      <TableCell align="right">
                        {appointment.status === 'completed' && (
                          <Tooltip title="View Notes">
                            <IconButton size="small" color="primary">
                              <NotesIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {appointment.billable && (
                          <Tooltip title={appointment.billingStatus === 'billed' ? 'Billed' : 'Not Billed'}>
                            <IconButton size="small" color={appointment.billingStatus === 'billed' ? 'success' : 'default'}>
                              <BilledIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No past appointments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <ScheduleAppointmentDialog />
    </Box>
  );
}; 