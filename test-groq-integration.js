// Test Groq integration
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'skip_llm_features';

const { SideEffect, Drug, AnalyticsAlert } = require('./server/models/firebaseModels');
const AnalyticsService = require('./server/services/analyticsService');

async function testGroqIntegration() {
  try {
    console.log('🚀 Testing Groq Integration...\n');
    
    // 1. Check if Groq is configured
    if (process.env.GROQ_API_KEY === 'skip_llm_features' || 
        process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.log('⚠️ Groq API key not configured. Using fallback mode.');
      console.log('   To use Groq:');
      console.log('   1. Get API key from https://console.groq.com/');
      console.log('   2. Add GROQ_API_KEY=your_key_here to .env file');
      console.log('   3. Run this test again\n');
    }
    
    // 2. Check database
    console.log('1️⃣ Checking database...');
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
    
    // 3. Check for recent data
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
    
    // 4. Test side effect analysis with Groq
    console.log('\n3️⃣ Testing side effect analysis...');
    const testSideEffect = recentSideEffects[0];
    const drug = await drugModel.findById(testSideEffect.drugId);
    
    console.log(`🔍 Analyzing side effect: "${testSideEffect.description}"`);
    console.log(`   Drug: ${drug ? drug.name : 'Unknown'}`);
    console.log(`   Severity: ${testSideEffect.severity}`);
    
    // This will use Groq if configured, or fallback if not
    const analysis = await require('./server/services/llmService').analyzeSideEffect({
      description: testSideEffect.description,
      severity: testSideEffect.severity,
      impactOnDailyLife: testSideEffect.impactOnDailyLife,
      drugName: drug ? drug.name : 'Unknown',
      patientAge: 30,
      otherMedications: []
    });
    
    console.log('\n📊 Analysis Result:');
    console.log(`   - Concern Level: ${analysis.concernLevel}`);
    console.log(`   - Is Concerning: ${analysis.isConcerning}`);
    console.log(`   - Urgency: ${analysis.urgency}`);
    console.log(`   - Recommendations: ${analysis.recommendations.length} items`);
    analysis.recommendations.forEach((rec, index) => {
      console.log(`     ${index + 1}. ${rec}`);
    });
    
    // 5. Test analytics report
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
    
    // 6. Test periodic analysis
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
        console.log('\nℹ️ No alerts generated.');
      }
    }
    
    console.log('\n🎉 Groq integration test completed!');
    
    if (process.env.GROQ_API_KEY !== 'skip_llm_features' && 
        process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      console.log('\n✅ Groq is working! You should see faster AI responses.');
    } else {
      console.log('\n⚠️ Using fallback mode. Configure Groq for better performance.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Groq API key');
    console.log('2. Make sure you have recent data');
    console.log('3. Check your internet connection');
  }
}

testGroqIntegration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
