import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Grid,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider
} from '@mui/material';

const MedicalHistoryForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Medical History
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Primary Care Provider"
            {...register('primaryCareProvider')}
            error={!!errors.primaryCareProvider}
            helperText={errors.primaryCareProvider?.message?.toString()}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Primary Care Provider Phone"
            {...register('primaryCareProviderPhone')}
            error={!!errors.primaryCareProviderPhone}
            helperText={errors.primaryCareProviderPhone?.message?.toString()}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Medical Conditions
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Allergies"
            placeholder="List any allergies, separated by commas"
            {...register('allergies')}
            error={!!errors.allergies}
            helperText={errors.allergies?.message?.toString()}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Current Medications"
            placeholder="List current medications, dosage, and frequency"
            {...register('medications')}
            error={!!errors.medications}
            helperText={errors.medications?.message?.toString()}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Existing Medical Conditions"
            placeholder="List any chronic conditions or ongoing health issues"
            {...register('existingConditions')}
            error={!!errors.existingConditions}
            helperText={errors.existingConditions?.message?.toString()}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Treatment History
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Previous Mental Health Treatments"
            placeholder="Include previous therapists, hospitalizations, or programs"
            {...register('previousTreatments')}
            error={!!errors.previousTreatments}
            helperText={errors.previousTreatments?.message?.toString()}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Factors
            </Typography>
            <FormGroup>
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Checkbox {...register('riskFactors.suicidalIdeation')} />}
                    label="Suicidal Ideation"
                  />
                  <FormControlLabel
                    control={<Checkbox {...register('riskFactors.homicidalIdeation')} />}
                    label="Homicidal Ideation"
                  />
                  <FormControlLabel
                    control={<Checkbox {...register('riskFactors.substanceAbuse')} />}
                    label="Substance Abuse"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Checkbox {...register('riskFactors.selfHarm')} />}
                    label="Self-Harm"
                  />
                  <FormControlLabel
                    control={<Checkbox {...register('riskFactors.recentHospitalization')} />}
                    label="Recent Hospitalization"
                  />
                  <FormControlLabel
                    control={<Checkbox {...register('riskFactors.highRiskBehavior')} />}
                    label="High-Risk Behavior"
                  />
                </Grid>
              </Grid>
            </FormGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Additional Notes"
            placeholder="Any other relevant medical information"
            {...register('medicalNotes')}
            error={!!errors.medicalNotes}
            helperText={errors.medicalNotes?.message?.toString()}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MedicalHistoryForm; 