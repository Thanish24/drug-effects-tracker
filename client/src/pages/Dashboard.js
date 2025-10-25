import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  Medication as MedicationIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'analytics-dashboard',
    () => axios.get('/api/analytics/dashboard').then(res => res.data),
    {
      enabled: user?.role === 'doctor',
    }
  );

  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery(
    'prescriptions-dashboard',
    () => axios.get('/api/prescriptions?limit=5').then(res => res.data)
  );

  const { data: sideEffectsData, isLoading: sideEffectsLoading } = useQuery(
    'side-effects-dashboard',
    () => axios.get('/api/side-effects?limit=5').then(res => res.data)
  );

  if (prescriptionsLoading || sideEffectsLoading) {
    return <LoadingSpinner />;
  }

  const prescriptions = prescriptionsData?.prescriptions || [];
  const sideEffects = sideEffectsData?.sideEffects || [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return 'success';
      case 'moderate': return 'warning';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  const getRoleIcon = () => {
    return user?.role === 'doctor' ? <HospitalIcon /> : <PersonIcon />;
  };

  const getRoleColor = () => {
    return user?.role === 'doctor' ? 'primary' : 'secondary';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {user?.role === 'doctor' 
          ? 'Monitor your patients and track drug effects' 
          : 'Track your medications and report any side effects'
        }
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: `${getRoleColor()}.main`, mr: 2 }}>
                  {getRoleIcon()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Chip 
                    label={user?.role === 'doctor' ? 'Doctor' : 'Patient'} 
                    color={getRoleColor()}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              {user?.specialization && (
                <Typography variant="body2" color="text.secondary">
                  {user.specialization}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <MedicationIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {prescriptions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Prescriptions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {sideEffects.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recent Side Effects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Doctor Analytics */}
        {user?.role === 'doctor' && analyticsData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analytics Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {analyticsData.statistics.totalSideEffects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Side Effects
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {analyticsData.statistics.concerningSideEffects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Concerning Reports
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning">
                        {analyticsData.statistics.activeAlerts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Alerts
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info">
                        {analyticsData.statistics.drugInteractions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Drug Interactions
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Prescriptions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Prescriptions
              </Typography>
              {prescriptions.length > 0 ? (
                <List>
                  {prescriptions.map((prescription, index) => (
                    <React.Fragment key={prescription.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <MedicationIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={prescription.drug.name}
                          secondary={`${prescription.dosage} - ${prescription.frequency}`}
                        />
                        <Chip
                          label={prescription.isActive ? 'Active' : 'Inactive'}
                          color={prescription.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </ListItem>
                      {index < prescriptions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No prescriptions found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Side Effects */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Side Effects
              </Typography>
              {sideEffects.length > 0 ? (
                <List>
                  {sideEffects.map((sideEffect, index) => (
                    <React.Fragment key={sideEffect.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <WarningIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={sideEffect.description}
                          secondary={sideEffect.drug.name}
                        />
                        <Chip
                          label={sideEffect.severity}
                          color={getSeverityColor(sideEffect.severity)}
                          size="small"
                        />
                      </ListItem>
                      {index < sideEffects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No side effects reported
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
