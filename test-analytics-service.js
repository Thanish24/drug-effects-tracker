const { db } = require('./server/config/firebase');
const AnalyticsService = require('./server/services/analyticsService');

async function testAnalyticsService() {
  console.log('🧪 Testing Analytics Service with Populated Data...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing Firebase connection...');
    await db.collection('test').doc('analytics-test').set({ test: true });
    console.log('✅ Firebase connection successful\n');

    // Run periodic analysis to detect alerts
    console.log('2️⃣ Running periodic analytics analysis...');
    const analysisResult = await AnalyticsService.runPeriodicAnalysis();
    
    if (analysisResult.error) {
      console.error('❌ Analysis failed:', analysisResult.error);
      return;
    }

    console.log(`✅ Analysis complete! Generated ${analysisResult.alerts.length} alerts\n`);

    // Display alerts
    if (analysisResult.alerts.length > 0) {
      console.log('🚨 Generated Alerts:');
      analysisResult.alerts.forEach((alert, index) => {
        console.log(`\n${index + 1}. ${alert.title}`);
        console.log(`   Type: ${alert.alertType}`);
        console.log(`   Severity: ${alert.severity}`);
        console.log(`   Description: ${alert.description}`);
        console.log(`   Confidence: ${(alert.confidenceScore * 100).toFixed(1)}%`);
        console.log(`   Affected Patients: ${alert.affectedPatientCount}`);
        if (alert.recommendations && alert.recommendations.length > 0) {
          console.log(`   Recommendations:`);
          alert.recommendations.forEach(rec => console.log(`     - ${rec}`));
        }
      });
    } else {
      console.log('ℹ️ No alerts generated. This could mean:');
      console.log('   - No significant patterns detected');
      console.log('   - Thresholds not met');
      console.log('   - Insufficient data');
    }

    // Display analytics report summary
    if (analysisResult.report) {
      console.log('\n📊 Analytics Report Summary:');
      console.log(`   Time Window: ${analysisResult.report.timeWindow} days`);
      console.log(`   Total Side Effects: ${analysisResult.report.totalSideEffects}`);
      console.log(`   Generated At: ${analysisResult.report.generatedAt}`);
      
      if (analysisResult.report.drugStats) {
        console.log('\n   Drug Statistics:');
        Object.entries(analysisResult.report.drugStats).forEach(([drugName, stats]) => {
          console.log(`     ${drugName}:`);
          console.log(`       Total: ${stats.total}`);
          console.log(`       Severe: ${stats.severe}`);
          console.log(`       Moderate: ${stats.moderate}`);
          console.log(`       Mild: ${stats.mild}`);
          console.log(`       Concerning: ${stats.concerning}`);
        });
      }
    }

    // Clean up test data
    console.log('\n3️⃣ Cleaning up test data...');
    await db.collection('test').doc('analytics-test').delete();
    console.log('✅ Cleanup complete\n');

    console.log('🎉 Analytics Service Test Complete!');
    console.log('\n💡 Next Steps:');
    console.log('   - Check the Firestore console to see the generated alerts');
    console.log('   - Run individual population scripts for specific scenarios');
    console.log('   - Modify thresholds in .env to test different sensitivity levels');

  } catch (error) {
    console.error('❌ Analytics service test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAnalyticsService();
