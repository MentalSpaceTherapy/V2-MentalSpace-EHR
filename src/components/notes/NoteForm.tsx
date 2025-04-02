import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  SelectChangeEvent,
} from '@mui/material';
import {
  Note as NoteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AssignmentInd as IntakeIcon,
  Assignment as TreatmentPlanIcon,
  MedicalServices as MedicationIcon,
  Phone as PhoneIcon,
  ExitToApp as DischargeIcon,
  LockOpen as LockOpenIcon,
  Lock as SignedIcon,
  Add as AddIcon,
  History as HistoryIcon,
  HowToReg as SignatureIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import RichTextEditor from '../editor/RichTextEditor';
import { NOTE_TEMPLATES, getTemplateById, getAllTemplates } from './NoteTemplates';
import NoteHistoryService from '../../services/NoteHistoryService';
import NoteSignatureService from '../../services/NoteSignatureService';
import NoteAutoSaveService from '../../services/NoteAutoSaveService';
import NoteVersionHistory from './NoteVersionHistory';
import NoteSignaturePanel from './NoteSignaturePanel';

// Interface for note data
export interface NoteFormData {
  id?: string;
  clientId: string;
  title: string;
  content: string;
  type: string;
  appointmentId?: string | null;
  status: 'draft' | 'signed' | 'co-signed' | 'locked' | 'reopened';
  tags: string[];
  visibility: 'clinical-staff' | 'all-staff' | 'client-visible';
  signedBy?: string;
  signedAt?: string;
  coSignedBy?: string[];
  coSignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  locked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
  currentVersionId?: string;
}

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: NoteFormData) => void;
  initialData?: Partial<NoteFormData>;
  clientId: string;
  clientName?: string;
  isEditMode?: boolean;
  appointments?: any[];
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
}

const defaultNote: NoteFormData = {
  clientId: '',
  title: '',
  content: '',
  type: 'progress',
  appointmentId: null,
  status: 'draft',
  tags: [],
  visibility: 'clinical-staff',
};

// Interface for tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`note-tabpanel-${index}`}
      aria-labelledby={`note-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const NoteForm: React.FC<NoteFormProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  clientId,
  clientName = 'Client',
  isEditMode = false,
  appointments = [],
  currentUser = { id: '1', name: 'Current User', role: 'Therapist' },
}) => {
  // Basic form state
  const [formData, setFormData] = useState<NoteFormData>({ ...defaultNote, clientId });
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');
  const [customTag, setCustomTag] = useState('');
  const [sign, setSign] = useState(false);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showAutoSaveMessage, setShowAutoSaveMessage] = useState(false);
  const contentChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for note history and signatures
  const [availableSupervisors, setAvailableSupervisors] = useState([
    { id: 'supervisor1', name: 'Dr. Jennifer White', role: 'Clinical Supervisor' },
    { id: 'supervisor2', name: 'Dr. Michael Johnson', role: 'Medical Director' },
    { id: 'supervisor3', name: 'Sarah Thompson', role: 'Program Director' },
  ]);

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultNote,
        ...initialData,
        clientId,
      });
      
      // Initialize history service if note has ID
      if (initialData.id && initialData.content) {
        // Check if history exists already
        const existingHistory = NoteHistoryService.getHistory(initialData.id);
        if (!existingHistory) {
          // Initialize history with current content
          NoteHistoryService.initializeHistory(
            initialData.id,
            initialData.content,
            currentUser.id,
            currentUser.name
          );
        }
        
        // Start tracking for auto-save
        if (autoSaveEnabled && initialData.status !== 'signed' && initialData.status !== 'co-signed') {
          NoteAutoSaveService.startTracking(
            initialData.id,
            initialData.content,
            initialData.title,
            currentUser.id
          );
        }
      }
    } else {
      setFormData({
        ...defaultNote,
        clientId,
        author: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [initialData, clientId, currentUser, autoSaveEnabled]);

  // Apply template when it changes
  useEffect(() => {
    if (templateId && !isEditMode) {
      const template = getTemplateById(templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          title: template.name,
          content: template.defaultContent,
          type: templateId.includes('intake') ? 'intake' : 
                templateId.includes('medication') ? 'medication' : 
                templateId.includes('phone') ? 'contact' : 
                templateId.includes('discharge') ? 'discharge' : 
                templateId.includes('treatment') ? 'treatment' : 'progress',
        }));
      }
    }
  }, [templateId, isEditMode]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }
      
      if (formData.id) {
        NoteAutoSaveService.stopTracking(formData.id);
      }
    };
  }, [formData.id]);

  // Check if note is locked
  const isNoteLocked = () => {
    if (!formData.id) return false;
    return NoteSignatureService.isNoteLocked(formData.id);
  };

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'intakeAssessment':
        return <IntakeIcon />;
      case 'treatmentPlanReview':
        return <TreatmentPlanIcon />;
      case 'medicationManagement':
        return <MedicationIcon />;
      case 'phoneContact':
        return <PhoneIcon />;
      case 'dischargeNote':
        return <DischargeIcon />;
      default:
        return <NoteIcon />;
    }
  };

  const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof NoteFormData;
    if (name) {
      const now = new Date().toISOString();
      
      const updatedFormData = {
        ...formData,
        [name]: e.target.value,
        updatedAt: now,
      };
      
      setFormData(updatedFormData);
      
      // Register change for auto-save
      if (autoSaveEnabled && formData.id && name !== 'tags') {
        // Debounce the auto-save to prevent too many calls
        if (contentChangeTimeoutRef.current) {
          clearTimeout(contentChangeTimeoutRef.current);
        }
        
        contentChangeTimeoutRef.current = setTimeout(() => {
          NoteAutoSaveService.registerChange(
            formData.id as string,
            updatedFormData.content,
            updatedFormData.title,
            currentUser.id
          );
          setLastSaved(now);
          setShowAutoSaveMessage(true);
          setTimeout(() => setShowAutoSaveMessage(false), 3000);
        }, 1000);
      }
    }
  };

  const handleContentChange = (content: string) => {
    const now = new Date().toISOString();
    
    const updatedFormData = {
      ...formData,
      content,
      updatedAt: now,
    };
    
    setFormData(updatedFormData);
    
    // Register change for auto-save
    if (autoSaveEnabled && formData.id) {
      // Debounce the auto-save to prevent too many calls
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }
      
      contentChangeTimeoutRef.current = setTimeout(() => {
        NoteAutoSaveService.registerChange(
          formData.id as string,
          content,
          updatedFormData.title,
          currentUser.id
        );
        setLastSaved(now);
        setShowAutoSaveMessage(true);
        setTimeout(() => setShowAutoSaveMessage(false), 3000);
      }, 1000);
    }
  };

  const handleTagAdd = () => {
    if (customTag && !formData.tags.includes(customTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, customTag],
      });
      setCustomTag('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToDelete),
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle version revert
  const handleRevertToVersion = (versionId: string) => {
    if (!formData.id) return;
    
    // Revert to the selected version
    const newVersionId = NoteHistoryService.revertToVersion(
      formData.id,
      versionId,
      currentUser.id,
      currentUser.name
    );
    
    if (newVersionId) {
      // Get the reverted content
      const newVersion = NoteHistoryService.getVersion(formData.id, newVersionId);
      if (newVersion) {
        setFormData({
          ...formData,
          content: newVersion.content,
          updatedAt: new Date().toISOString(),
          currentVersionId: newVersionId,
        });
        
        // Show success message
        setShowAutoSaveMessage(true);
        setTimeout(() => setShowAutoSaveMessage(false), 3000);
      }
    }
  };
  
  // Handle status change from signature panel
  const handleStatusChange = (newStatus: string) => {
    setFormData({
      ...formData,
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Create a new note object with updated timestamps
      const now = new Date().toISOString();
      const noteToSave: NoteFormData = {
        ...formData,
        updatedAt: now,
        status: sign ? 'signed' : formData.status === 'signed' || formData.status === 'co-signed' ? formData.status : 'draft',
      };

      // Create a new ID if this is a new note
      if (!noteToSave.id) {
        noteToSave.id = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }

      // Add signing information if signing
      if (sign) {
        noteToSave.signedBy = currentUser.name;
        noteToSave.signedAt = now;
        noteToSave.locked = true;
        
        // Add signature in signature service
        NoteSignatureService.signNote(
          noteToSave.id!,
          currentUser.id,
          currentUser.name,
          currentUser.role
        );
      }

      // If it's a new note, add creation timestamp and initialize history
      if (!isEditMode) {
        noteToSave.createdAt = noteToSave.createdAt || now;
        noteToSave.author = currentUser.name;
        
        // Initialize history
        NoteHistoryService.initializeHistory(
          noteToSave.id!,
          noteToSave.content,
          currentUser.id,
          currentUser.name
        );
      } else {
        // Add a new version to history
        const versionId = NoteHistoryService.addVersion(
          noteToSave.id!,
          noteToSave.content,
          currentUser.id,
          currentUser.name
        );
        
        noteToSave.currentVersionId = versionId;
      }

      await onSave(noteToSave);
      setSaving(false);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ 
        sx: { 
          height: '90vh',
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isEditMode ? 'Edit Note' : 'Create New Note'}
            {clientName && (
              <Typography component="span" variant="subtitle1" sx={{ ml: 1 }}>
                for {clientName}
              </Typography>
            )}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="note tabs">
          <Tab icon={<NoteIcon />} label="Content" />
          {isEditMode && formData.id && (
            <Tab icon={<HistoryIcon />} label="Version History" />
          )}
          {isEditMode && formData.id && (
            <Tab icon={<SignatureIcon />} label="Signature" />
          )}
        </Tabs>
      </Box>

      <DialogContent sx={{ flexGrow: 1, p: 0 }}>
        {/* Content Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {!isEditMode && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Choose a Template (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getAllTemplates().map((template) => (
                      <Button
                        key={template.id}
                        variant={templateId === template.id ? "contained" : "outlined"}
                        size="small"
                        startIcon={getTemplateIcon(template.id)}
                        onClick={() => setTemplateId(template.id)}
                        sx={{ mb: 1 }}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Note Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                margin="normal"
                disabled={isNoteLocked()}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Note Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Note Type"
                  disabled={isNoteLocked()}
                >
                  <MenuItem value="progress">Progress Note</MenuItem>
                  <MenuItem value="intake">Intake Assessment</MenuItem>
                  <MenuItem value="medication">Medication Management</MenuItem>
                  <MenuItem value="treatment">Treatment Plan</MenuItem>
                  <MenuItem value="contact">Phone/Email Contact</MenuItem>
                  <MenuItem value="discharge">Discharge Summary</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              {isNoteLocked() && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This note has been signed and is locked for editing. You must unlock it to make changes.
                </Alert>
              )}
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Note Content
              </Typography>
              <RichTextEditor
                onChange={handleContentChange}
                initialContent={formData.content}
                placeholder="Enter your clinical note here..."
              />
              
              {autoSaveEnabled && isEditMode && lastSaved && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                  Last auto-saved: {format(new Date(lastSaved), 'h:mm:ss a')}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Visibility</InputLabel>
                <Select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  label="Visibility"
                  disabled={isNoteLocked()}
                >
                  <MenuItem value="clinical-staff">Clinical Staff Only</MenuItem>
                  <MenuItem value="all-staff">All Staff</MenuItem>
                  <MenuItem value="client-visible">Client Visible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Related Appointment</InputLabel>
                <Select
                  name="appointmentId"
                  value={formData.appointmentId || ''}
                  onChange={handleChange}
                  label="Related Appointment"
                  disabled={isNoteLocked()}
                >
                  <MenuItem value="">None</MenuItem>
                  {appointments.map((appointment) => (
                    <MenuItem key={appointment.id} value={appointment.id}>
                      {format(new Date(appointment.date), 'MM/dd/yyyy h:mm a')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    sx={{ mr: 1 }}
                    disabled={isNoteLocked()}
                  />
                  <IconButton 
                    size="small" 
                    onClick={handleTagAdd}
                    disabled={!customTag || isNoteLocked()}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={isNoteLocked() ? undefined : () => handleTagDelete(tag)}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Status:
                  </Typography>
                  {formData.status === 'signed' || formData.status === 'co-signed' ? (
                    <Chip 
                      icon={<SignedIcon />} 
                      label={formData.status === 'co-signed' ? 'Co-Signed' : 'Signed'} 
                      size="small" 
                      color="success" 
                    />
                  ) : formData.status === 'reopened' ? (
                    <Chip 
                      icon={<LockOpenIcon />} 
                      label="Reopened" 
                      size="small" 
                      color="warning" 
                    />
                  ) : (
                    <Chip 
                      icon={<LockOpenIcon />} 
                      label="Draft" 
                      size="small" 
                      color="default" 
                    />
                  )}
                </Box>
                {formData.status === 'signed' && formData.signedBy && (
                  <Typography variant="body2">
                    Signed by {formData.signedBy} on {formData.signedAt ? 
                      format(new Date(formData.signedAt), 'MM/dd/yyyy h:mm a') : ''}
                  </Typography>
                )}
              </Box>
              
              {/* Auto-save toggle */}
              {isEditMode && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      disabled={isNoteLocked()}
                    />
                  }
                  label="Enable auto-save"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Version History Tab */}
        {isEditMode && formData.id && (
          <TabPanel value={tabValue} index={1}>
            <NoteVersionHistory
              noteId={formData.id}
              onRevert={handleRevertToVersion}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
            />
          </TabPanel>
        )}
        
        {/* Signature Tab */}
        {isEditMode && formData.id && (
          <TabPanel value={tabValue} index={2}>
            <NoteSignaturePanel
              noteId={formData.id}
              status={formData.status}
              onStatusChange={handleStatusChange}
              currentUser={currentUser}
              availableSupervisors={availableSupervisors}
            />
          </TabPanel>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {!isEditMode && formData.status !== 'signed' && (
          <FormControlLabel
            control={
              <Checkbox
                checked={sign}
                onChange={(e) => setSign(e.target.checked)}
              />
            }
            label="Sign note upon saving"
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!formData.title || !formData.content || saving || isNoteLocked()}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </Button>
      </DialogActions>
      
      {/* Auto-save notification */}
      <Snackbar
        open={showAutoSaveMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="Note auto-saved"
        autoHideDuration={3000}
      />
    </Dialog>
  );
};

export default NoteForm; 