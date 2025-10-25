import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Medication as MedicationIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

const Analytics = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionDialog, setResolutionDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'analytics-dashboard',
    () => axios.get('/api/analytics/dashboard').then(res => res.data)
  );

  const { data: alertsData, isLoading: alertsLoading } = useQuery(
    'analytics-alerts',
    () => axios.get('/api/analytics/alerts').then(res => res.data)
  );

  const { data: trendsData, isLoading: trendsLoading } = useQuery(
    'analytics-trends',
    () => axios.get('/api/analytics/trends').then(res => res.data)
  );

  const { data: interactionsData, isLoading: interactionsLoading } = useQuery(
    'drug-interactions',
    () => axios.get('/api/analytics/interactions').then(res => res.data)
  );

  const runAnalysisMutation = useMutation(
    () => axios.post('/api/analytics/analyze'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('analytics-dashboard');
        queryClient.invalidateQueries('analytics-alerts');
        enqueueSnackbar('Analytics analysis completed', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to run analysis', { variant: 'error' });
      },
    }
  );

  const resolveAlertMutation = useMutation(
    ({ id, notes }) => axios.put(`/api/analytics/alerts/${id}/resolve`, { resolutionNotes: notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('analytics-alerts');
        setResolutionDialog(false);
        setSelectedAlert(null);
        setResolutionNotes('');
        enqueueSnackbar('Alert resolved successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error || 'Failed to resolve alert', { variant: 'error' });
      },
    }
  );

  const handleResolveAlert = (alert) => {
    setSelectedAlert(alert);
    setResolutionDialog(true);
  };

  const handleSubmitResolution = () => {
    if (selectedAlert) {
      resolveAlertMutation.mutate({
        id: selectedAlert.id,
        notes: resolutionNotes,
      });
    }
  };

  if (analyticsLoading || alertsLoading || trendsLoading || interactionsLoading) {
    return <LoadingSpinner />;
  }

  const analytics = analyticsData || {};
  const alerts = alertsData?.alerts || [];
  const trends = trendsData || {};
  const interactions = interactionsData?.interactions || [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'side_effect_spike': return 'error';
      case 'drug_interaction': return 'warning';
      case 'unexpected_reaction': return 'error';
      case 'dosage_concern': return 'info';
      default: return 'default';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => runAnalysisMutation.mutate()}
          disabled={runAnalysisMutation.isLoading}
        >
          Run Analysis
        </Button>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {analytics.statistics?.totalSideEffects || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Side Effects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {analytics.statistics?.concerningSideEffects || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Concerning Reports
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicationIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {analytics.statistics?.activeAlerts || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Alerts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {analytics.statistics?.drugInteractions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drug Interactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Side Effects by Severity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.severityStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.severityStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Drugs by Side Effects
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topDrugs || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="drug.name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sideEffectCount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Trends */}
      {trends.dailyTrends && trends.dailyTrends.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Side Effect Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Total Side Effects" />
                <Line type="monotone" dataKey="concerningCount" stroke="#ff7300" name="Concerning" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analytics Alerts
          </Typography>
          {alerts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No active alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All systems are operating normally
              </Typography>
            </Paper>
          ) : (
            <List>
              {alerts.map((alert) => (
                <Accordion key={alert.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{alert.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alert.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                        <Chip
                          label={alert.alertType.replace('_', ' ').toUpperCase()}
                          color={getAlertTypeColor(alert.alertType)}
                          size="small"
                        />
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Confidence Score:</strong> {(alert.confidenceScore * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Affected Patients:</strong> {alert.affectedPatientCount}
                      </Typography>
                      {alert.recommendations && alert.recommendations.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Recommendations:</strong>
                          </Typography>
                          <List dense>
                            {alert.recommendations.map((rec, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={rec} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      {!alert.isResolved && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleResolveAlert(alert)}
                          >
                            Resolve Alert
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Drug Interactions */}
      {interactions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detected Drug Interactions
            </Typography>
            <List>
              {interactions.map((interaction) => (
                <ListItem key={interaction.id}>
                  <ListItemText
                    primary={`${interaction.drug1?.name} + ${interaction.drug2?.name}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {interaction.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={interaction.severity}
                            color={getSeverityColor(interaction.severity)}
                            size="small"
                          />
                          <Chip
                            label={`${(interaction.confidenceScore * 100).toFixed(1)}% confidence`}
                            color="info"
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Resolution Dialog */}
      <Dialog open={resolutionDialog} onClose={() => setResolutionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Alert</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Notes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Describe how this alert was resolved..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolutionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitResolution}
            disabled={resolveAlertMutation.isLoading}
          >
            Resolve Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Analytics;
