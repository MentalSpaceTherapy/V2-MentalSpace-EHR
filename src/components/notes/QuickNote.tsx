import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Fab,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  NoteAdd as NoteAddIcon,
  Note as NoteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import RichTextEditor from '../editor/RichTextEditor';
import NoteForm, { NoteFormData } from './NoteForm';
import { NOTE_TEMPLATES, getTemplateById } from './NoteTemplates';

interface QuickNoteProps {
  clientId: string;
  clientName?: string;
  onSave: (note: NoteFormData) => void;
  expanded?: boolean;
  minified?: boolean; // For sidebar or widget view
}

// Quick Note presets
const QUICK_NOTE_PRESETS = [
  {
    id: 'quick-progress',
    name: 'Quick Progress Note',
    template: 'Session completed as scheduled. Client arrived on time and actively participated in treatment. Will continue with current treatment plan.',
  },
  {
    id: 'quick-cancellation',
    name: 'Cancellation Note',
    template: 'Client cancelled appointment for today. Reason provided: ',
  },
  {
    id: 'quick-noshow',
    name: 'No-Show Note',
    template: 'Client did not attend scheduled appointment and did not provide advance notice. Attempted to contact client by phone but was unable to reach them. Will follow up.',
  },
  {
    id: 'quick-telephone',
    name: 'Telephone Contact',
    template: 'Brief telephone contact with client. Client reported: ',
  },
];

const QuickNote: React.FC<QuickNoteProps> = ({
  clientId,
  clientName = 'Client',
  onSave,
  expanded = false,
  minified = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showFullForm, setShowFullForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('progress');

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePresetChange = (event: SelectChangeEvent) => {
    const presetId = event.target.value;
    setSelectedPreset(presetId);
    
    if (presetId) {
      const preset = QUICK_NOTE_PRESETS.find(p => p.id === presetId);
      if (preset) {
        setNoteContent(preset.template);
        // Determine note type based on preset
        if (presetId.includes('progress')) {
          setNoteType('progress');
        } else if (presetId.includes('telephone') || presetId.includes('cancellation') || presetId.includes('noshow')) {
          setNoteType('contact');
        }
      }
    } else {
      setNoteContent('');
    }
  };

  const handleContentChange = (content: string) => {
    setNoteContent(content);
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setNoteType(event.target.value);
  };

  const handleSaveQuickNote = () => {
    const now = new Date().toISOString();
    
    // Create note title based on type and date
    let title = 'Quick Note';
    if (noteType === 'progress') {
      title = 'Progress Note';
    } else if (noteType === 'contact') {
      if (selectedPreset.includes('cancellation')) {
        title = 'Cancellation Note';
      } else if (selectedPreset.includes('noshow')) {
        title = 'No-Show Note';
      } else {
        title = 'Phone Contact';
      }
    }
    
    // Create the note
    const note: NoteFormData = {
      clientId,
      title: `${title} - ${new Date().toLocaleDateString()}`,
      content: noteContent,
      type: noteType,
      appointmentId: null,
      status: 'draft',
      tags: [],
      visibility: 'clinical-staff',
      author: 'Current User', // Replace with actual logged-in user
      createdAt: now,
      updatedAt: now,
    };
    
    onSave(note);
    
    // Reset form
    setNoteContent('');
    setSelectedPreset('');
    setIsExpanded(false);
  };

  const renderMinifiedVersion = () => (
    <Box>
      <Tooltip title="Add Quick Note">
        <Fab
          color="primary"
          size="medium"
          onClick={handleExpandToggle}
          sx={{ boxShadow: 2 }}
        >
          <NoteAddIcon />
        </Fab>
      </Tooltip>
      
      <Collapse in={isExpanded}>
        <Card 
          sx={{ 
            mt: 2, 
            width: '300px',
            boxShadow: 3,
            position: 'absolute',
            zIndex: 1000,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Quick Note</Typography>
              <IconButton size="small" onClick={handleExpandToggle}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Note Template</InputLabel>
              <Select
                value={selectedPreset}
                onChange={handlePresetChange}
                label="Note Template"
              >
                <MenuItem value="">
                  <em>Select a template</em>
                </MenuItem>
                {QUICK_NOTE_PRESETS.map((preset) => (
                  <MenuItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Enter your quick note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                size="small" 
                onClick={() => setShowFullForm(true)}
              >
                Full Form
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={!noteContent}
                onClick={handleSaveQuickNote}
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );

  const renderFullVersion = () => (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        mb: 3,
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NoteIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Quick Note</Typography>
        </Box>
        
        <IconButton
          onClick={handleExpandToggle}
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Quick Template</InputLabel>
              <Select
                value={selectedPreset}
                onChange={handlePresetChange}
                label="Quick Template"
              >
                <MenuItem value="">
                  <em>Select a template</em>
                </MenuItem>
                {QUICK_NOTE_PRESETS.map((preset) => (
                  <MenuItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Note Type</InputLabel>
              <Select
                value={noteType}
                onChange={handleTypeChange}
                label="Note Type"
              >
                <MenuItem value="progress">Progress</MenuItem>
                <MenuItem value="contact">Contact</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowFullForm(true)}
            >
              Full Note Form
            </Button>
          </Box>
          
          <RichTextEditor
            onChange={handleContentChange}
            initialContent={noteContent}
            placeholder="Enter a quick clinical note here..."
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              disabled={!noteContent}
              onClick={handleSaveQuickNote}
              startIcon={<SaveIcon />}
            >
              Save Quick Note
            </Button>
          </Box>
        </Box>
      </Collapse>
      
      {!isExpanded && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 1,
            cursor: 'pointer',
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
          onClick={handleExpandToggle}
        >
          <Typography variant="body2" color="text.secondary">
            Click to add a quick note for {clientName}
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <>
      {minified ? renderMinifiedVersion() : renderFullVersion()}
      
      <NoteForm
        open={showFullForm}
        onClose={() => setShowFullForm(false)}
        onSave={onSave}
        clientId={clientId}
        clientName={clientName}
        initialData={{
          clientId,
          content: noteContent,
          type: noteType,
          tags: [],
        }}
      />
    </>
  );
};

export default QuickNote; 