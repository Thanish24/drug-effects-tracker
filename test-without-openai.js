// Test analytics without OpenAI
process.env.OPENAI_API_KEY = 'skip_llm_features';

const { SideEffect, Drug, AnalyticsAlert } = require('./server/models/firebaseModels');
const AnalyticsService = require('./server/services/analyticsService');

async function testWithoutOpenAI() {
  try {
    console.log('🧪 Testing Analytics Service WITHOUT OpenAI...\n');
    
    // 1. Check data
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
    
    // 2. Get recent side effects
    console.log('\n2️⃣ Checking for recent side effects...');
    const allSideEffects = await sideEffectModel.findAll();
    const recentSideEffects = allSideEffects.filter(se => 
      se.createdAt && new Date(se.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    console.log(`📈 Recent side effects (last 7 days): ${recentSideEffects.length}`);
    
    if (recentSideEffects.length === 0) {
      console.log('\n❌ No recent side effects found. Please run: node create-recent-alerts.js');
      return;
    }
    
    // 3. Test side effect spike detection
    console.log('\n3️⃣ Testing side effect spike detection...');
    const drugs = await drugModel.findAll({ isActive: true });
    
    for (const drug of drugs.slice(0, 3)) {
      const spikeAlert = await AnalyticsService.detectSideEffectSpikes(drug.id);
      if (spikeAlert) {
        console.log(`🚨 SPIKE ALERT for ${drug.name}:`);
        console.log(`   - Alert Type: ${spikeAlert.alertType}`);
        console.log(`   - Message: ${spikeAlert.message}`);
        console.log(`   - Severity: ${spikeAlert.severity}`);
      } else {
        console.log(`✅ No spike detected for ${drug.name}`);
      }
    }
    
    // 4. Test analytics report
    console.log('\n4️⃣ Testing analytics report...');
    const report = await AnalyticsService.generateAnalyticsReport();
    console.log('📊 Analytics Report:');
    console.log(`   - Time Window: ${report.timeWindow} days`);
    console.log(`   - Total Side Effects: ${report.totalSideEffects}`);
    console.log(`   - Drug Stats: ${Object.keys(report.drugStats).length} drugs`);
    
    if (report.insights && report.insights.length > 0) {
      console.log(`   - Insights: ${report.insights.length} insights`);
      report.insights.forEach((insight, index) => {
        console.log(`     ${index + 1}. ${insight}`);
      });
    }
    
    // 5. Run periodic analysis
    console.log('\n5️⃣ Running periodic analysis...');
    const analysis = await AnalyticsService.runPeriodicAnalysis();
    
    if (analysis.error) {
      console.log(`❌ Analysis failed: ${analysis.error}`);
    } else {
      console.log(`✅ Analysis complete: ${analysis.alerts.length} alerts generated`);
      if (analysis.alerts.length > 0) {
        console.log('\n🚨 Generated Alerts:');
        analysis.alerts.forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.alertType}: ${alert.message}`);
        });
      } else {
        console.log('\nℹ️ No alerts generated. This could mean:');
        console.log('   - No significant patterns detected');
        console.log('   - Thresholds not met');
        console.log('   - Need more recent data');
      }
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithoutOpenAI().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
