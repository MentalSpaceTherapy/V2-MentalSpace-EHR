import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Tooltip,
  Divider,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  MoreVert as MoreIcon,
  BookmarkBorder as BookmarkOutlineIcon,
} from '@mui/icons-material';

// Interface for saved filter
export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

interface SavedFilterManagerProps {
  currentFilters: Record<string, any>;
  onFilterSelect: (filter: SavedFilter) => void;
  onSaveNewFilter?: (name: string, description: string, filters: Record<string, any>) => void;
  onUpdateFilter?: (id: string, name: string, description: string, filters: Record<string, any>) => void;
  onDeleteFilter?: (id: string) => void;
  onSetDefaultFilter?: (id: string) => void;
  savedFilters: SavedFilter[];
}

const SavedFilterManager: React.FC<SavedFilterManagerProps> = ({
  currentFilters,
  onFilterSelect,
  onSaveNewFilter,
  onUpdateFilter,
  onDeleteFilter,
  onSetDefaultFilter,
  savedFilters,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!dialogOpen) {
      setFilterName('');
      setFilterDescription('');
      setEditingFilter(null);
    } else if (editingFilter) {
      setFilterName(editingFilter.name);
      setFilterDescription(editingFilter.description || '');
    }
  }, [dialogOpen, editingFilter]);

  const handleSaveFilter = () => {
    if (editingFilter && onUpdateFilter) {
      onUpdateFilter(editingFilter.id, filterName, filterDescription, currentFilters);
    } else if (onSaveNewFilter) {
      onSaveNewFilter(filterName, filterDescription, currentFilters);
    }
    setDialogOpen(false);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, filterId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedFilterId(filterId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedFilterId(null);
  };

  const handleEditFilter = () => {
    const filter = savedFilters.find(f => f.id === selectedFilterId);
    if (filter) {
      setEditingFilter(filter);
      setDialogOpen(true);
    }
    handleCloseMenu();
  };

  const handleDeleteFilter = () => {
    if (selectedFilterId && onDeleteFilter) {
      onDeleteFilter(selectedFilterId);
    }
    handleCloseMenu();
  };

  const handleSetDefaultFilter = () => {
    if (selectedFilterId && onSetDefaultFilter) {
      onSetDefaultFilter(selectedFilterId);
    }
    handleCloseMenu();
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" component="h3">
            Saved Filters
          </Typography>
          <Tooltip title="Save Current Filter">
            <Button
              size="small"
              startIcon={<BookmarkIcon />}
              onClick={() => setDialogOpen(true)}
              disabled={Object.keys(currentFilters).length === 0}
            >
              Save Current
            </Button>
          </Tooltip>
        </Box>

        {savedFilters.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            No saved filters yet
          </Typography>
        ) : (
          <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
            <List dense disablePadding>
              {savedFilters.map((filter) => (
                <React.Fragment key={filter.id}>
                  <ListItem 
                    button 
                    onClick={() => onFilterSelect(filter)}
                    selected={JSON.stringify(currentFilters) === JSON.stringify(filter.filters)}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {filter.isDefault && (
                            <BookmarkIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                          )}
                          <Typography variant="body2">{filter.name}</Typography>
                        </Box>
                      }
                      secondary={filter.description}
                      primaryTypographyProps={{ fontWeight: filter.isDefault ? 'medium' : 'regular' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => handleOpenMenu(e, filter.id)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Save/Edit Filter Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingFilter ? 'Edit Saved Filter' : 'Save Current Filter'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Filter Name"
            fullWidth
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveFilter} 
            variant="contained"
            disabled={!filterName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEditFilter}>
          <ListItemText primary="Edit" />
          <EditIcon fontSize="small" sx={{ ml: 1 }} />
        </MenuItem>
        <MenuItem onClick={handleSetDefaultFilter}>
          <ListItemText primary="Set as Default" />
          <BookmarkOutlineIcon fontSize="small" sx={{ ml: 1 }} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteFilter} sx={{ color: 'error.main' }}>
          <ListItemText primary="Delete" />
          <DeleteIcon fontSize="small" sx={{ ml: 1 }} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default SavedFilterManager; 