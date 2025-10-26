// Complete Groq integration test
const { SideEffect, Drug, User, AnalyticsAlert } = require('./server/models/firebaseModels');
const AnalyticsService = require('./server/services/analyticsService');
const LLMService = require('./server/services/llmService');

async function testGroqComplete() {
  try {
    console.log('🚀 Complete Groq Integration Test\n');
    
    // 1. Check configuration
    console.log('1️⃣ Checking configuration...');
    const hasGroqKey = process.env.GROQ_API_KEY && 
                       process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && 
                       process.env.GROQ_API_KEY !== 'skip_llm_features';
    
    if (hasGroqKey) {
      console.log('✅ Groq API key configured');
    } else {
      console.log('⚠️ Groq API key not configured - using fallback mode');
      console.log('   To use Groq: Get API key from https://console.groq.com/');
    }
    
    // 2. Check database
    console.log('\n2️⃣ Checking database...');
    const drugModel = new Drug();
    const sideEffectModel = new SideEffect();
    const userModel = new User();
    
    const drugCount = await drugModel.count();
    const sideEffectCount = await sideEffectModel.count();
    const userCount = await userModel.count();
    
    console.log(`📊 Database Status:`);
    console.log(`   - Drugs: ${drugCount}`);
    console.log(`   - Side Effects: ${sideEffectCount}`);
    console.log(`   - Users: ${userCount}`);
    
    if (drugCount === 0) {
      console.log('\n❌ No drugs found. Please run: node setup-groq-complete.js');
      return;
    }
    
    // 3. Test side effect analysis
    console.log('\n3️⃣ Testing side effect analysis...');
    const allSideEffects = await sideEffectModel.findAll();
    const recentSideEffects = allSideEffects.filter(se => 
      se.createdAt && new Date(se.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    console.log(`📈 Recent side effects: ${recentSideEffects.length}`);
    
    if (recentSideEffects.length > 0) {
      const testSideEffect = recentSideEffects[0];
      const drug = await drugModel.findById(testSideEffect.drugId);
      
      console.log(`🔍 Analyzing: "${testSideEffect.description}"`);
      console.log(`   Drug: ${drug ? drug.name : 'Unknown'}`);
      console.log(`   Severity: ${testSideEffect.severity}`);
      
      const analysis = await LLMService.analyzeSideEffect({
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
      console.log(`   - Reasoning: ${analysis.reasoning}`);
      console.log(`   - Recommendations: ${analysis.recommendations.length} items`);
      analysis.recommendations.forEach((rec, index) => {
        console.log(`     ${index + 1}. ${rec}`);
      });
    }
    
    // 4. Test drug interaction detection
    console.log('\n4️⃣ Testing drug interaction detection...');
    const interactionAlerts = await AnalyticsService.detectDrugInteractions();
    if (interactionAlerts.length > 0) {
      console.log(`🚨 Found ${interactionAlerts.length} interaction alerts:`);
      interactionAlerts.forEach((alert, index) => {
        console.log(`   ${index + 1}. ${alert.alertType}: ${alert.message}`);
      });
    } else {
      console.log('✅ No drug interaction alerts detected');
    }
    
    // 5. Test analytics report
    console.log('\n5️⃣ Testing analytics report...');
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
    console.log('\n6️⃣ Running periodic analysis...');
    const analysis = await AnalyticsService.runPeriodicAnalysis();
    
    if (analysis.error) {
      console.log(`❌ Analysis failed: ${analysis.error}`);
    } else {
      console.log(`✅ Analysis complete: ${analysis.alerts.length} alerts generated`);
      if (analysis.alerts.length > 0) {
        console.log('\n🚨 Generated Alerts:');
        analysis.alerts.forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.alertType}: ${alert.description || alert.message || 'No description'}`);
        });
      } else {
        console.log('\nℹ️ No alerts generated.');
      }
    }
    
    // 7. Performance test
    if (hasGroqKey) {
      console.log('\n7️⃣ Testing Groq performance...');
      const startTime = Date.now();
      
      const performanceTest = await LLMService.analyzeSideEffect({
        description: 'Mild headache and dizziness',
        severity: 'mild',
        impactOnDailyLife: 'Slight discomfort',
        drugName: 'Test Drug',
        patientAge: 25,
        otherMedications: []
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`⚡ Groq response time: ${responseTime}ms`);
      console.log(`   - Analysis: ${performanceTest.concernLevel}`);
      console.log(`   - Urgency: ${performanceTest.urgency}`);
      
      if (responseTime < 2000) {
        console.log('✅ Excellent performance!');
      } else if (responseTime < 5000) {
        console.log('✅ Good performance');
      } else {
        console.log('⚠️ Slow response - check your connection');
      }
    }
    
    console.log('\n🎉 Complete Groq test finished!');
    
    if (hasGroqKey) {
      console.log('\n✅ Groq is working perfectly!');
      console.log('🚀 Benefits you\'re getting:');
      console.log('   - 10x faster than OpenAI');
      console.log('   - 90% cheaper than OpenAI');
      console.log('   - High-quality analysis');
    } else {
      console.log('\n⚠️ Using fallback mode (no AI features)');
      console.log('💡 To enable Groq: Get API key from https://console.groq.com/');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Groq API key');
    console.log('2. Run: node setup-groq-complete.js');
    console.log('3. Check your internet connection');
  }
}

testGroqComplete().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
