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
  CardActions,
  InputBase,
  IconButton,
  Chip,
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
  ListItemIcon,
  ListItemText,
  Menu,
  Stack
} from '@mui/material';
import {
  Description as DocumentIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  CloudDownload as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  FileCopy as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Assignment as FormIcon,
  MoreVert as MoreIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface DocumentsTabProps {
  documents: any[];
  clientId: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Document categories for filtering
  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'intake', label: 'Intake Forms' },
    { value: 'legal', label: 'Legal Documents' },
    { value: 'medical', label: 'Medical Records' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'treatment', label: 'Treatment Plans' },
  ];
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MM/dd/yyyy');
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <PdfIcon color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon color="primary" />;
      case 'intake':
      case 'assessment':
      case 'consent':
      case 'hipaa':
        return <FormIcon color="info" />;
      default:
        return <FileIcon />;
    }
  };
  
  // Filter documents based on search term and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMoreClose = () => {
    setAnchorEl(null);
  };
  
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterMenuAnchorEl(null);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    handleFilterClose();
  };
  
  const UploadDocumentDialog = () => (
    <Dialog
      open={uploadDialogOpen}
      onClose={() => setUploadDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Upload Document
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                mb: 2,
                bgcolor: 'rgba(0, 0, 0, 0.01)'
              }}
            >
              <UploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop files here or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: PDF, JPG, PNG, DOCX, XLSX (Max 10MB)
              </Typography>
              <Button 
                variant="outlined" 
                component="label" 
                sx={{ mt: 2 }}
              >
                Browse Files
                <input
                  type="file"
                  hidden
                />
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Document Name"
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Document Type</InputLabel>
              <Select
                label="Document Type"
                defaultValue="intake"
              >
                <MenuItem value="intake">Intake Form</MenuItem>
                <MenuItem value="consent">Consent Form</MenuItem>
                <MenuItem value="hipaa">HIPAA Form</MenuItem>
                <MenuItem value="insurance">Insurance Document</MenuItem>
                <MenuItem value="assessment">Assessment</MenuItem>
                <MenuItem value="treatment">Treatment Plan</MenuItem>
                <MenuItem value="medical">Medical Record</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                defaultValue="intake"
              >
                {categories.filter(c => c.value !== 'all').map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <TextField
                placeholder="Add tags separated by commas..."
                size="small"
                fullWidth
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setUploadDialogOpen(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setUploadDialogOpen(false)}
          startIcon={<UploadIcon />}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <DocumentIcon sx={{ mr: 1 }} color="primary" />
          Documents
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Document
        </Button>
      </Box>
      
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
        <Paper
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            flex: 1,
            minWidth: '200px'
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton sx={{ p: '10px' }}>
            <SearchIcon />
          </IconButton>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
          >
            {selectedCategory === 'all' ? 'All Documents' : 
              categories.find(cat => cat.value === selectedCategory)?.label || 'Filter'}
          </Button>
          <Menu
            anchorEl={filterMenuAnchorEl}
            open={Boolean(filterMenuAnchorEl)}
            onClose={handleFilterClose}
          >
            {categories.map((category) => (
              <MenuItem 
                key={category.value} 
                selected={selectedCategory === category.value}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </MenuItem>
            ))}
          </Menu>
          
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<SortIcon />}
          >
            Sort
          </Button>
        </Box>
      </Paper>
      
      {filteredDocuments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py:.4 }}>
          <Typography color="text.secondary" gutterBottom>
            No documents found
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />}
            size="small"
            sx={{ mt: 1 }}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Document
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredDocuments.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card variant="outlined">
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ mr: 1, mt: 0.5 }}>
                      {getFileIcon(document.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" noWrap>
                        {document.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Uploaded: {formatDate(document.uploadDate)} by {document.uploadedBy}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleMoreClick}>
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  {document.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {document.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(document.size)}
                    </Typography>
                    {document.status === 'signed' && (
                      <Chip 
                        icon={<VerifiedIcon />} 
                        label="Signed" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                    {document.status === 'verified' && (
                      <Chip 
                        icon={<VerifiedIcon />} 
                        label="Verified" 
                        size="small" 
                        color="info" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  {document.tags && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {document.tags.map((tag: string, index: number) => (
                        <Chip 
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ typography: 'caption' }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <Divider />
                <CardActions>
                  <Tooltip title="View">
                    <IconButton size="small">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton size="small">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton size="small">
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMoreClose}
      >
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      <UploadDocumentDialog />
    </Box>
  );
}; 