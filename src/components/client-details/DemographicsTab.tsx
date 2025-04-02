import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Button,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  ContactPhone as ContactIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface DemographicsTabProps {
  client: any;
}

export const DemographicsTab: React.FC<DemographicsTabProps> = ({ client }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MM/dd/yyyy');
  };
  
  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
          {title}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button 
          size="small" 
          startIcon={<EditIcon />}
          variant="outlined"
        >
          Edit
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
  
  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <TableRow>
      <TableCell component="th" scope="row" sx={{ width: '40%', color: 'text.secondary' }}>
        {label}
      </TableCell>
      <TableCell>{value || 'Not provided'}</TableCell>
    </TableRow>
  );
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Section title="Personal Information" icon={<PersonIcon color="primary" />}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <InfoRow label="Full Name" value={`${client.firstName} ${client.lastName}`} />
                  <InfoRow label="Date of Birth" value={formatDate(client.dateOfBirth)} />
                  <InfoRow label="Age" value={`${calculateAge(client.dateOfBirth)} years`} />
                  <InfoRow label="Gender" value={client.gender || 'Not specified'} />
                  <InfoRow label="Preferred Pronouns" value={client.preferredPronoun || 'Not specified'} />
                  <InfoRow label="Preferred Name" value={client.preferredName || 'Not specified'} />
                  <InfoRow label="Marital Status" value={client.maritalStatus ? client.maritalStatus.charAt(0).toUpperCase() + client.maritalStatus.slice(1) : 'Not specified'} />
                  <InfoRow label="Status" value={
                    <Chip 
                      label={client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'Unknown'} 
                      size="small"
                      color={
                        client.status === 'active' ? 'success' :
                        client.status === 'inactive' ? 'default' :
                        client.status === 'onboarding' ? 'info' :
                        client.status === 'discharged' ? 'error' :
                        client.status === 'on-hold' ? 'warning' :
                        'default'
                      }
                      variant="outlined"
                    />
                  } />
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Section title="Contact Information" icon={<ContactIcon color="primary" />}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <InfoRow label="Email" value={client.email} />
                  <InfoRow label="Phone" value={client.phone} />
                  <InfoRow label="Preferred Contact Method" value={
                    client.preferredContactMethod ? (
                      <Stack direction="row" spacing={1}>
                        {client.preferredContactMethod.map((method: string) => (
                          <Chip 
                            key={method} 
                            label={method.charAt(0).toUpperCase() + method.slice(1)} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    ) : 'Not specified'
                  } />
                  <InfoRow label="Contact Notes" value={client.contactNotes} />
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Section title="Address" icon={<HomeIcon color="primary" />}>
            {client.address ? (
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <InfoRow label="Street" value={client.address.street} />
                    {client.address.unit && <InfoRow label="Unit" value={client.address.unit} />}
                    <InfoRow label="City" value={client.address.city} />
                    <InfoRow label="State" value={client.address.state} />
                    <InfoRow label="ZIP Code" value={client.address.zipCode} />
                    <InfoRow label="Country" value={client.address.country} />
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No address information provided
              </Typography>
            )}
          </Section>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Section title="Employment & Education" icon={<BusinessIcon color="primary" />}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <InfoRow label="Employment Status" value={client.employmentStatus} />
                  <InfoRow label="Employer" value={client.employer} />
                  <InfoRow label="Occupation" value={client.occupation} />
                  <InfoRow label="Education Level" value={client.educationLevel} />
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Section title="Demographics" icon={<LanguageIcon color="primary" />}>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <InfoRow label="Primary Language" value={client.primaryLanguage} />
                  <InfoRow label="Secondary Language" value={client.secondaryLanguage} />
                  <InfoRow label="Ethnicity" value={client.ethnicity} />
                  <InfoRow label="Race" value={client.race} />
                  <InfoRow label="Religious Preference" value={client.religiousPreference} />
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </Grid>
        
        <Grid item xs={12}>
          <Section title="Emergency Contact" icon={<ContactIcon color="primary" />}>
            {client.emergencyContact ? (
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <InfoRow label="Name" value={`${client.emergencyContact.firstName} ${client.emergencyContact.lastName}`} />
                    <InfoRow label="Relationship" value={client.emergencyContact.relationship} />
                    <InfoRow label="Phone" value={client.emergencyContact.phone} />
                    <InfoRow label="Email" value={client.emergencyContact.email} />
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No emergency contact information provided
              </Typography>
            )}
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
}; 