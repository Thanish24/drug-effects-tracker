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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

const Prescriptions = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    drugId: '',
    dosage: '',
    frequency: '',
    instructions: '',
    startDate: '',
    endDate: '',
    refillsRemaining: 0,
    totalRefills: 0,
    notes: '',
  });

  const { data: prescriptionsData, isLoading } = useQuery(
    'prescriptions',
    () => axios.get('/api/prescriptions').then(res => res.data)
  );

  const { data: patientsData } = useQuery(
    'patients',
    () => axios.get('/api/prescriptions/patients/list').then(res => res.data),
    { enabled: user?.role === 'doctor' }
  );

  const { data: drugsData } = useQuery(
    'drugs',
    () => axios.get('/api/drugs').then(res => res.data)
  );

  const createPrescriptionMutation = useMutation(
    (data) => axios.post('/api/prescriptions', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prescriptions');
        setOpenDialog(false);
        resetForm();
        enqueueSnackbar('Prescription created successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to create prescription', { variant: 'error' });
      },
    }
  );

  const updatePrescriptionMutation = useMutation(
    ({ id, data }) => axios.put(`/api/prescriptions/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prescriptions');
        setOpenDialog(false);
        setSelectedPrescription(null);
        resetForm();
        enqueueSnackbar('Prescription updated successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to update prescription', { variant: 'error' });
      },
    }
  );

  const deactivatePrescriptionMutation = useMutation(
    (id) => axios.put(`/api/prescriptions/${id}/deactivate`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prescriptions');
        enqueueSnackbar('Prescription deactivated successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to deactivate prescription', { variant: 'error' });
      },
    }
  );

  const resetForm = () => {
    setFormData({
      patientId: '',
      drugId: '',
      dosage: '',
      frequency: '',
      instructions: '',
      startDate: '',
      endDate: '',
      refillsRemaining: 0,
      totalRefills: 0,
      notes: '',
    });
  };

  const handleOpenDialog = (prescription = null) => {
    if (prescription) {
      setSelectedPrescription(prescription);
      setFormData({
        patientId: prescription.patientId,
        drugId: prescription.drugId,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        instructions: prescription.instructions || '',
        startDate: prescription.startDate,
        endDate: prescription.endDate || '',
        refillsRemaining: prescription.refillsRemaining,
        totalRefills: prescription.totalRefills,
        notes: prescription.notes || '',
      });
    } else {
      resetForm();
      setSelectedPrescription(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPrescription) {
      updatePrescriptionMutation.mutate({
        id: selectedPrescription.id,
        data: formData,
      });
    } else {
      createPrescriptionMutation.mutate(formData);
    }
  };

  const handleDeactivate = (id) => {
    if (window.confirm('Are you sure you want to deactivate this prescription?')) {
      deactivatePrescriptionMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const prescriptions = prescriptionsData?.prescriptions || [];
  const patients = patientsData?.patients || [];
  const drugs = drugsData?.drugs || [];

  const getSeverityColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Prescriptions</Typography>
        {user?.role === 'doctor' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Prescription
          </Button>
        )}
      </Box>

      {prescriptions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MedicationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No prescriptions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'doctor' 
              ? 'Create a new prescription to get started' 
              : 'Your prescriptions will appear here'
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {prescriptions.map((prescription) => (
            <Grid item xs={12} md={6} lg={4} key={prescription.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {prescription.drug.name}
                    </Typography>
                    <Chip
                      label={prescription.isActive ? 'Active' : 'Inactive'}
                      color={getSeverityColor(prescription.isActive)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {prescription.drug.genericName}
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Dosage"
                        secondary={prescription.dosage}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Frequency"
                        secondary={prescription.frequency}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Start Date"
                        secondary={new Date(prescription.startDate).toLocaleDateString()}
                      />
                    </ListItem>
                    {prescription.endDate && (
                      <ListItem>
                        <ListItemText
                          primary="End Date"
                          secondary={new Date(prescription.endDate).toLocaleDateString()}
                        />
                      </ListItem>
                    )}
                    {prescription.instructions && (
                      <ListItem>
                        <ListItemText
                          primary="Instructions"
                          secondary={prescription.instructions}
                        />
                      </ListItem>
                    )}
                    {user?.role === 'doctor' && (
                      <ListItem>
                        <ListItemText
                          primary="Patient"
                          secondary={`${prescription.patient.firstName} ${prescription.patient.lastName}`}
                        />
                      </ListItem>
                    )}
                    {user?.role === 'patient' && (
                      <ListItem>
                        <ListItemText
                          primary="Doctor"
                          secondary={`Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`}
                        />
                      </ListItem>
                    )}
                  </List>

                  {user?.role === 'doctor' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(prescription)}
                      >
                        <EditIcon />
                      </IconButton>
                      {prescription.isActive && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeactivate(prescription.id)}
                          color="error"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Prescription Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPrescription ? 'Edit Prescription' : 'New Prescription'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {user?.role === 'doctor' && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Patient</InputLabel>
                    <Select
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      label="Patient"
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Drug</InputLabel>
                  <Select
                    value={formData.drugId}
                    onChange={(e) => setFormData({ ...formData, drugId: e.target.value })}
                    label="Drug"
                  >
                    {drugs.map((drug) => (
                      <MenuItem key={drug.id} value={drug.id}>
                        {drug.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Refills Remaining"
                  type="number"
                  value={formData.refillsRemaining}
                  onChange={(e) => setFormData({ ...formData, refillsRemaining: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Refills"
                  type="number"
                  value={formData.totalRefills}
                  onChange={(e) => setFormData({ ...formData, totalRefills: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  multiline
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createPrescriptionMutation.isLoading || updatePrescriptionMutation.isLoading}
            >
              {selectedPrescription ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Prescriptions;
