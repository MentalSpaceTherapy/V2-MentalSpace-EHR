import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import NoteSignatureService, { Signature, SignedNote, SignatureRequest } from '../../services/NoteSignatureService';

interface NoteSignaturePanelProps {
  noteId: string;
  status: string;
  onStatusChange: (newStatus: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  availableSupervisors?: {
    id: string;
    name: string;
    role: string;
  }[];
}

export const NoteSignaturePanel: React.FC<NoteSignaturePanelProps> = ({
  noteId,
  status,
  onStatusChange,
  currentUser,
  availableSupervisors = []
}) => {
  const [signatureInfo, setSignatureInfo] = useState<SignedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [requestCoSignDialogOpen, setRequestCoSignDialogOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  
  // Load signature info
  useEffect(() => {
    if (noteId) {
      const info = NoteSignatureService.getNoteSignatures(noteId);
      if (info) {
        setSignatureInfo(info);
      } else {
        NoteSignatureService.initializeNote(noteId);
        setSignatureInfo(NoteSignatureService.getNoteSignatures(noteId));
      }
      setLoading(false);
    }
  }, [noteId]);
  
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Sign the note
  const handleSign = () => {
    if (!noteId) return;
    
    try {
      const signature = NoteSignatureService.signNote(
        noteId,
        currentUser.id,
        currentUser.name,
        currentUser.role
      );
      
      setSignatureInfo(NoteSignatureService.getNoteSignatures(noteId));
      onStatusChange('signed');
      setSignDialogOpen(false);
    } catch (error) {
      console.error('Error signing note:', error);
    }
  };
  
  // Co-sign the note
  const handleCoSign = () => {
    if (!noteId) return;
    
    try {
      const signature = NoteSignatureService.coSignNote(
        noteId,
        currentUser.id,
        currentUser.name,
        currentUser.role
      );
      
      setSignatureInfo(NoteSignatureService.getNoteSignatures(noteId));
      onStatusChange('co-signed');
    } catch (error) {
      console.error('Error co-signing note:', error);
    }
  };
  
  // Unlock a note for editing
  const handleUnlock = () => {
    if (!noteId || !unlockReason.trim()) return;
    
    try {
      const result = NoteSignatureService.unlockNote(
        noteId,
        currentUser.id,
        currentUser.name,
        unlockReason
      );
      
      if (result) {
        setSignatureInfo(NoteSignatureService.getNoteSignatures(noteId));
        onStatusChange('reopened');
      }
      
      setUnlockDialogOpen(false);
      setUnlockReason('');
    } catch (error) {
      console.error('Error unlocking note:', error);
    }
  };
  
  // Request a co-signature
  const handleRequestCoSign = () => {
    if (!noteId || !selectedSupervisor) return;
    
    const supervisor = availableSupervisors.find(s => s.id === selectedSupervisor);
    if (!supervisor) return;
    
    try {
      const request = NoteSignatureService.requestCoSignature(
        noteId,
        currentUser.id,
        currentUser.name,
        supervisor.id,
        supervisor.name,
        requestMessage
      );
      
      setSignatureInfo(NoteSignatureService.getNoteSignatures(noteId));
      setRequestCoSignDialogOpen(false);
      setSelectedSupervisor('');
      setRequestMessage('');
    } catch (error) {
      console.error('Error requesting co-signature:', error);
    }
  };
  
  // Helper to check if the current user has already co-signed
  const hasCurrentUserCoSigned = () => {
    if (!signatureInfo || !signatureInfo.coSignatures) return false;
    
    return signatureInfo.coSignatures.some(
      signature => signature.userId === currentUser.id && signature.isValid
    );
  };
  
  // Helper to check if the current user has a pending co-sign request
  const hasRequestedCoSignature = () => {
    if (!signatureInfo || !signatureInfo.pendingSignatureRequests) return false;
    
    return signatureInfo.pendingSignatureRequests.some(
      request => 
        request.requestedByUserId === currentUser.id && 
        request.status === 'pending'
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Signature Status
        </Typography>
        
        <Chip 
          icon={status === 'draft' ? <LockOpenIcon /> : <LockIcon />}
          color={status === 'draft' ? 'default' : 'primary'}
          label={status === 'draft' ? 'Draft' : status === 'signed' ? 'Signed' : status === 'co-signed' ? 'Co-Signed' : status === 'reopened' ? 'Reopened' : 'Locked'}
          variant={status === 'draft' ? 'outlined' : 'filled'}
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Primary Signature */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Primary Signature
        </Typography>
        
        {signatureInfo?.primarySignature ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body2">
                {signatureInfo.primarySignature.userName} ({signatureInfo.primarySignature.userRole})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Signed on {formatDate(signatureInfo.primarySignature.timestamp)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 1 }}>
            This note has not been signed yet.
          </Alert>
        )}
      </Box>
      
      {/* Co-Signatures */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Co-Signatures
        </Typography>
        
        {signatureInfo?.coSignatures && signatureInfo.coSignatures.length > 0 ? (
          <List dense disablePadding>
            {signatureInfo.coSignatures
              .filter(signature => signature.isValid)
              .map(signature => (
                <ListItem key={signature.signatureId} disablePadding sx={{ py: 0.5 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'secondary.main' }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={signature.userName}
                    secondary={`${signature.userRole} • ${formatDate(signature.timestamp)}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No co-signatures yet.
          </Typography>
        )}
        
        {/* Pending Co-Signature Requests */}
        {signatureInfo?.pendingSignatureRequests && signatureInfo.pendingSignatureRequests.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pending Requests:
            </Typography>
            
            {signatureInfo.pendingSignatureRequests
              .filter(request => request.status === 'pending')
              .map(request => (
                <Chip 
                  key={request.requestId}
                  label={`Awaiting ${request.requestedToUserName}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
          </Box>
        )}
      </Box>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
        {/* Sign Button - Only show if note is draft */}
        {status === 'draft' && (
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<CheckIcon />}
            onClick={() => setSignDialogOpen(true)}
          >
            Sign Note
          </Button>
        )}
        
        {/* Co-Sign Button - Only show if note is signed and current user is not the signer */}
        {status === 'signed' && 
         signatureInfo?.primarySignature && 
         signatureInfo.primarySignature.userId !== currentUser.id &&
         !hasCurrentUserCoSigned() && (
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<CheckIcon />}
            onClick={handleCoSign}
          >
            Co-Sign Note
          </Button>
        )}
        
        {/* Request Co-Signature Button - Only show if note is signed */}
        {(status === 'signed' || status === 'co-signed') && 
         !hasRequestedCoSignature() &&
         availableSupervisors.length > 0 && (
          <Button 
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setRequestCoSignDialogOpen(true)}
          >
            Request Co-Signature
          </Button>
        )}
        
        {/* Unlock Button - Only show if note is signed or co-signed */}
        {(status === 'signed' || status === 'co-signed') && (
          <Button 
            variant="outlined"
            color="warning"
            startIcon={<LockOpenIcon />}
            onClick={() => setUnlockDialogOpen(true)}
          >
            Unlock For Editing
          </Button>
        )}
      </Box>
      
      {/* Sign Dialog */}
      <Dialog open={signDialogOpen} onClose={() => setSignDialogOpen(false)}>
        <DialogTitle>Sign Note</DialogTitle>
        <DialogContent>
          <Box sx={{ px: 1, py: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Important</AlertTitle>
              Signing this note will lock it for further editing. The note will become part of the permanent clinical record.
            </Alert>
            
            <Typography variant="body2" gutterBottom>
              By signing this note, you confirm that:
            </Typography>
            
            <ul>
              <li>
                <Typography variant="body2">
                  The information in this note is accurate and complete.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  You have reviewed the content and approve it for the clinical record.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  You understand this action cannot be undone without creating an audit trail.
                </Typography>
              </li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSign} 
            variant="contained" 
            color="primary"
            startIcon={<CheckIcon />}
          >
            Sign Note
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Unlock Dialog */}
      <Dialog open={unlockDialogOpen} onClose={() => setUnlockDialogOpen(false)}>
        <DialogTitle>Unlock Note for Editing</DialogTitle>
        <DialogContent>
          <Box sx={{ px: 1, py: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                This action will be permanently recorded in the audit trail.
              </Typography>
            </Alert>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please provide a reason for unlocking this note:
            </Typography>
            
            <TextField
              label="Reason for unlocking"
              multiline
              rows={3}
              variant="outlined"
              fullWidth
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              required
              placeholder="Example: Correction needed to medication dosage"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlockDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUnlock} 
            variant="contained" 
            color="warning"
            startIcon={<LockOpenIcon />}
            disabled={!unlockReason.trim()}
          >
            Unlock Note
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Request Co-Signature Dialog */}
      <Dialog 
        open={requestCoSignDialogOpen} 
        onClose={() => setRequestCoSignDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Request Co-Signature</DialogTitle>
        <DialogContent>
          <Box sx={{ px: 1, py: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Supervisor</InputLabel>
              <Select
                value={selectedSupervisor}
                label="Select Supervisor"
                onChange={(e) => setSelectedSupervisor(e.target.value)}
              >
                {availableSupervisors.map(supervisor => (
                  <MenuItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} ({supervisor.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Message (Optional)"
              multiline
              rows={3}
              variant="outlined"
              fullWidth
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Add a note to the supervisor about this co-signature request"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestCoSignDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequestCoSign} 
            variant="contained" 
            disabled={!selectedSupervisor}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NoteSignaturePanel; 