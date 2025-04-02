import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Psychology as ClinicalIcon,
  Edit as EditIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  PriorityHigh as ActiveIcon,
  Archive as ArchivedIcon,
  AutoGraph as AssessmentIcon,
  MedicalInformation as MedicalIcon,
  LocalHospital as DiagnosisIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface ClinicalTabProps {
  client: any;
  diagnoses: any[];
}

export const ClinicalTab: React.FC<ClinicalTabProps> = ({ client, diagnoses }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAddDiagnosisDialog, setShowAddDiagnosisDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MM/dd/yyyy');
  };
  
  // Get primary diagnosis (if any)
  const primaryDiagnosis = diagnoses.find(d => d.clientId === client.id && d.primary);
  
  // Filter active diagnoses for this client
  const activeDiagnoses = diagnoses.filter(
    d => d.clientId === client.id && d.status !== 'resolved'
  );
  
  // Filter resolved diagnoses for this client
  const resolvedDiagnoses = diagnoses.filter(
    d => d.clientId === client.id && d.status === 'resolved'
  );
  
  const getStatusChip = (status: string) => {
    let color;
    let icon;
    
    switch (status) {
      case 'active':
        color = 'primary';
        icon = <ActiveIcon />;
        break;
      case 'resolved':
        color = 'success';
        icon = <CompletedIcon />;
        break;
      case 'improving':
        color = 'info';
        icon = <AssessmentIcon />;
        break;
      case 'worsening':
        color = 'warning';
        icon = <PriorityHigh />;
        break;
      case 'remission':
        color = 'success';
        icon = <CheckCircle />;
        break;
      default:
        color = 'default';
        icon = <DiagnosisIcon />;
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color as any}
        size="small"
        icon={icon}
        variant="outlined"
      />
    );
  };
  
  const Section = ({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
          {title}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {action}
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
  
  const DiagnosisCard = ({ diagnosis }: { diagnosis: any }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              {diagnosis.code} - {diagnosis.name}
            </Typography>
            {diagnosis.primary && (
              <Chip 
                label="Primary" 
                color="primary" 
                size="small" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
        action={
          <Box>
            {getStatusChip(diagnosis.status)}
            <IconButton size="small" sx={{ ml: 1 }}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        subheader={`Assigned: ${formatDate(diagnosis.dateAssigned)} by ${diagnosis.assignedBy}`}
      />
      <CardContent>
        {diagnosis.notes && (
          <Typography variant="body2" paragraph>
            {diagnosis.notes}
          </Typography>
        )}
        
        {diagnosis.severity && (
          <Typography variant="body2" color="text.secondary">
            <strong>Severity:</strong> {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)}
            {diagnosis.specifier && ` - ${diagnosis.specifier}`}
          </Typography>
        )}
        
        {diagnosis.treatmentResponses && diagnosis.treatmentResponses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Treatment Response
            </Typography>
            {diagnosis.treatmentResponses.map((resp: any, index: number) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                <Chip 
                  label={resp.response.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} 
                  size="small" 
                  color={
                    resp.response.includes('improved') ? 'success' : 
                    resp.response === 'partial' ? 'info' : 
                    resp.response.includes('worsened') ? 'error' : 
                    'default'
                  }
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(resp.date)}
                  </Typography>
                  <Typography variant="body2">
                    {resp.notes}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
  
  const AddDiagnosisDialog = () => (
    <Dialog
      open={showAddDiagnosisDialog}
      onClose={() => setShowAddDiagnosisDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Add New Diagnosis
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Diagnosis Code"
              placeholder="e.g., F41.1"
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Diagnosis Name"
              placeholder="e.g., Generalized Anxiety Disorder"
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Severity</InputLabel>
              <Select
                label="Severity"
                defaultValue="moderate"
              >
                <MenuItem value="mild">Mild</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="severe">Severe</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                defaultValue="active"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="improving">Improving</MenuItem>
                <MenuItem value="worsening">Worsening</MenuItem>
                <MenuItem value="remission">In Remission</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Specifier (if applicable)"
                placeholder="e.g., with anxious distress"
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Clinical Notes"
                placeholder="Enter additional details about this diagnosis..."
                fullWidth
                multiline
                rows={4}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Primary Diagnosis</InputLabel>
              <Select
                label="Primary Diagnosis"
                defaultValue="false"
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAddDiagnosisDialog(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setShowAddDiagnosisDialog(false)}
        >
          Save Diagnosis
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Diagnoses" />
        <Tab label="Treatment Plan" />
        <Tab label="Assessments" />
      </Tabs>
      
      {activeTab === 0 && (
        <Box>
          <Section 
            title="Diagnoses" 
            icon={<DiagnosisIcon color="primary" />}
            action={
              <Button
                size="small" 
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setShowAddDiagnosisDialog(true)}
              >
                Add Diagnosis
              </Button>
            }
          >
            {activeDiagnoses.length === 0 ? (
              <Typography color="text.secondary">
                No active diagnoses found. Click the "Add Diagnosis" button to add a diagnosis.
              </Typography>
            ) : (
              <Box>
                {activeDiagnoses.map(diagnosis => (
                  <DiagnosisCard key={diagnosis.id} diagnosis={diagnosis} />
                ))}
              </Box>
            )}
            
            {resolvedDiagnoses.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon sx={{ mr: 1 }} />
                  Past Diagnoses
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {resolvedDiagnoses.map(diagnosis => (
                  <DiagnosisCard key={diagnosis.id} diagnosis={diagnosis} />
                ))}
              </Box>
            )}
          </Section>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
          <Section 
            title="Treatment Plan" 
            icon={<MedicalIcon color="primary" />}
            action={
              <Button
                size="small" 
                startIcon={<EditIcon />}
                variant="outlined"
              >
                Edit Plan
              </Button>
            }
          >
            <Typography variant="body1" gutterBottom>
              <strong>Primary Diagnosis:</strong> {primaryDiagnosis ? `${primaryDiagnosis.code} - ${primaryDiagnosis.name}` : 'No primary diagnosis'}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              <strong>Treatment Approach:</strong> Cognitive-Behavioral Therapy (CBT)
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              <strong>Frequency:</strong> Once weekly, 50-minute sessions
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Treatment Goals
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ ml: 2, mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>1. Reduce anxiety symptoms</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                Client will report a 50% reduction in anxiety symptoms as measured by the GAD-7 within 3 months.
                Client will develop and utilize at least 3 coping strategies for managing anxiety in work situations.
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>2. Improve sleep quality</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mb: 2 }}>
                Client will establish a consistent sleep routine within 1 month.
                Client will report increased sleep quality and average 7 hours of sleep per night within 2 months.
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>3. Develop cognitive restructuring skills</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Client will learn to identify and challenge negative thought patterns, particularly related to work performance.
                Client will demonstrate ability to generate balanced alternative thoughts when experiencing anxiety.
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Interventions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ ml: 2 }}>
              <ul style={{ marginTop: 0 }}>
                <li>
                  <Typography variant="body2">
                    Provide psychoeducation on anxiety and the cognitive-behavioral model
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Teach relaxation techniques, including diaphragmatic breathing and progressive muscle relaxation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Implement cognitive restructuring to address anxious thoughts
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Develop exposure hierarchy for anxiety-provoking situations
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Implement graduated exposure exercises
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Teach sleep hygiene practices
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Collaborate with psychiatrist (Dr. Johnson) for medication management
                  </Typography>
                </li>
              </ul>
            </Box>
          </Section>
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          <Section 
            title="Assessments" 
            icon={<AssessmentIcon color="primary" />}
            action={
              <Button
                size="small" 
                startIcon={<AddIcon />}
                variant="outlined"
              >
                Add Assessment
              </Button>
            }
          >
            <TableContainer>
              <Table size="medium">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        GAD-7 (Generalized Anxiety Disorder Scale)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administered: {formatDate('2023-03-15')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>Score: 16</strong> (Severe Anxiety)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text">View Details</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        PHQ-9 (Patient Health Questionnaire)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administered: {formatDate('2023-03-15')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>Score: 8</strong> (Mild Depression)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text">View Details</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        GAD-7 (Generalized Anxiety Disorder Scale)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administered: {formatDate('2023-04-26')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>Score: 12</strong> (Moderate Anxiety)
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ↓ 4 points from previous
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text">View Details</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        ISI (Insomnia Severity Index)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administered: {formatDate('2023-04-12')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>Score: 14</strong> (Moderate Insomnia)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text">View Details</Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">
                        ISI (Insomnia Severity Index)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administered: {formatDate('2023-05-10')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>Score: 10</strong> (Subthreshold Insomnia)
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ↓ 4 points from previous
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text">View Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </Box>
      )}
      
      <AddDiagnosisDialog />
    </Box>
  );
}; 