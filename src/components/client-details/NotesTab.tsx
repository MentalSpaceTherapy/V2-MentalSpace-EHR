import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  InputBase,
  Tab,
  Tabs,
  Menu
} from '@mui/material';
import {
  Comment as NoteIcon,
  Add as AddIcon,
  Event as DateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
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
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface NotesTabProps {
  notes: any[];
  clientId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ notes, clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showNoteDrawer, setShowNoteDrawer] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MM/dd/yyyy');
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'h:mm a');
  };
  
  // Sort and filter notes
  const filteredNotes = notes
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
  
  const handleFilterChange = (event: React.SyntheticEvent, newValue: string) => {
    setFilter(newValue);
  };
  
  const handleOpenNote = (note: any) => {
    setSelectedNote(note);
    setShowNoteDrawer(true);
  };
  
  const handleCloseNote = () => {
    setShowNoteDrawer(false);
  };
  
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <TherapyIcon />;
      case 'medication':
        return <MedicationIcon />;
      case 'contact':
        return <PhoneIcon />;
      case 'appointment':
        return <AppointmentIcon />;
      default:
        return <NoteIcon />;
    }
  };
  
  const getNoteTypeChip = (type: string) => {
    let color;
    let icon;
    let label;
    
    switch (type) {
      case 'progress':
        color = 'primary';
        icon = <TherapyIcon />;
        label = 'Progress Note';
        break;
      case 'medication':
        color = 'secondary';
        icon = <MedicationIcon />;
        label = 'Medication Note';
        break;
      case 'contact':
        color = 'info';
        icon = <PhoneIcon />;
        label = 'Contact Note';
        break;
      case 'appointment':
        color = 'success';
        icon = <AppointmentIcon />;
        label = 'Appointment Note';
        break;
      default:
        color = 'default';
        icon = <NoteIcon />;
        label = 'Other Note';
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
  
  const AddNoteDialog = () => (
    <Dialog
      open={showAddNoteDialog}
      onClose={() => setShowAddNoteDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Add New Note
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Title"
              placeholder="Enter note title..."
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Note Type</InputLabel>
              <Select
                label="Note Type"
                defaultValue="progress"
              >
                <MenuItem value="progress">Progress Note</MenuItem>
                <MenuItem value="medication">Medication Note</MenuItem>
                <MenuItem value="contact">Contact Note</MenuItem>
                <MenuItem value="appointment">Appointment Note</MenuItem>
                <MenuItem value="other">Other Note</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Associated Appointment</InputLabel>
              <Select
                label="Associated Appointment"
                defaultValue=""
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="appt1">May 10, 2023 - Therapy Session</MenuItem>
                <MenuItem value="appt2">Apr 26, 2023 - Therapy Session</MenuItem>
                <MenuItem value="appt3">Apr 12, 2023 - Medication Review</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Note Content"
              placeholder="Enter your clinical note here..."
              fullWidth
              multiline
              rows={12}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Visibility</InputLabel>
              <Select
                label="Visibility"
                defaultValue="clinical-staff"
              >
                <MenuItem value="clinical-staff">Clinical Staff Only</MenuItem>
                <MenuItem value="all-staff">All Staff</MenuItem>
                <MenuItem value="client-visible">Client Visible</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                input={<OutlinedInput label="Tags" />}
                defaultValue={[]}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="anxiety">Anxiety</MenuItem>
                <MenuItem value="depression">Depression</MenuItem>
                <MenuItem value="medication">Medication</MenuItem>
                <MenuItem value="CBT">CBT</MenuItem>
                <MenuItem value="coping-skills">Coping Skills</MenuItem>
                <MenuItem value="assessment">Assessment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="outlined"
          onClick={() => setShowAddNoteDialog(false)}
        >
          Cancel
        </Button>
        <Button 
          variant="outlined"
          startIcon={<SaveIcon />}
        >
          Save Draft
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<LockIcon />}
          onClick={() => setShowAddNoteDialog(false)}
        >
          Sign & Save
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  const NoteDrawer = () => (
    <Drawer
      anchor="right"
      open={showNoteDrawer}
      onClose={handleCloseNote}
      sx={{
        width: 500,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 500,
        },
      }}
    >
      {selectedNote && (
        <>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6">Clinical Note</Typography>
            <IconButton onClick={handleCloseNote}>
              <DeleteIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">{selectedNote.title}</Typography>
              {getNoteTypeChip(selectedNote.type)}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DateIcon color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(selectedNote.createdAt)} at {formatTime(selectedNote.createdAt)}
              </Typography>
              {selectedNote.status === 'signed' && (
                <Chip 
                  icon={<VerifiedIcon />} 
                  label="Signed" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Author: {selectedNote.author}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
              {selectedNote.content}
            </Typography>
            
            {selectedNote.tags && selectedNote.tags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedNote.tags.map((tag: string, index: number) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {selectedNote.status === 'signed' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Signature Information
                </Typography>
                <Typography variant="body2">
                  Signed by: {selectedNote.signedBy}
                </Typography>
                <Typography variant="body2">
                  Signed on: {formatDate(selectedNote.signedAt)} at {formatTime(selectedNote.signedAt)}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                size="small"
              >
                Print
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<ShareIcon />}
                size="small"
              >
                Share
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                size="small"
                disabled={selectedNote.status === 'signed'}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Drawer>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <NoteIcon sx={{ mr: 1 }} color="primary" />
          Clinical Notes
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddNoteDialog(true)}
        >
          Add Note
        </Button>
      </Box>
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}
      >
        <Paper
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            width: 400
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton sx={{ p: '10px' }}>
            <SearchIcon />
          </IconButton>
        </Paper>
        
        <Tabs 
          value={filter} 
          onChange={handleFilterChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="all" label="All" />
          <Tab value="progress" label="Progress" />
          <Tab value="medication" label="Medication" />
          <Tab value="contact" label="Contact" />
        </Tabs>
        
        <IconButton onClick={handleMenuClick}>
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Print All Notes</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <FilterIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Advanced Filters</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Notes</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
      
      {filteredNotes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" gutterBottom>
            No notes found
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setShowAddNoteDialog(true)}
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
                onClick={() => handleOpenNote(note)}
              >
                <CardHeader
                  avatar={getNoteIcon(note.type)}
                  title={note.title}
                  subheader={`${formatDate(note.createdAt)} by ${note.author}`}
                  action={
                    note.status === 'signed' ? (
                      <Tooltip title="Signed Note">
                        <LockIcon fontSize="small" color="success" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Draft">
                        <UnlockIcon fontSize="small" color="action" />
                      </Tooltip>
                    )
                  }
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                  >
                    {note.content}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  {note.tags && note.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mr: 1 }}>
                      {note.tags.slice(0, 2).map((tag: string, index: number) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                          sx={{ typography: 'caption' }}
                        />
                      ))}
                      {note.tags.length > 2 && (
                        <Chip 
                          label={`+${note.tags.length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ typography: 'caption' }}
                        />
                      )}
                    </Box>
                  )}
                  <Box sx={{ flex: 1 }} />
                  {getNoteTypeChip(note.type)}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <AddNoteDialog />
      <NoteDrawer />
    </Box>
  );
}; 