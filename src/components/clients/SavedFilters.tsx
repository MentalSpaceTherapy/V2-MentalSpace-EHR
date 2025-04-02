import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkOutlineIcon,
  FilterAlt as FilterIcon,
  Save as SaveIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  isDefault?: boolean;
  createdAt: string;
}

interface SavedFiltersProps {
  savedFilters: SavedFilter[];
  currentFilters: Record<string, any>;
  onFilterSelect: (filter: SavedFilter) => void;
  onFilterSave: (filter: SavedFilter) => void;
  onFilterUpdate: (filter: SavedFilter) => void;
  onFilterDelete: (id: string) => void;
  onSetDefaultFilter: (id: string) => void;
}

const SavedFilters: React.FC<SavedFiltersProps> = ({
  savedFilters,
  currentFilters,
  onFilterSelect,
  onFilterSave,
  onFilterUpdate,
  onFilterDelete,
  onSetDefaultFilter,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
  const [filterSelectorAnchorEl, setFilterSelectorAnchorEl] = useState<null | HTMLElement>(null);

  // Check if current filter matches any saved filter
  const currentMatchesAny = () => {
    return savedFilters.some(
      (filter) => JSON.stringify(filter.filters) === JSON.stringify(currentFilters)
    );
  };

  // Reset form when dialog opens
  const openSaveDialog = (existingFilter?: SavedFilter) => {
    if (existingFilter) {
      setEditingFilter(existingFilter);
      setFilterName(existingFilter.name);
      setFilterDescription(existingFilter.description || '');
    } else {
      setEditingFilter(null);
      setFilterName('');
      setFilterDescription('');
    }
    setSaveDialogOpen(true);
  };

  // Close dialog and reset form
  const closeDialog = () => {
    setSaveDialogOpen(false);
    setEditingFilter(null);
    setFilterName('');
    setFilterDescription('');
  };

  // Save filter
  const handleSaveFilter = () => {
    if (editingFilter) {
      onFilterUpdate({
        ...editingFilter,
        name: filterName,
        description: filterDescription,
        filters: currentFilters,
      });
    } else {
      onFilterSave({
        id: uuidv4(),
        name: filterName,
        description: filterDescription,
        filters: currentFilters,
        createdAt: new Date().toISOString(),
      });
    }
    closeDialog();
  };

  // Open filter actions menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>, filter: SavedFilter) => {
    setFilterMenuAnchorEl(event.currentTarget);
    setSelectedFilterId(filter.id);
  };

  // Close filter actions menu
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
    setSelectedFilterId(null);
  };

  // Open filter selector dropdown
  const handleFilterSelectorOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterSelectorAnchorEl(event.currentTarget);
  };

  // Close filter selector dropdown
  const handleFilterSelectorClose = () => {
    setFilterSelectorAnchorEl(null);
  };

  // Select filter from dropdown
  const handleFilterSelect = (filter: SavedFilter) => {
    onFilterSelect(filter);
    handleFilterSelectorClose();
  };

  // Edit filter
  const handleEditFilter = () => {
    const filter = savedFilters.find((f) => f.id === selectedFilterId);
    if (filter) {
      openSaveDialog(filter);
    }
    handleFilterMenuClose();
  };

  // Delete filter
  const handleDeleteFilter = () => {
    if (selectedFilterId) {
      onFilterDelete(selectedFilterId);
    }
    handleFilterMenuClose();
  };

  // Set as default filter
  const handleSetDefaultFilter = () => {
    if (selectedFilterId) {
      onSetDefaultFilter(selectedFilterId);
    }
    handleFilterMenuClose();
  };

  // Get active filter name
  const getActiveFilterName = (): string => {
    const activeFilter = savedFilters.find(
      (filter) => JSON.stringify(filter.filters) === JSON.stringify(currentFilters)
    );
    return activeFilter ? activeFilter.name : 'Custom Filter';
  };

  // Get filter tag display
  const getFilterSummary = (filter: SavedFilter): React.ReactNode => {
    const filterObj = filter.filters;
    const filterParts: string[] = [];

    if (filterObj.statuses && filterObj.statuses.length > 0) {
      filterParts.push(`Statuses: ${filterObj.statuses.length}`);
    }
    if (filterObj.tags && filterObj.tags.length > 0) {
      filterParts.push(`Tags: ${filterObj.tags.length}`);
    }
    if (filterObj.diagnosisCodes && filterObj.diagnosisCodes.length > 0) {
      filterParts.push(`Diagnoses: ${filterObj.diagnosisCodes.length}`);
    }
    if (filterObj.therapistIds && filterObj.therapistIds.length > 0) {
      filterParts.push(`Therapists: ${filterObj.therapistIds.length}`);
    }
    if (filterObj.searchTerm) {
      filterParts.push(`Search: "${filterObj.searchTerm}"`);
    }

    return filterParts.length > 0 ? (
      <Typography variant="body2" color="text.secondary" noWrap>
        {filterParts.join(' • ')}
      </Typography>
    ) : (
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        No filters applied
      </Typography>
    );
  };

  return (
    <>
      {/* Saved Filter Selector */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleFilterSelectorOpen}
          endIcon={<ArrowDownIcon />}
          startIcon={<BookmarkIcon />}
          size="small"
          sx={{ 
            textAlign: 'left', 
            justifyContent: 'space-between', 
            width: '100%',
            '& .MuiButton-startIcon': { margin: 0 }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap>
              {getActiveFilterName()}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {Object.keys(currentFilters).length > 0 
                ? `${Object.keys(currentFilters).length} active filters`
                : 'No filters applied'}
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={filterSelectorAnchorEl}
          open={Boolean(filterSelectorAnchorEl)}
          onClose={handleFilterSelectorClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ width: '100%', maxWidth: 320 }}
          PaperProps={{ sx: { width: 320 } }}
        >
          <MenuItem
            onClick={() => {
              // Clear filters by applying empty filter
              onFilterSelect({ 
                id: 'empty', 
                name: 'No Filters', 
                filters: {}, 
                createdAt: '' 
              });
              handleFilterSelectorClose();
            }}
          >
            <ListItemIcon>
              <FilterIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Clear All Filters" />
          </MenuItem>
          
          {!currentMatchesAny() && Object.keys(currentFilters).length > 0 && (
            <MenuItem onClick={() => openSaveDialog()}>
              <ListItemIcon>
                <SaveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Save Current Filter" />
            </MenuItem>
          )}
          
          {savedFilters.length > 0 && <Divider />}
          
          {savedFilters.map((filter) => (
            <MenuItem
              key={filter.id}
              onClick={() => handleFilterSelect(filter)}
              selected={JSON.stringify(filter.filters) === JSON.stringify(currentFilters)}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                py: 1
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                width: '100%', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {filter.isDefault && (
                    <BookmarkIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="body1">{filter.name}</Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilterMenuOpen(e, filter);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ pl: 2, width: '100%' }}>
                {getFilterSummary(filter)}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Filter Actions Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem onClick={handleEditFilter}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Filter" />
        </MenuItem>
        <MenuItem onClick={handleSetDefaultFilter}>
          <ListItemIcon>
            <BookmarkOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Set as Default" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteFilter}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Filter" sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>

      {/* Save Filter Dialog */}
      <Dialog open={saveDialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
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
            variant="outlined"
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
            variant="outlined"
          />
          
          {/* Preview of filter criteria */}
          {Object.keys(currentFilters).length > 0 && (
            <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filter Criteria
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(currentFilters).map(([key, value]) => {
                  // Skip empty arrays or objects
                  if (Array.isArray(value) && value.length === 0) return null;
                  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return null;
                  
                  let label = '';
                  if (key === 'searchTerm') label = `Search: "${value}"`;
                  else if (key === 'statuses') label = `Status: ${value.length}`;
                  else if (key === 'tags') label = `Tags: ${value.length}`;
                  else if (key === 'diagnosisCodes') label = `Diagnoses: ${value.length}`;
                  else if (key === 'therapistIds') label = `Therapists: ${value.length}`;
                  else label = key;
                  
                  return label ? (
                    <Chip key={key} label={label} size="small" />
                  ) : null;
                })}
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={handleSaveFilter}
            variant="contained"
            disabled={!filterName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavedFilters; 