import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

const SideEffects = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSideEffect, setSelectedSideEffect] = useState(null);
  const [formData, setFormData] = useState({
    prescriptionId: '',
    description: '',
    severity: 'mild',
    onsetDate: '',
    duration: '',
    isOngoing: true,
    impactOnDailyLife: 'minimal',
  });

  const { data: sideEffectsData, isLoading } = useQuery(
    'side-effects',
    () => axios.get('/api/side-effects').then(res => res.data)
  );

  const { data: prescriptionsData } = useQuery(
    'user-prescriptions',
    () => axios.get('/api/prescriptions?status=active').then(res => res.data),
    { enabled: user?.role === 'patient' }
  );

  const createSideEffectMutation = useMutation(
    (data) => axios.post('/api/side-effects', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('side-effects');
        setOpenDialog(false);
        resetForm();
        enqueueSnackbar('Side effect reported successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to report side effect', { variant: 'error' });
      },
    }
  );

  const updateSideEffectMutation = useMutation(
    ({ id, data }) => axios.put(`/api/side-effects/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('side-effects');
        setOpenDialog(false);
        setSelectedSideEffect(null);
        resetForm();
        enqueueSnackbar('Side effect updated successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to update side effect', { variant: 'error' });
      },
    }
  );

  const resetForm = () => {
    setFormData({
      prescriptionId: '',
      description: '',
      severity: 'mild',
      onsetDate: '',
      duration: '',
      isOngoing: true,
      impactOnDailyLife: 'minimal',
    });
  };

  const handleOpenDialog = (sideEffect = null) => {
    if (sideEffect) {
      setSelectedSideEffect(sideEffect);
      setFormData({
        prescriptionId: sideEffect.prescriptionId,
        description: sideEffect.description,
        severity: sideEffect.severity,
        onsetDate: sideEffect.onsetDate,
        duration: sideEffect.duration || '',
        isOngoing: sideEffect.isOngoing,
        impactOnDailyLife: sideEffect.impactOnDailyLife,
      });
    } else {
      resetForm();
      setSelectedSideEffect(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSideEffect(null);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSideEffect) {
      updateSideEffectMutation.mutate({
        id: selectedSideEffect.id,
        data: formData,
      });
    } else {
      createSideEffectMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sideEffects = sideEffectsData?.sideEffects || [];
  const prescriptions = prescriptionsData?.prescriptions || [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return 'success';
      case 'moderate': return 'warning';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'none': return 'success';
      case 'minimal': return 'info';
      case 'moderate': return 'warning';
      case 'significant': return 'error';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Side Effects</Typography>
        {user?.role === 'patient' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Report Side Effect
          </Button>
        )}
      </Box>

      {sideEffects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WarningIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No side effects reported
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'patient' 
              ? 'Report any side effects you experience from your medications' 
              : 'Patient side effect reports will appear here'
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sideEffects.map((sideEffect) => (
            <Grid item xs={12} key={sideEffect.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {sideEffect.drug.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sideEffect.drug.genericName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={sideEffect.severity}
                        color={getSeverityColor(sideEffect.severity)}
                        size="small"
                      />
                      {sideEffect.isConcerning && (
                        <Chip
                          label="Concerning"
                          color="error"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {sideEffect.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Onset Date:</strong> {new Date(sideEffect.onsetDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Impact:</strong> 
                        <Chip
                          label={sideEffect.impactOnDailyLife}
                          color={getImpactColor(sideEffect.impactOnDailyLife)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>
                    {sideEffect.duration && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Duration:</strong> {sideEffect.duration} days
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Status:</strong> {sideEffect.isOngoing ? 'Ongoing' : 'Resolved'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {user?.role === 'doctor' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Patient:</strong> {sideEffect.prescription.patient.firstName} {sideEffect.prescription.patient.lastName}
                      </Typography>
                    </Box>
                  )}

                  {sideEffect.llmAnalysis && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">AI Analysis</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Concern Level:</strong> {sideEffect.llmAnalysis.concernLevel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Urgency:</strong> {sideEffect.llmAnalysis.urgency}
                          </Typography>
                          {sideEffect.llmAnalysis.recommendations && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>Recommendations:</strong>
                              </Typography>
                              <List dense>
                                {sideEffect.llmAnalysis.recommendations.map((rec, index) => (
                                  <ListItem key={index}>
                                    <ListItemText primary={rec} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {sideEffect.doctorResponse && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Doctor Response:
                      </Typography>
                      <Typography variant="body2">
                        {sideEffect.doctorResponse}
                      </Typography>
                    </Alert>
                  )}

                  {user?.role === 'patient' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(sideEffect)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Side Effect Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSideEffect ? 'Edit Side Effect' : 'Report Side Effect'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Prescription</InputLabel>
                  <Select
                    value={formData.prescriptionId}
                    onChange={(e) => setFormData({ ...formData, prescriptionId: e.target.value })}
                    label="Prescription"
                  >
                    {prescriptions.map((prescription) => (
                      <MenuItem key={prescription.id} value={prescription.id}>
                        {prescription.drug.name} - {prescription.dosage}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the side effect in detail..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    label="Severity"
                  >
                    <MenuItem value="mild">Mild</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="severe">Severe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Impact on Daily Life</InputLabel>
                  <Select
                    value={formData.impactOnDailyLife}
                    onChange={(e) => setFormData({ ...formData, impactOnDailyLife: e.target.value })}
                    label="Impact on Daily Life"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="minimal">Minimal</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="significant">Significant</MenuItem>
                    <MenuItem value="severe">Severe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Onset Date"
                  type="date"
                  value={formData.onsetDate}
                  onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (days)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createSideEffectMutation.isLoading || updateSideEffectMutation.isLoading}
            >
              {selectedSideEffect ? 'Update' : 'Report'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SideEffects;
