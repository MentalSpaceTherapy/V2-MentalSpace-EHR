import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Comment as NoteIcon,
  Add as AddIcon,
  Event as DateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  FileCopy as CopyIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Psychology as TherapyIcon,
  Medication as MedicationIcon,
  Phone as PhoneIcon,
  Today as AppointmentIcon,
  Verified as VerifiedIcon,
  MoreVert as MoreIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import QuickNote from '../../notes/QuickNote';
import NoteForm, { NoteFormData } from '../../notes/NoteForm';
import { MOCK_NOTES } from '../../../mockData/notesData';

interface ClientNotesTabProps {
  clientId: string;
  clientData?: any;
}

interface NotesState {
  notes: any[];
  loading: boolean;
  error: string | null;
}

export const ClientNotesTab: React.FC<ClientNotesTabProps> = ({ 
  clientId, 
  clientData = {} 
}) => {
  const [notesState, setNotesState] = useState<NotesState>({
    notes: [],
    loading: true,
    error: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [selectedNoteForAction, setSelectedNoteForAction] = useState<string | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load notes
  useEffect(() => {
    setNotesState({
      loading: true,
      notes: [],
      error: null,
    });

    // Simulate API call to fetch notes
    setTimeout(() => {
      try {
        const clientNotes = MOCK_NOTES.filter(note => note.clientId === clientId);
        setNotesState({
          notes: clientNotes,
          loading: false,
          error: null,
        });
      } catch (error) {
        setNotesState({
          notes: [],
          loading: false,
          error: 'Failed to load notes. Please try again.',
        });
      }
    }, 1000);
  }, [clientId]);

  // Handle note saving (create/update)
  const handleSaveNote = useCallback((noteData: NoteFormData) => {
    const isNewNote = !noteData.id;
    
    // Create a new note or update existing
    if (isNewNote) {
      // Generate a unique ID
      const newNote = {
        ...noteData,
        id: uuidv4(),
      };
      
      // Update state with the new note
      setNotesState(prev => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
    } else {
      // Update existing note
      setNotesState(prev => ({
        ...prev,
        notes: prev.notes.map(note => 
          note.id === noteData.id ? { ...note, ...noteData } : note
        ),
      }));
    }
    
    // Close the form
    setFormOpen(false);
    setIsEditMode(false);
    setSelectedNote(null);
  }, []);

  // Handle note deletion
  const handleDeleteNote = useCallback(() => {
    if (selectedNoteForAction) {
      setNotesState(prev => ({
        ...prev,
        notes: prev.notes.filter(note => note.id !== selectedNoteForAction),
      }));
      setConfirmDeleteOpen(false);
      setSelectedNoteForAction(null);
      setActionMenuAnchorEl(null);
    }
  }, [selectedNoteForAction]);

  // Handle opening the action menu
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, noteId: string) => {
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedNoteForAction(noteId);
    event.stopPropagation();
  };

  // Handle closing the action menu
  const handleMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  // Handle action selection from menu
  const handleAction = (action: string) => {
    handleMenuClose();
    
    if (!selectedNoteForAction) return;
    
    const note = notesState.notes.find(n => n.id === selectedNoteForAction);
    if (!note) return;
    
    switch (action) {
      case 'edit':
        setSelectedNote(note);
        setIsEditMode(true);
        setFormOpen(true);
        break;
      case 'delete':
        setConfirmDeleteOpen(true);
        break;
      case 'print':
        // Implement print functionality
        window.print();
        break;
      case 'copy':
        // Create a copy of the note
        const noteCopy = {
          ...note,
          id: uuidv4(),
          title: `Copy of ${note.title}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
          signedBy: undefined,
          signedAt: undefined,
        };
        setNotesState(prev => ({
          ...prev,
          notes: [noteCopy, ...prev.notes],
        }));
        break;
      default:
        break;
    }
  };

  // Handle filter change
  const handleFilterChange = (event: React.SyntheticEvent, newValue: string) => {
    setFilter(newValue);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  // Get filtered notes
  const filteredNotes = notesState.notes
    .filter(note => {
      // Filter by type
      const typeMatch = filter === 'all' || note.type === filter;
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.author?.toLowerCase().includes(searchTerm.toLowerCase());
        
      return typeMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get icon based on note type
  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <TherapyIcon color="primary" />;
      case 'medication':
        return <MedicationIcon color="secondary" />;
      case 'contact':
        return <PhoneIcon color="action" />;
      case 'intake':
        return <PersonIcon color="error" />;
      case 'treatment':
        return <VerifiedIcon color="success" />;
      case 'discharge':
        return <AppointmentIcon color="warning" />;
      default:
        return <NoteIcon />;
    }
  };

  return (
    <Box>
      {/* Header and Add Note Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <NoteIcon sx={{ mr: 1 }} color="primary" />
          Clinical Notes
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormOpen(true);
            setIsEditMode(false);
            setSelectedNote(null);
          }}
        >
          Add Note
        </Button>
      </Box>
      
      {/* Quick Note Component */}
      <QuickNote 
        clientId={clientId} 
        clientName={`${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || undefined}
        onSave={handleSaveNote}
      />
      
      {/* Search and Filter Bar */}
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <TextField
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <Tabs 
          value={filter} 
          onChange={handleFilterChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="all" label="All" />
          <Tab value="progress" label="Progress" />
          <Tab value="medication" label="Medication" />
          <Tab value="contact" label="Contact" />
          <Tab value="treatment" label="Treatment" />
          <Tab value="intake" label="Intake" />
        </Tabs>
      </Paper>
      
      {/* Notes List */}
      {notesState.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : notesState.error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {notesState.error}
        </Alert>
      ) : filteredNotes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" gutterBottom>
            No notes found
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              setFormOpen(true);
              setIsEditMode(false);
              setSelectedNote(null);
            }}
          >
            Add Note
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredNotes.map((note) => (
            <Grid item xs={12} md={6} xl={4} key={note.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 1
                  }
                }}
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditMode(true);
                  setFormOpen(true);
                }}
              >
                <CardHeader
                  avatar={getNoteIcon(note.type)}
                  title={note.title}
                  subheader={`${formatDate(note.createdAt)} by ${note.author}`}
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {note.status === 'signed' ? (
                        <Tooltip title="Signed Note">
                          <LockIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Draft">
                          <UnlockIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        </Tooltip>
                      )}
                      <IconButton 
                        size="small"
                        onClick={(e) => handleMenuClick(e, note.id)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
                <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                  {/* Strip HTML and truncate content */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: note.content.replace(/<[^>]*>?/gm, ' ').substring(0, 150) + (note.content.length > 150 ? '...' : '') 
                    }}
                  />
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', py: 1 }}>
                  <Box>
                    {note.tags && note.tags.length > 0 && note.tags.slice(0, 2).map((tag: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                    {note.tags && note.tags.length > 2 && (
                      <Chip 
                        label={`+${note.tags.length - 2}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    )}
                  </Box>
                  <Tooltip title="Edit Note">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNote(note);
                        setIsEditMode(true);
                        setFormOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Note Form Dialog */}
      <NoteForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedNote(null);
          setIsEditMode(false);
        }}
        onSave={handleSaveNote}
        initialData={selectedNote}
        clientId={clientId}
        clientName={`${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || undefined}
        isEditMode={isEditMode}
        appointments={clientData.appointmentHistory || []}
      />
      
      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Note</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('copy')}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Copy</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('print')}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Note</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Note</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteNote} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 