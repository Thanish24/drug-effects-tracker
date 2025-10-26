const { SideEffect, Drug, Prescription, DrugInteraction, AnalyticsAlert } = require('../models');
const { Op } = require('sequelize');
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
            [Op.gte]: cutoffDate
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
            [Op.gte]: baselineStart,
            [Op.lt]: cutoffDate
          }
        }
      });

      // Calculate spike metrics
      const recentCount = recentSideEffects.length;
      const baselineCount = baselineSideEffects.length;
      const baselineAverage = baselineCount / timeWindow;
      const recentAverage = recentCount / timeWindow;
      
      // Calculate spike ratio
      const spikeRatio = baselineAverage > 0 ? recentAverage / baselineAverage : recentAverage;
      
      // Determine if there's a significant spike (threshold: 2x baseline)
      const isSpike = spikeRatio >= 2 && recentCount >= 5; // Minimum 5 reports for significance
      
      if (isSpike) {
        // Get drug information
        const drug = await Drug.findByPk(drugId);
        
        // Analyze severity distribution
        const severityCounts = recentSideEffects.reduce((acc, se) => {
          acc[se.severity] = (acc[se.severity] || 0) + 1;
          return acc;
        }, {});

        // Create alert
        const alert = await AnalyticsAlert.create({
          alertType: 'side_effect_spike',
          title: `Side Effect Spike Detected: ${drug?.name || 'Unknown Drug'}`,
          description: `Significant increase in side effect reports for ${drug?.name || 'this drug'}. Recent reports: ${recentCount}, Baseline average: ${baselineAverage.toFixed(1)}`,
          severity: spikeRatio >= 4 ? 'high' : spikeRatio >= 2.5 ? 'medium' : 'low',
          affectedPatientCount: recentCount,
          confidenceScore: Math.min(spikeRatio / 4, 1), // Normalize to 0-1
          dataPoints: {
            recentCount,
            baselineCount,
            spikeRatio: spikeRatio.toFixed(2),
            severityDistribution: severityCounts,
            timeWindow
          },
          recommendations: [
            'Review recent prescriptions for this drug',
            'Consider patient monitoring protocols',
            'Evaluate if dosage adjustments are needed',
            'Check for potential drug interactions'
          ]
        });

        return {
          isSpike: true,
          alert,
          metrics: {
            recentCount,
            baselineCount,
            spikeRatio: spikeRatio.toFixed(2),
            severityDistribution: severityCounts
          }
        };
      }

      return {
        isSpike: false,
        metrics: {
          recentCount,
          baselineCount,
          spikeRatio: spikeRatio.toFixed(2)
        }
      };
    } catch (error) {
      console.error('Error detecting side effect spikes:', error);
      throw error;
    }
  }

  static async detectDrugInteractions(prescriptionId) {
    try {
      // Get prescription with drug information
      const prescription = await Prescription.findByPk(prescriptionId, {
        include: [{
          model: Drug,
          as: 'drug',
          include: [{
            model: Drug,
            as: 'interactsWith',
            through: {
              attributes: ['severity', 'description', 'clinicalEffect', 'management', 'evidenceLevel']
            }
          }]
        }]
      });

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      // Get all other active prescriptions for the same patient
      const otherPrescriptions = await Prescription.findAll({
        where: {
          patientId: prescription.patientId,
          id: { [Op.ne]: prescriptionId },
          isActive: true
        },
        include: [{
          model: Drug,
          as: 'drug'
        }]
      });

      const interactions = [];
      const currentDrug = prescription.drug;

      // Check for known interactions
      for (const otherPrescription of otherPrescriptions) {
        const otherDrug = otherPrescription.drug;
        
        // Check if there's a known interaction
        const knownInteraction = currentDrug.interactsWith.find(
          interaction => interaction.id === otherDrug.id
        );

        if (knownInteraction) {
          interactions.push({
            drug1: currentDrug.name,
            drug2: otherDrug.name,
            severity: knownInteraction.DrugInteraction.severity,
            description: knownInteraction.DrugInteraction.description,
            clinicalEffect: knownInteraction.DrugInteraction.clinicalEffect,
            management: knownInteraction.DrugInteraction.management,
            evidenceLevel: knownInteraction.DrugInteraction.evidenceLevel,
            isKnown: true
          });
        } else {
          // Use LLM to check for potential interactions
          try {
            const llmAnalysis = await LLMService.analyzeDrugInteraction(
              currentDrug.name,
              otherDrug.name,
              currentDrug.description || '',
              otherDrug.description || ''
            );

            if (llmAnalysis.hasInteraction && llmAnalysis.confidence > 0.7) {
              interactions.push({
                drug1: currentDrug.name,
                drug2: otherDrug.name,
                severity: llmAnalysis.severity,
                description: llmAnalysis.description,
                clinicalEffect: llmAnalysis.clinicalEffect,
                management: llmAnalysis.management,
                evidenceLevel: 'AI Analysis',
                isKnown: false,
                confidence: llmAnalysis.confidence
              });
            }
          } catch (llmError) {
            console.error('LLM analysis error:', llmError);
          }
        }
      }

      // Create alerts for high-severity interactions
      const highSeverityInteractions = interactions.filter(i => 
        ['major', 'severe'].includes(i.severity)
      );

      for (const interaction of highSeverityInteractions) {
        await AnalyticsAlert.create({
          alertType: 'drug_interaction',
          title: `Drug Interaction Alert: ${interaction.drug1} + ${interaction.drug2}`,
          description: interaction.description,
          severity: interaction.severity === 'severe' ? 'high' : 'medium',
          affectedPatientCount: 1,
          confidenceScore: interaction.confidence || 1,
          dataPoints: {
            drug1: interaction.drug1,
            drug2: interaction.drug2,
            prescriptionId,
            patientId: prescription.patientId
          },
          recommendations: [
            interaction.management || 'Consult healthcare provider immediately',
            'Monitor patient closely for adverse effects',
            'Consider alternative medications if possible'
          ]
        });
      }

      return {
        interactions,
        hasHighSeverity: highSeverityInteractions.length > 0
      };
    } catch (error) {
      console.error('Error detecting drug interactions:', error);
      throw error;
    }
  }

  static async generateAnalyticsReport(timeWindow = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

      // Get all drugs with recent activity
      const activeDrugs = await Drug.findAll({
        include: [{
          model: SideEffect,
          as: 'sideEffects',
          where: {
            createdAt: { [Op.gte]: cutoffDate }
          },
          required: true
        }]
      });

      const report = {
        timeWindow,
        generatedAt: new Date(),
        summary: {
          totalDrugs: activeDrugs.length,
          totalSideEffects: 0,
          totalAlerts: 0,
          spikeDetections: 0
        },
        drugAnalytics: [],
        alerts: []
      };

      // Analyze each drug
      for (const drug of activeDrugs) {
        const spikeAnalysis = await this.detectSideEffectSpikes(drug.id, timeWindow);
        
        const drugAnalytics = {
          drugId: drug.id,
          drugName: drug.name,
          sideEffectCount: drug.sideEffects.length,
          hasSpike: spikeAnalysis.isSpike,
          spikeRatio: spikeAnalysis.metrics.spikeRatio,
          severityDistribution: spikeAnalysis.metrics.severityDistribution || {}
        };

        report.drugAnalytics.push(drugAnalytics);
        report.summary.totalSideEffects += drug.sideEffects.length;
        
        if (spikeAnalysis.isSpike) {
          report.summary.spikeDetections++;
        }
      }

      // Get recent alerts
      const recentAlerts = await AnalyticsAlert.findAll({
        where: {
          createdAt: { [Op.gte]: cutoffDate }
        },
        order: [['createdAt', 'DESC']]
      });

      report.alerts = recentAlerts.map(alert => ({
        id: alert.id,
        type: alert.alertType,
        title: alert.title,
        severity: alert.severity,
        confidence: alert.confidenceScore,
        createdAt: alert.createdAt
      }));

      report.summary.totalAlerts = recentAlerts.length;

      return report;
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  static async getAlerts(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.alertType) {
        whereClause.alertType = filters.alertType;
      }
      
      if (filters.severity) {
        whereClause.severity = filters.severity;
      }
      
      if (filters.isResolved !== undefined) {
        whereClause.isResolved = filters.isResolved;
      }

      const alerts = await AnalyticsAlert.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 50
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  static async resolveAlert(alertId, resolution = {}) {
    try {
      const alert = await AnalyticsAlert.findByPk(alertId);
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({
        isResolved: true,
        resolvedAt: new Date(),
        resolution: resolution
      });

      return alert;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  static async runPeriodicAnalysis(timeWindow = 30) {
    try {
      console.log('Running periodic analytics analysis...');
      
      // Get all active drugs
      const activeDrugs = await Drug.findAll({
        where: { isActive: true }
      });

      const analysisResults = {
        timestamp: new Date(),
        timeWindow,
        drugsAnalyzed: activeDrugs.length,
        spikesDetected: 0,
        interactionsDetected: 0,
        alertsGenerated: 0,
        summary: {}
      };

      // Analyze each drug for side effect spikes
      for (const drug of activeDrugs) {
        try {
          const spikeAnalysis = await this.detectSideEffectSpikes(drug.id, timeWindow);
          if (spikeAnalysis.isSpike) {
            analysisResults.spikesDetected++;
            analysisResults.alertsGenerated++;
          }
        } catch (error) {
          console.error(`Error analyzing drug ${drug.name}:`, error);
        }
      }

      // Get recent prescriptions and check for interactions
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeWindow);
      
      const recentPrescriptions = await Prescription.findAll({
        where: {
          createdAt: { [Op.gte]: cutoffDate },
          isActive: true
        },
        include: [{
          model: Drug,
          as: 'drug'
        }]
      });

      // Check for drug interactions
      for (const prescription of recentPrescriptions) {
        try {
          const interactionAnalysis = await this.detectDrugInteractions(prescription.id);
          if (interactionAnalysis.hasHighSeverity) {
            analysisResults.interactionsDetected++;
            analysisResults.alertsGenerated++;
          }
        } catch (error) {
          console.error(`Error analyzing interactions for prescription ${prescription.id}:`, error);
        }
      }

      // Generate summary
      analysisResults.summary = {
        totalAlerts: await AnalyticsAlert.count({ where: { isResolved: false } }),
        highSeverityAlerts: await AnalyticsAlert.count({ 
          where: { 
            isResolved: false, 
            severity: 'high' 
          } 
        }),
        recentSideEffects: await SideEffect.count({
          where: {
            createdAt: { [Op.gte]: cutoffDate },
            isAnonymous: true
          }
        })
      };

      console.log('Periodic analysis completed:', analysisResults);
      return analysisResults;
    } catch (error) {
      console.error('Error running periodic analysis:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;