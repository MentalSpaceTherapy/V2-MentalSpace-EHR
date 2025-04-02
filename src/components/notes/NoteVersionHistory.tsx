import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Grid,
} from '@mui/material';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  CompareArrows as CompareIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import NoteHistoryService, { NoteVersion, NoteHistory } from '../../services/NoteHistoryService';
import RichTextEditor from '../editor/RichTextEditor';

interface NoteVersionHistoryProps {
  noteId: string;
  onRevert: (versionId: string) => void;
  currentUserId: string;
  currentUserName: string;
}

export const NoteVersionHistory: React.FC<NoteVersionHistoryProps> = ({
  noteId,
  onRevert,
  currentUserId,
  currentUserName,
}) => {
  const [history, setHistory] = useState<NoteHistory | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<NoteVersion | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [diffResult, setDiffResult] = useState<{ added: string[], removed: string[] }>({ 
    added: [], 
    removed: [] 
  });

  // Load history on mount
  useEffect(() => {
    if (noteId) {
      const noteHistory = NoteHistoryService.getHistory(noteId);
      setHistory(noteHistory);
      
      if (noteHistory && noteHistory.versions.length > 0) {
        const currentVersion = NoteHistoryService.getCurrentVersion(noteId);
        setSelectedVersion(currentVersion);
      }
    }
  }, [noteId]);

  const handleVersionSelect = (version: NoteVersion) => {
    setSelectedVersion(version);
  };

  const handleCompare = (version: NoteVersion) => {
    if (!selectedVersion || selectedVersion.versionId === version.versionId) {
      return;
    }
    
    setCompareVersion(version);
    
    // Get the diff
    const diff = NoteHistoryService.compareVersions(
      noteId,
      selectedVersion.versionId,
      version.versionId
    );
    
    setDiffResult(diff);
    setCompareDialogOpen(true);
  };

  const handleRevertPrompt = (version: NoteVersion) => {
    setSelectedVersion(version);
    setRevertDialogOpen(true);
  };

  const handleRevert = () => {
    if (selectedVersion) {
      onRevert(selectedVersion.versionId);
      setRevertDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!history || history.versions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Version History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No previous versions of this note have been saved yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Version History</Typography>
          <Typography variant="body2" color="text.secondary">
            {history.versions.length} versions
          </Typography>
        </Box>
        
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {history.versions.map((version, index) => (
            <React.Fragment key={version.versionId}>
              <ListItemButton 
                selected={selectedVersion?.versionId === version.versionId}
                onClick={() => handleVersionSelect(version)}
              >
                <ListItemIcon>
                  {version.isPristine ? (
                    <Tooltip title="Original version">
                      <InfoIcon color="primary" />
                    </Tooltip>
                  ) : (
                    <HistoryIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {index === 0 ? 'Current Version' : `Version ${history.versions.length - index}`}
                      </Typography>
                      {history.currentVersionId === version.versionId && (
                        <Chip 
                          label="Current" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {version.userName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(version.timestamp)}
                        </Typography>
                      </Box>
                      {version.reason && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Reason: {version.reason}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Compare with selected version">
                    <IconButton 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompare(version);
                      }}
                      disabled={!selectedVersion || selectedVersion.versionId === version.versionId}
                      size="small"
                    >
                      <CompareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Revert to this version">
                    <IconButton 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevertPrompt(version);
                      }}
                      disabled={history.currentVersionId === version.versionId}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItemButton>
              {index < history.versions.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      {selectedVersion && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {history.versions.indexOf(selectedVersion) === 0 
              ? 'Current Version' 
              : `Version from ${formatDate(selectedVersion.timestamp)}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            By {selectedVersion.userName}
          </Typography>
          <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <RichTextEditor
              initialContent={selectedVersion.content}
              onChange={() => {}}
              placeholder=""
            />
          </Box>
        </Paper>
      )}
      
      {/* Compare Dialog */}
      <Dialog 
        open={compareDialogOpen} 
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Compare Versions</Typography>
            <IconButton onClick={() => setCompareDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVersion && compareVersion && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatDate(selectedVersion.timestamp)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {selectedVersion.userName}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mt: 2 }}>
                    <RichTextEditor
                      initialContent={selectedVersion.content}
                      onChange={() => {}}
                      placeholder=""
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatDate(compareVersion.timestamp)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {compareVersion.userName}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mt: 2 }}>
                    <RichTextEditor
                      initialContent={compareVersion.content}
                      onChange={() => {}}
                      placeholder=""
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Differences
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {diffResult.added.length === 0 && diffResult.removed.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No differences found between these versions.
                      </Typography>
                    ) : (
                      <>
                        {diffResult.added.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="success.main" gutterBottom>
                              Added:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'success.light', color: 'success.contrastText' }}>
                              {diffResult.added.map((line, i) => (
                                <Typography key={i} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  + {line}
                                </Typography>
                              ))}
                            </Paper>
                          </Box>
                        )}
                        
                        {diffResult.removed.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="error.main" gutterBottom>
                              Removed:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                              {diffResult.removed.map((line, i) => (
                                <Typography key={i} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  - {line}
                                </Typography>
                              ))}
                            </Paper>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Revert Confirmation Dialog */}
      <Dialog
        open={revertDialogOpen}
        onClose={() => setRevertDialogOpen(false)}
      >
        <DialogTitle>Confirm Revert</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to revert to the version from {selectedVersion ? formatDate(selectedVersion.timestamp) : ''}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will create a new version based on this previous content. The current version will remain in the history.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevertDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRevert} color="primary" variant="contained">
            Revert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoteVersionHistory; 