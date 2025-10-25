const { SideEffect, Drug, Prescription, DrugInteraction, AnalyticsAlert } = require('../models/firebaseModels');
const LLMService = require('./llmService');

class AnalyticsService {
  static async detectSideEffectSpikes(drugId, timeWindow = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

      // Get side effects for the drug in the time window
      const recentSideEffects = await SideEffect.findAll({
        where: {
          drugId,
          isAnonymous: true,
          createdAt: {
            [require('sequelize').Op.gte]: cutoffDate
          }
        },
        include: [{
          model: Drug,
          as: 'drug',
          attributes: ['name']
        }]
      });

      // Get historical baseline (previous period)
      const baselineStart = new Date(cutoffDate);
      baselineStart.setDate(baselineStart.getDate() - timeWindow);
      
      const baselineSideEffects = await SideEffect.findAll({
        where: {
          drugId,
          isAnonymous: true,
          createdAt: {
            [require('sequelize').Op.between]: [baselineStart, cutoffDate]
          }
        }
      });

      // Calculate rates
      const recentRate = recentSideEffects.length / timeWindow;
      const baselineRate = baselineSideEffects.length / timeWindow;
      
      // Check for significant increase
      const threshold = parseFloat(process.env.SIDE_EFFECT_SPIKE_THRESHOLD) || 0.15;
      const increaseRatio = (recentRate - baselineRate) / baselineRate;

      if (increaseRatio > threshold && recentRate > 0.1) {
        // Create alert
        const alert = await AnalyticsAlert.create({
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
      const prescriptions = await Prescription.findAll({
        where: { isActive: true },
        include: [{
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name']
        }]
      });

      // Group by patient
      const patientDrugs = {};
      prescriptions.forEach(prescription => {
        if (!patientDrugs[prescription.patientId]) {
          patientDrugs[prescription.patientId] = [];
        }
        patientDrugs[prescription.patientId].push(prescription.drug);
      });

      const interactions = [];

      // Check for patients on multiple drugs
      for (const [patientId, drugs] of Object.entries(patientDrugs)) {
        if (drugs.length > 1) {
          // Get side effects for this patient
          const patientSideEffects = await SideEffect.findAll({
            where: {
              prescriptionId: prescriptions
                .filter(p => p.patientId === patientId)
                .map(p => p.id)
            },
            include: [{
              model: Drug,
              as: 'drug',
              attributes: ['name']
            }]
          });

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
              const existingInteraction = await DrugInteraction.findOne({
                where: {
                  [require('sequelize').Op.or]: [
                    { drugId1: drugs[0].id, drugId2: drugs[1].id },
                    { drugId1: drugs[1].id, drugId2: drugs[0].id }
                  ]
                }
              });

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
      const sideEffects = await SideEffect.findAll({
        where: {
          isAnonymous: true,
          createdAt: {
            [require('sequelize').Op.gte]: cutoffDate
          }
        },
        include: [{
          model: Drug,
          as: 'drug',
          attributes: ['name', 'drugClass']
        }]
      });

      // Group by drug
      const drugStats = {};
      sideEffects.forEach(se => {
        const drugName = se.drug.name;
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
        drugStats[drugName][se.severity]++;
        if (se.isConcerning) drugStats[drugName].concerning++;
      });

      // Use LLM to generate insights
      const insights = await LLMService.generateAnalyticsInsights({
        drugStats,
        timeWindow,
        totalSideEffects: sideEffects.length
      });

      return {
        timeWindow,
        totalSideEffects: sideEffects.length,
        drugStats,
        insights,
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
      const drugs = await Drug.findAll({
        where: { isActive: true },
        attributes: ['id', 'name']
      });

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
