import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  ListItemButton,
  ListItemText,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Autocomplete,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Sample diagnosis codes and descriptions
const COMMON_DIAGNOSES = [
  { code: 'F32.9', name: 'Major Depressive Disorder, Single Episode, Unspecified' },
  { code: 'F33.0', name: 'Major Depressive Disorder, Recurrent, Mild' },
  { code: 'F33.1', name: 'Major Depressive Disorder, Recurrent, Moderate' },
  { code: 'F33.2', name: 'Major Depressive Disorder, Recurrent, Severe' },
  { code: 'F41.1', name: 'Generalized Anxiety Disorder' },
  { code: 'F41.9', name: 'Anxiety Disorder, Unspecified' },
  { code: 'F43.10', name: 'Post-Traumatic Stress Disorder, Unspecified' },
  { code: 'F31.9', name: 'Bipolar Disorder, Unspecified' },
  { code: 'F60.3', name: 'Borderline Personality Disorder' },
  { code: 'F90.9', name: 'Attention-Deficit/Hyperactivity Disorder, Unspecified Type' },
  { code: 'F42.9', name: 'Obsessive-Compulsive Disorder, Unspecified' },
  { code: 'F50.9', name: 'Eating Disorder, Unspecified' },
  { code: 'F10.20', name: 'Alcohol Use Disorder, Moderate' },
  { code: 'F19.20', name: 'Other Psychoactive Substance Use Disorder, Moderate' },
];

interface DiagnosisFilterSectionProps {
  expanded: boolean;
  onToggle: () => void;
  selectedDiagnoses: string[];
  onDiagnosisChange: (diagnoses: string[]) => void;
}

const DiagnosisFilterSection: React.FC<DiagnosisFilterSectionProps> = ({
  expanded,
  onToggle,
  selectedDiagnoses,
  onDiagnosisChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter diagnoses based on search term
  const filteredDiagnoses = COMMON_DIAGNOSES.filter(
    (diagnosis) =>
      diagnosis.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get diagnosis category (e.g., F30-F39 Mood disorders)
  const getDiagnosisCategory = (code: string): string => {
    const prefix = code.split('.')[0];
    
    // Common categories in mental health
    if (prefix === 'F32' || prefix === 'F33' || prefix === 'F31') return 'Mood Disorders';
    if (prefix === 'F40' || prefix === 'F41') return 'Anxiety Disorders';
    if (prefix === 'F43') return 'Stress-Related Disorders';
    if (prefix === 'F10' || prefix === 'F19') return 'Substance Use Disorders';
    if (prefix === 'F90') return 'Neurodevelopmental Disorders';
    if (prefix === 'F60') return 'Personality Disorders';
    if (prefix === 'F50') return 'Eating Disorders';
    
    return 'Other Disorders';
  };

  // Group diagnoses by category
  const diagnosesByCategory = filteredDiagnoses.reduce<Record<string, typeof COMMON_DIAGNOSES>>(
    (acc, diagnosis) => {
      const category = getDiagnosisCategory(diagnosis.code);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(diagnosis);
      return acc;
    },
    {}
  );

  // Handle category selection
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle diagnosis toggle
  const handleDiagnosisToggle = (code: string) => {
    onDiagnosisChange(
      selectedDiagnoses.includes(code)
        ? selectedDiagnoses.filter((c) => c !== code)
        : [...selectedDiagnoses, code]
    );
  };

  return (
    <Box sx={{ mb: 3 }}>
      <ListItemButton onClick={onToggle} sx={{ px: 0 }}>
        <ListItemText primary={<Typography variant="subtitle2">Diagnoses</Typography>} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ ml: 2, mt: 1 }}>
          {/* Search field */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search diagnoses by code or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* Selected diagnoses chips */}
          {selectedDiagnoses.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {selectedDiagnoses.map((code) => {
                const diagnosis = COMMON_DIAGNOSES.find((d) => d.code === code);
                return (
                  <Chip
                    key={code}
                    label={`${code}: ${diagnosis?.name.substring(0, 20)}...`}
                    size="small"
                    onDelete={() => handleDiagnosisToggle(code)}
                  />
                );
              })}
              {selectedDiagnoses.length > 0 && (
                <Chip
                  label="Clear All"
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => onDiagnosisChange([])}
                />
              )}
            </Box>
          )}
          
          {/* Diagnoses by category */}
          {Object.entries(diagnosesByCategory).map(([category, diagnoses]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    size="small"
                  />
                }
                label={<Typography variant="body2" fontWeight="medium">{category}</Typography>}
              />
              
              <Collapse in={selectedCategories.includes(category)}>
                <FormGroup sx={{ ml: 3 }}>
                  {diagnoses.map((diagnosis) => (
                    <FormControlLabel
                      key={diagnosis.code}
                      control={
                        <Checkbox
                          checked={selectedDiagnoses.includes(diagnosis.code)}
                          onChange={() => handleDiagnosisToggle(diagnosis.code)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {diagnosis.code}: {diagnosis.name}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Collapse>
            </Box>
          ))}
          
          {/* Autocomplete for quick selection */}
          <Autocomplete
            multiple
            options={COMMON_DIAGNOSES}
            getOptionLabel={(option) => `${option.code}: ${option.name}`}
            value={COMMON_DIAGNOSES.filter((d) => selectedDiagnoses.includes(d.code))}
            onChange={(_, newValue) => {
              onDiagnosisChange(newValue.map((d) => d.code));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Quick select diagnoses"
                placeholder="Type to search"
              />
            )}
            renderTags={() => null} // Don't show tags in the input (we're showing chips above)
            sx={{ mt: 2 }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default DiagnosisFilterSection; 