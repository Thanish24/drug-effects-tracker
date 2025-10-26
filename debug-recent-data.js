// Debug recent data detection
require('dotenv').config();
const { Drug, SideEffect, User } = require('./server/models/firebaseModels');

async function debugRecentData() {
  try {
    console.log('🔍 Debugging recent data detection...\n');
    
    const drugModel = new Drug();
    const sideEffectModel = new SideEffect();
    
    // 1. Get all side effects
    const allSideEffects = await sideEffectModel.findAll();
    console.log(`📊 Total side effects: ${allSideEffects.length}`);
    
    // 2. Check recent side effects (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSideEffects = allSideEffects.filter(se => 
      se.createdAt && new Date(se.createdAt) >= sevenDaysAgo
    );
    
    console.log(`📈 Recent side effects (last 7 days): ${recentSideEffects.length}`);
    
    if (recentSideEffects.length > 0) {
      console.log('\n🔍 Recent side effects details:');
      recentSideEffects.forEach((se, index) => {
        console.log(`   ${index + 1}. ${se.description}`);
        console.log(`      - Drug ID: ${se.drugId}`);
        console.log(`      - Severity: ${se.severity}`);
        console.log(`      - Anonymous: ${se.isAnonymous}`);
        console.log(`      - Created: ${se.createdAt}`);
        console.log('');
      });
    }
    
    // 3. Check anonymous side effects
    const anonymousSideEffects = allSideEffects.filter(se => se.isAnonymous === true);
    console.log(`👤 Anonymous side effects: ${anonymousSideEffects.length}`);
    
    // 4. Check side effects by drug
    const drugs = await drugModel.findAll({ isActive: true });
    console.log(`💊 Active drugs: ${drugs.length}`);
    
    if (drugs.length > 0) {
      const firstDrug = drugs[0];
      console.log(`\n🔍 Side effects for first drug (${firstDrug.name}):`);
      
      const drugSideEffects = allSideEffects.filter(se => se.drugId === firstDrug.id);
      console.log(`   - Total: ${drugSideEffects.length}`);
      
      const recentDrugSideEffects = drugSideEffects.filter(se => 
        se.createdAt && new Date(se.createdAt) >= sevenDaysAgo
      );
      console.log(`   - Recent: ${recentDrugSideEffects.length}`);
      
      const anonymousDrugSideEffects = drugSideEffects.filter(se => 
        se.isAnonymous === true && 
        se.createdAt && 
        new Date(se.createdAt) >= sevenDaysAgo
      );
      console.log(`   - Recent + Anonymous: ${anonymousDrugSideEffects.length}`);
      
      if (anonymousDrugSideEffects.length > 0) {
        console.log('\n   Recent anonymous side effects for this drug:');
        anonymousDrugSideEffects.forEach((se, index) => {
          console.log(`     ${index + 1}. ${se.description} (${se.severity})`);
          console.log(`        Created: ${se.createdAt}`);
        });
      }
    }
    
    // 5. Check date format issues
    console.log('\n📅 Date format check:');
    const sampleSideEffect = allSideEffects[0];
    if (sampleSideEffect) {
      console.log(`   Sample createdAt: ${sampleSideEffect.createdAt}`);
      console.log(`   Type: ${typeof sampleSideEffect.createdAt}`);
      console.log(`   Parsed date: ${new Date(sampleSideEffect.createdAt)}`);
      console.log(`   Is valid: ${!isNaN(new Date(sampleSideEffect.createdAt).getTime())}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugRecentData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
