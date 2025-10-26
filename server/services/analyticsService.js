const { SideEffect, Drug, Prescription, DrugInteraction, AnalyticsAlert } = require('../models/firebaseModels');
const LLMService = require('./llmService');

class AnalyticsService {
  static async detectSideEffectSpikes(drugId, timeWindow = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

      // Get side effects for the drug in the time window
      const sideEffectModel = new SideEffect();
      const allSideEffects = await sideEffectModel.findAll();
      const recentSideEffects = allSideEffects.filter(se => {
        if (se.drugId !== drugId || se.isAnonymous !== true || !se.createdAt) return false;
        
        // Handle Firestore timestamp objects
        let createdAt;
        if (typeof se.createdAt === 'object' && se.createdAt.toDate) {
          createdAt = se.createdAt.toDate();
        } else if (typeof se.createdAt === 'object' && se.createdAt._seconds) {
          createdAt = new Date(se.createdAt._seconds * 1000);
        } else if (typeof se.createdAt === 'string') {
          createdAt = new Date(se.createdAt);
        } else {
          createdAt = new Date(se.createdAt);
        }
        
        return !isNaN(createdAt.getTime()) && createdAt >= cutoffDate;
      });

      // Get historical baseline (previous period)
      const baselineStart = new Date(cutoffDate);
      baselineStart.setDate(baselineStart.getDate() - timeWindow);
      
      const baselineSideEffects = allSideEffects.filter(se => {
        if (se.drugId !== drugId || se.isAnonymous !== true || !se.createdAt) return false;
        
        // Handle Firestore timestamp objects
        let createdAt;
        if (typeof se.createdAt === 'object' && se.createdAt.toDate) {
          createdAt = se.createdAt.toDate();
        } else if (typeof se.createdAt === 'object' && se.createdAt._seconds) {
          createdAt = new Date(se.createdAt._seconds * 1000);
        } else if (typeof se.createdAt === 'string') {
          createdAt = new Date(se.createdAt);
        } else {
          createdAt = new Date(se.createdAt);
        }
        
        return !isNaN(createdAt.getTime()) && createdAt >= baselineStart && createdAt < cutoffDate;
      });

      // Calculate rates
      const recentRate = recentSideEffects.length / timeWindow;
      const baselineRate = baselineSideEffects.length / timeWindow;
      
      // Check for significant increase
      const threshold = parseFloat(process.env.SIDE_EFFECT_SPIKE_THRESHOLD) || 0.15;
      const increaseRatio = (recentRate - baselineRate) / baselineRate;

      if (increaseRatio > threshold && recentRate > 0.1) {
        // Create alert
        const analyticsAlertModel = new AnalyticsAlert();
        const alert = await analyticsAlertModel.create({
          alertType: 'side_effect_spike',
          title: `Side Effect Spike Detected for ${recentSideEffects[0]?.drug?.name || 'Unknown Drug'}`,
          description: `A ${(increaseRatio * 100).toFixed(1)}% increase in side effects has been detected for this drug over the past ${timeWindow} days.`,
          severity: increaseRatio > 0.5 ? 'high' : 'medium',
          drugIds: [drugId],
          affectedPatientCount: recentSideEffects.length,
          confidenceScore: Math.min(increaseRatio, 1.0),
          dataPoints: {
            recentRate,
            baselineRate,
            increaseRatio,
            timeWindow
          },
          recommendations: [
            'Review prescribing guidelines',
            'Consider additional monitoring',
            'Investigate potential causes'
          ]
        });

        return alert;
      }

      return null;
    } catch (error) {
      console.error('Side effect spike detection error:', error);
      return null;
    }
  }

  static async detectDrugInteractions() {
    try {
      // Get all active prescriptions with multiple drugs
      const prescriptionModel = new Prescription();
      const prescriptions = await prescriptionModel.findAll({ isActive: true });

      // Group by patient
      const patientDrugs = {};
      const drugModel = new Drug();
      
      for (const prescription of prescriptions) {
        if (!patientDrugs[prescription.patientId]) {
          patientDrugs[prescription.patientId] = [];
        }
        // Get drug details
        const drug = await drugModel.findById(prescription.drugId);
        if (drug) {
          patientDrugs[prescription.patientId].push(drug);
        }
      }

      const interactions = [];

      // Check for patients on multiple drugs
      for (const [patientId, drugs] of Object.entries(patientDrugs)) {
        if (drugs.length > 1) {
          // Get side effects for this patient
          const patientPrescriptions = prescriptions.filter(p => p.patientId === patientId);
          const prescriptionIds = patientPrescriptions.map(p => p.id);
          
          const sideEffectModel = new SideEffect();
          const allPatientSideEffects = await sideEffectModel.findAll();
          const patientSideEffects = allPatientSideEffects.filter(se => 
            prescriptionIds.includes(se.prescriptionId)
          );

          if (patientSideEffects.length > 0) {
            // Use LLM to analyze potential interactions
            const drugNames = drugs.map(d => d.name);
            const sideEffectDescriptions = patientSideEffects.map(se => ({
              description: se.description,
              severity: se.severity
            }));

            const analysis = await LLMService.detectDrugInteractions(drugNames, sideEffectDescriptions);

            if (analysis.hasInteractions && analysis.confidence > 0.7) {
              // Check if this interaction is already known
              const drugInteractionModel = new DrugInteraction();
              const allInteractions = await drugInteractionModel.findAll();
              const existingInteraction = allInteractions.find(interaction => 
                (interaction.drugId1 === drugs[0].id && interaction.drugId2 === drugs[1].id) ||
                (interaction.drugId1 === drugs[1].id && interaction.drugId2 === drugs[0].id)
              );

              if (!existingInteraction) {
                // Create new interaction record
                await DrugInteraction.create({
                  drugId1: drugs[0].id,
                  drugId2: drugs[1].id,
                  severity: analysis.severity,
                  description: analysis.description,
                  clinicalEffect: analysis.description,
                  management: analysis.recommendations.join('; '),
                  evidenceLevel: 'fair',
                  isDetectedByAnalytics: true,
                  confidenceScore: analysis.confidence
                });

                // Create alert
                const alert = await AnalyticsAlert.create({
                  alertType: 'drug_interaction',
                  title: `Potential Drug Interaction Detected: ${drugNames.join(' + ')}`,
                  description: analysis.description,
                  severity: analysis.severity === 'major' || analysis.severity === 'severe' ? 'high' : 'medium',
                  drugIds: [drugs[0].id, drugs[1].id],
                  affectedPatientCount: 1,
                  confidenceScore: analysis.confidence,
                  dataPoints: {
                    analysis,
                    patientId,
                    sideEffects: sideEffectDescriptions
                  },
                  recommendations: analysis.recommendations
                });

                interactions.push(alert);
              }
            }
          }
        }
      }

      return interactions;
    } catch (error) {
      console.error('Drug interaction detection error:', error);
      return [];
    }
  }

  static async generateAnalyticsReport(timeWindow = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

      // Get aggregated data
      const sideEffectModel = new SideEffect();
      const allSideEffects = await sideEffectModel.findAll({ isAnonymous: true });
      const sideEffects = allSideEffects.filter(se => {
        if (!se.createdAt) return false;
        
        // Handle Firestore timestamp objects
        let createdAt;
        if (typeof se.createdAt === 'object' && se.createdAt.toDate) {
          createdAt = se.createdAt.toDate();
        } else if (typeof se.createdAt === 'object' && se.createdAt._seconds) {
          createdAt = new Date(se.createdAt._seconds * 1000);
        } else if (typeof se.createdAt === 'string') {
          createdAt = new Date(se.createdAt);
        } else {
          createdAt = new Date(se.createdAt);
        }
        
        return !isNaN(createdAt.getTime()) && createdAt >= cutoffDate;
      });

      // Group by drug
      const drugStats = {};
      const drugModel = new Drug();
      
      for (const se of sideEffects) {
        const drug = await drugModel.findById(se.drugId);
        const drugName = drug ? drug.name : 'Unknown Drug';
        
        if (!drugStats[drugName]) {
          drugStats[drugName] = {
            total: 0,
            severe: 0,
            moderate: 0,
            mild: 0,
            concerning: 0
          };
        }
        drugStats[drugName].total++;
        if (se.severity) drugStats[drugName][se.severity]++;
        if (se.isConcerning) drugStats[drugName].concerning++;
      }

      // Use LLM to generate insights
      let insights = { patterns: [], alerts: [], summary: 'No significant patterns detected' };
      
      try {
        insights = await LLMService.generateAnalyticsInsights({
          drugStats,
          timeWindow,
          totalSideEffects: sideEffects.length
        });
      } catch (error) {
        console.log('Analytics insights error, using fallback:', error.message);
      }

      return {
        timeWindow: timeWindow || 30,
        totalSideEffects: sideEffects.length || 0,
        drugStats: drugStats || {},
        insights: insights.patterns || [],
        alerts: insights.alerts || [],
        summary: insights.summary || 'No significant patterns detected',
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Analytics report generation error:', error);
      return {
        error: 'Failed to generate analytics report',
        generatedAt: new Date()
      };
    }
  }

  static async runPeriodicAnalysis() {
    try {
      console.log('Running periodic analytics analysis...');
      
      // Get all active drugs
      const drugModel = new Drug();
      const drugs = await drugModel.findAll({ isActive: true });

      const alerts = [];

      // Check for side effect spikes
      for (const drug of drugs) {
        const spikeAlert = await this.detectSideEffectSpikes(drug.id);
        if (spikeAlert) {
          alerts.push(spikeAlert);
        }
      }

      // Check for drug interactions
      const interactionAlerts = await this.detectDrugInteractions();
      alerts.push(...interactionAlerts);

      // Generate overall analytics report
      const report = await this.generateAnalyticsReport();

      console.log(`Analytics analysis complete. Generated ${alerts.length} alerts.`);

      return {
        alerts,
        report,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Periodic analysis error:', error);
      return { error: error.message };
    }
  }
}

module.exports = AnalyticsService;
