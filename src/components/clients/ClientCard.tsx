import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Avatar, 
  Chip, 
  Box, 
  IconButton, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  MoreVert as MoreIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CalendarToday as CalendarIcon,
  Chat as ChatIcon,
  NoteAdd as NoteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ClientStatusBadge from './ClientStatusBadge';

interface ClientCardProps {
  client: any;
  onAction: (action: string, clientId: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onAction }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose();
    onAction(action, client.id);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };
  
  // Random color for avatar based on client id
  const getAvatarColor = (id: string) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffc107', '#ff9800', '#ff5722'
    ];
    const index = parseInt(id, 10) % colors.length;
    return colors[Math.abs(index)];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        translateY: -5
      }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          borderRadius: 2,
          '&:hover': {
            boxShadow: 3
          }
        }}
        onClick={() => onAction('view', client.id)}
      >
        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: getAvatarColor(client.id),
                    width: 56, 
                    height: 56,
                    mr: 2,
                    fontSize: '1.4rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(client.firstName, client.lastName)}
                </Avatar>
              </motion.div>
              
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {client.firstName} {client.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <ClientStatusBadge status={client.status} size="small" />
                </Box>
              </Box>
            </Box>
            
            <IconButton 
              onClick={handleMenuClick}
              size="small"
              aria-label="actions"
              aria-controls="client-menu"
              aria-haspopup="true"
            >
              <MoreIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <span style={{ fontWeight: 500 }}>Therapist:</span> {client.primaryTherapistName || 'Unassigned'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <span style={{ fontWeight: 500 }}>Insurance:</span> {client.insuranceProvider || 'Self-pay'}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              Next Appointment
            </Typography>
            
            <Typography variant="body2" color={client.nextAppointment ? 'text.primary' : 'text.secondary'}>
              {formatDate(client.nextAppointment)}
              {client.nextAppointment && (
                <Typography component="span" variant="body2" fontWeight="bold" sx={{ ml: 1 }}>
                  {formatTime(client.nextAppointment)}
                </Typography>
              )}
            </Typography>
          </Box>
          
          {client.tags && client.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {client.tags.slice(0, 3).map((tag: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Chip 
                    label={tag} 
                    size="small" 
                    sx={{ fontSize: '0.75rem' }}
                  />
                </motion.div>
              ))}
              {client.tags.length > 3 && (
                <Chip 
                  label={`+${client.tags.length - 3} more`} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ pt: 0, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleAction('schedule');
              }}
              title="Schedule appointment"
            >
              <CalendarIcon fontSize="small" />
            </IconButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleAction('message');
              }}
              title="Send message"
            >
              <ChatIcon fontSize="small" />
            </IconButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleAction('add-note');
              }}
              title="Add note"
            >
              <NoteIcon fontSize="small" />
            </IconButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleAction('edit');
              }}
              title="Edit client"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </motion.div>
        </CardActions>
        
        <Menu
          id="client-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 180,
              borderRadius: 2,
              py: 0.5,
            },
          }}
        >
          <MenuItem onClick={() => handleAction('view')}>
            <ListItemIcon>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('edit')}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Client</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('schedule')}>
            <ListItemIcon>
              <CalendarIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Schedule Appointment</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('message')}>
            <ListItemIcon>
              <ChatIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Send Message</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('add-note')}>
            <ListItemIcon>
              <NoteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Note</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Client</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
}; 