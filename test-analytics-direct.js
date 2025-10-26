const { SideEffect, Drug, AnalyticsAlert } = require('./server/models/firebaseModels');
const AnalyticsService = require('./server/services/analyticsService');
require('dotenv').config();

async function testAnalyticsDirect() {
  try {
    console.log('🧪 Testing Analytics Service Directly...\n');
    
    // 1. Check if we have data
    console.log('1️⃣ Checking database for data...');
    const drugModel = new Drug();
    const sideEffectModel = new SideEffect();
    
    const drugCount = await drugModel.count();
    const sideEffectCount = await sideEffectModel.count();
    
    console.log(`📊 Database Status:`);
    console.log(`   - Drugs: ${drugCount}`);
    console.log(`   - Side Effects: ${sideEffectCount}`);
    
    if (drugCount === 0) {
      console.log('\n❌ No drugs found. Please run: node seed-drugs-firebase.js');
      return;
    }
    
    if (sideEffectCount === 0) {
      console.log('\n❌ No side effects found. Please run: node seed-test-data.js');
      return;
    }
    
    // 2. Get some sample data
    console.log('\n2️⃣ Getting sample data...');
    const drugs = await drugModel.findAll({ isActive: true });
    const sideEffects = await sideEffectModel.findAll();
    
    console.log(`✅ Found ${drugs.length} active drugs`);
    console.log(`✅ Found ${sideEffects.length} side effects`);
    
    // Show recent side effects
    const recentSideEffects = sideEffects.filter(se => 
      se.createdAt && new Date(se.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    console.log(`📈 Recent side effects (last 7 days): ${recentSideEffects.length}`);
    
    // 3. Test analytics service
    console.log('\n3️⃣ Testing Analytics Service...');
    
    // Test side effect spike detection
    console.log('🔍 Testing side effect spike detection...');
    for (const drug of drugs.slice(0, 3)) { // Test first 3 drugs
      const spikeAlert = await AnalyticsService.detectSideEffectSpikes(drug.id);
      if (spikeAlert) {
        console.log(`🚨 Spike alert for ${drug.name}:`, spikeAlert);
      } else {
        console.log(`✅ No spike detected for ${drug.name}`);
      }
    }
    
    // Test drug interaction detection
    console.log('\n🔍 Testing drug interaction detection...');
    const interactionAlerts = await AnalyticsService.detectDrugInteractions();
    if (interactionAlerts.length > 0) {
      console.log(`🚨 Found ${interactionAlerts.length} interaction alerts:`, interactionAlerts);
    } else {
      console.log('✅ No drug interaction alerts detected');
    }
    
    // Test analytics report
    console.log('\n🔍 Testing analytics report generation...');
    const report = await AnalyticsService.generateAnalyticsReport();
    console.log('📊 Analytics Report:');
    console.log(`   - Time Window: ${report.timeWindow} days`);
    console.log(`   - Total Side Effects: ${report.totalSideEffects}`);
    console.log(`   - Drug Stats: ${Object.keys(report.drugStats).length} drugs`);
    
    if (report.insights) {
      console.log(`   - Insights: ${report.insights.length} insights generated`);
    }
    
    // 4. Run periodic analysis
    console.log('\n4️⃣ Running periodic analysis...');
    const analysis = await AnalyticsService.runPeriodicAnalysis();
    
    if (analysis.error) {
      console.log(`❌ Analysis failed: ${analysis.error}`);
    } else {
      console.log(`✅ Analysis complete: ${analysis.alerts.length} alerts generated`);
      if (analysis.alerts.length > 0) {
        console.log('🚨 Generated alerts:');
        analysis.alerts.forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.alertType}: ${alert.message}`);
        });
      }
    }
    
    console.log('\n🎉 Analytics test completed!');
    
  } catch (error) {
    console.error('❌ Analytics test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Firebase is configured');
    console.log('2. Check your .env file');
    console.log('3. Run data population scripts first');
  }
}

testAnalyticsDirect().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
