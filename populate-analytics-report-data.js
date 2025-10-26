const { sequelize, AnalyticsAlert, Drug, SideEffect, DrugInteraction } = require('./server/models');
const { Op } = require('sequelize');

async function populateAnalyticsReportData() {
  console.log('📊 Populating PostgreSQL with Analytics Report Data...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Get existing drugs for analytics
    const drugs = await Drug.findAll();
    if (drugs.length === 0) {
      console.log('⚠️  No drugs found. Please run drug population scripts first.');
      return;
    }

    console.log(`📊 Found ${drugs.length} drugs for analytics`);

    // Create side effect spike alerts
    console.log('\n🚨 Creating side effect spike alerts...');
    const spikeAlerts = [
      {
        alertType: 'side_effect_spike',
        title: 'Critical Spike: Aspirin Side Effects',
        description: 'Significant increase in aspirin-related side effects reported in the last 7 days. 25 reports vs 4 baseline average (625% increase).',
        severity: 'high',
        affectedPatientCount: 25,
        confidenceScore: 0.95,
        dataPoints: {
          drugName: 'Aspirin',
          recentCount: 25,
          baselineCount: 4,
          spikeRatio: 6.25,
          severityDistribution: { mild: 8, moderate: 12, severe: 5 },
          timeWindow: 7,
          concerningReports: 18
        },
        recommendations: [
          'Immediate review of recent aspirin prescriptions',
          'Consider temporary suspension of new prescriptions',
          'Implement enhanced patient monitoring protocol',
          'Investigate potential batch contamination',
          'Notify regulatory authorities if pattern continues'
        ]
      },
      {
        alertType: 'side_effect_spike',
        title: 'Moderate Spike: Warfarin Bleeding Events',
        description: 'Increased bleeding events reported with warfarin. 15 reports vs 3 baseline average (400% increase).',
        severity: 'medium',
        affectedPatientCount: 15,
        confidenceScore: 0.85,
        dataPoints: {
          drugName: 'Warfarin',
          recentCount: 15,
          baselineCount: 3,
          spikeRatio: 4.0,
          severityDistribution: { mild: 5, moderate: 7, severe: 3 },
          timeWindow: 7,
          concerningReports: 10
        },
        recommendations: [
          'Review INR monitoring protocols',
          'Check for drug interactions in recent prescriptions',
          'Consider dose adjustments for high-risk patients',
          'Enhance patient education on bleeding signs'
        ]
      },
      {
        alertType: 'side_effect_spike',
        title: 'Minor Spike: Metformin Gastrointestinal Effects',
        description: 'Slight increase in GI side effects with metformin. 12 reports vs 5 baseline average (140% increase).',
        severity: 'low',
        affectedPatientCount: 12,
        confidenceScore: 0.70,
        dataPoints: {
          drugName: 'Metformin',
          recentCount: 12,
          baselineCount: 5,
          spikeRatio: 1.4,
          severityDistribution: { mild: 8, moderate: 3, severe: 1 },
          timeWindow: 14,
          concerningReports: 4
        },
        recommendations: [
          'Review dosing instructions with patients',
          'Consider extended-release formulations',
          'Monitor patient adherence to food recommendations'
        ]
      }
    ];

    for (const alertData of spikeAlerts) {
      const [alert, created] = await AnalyticsAlert.findOrCreate({
        where: {
          alertType: alertData.alertType,
          title: alertData.title
        },
        defaults: {
          ...alertData,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        }
      });
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${alert.title}`);
    }

    // Create drug interaction alerts
    console.log('\n🔗 Creating drug interaction alerts...');
    const interactionAlerts = [
      {
        alertType: 'drug_interaction',
        title: 'Critical Interaction: Warfarin + Aspirin',
        description: 'High-risk drug interaction detected between warfarin and aspirin. Multiple patients affected with severe bleeding risk.',
        severity: 'high',
        affectedPatientCount: 8,
        confidenceScore: 0.98,
        dataPoints: {
          drug1: 'Warfarin',
          drug2: 'Aspirin',
          interactionSeverity: 'major',
          affectedPatients: 8,
          timeFrame: 'Last 24 hours',
          riskLevel: 'Critical'
        },
        recommendations: [
          'Immediate review of all patients on both medications',
          'Consider discontinuing aspirin in warfarin patients',
          'Implement enhanced INR monitoring',
          'Educate patients about bleeding risk',
          'Consider alternative pain management'
        ]
      },
      {
        alertType: 'drug_interaction',
        title: 'Moderate Interaction: Furosemide + Digoxin',
        description: 'Moderate drug interaction between furosemide and digoxin. Risk of digoxin toxicity due to hypokalemia.',
        severity: 'medium',
        affectedPatientCount: 5,
        confidenceScore: 0.88,
        dataPoints: {
          drug1: 'Furosemide',
          drug2: 'Digoxin',
          interactionSeverity: 'moderate',
          affectedPatients: 5,
          timeFrame: 'Last 48 hours',
          riskLevel: 'Moderate'
        },
        recommendations: [
          'Monitor potassium levels closely',
          'Consider potassium supplementation',
          'Adjust digoxin dosing if needed',
          'Educate patients about toxicity signs'
        ]
      },
      {
        alertType: 'drug_interaction',
        title: 'Minor Interaction: Metformin + Furosemide',
        description: 'Minor interaction between metformin and furosemide. Potential for increased metformin levels.',
        severity: 'low',
        affectedPatientCount: 3,
        confidenceScore: 0.65,
        dataPoints: {
          drug1: 'Metformin',
          drug2: 'Furosemide',
          interactionSeverity: 'minor',
          affectedPatients: 3,
          timeFrame: 'Last 72 hours',
          riskLevel: 'Low'
        },
        recommendations: [
          'Monitor kidney function',
          'Consider dose adjustments',
          'Watch for lactic acidosis signs'
        ]
      }
    ];

    for (const alertData of interactionAlerts) {
      const [alert, created] = await AnalyticsAlert.findOrCreate({
        where: {
          alertType: alertData.alertType,
          title: alertData.title
        },
        defaults: {
          ...alertData,
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) // Random time in last 3 days
        }
      });
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${alert.title}`);
    }

    // Create resolved alerts for historical data
    console.log('\n✅ Creating resolved alerts for historical context...');
    const resolvedAlerts = [
      {
        alertType: 'side_effect_spike',
        title: 'Resolved: Ibuprofen Stomach Issues',
        description: 'Previous spike in ibuprofen-related stomach issues has been resolved after batch recall.',
        severity: 'medium',
        affectedPatientCount: 20,
        confidenceScore: 0.90,
        isResolved: true,
        resolvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        dataPoints: {
          drugName: 'Ibuprofen',
          recentCount: 20,
          baselineCount: 3,
          spikeRatio: 6.67,
          resolution: 'Batch recall implemented',
          timeToResolution: '3 days'
        },
        recommendations: [
          'Batch recall completed',
          'New batch tested and approved',
          'Enhanced quality control implemented'
        ]
      },
      {
        alertType: 'drug_interaction',
        title: 'Resolved: Simvastatin + Grapefruit',
        description: 'Drug interaction alert resolved after patient education about grapefruit consumption.',
        severity: 'low',
        affectedPatientCount: 1,
        confidenceScore: 0.75,
        isResolved: true,
        resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        dataPoints: {
          drug1: 'Simvastatin',
          drug2: 'Grapefruit',
          interactionSeverity: 'moderate',
          resolution: 'Patient education provided',
          timeToResolution: '1 day'
        },
        recommendations: [
          'Patient educated about grapefruit interaction',
          'Dietary counseling provided',
          'Follow-up scheduled'
        ]
      }
    ];

    for (const alertData of resolvedAlerts) {
      const [alert, created] = await AnalyticsAlert.findOrCreate({
        where: {
          alertType: alertData.alertType,
          title: alertData.title
        },
        defaults: {
          ...alertData,
          createdAt: new Date(alertData.resolvedAt.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days before resolution
        }
      });
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${alert.title} (Resolved)`);
    }

    // Create summary statistics
    console.log('\n📈 Creating analytics summary...');
    const totalAlerts = await AnalyticsAlert.count();
    const activeAlerts = await AnalyticsAlert.count({ where: { isResolved: false } });
    const resolvedAlertsCount = await AnalyticsAlert.count({ where: { isResolved: true } });
    const highSeverityAlerts = await AnalyticsAlert.count({ 
      where: { 
        severity: 'high',
        isResolved: false 
      } 
    });

    console.log('\n🎉 Analytics report data population completed!');
    console.log(`📊 Total alerts: ${totalAlerts}`);
    console.log(`🚨 Active alerts: ${activeAlerts}`);
    console.log(`✅ Resolved alerts: ${resolvedAlertsCount}`);
    console.log(`🔴 High severity alerts: ${highSeverityAlerts}`);
    console.log('📈 Analytics dashboard ready for testing');

  } catch (error) {
    console.error('❌ Error populating analytics report data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the population script
populateAnalyticsReportData();