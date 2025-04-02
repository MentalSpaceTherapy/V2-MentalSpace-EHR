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
  Button,
  Chip,
  LinearProgress,
  Stack,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  HealthAndSafety as InsuranceIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CompareArrows as CompareIcon,
  AttachMoney as MoneyIcon,
  CheckCircleOutline as VerifiedIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface InsuranceTabProps {
  client: any;
}

export const InsuranceTab: React.FC<InsuranceTabProps> = ({ client }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MM/dd/yyyy');
  };
  
  const Section = ({ title, icon, children, sx }: { title: string; icon: React.ReactNode; children: React.ReactNode; sx?: any }) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, ...sx }}>
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
  
  const InsuranceCard = ({ insurance, isPrimary }: { insurance: any; isPrimary: boolean }) => {
    if (!insurance) return null;
    
    // Calculate the percentage of deductible met
    const deductiblePercentage = insurance.deductible 
      ? Math.min(100, Math.round((insurance.deductibleMet / insurance.deductible) * 100))
      : 0;
      
    // Calculate the percentage of out-of-pocket maximum met
    const outOfPocketPercentage = insurance.outOfPocketMax 
      ? Math.min(100, Math.round((insurance.outOfPocketMet / insurance.outOfPocketMax) * 100))
      : 0;
    
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 3,
          border: isPrimary ? '1px solid #2196f3' : undefined,
          bgcolor: isPrimary ? 'rgba(33, 150, 243, 0.05)' : undefined
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsuranceIcon color={isPrimary ? 'primary' : 'action'} />
            <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
              {isPrimary ? 'Primary Insurance' : 'Secondary Insurance'}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip 
              label={insurance.provider} 
              color={isPrimary ? 'primary' : 'default'} 
              size="small"
              variant={isPrimary ? 'filled' : 'outlined'}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Policy Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <InfoRow label="Provider" value={insurance.provider} />
                      <InfoRow label="Plan Name" value={insurance.planName} />
                      <InfoRow label="Member ID" value={insurance.memberId} />
                      <InfoRow label="Group Number" value={insurance.groupNumber} />
                      <InfoRow 
                        label="Coverage Period" 
                        value={`${formatDate(insurance.coverageStartDate)} - ${formatDate(insurance.coverageEndDate)}`} 
                      />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Policy Holder Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <InfoRow 
                        label="Policy Holder" 
                        value={
                          insurance.policyHolder.isSelf 
                            ? <Chip icon={<PersonIcon />} label="Self" size="small" variant="outlined" />
                            : `${insurance.policyHolder.firstName} ${insurance.policyHolder.lastName}`
                        }
                      />
                      {!insurance.policyHolder.isSelf && (
                        <>
                          <InfoRow label="Date of Birth" value={formatDate(insurance.policyHolder.dateOfBirth)} />
                          <InfoRow label="Relationship" value={insurance.policyHolder.relationship} />
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Coverage Details
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <InfoRow label="Copay" value={insurance.copay ? `$${insurance.copay.toFixed(2)}` : 'N/A'} />
                      <InfoRow label="Coinsurance" value={insurance.coinsurance ? `${insurance.coinsurance}%` : 'N/A'} />
                      
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>
                          Deductible
                        </TableCell>
                        <TableCell>
                          <Box sx={{ mb: 1 }}>
                            {insurance.deductible ? (
                              <Typography variant="body2">
                                ${insurance.deductibleMet?.toFixed(2) || '0.00'} / ${insurance.deductible.toFixed(2)}
                              </Typography>
                            ) : 'N/A'}
                          </Box>
                          
                          {insurance.deductible && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={deductiblePercentage} 
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {deductiblePercentage}%
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>
                          Out-of-Pocket Max
                        </TableCell>
                        <TableCell>
                          <Box sx={{ mb: 1 }}>
                            {insurance.outOfPocketMax ? (
                              <Typography variant="body2">
                                ${insurance.outOfPocketMet?.toFixed(2) || '0.00'} / ${insurance.outOfPocketMax.toFixed(2)}
                              </Typography>
                            ) : 'N/A'}
                          </Box>
                          
                          {insurance.outOfPocketMax && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={outOfPocketPercentage} 
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {outOfPocketPercentage}%
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              {insurance.authorizationRequired && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Authorization Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <InfoRow label="Authorization Number" value={insurance.authorizationNumber} />
                        <InfoRow 
                          label="Authorization Period" 
                          value={`${formatDate(insurance.authorizationStartDate)} - ${formatDate(insurance.authorizationEndDate)}`} 
                        />
                        <InfoRow 
                          label="Sessions" 
                          value={`${insurance.sessionsUsed} of ${insurance.sessionsApproved} used`} 
                        />
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const hasInsurance = client.insuranceDetails?.primary || client.insuranceDetails?.secondary;
  
  return (
    <Box>
      {!hasInsurance && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No insurance information is currently on file for this client.
        </Alert>
      )}
      
      {client.insuranceDetails?.primary && (
        <InsuranceCard insurance={client.insuranceDetails.primary} isPrimary={true} />
      )}
      
      {client.insuranceDetails?.secondary && (
        <InsuranceCard insurance={client.insuranceDetails.secondary} isPrimary={false} />
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Section title="Insurance Notes" icon={<MoneyIcon color="primary" />}>
            <Typography variant="body2" color="text.secondary">
              Client is required to provide a 24-hour notice for cancellations to avoid being charged the full session fee, 
              which may not be covered by insurance. Insurance cards should be verified annually or when there are changes to coverage.
            </Typography>
          </Section>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<CompareIcon />}>
                Verify Benefits
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<MoneyIcon />}>
                Eligibility Check
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}; 