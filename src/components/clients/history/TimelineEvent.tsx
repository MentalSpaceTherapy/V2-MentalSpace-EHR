import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Collapse,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  Note as NoteIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  MedicalServices as MedicalIcon,
  Upload as UploadIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  LocalHospital as DiagnosisIcon,
  Medication as MedicationIcon,
  Group as ConsultationIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { EVENT_TYPE_CONFIG } from '../../../mockData/historyData';

interface TimelineEventProps {
  event: {
    id: string;
    timestamp: string;
    type: string;
    eventType: string;
    title: string;
    description: string;
    details: string;
    user: {
      id: string;
      name: string;
      role: string;
    };
    metadata: Record<string, any>;
  };
  showDetails?: boolean;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({ 
  event,
  showDetails = false
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(showDetails);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <EventIcon />;
      case 'note':
        return <NoteIcon />;
      case 'billing':
        return <ReceiptIcon />;
      case 'document':
        return <UploadIcon />;
      case 'assessment':
        return <AssignmentIcon />;
      case 'diagnosis':
        return <DiagnosisIcon />;
      case 'record':
        return <EditIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'message':
        return <MessageIcon />;
      case 'intake':
        return <PersonAddIcon />;
      case 'treatment':
        return <AssignmentIcon />;
      case 'medication':
        return <MedicationIcon />;
      case 'consultation':
        return <ConsultationIcon />;
      case 'communication':
        return <PhoneIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventColor = (type: string): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' => {
    const config = EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG];
    return (config?.color as any) || 'default';
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getEventTypeChip = () => {
    const config = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG] || { label: 'Event', color: 'default' };
    return (
      <Chip 
        size="small" 
        label={config.label}
        color={getEventColor(event.type)}
        icon={getEventIcon(event.type)}
        sx={{ mr: 1 }}
      />
    );
  };

  const renderMetadataItem = (key: string, value: any) => {
    if (value === null || value === undefined) return null;
    
    // Format based on value type
    let displayValue = value;
    
    if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (typeof value === 'object') {
      // Skip rendering complex objects
      return null;
    }
    
    const formattedKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ');
    
    return (
      <Box key={key} sx={{ mb: 0.5 }}>
        <Typography component="span" variant="body2" color="text.secondary">
          {formattedKey}: 
        </Typography>{' '}
        <Typography component="span" variant="body2">
          {displayValue}
        </Typography>
      </Box>
    );
  };

  const renderMetadata = () => {
    if (!event.metadata || Object.keys(event.metadata).length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
        {Object.entries(event.metadata)
          .filter(([key]) => !key.startsWith('_'))
          .map(([key, value]) => renderMetadataItem(key, value))}
      </Box>
    );
  };

  // Function to safely get color from palette
  const getColorFromPalette = (colorName: string, variant: 'main' | 'light') => {
    const validColors: Record<string, keyof typeof theme.palette> = {
      'primary': 'primary',
      'secondary': 'secondary',
      'error': 'error',
      'info': 'info',
      'success': 'success',
      'warning': 'warning',
      'default': 'grey'
    };
    
    const paletteColor = validColors[colorName] || 'grey';
    // @ts-ignore - accessing palette color variants
    return theme.palette[paletteColor][variant];
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderLeft: `4px solid ${
          theme.palette.getContrastText(theme.palette.background.paper) === '#fff'
            ? getColorFromPalette(getEventColor(event.type), 'main')
            : getColorFromPalette(getEventColor(event.type), 'light')
        }`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {getEventTypeChip()}
          
          <Chip 
            size="small" 
            label={event.eventType.replace(/_/g, ' ')}
            variant="outlined"
          />
          
          <Typography 
            variant="caption" 
            sx={{ display: 'flex', alignItems: 'center', ml: 1 }}
            color="text.secondary"
          >
            <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
            {formatEventDate(event.timestamp)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          <IconButton size="small" onClick={toggleExpanded}>
            <ExpandMoreIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform')
              }} 
            />
          </IconButton>
          
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Typography variant="subtitle1" component="div" sx={{ mt: 1 }}>
        {event.title}
      </Typography>
      
      <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
        {event.description}
      </Typography>
      
      <Collapse in={expanded} timeout="auto">
        {event.details && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
            <Typography variant="body2">
              {event.details}
            </Typography>
          </Box>
        )}
        
        {renderMetadata()}
      </Collapse>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Tooltip title={event.user.role}>
          <Avatar 
            sx={{ 
              width: 24, 
              height: 24, 
              mr: 1, 
              bgcolor: theme.palette.primary.main,
              fontSize: '0.875rem'
            }}
          >
            {event.user.name.charAt(0)}
          </Avatar>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          {event.user.name} ({event.user.role})
        </Typography>
      </Box>
    </Paper>
  );
};

export default TimelineEvent; 