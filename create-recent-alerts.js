const { SideEffect, Drug, User } = require('./server/models/firebaseModels');
require('dotenv').config();

async function createRecentAlerts() {
  try {
    console.log('🚨 Creating recent side effects to trigger alerts...\n');
    
    // 1. Get some drugs
    const drugModel = new Drug();
    const drugs = await drugModel.findAll({ isActive: true });
    
    if (drugs.length === 0) {
      console.log('❌ No drugs found. Please run: node seed-drugs-firebase.js');
      return;
    }
    
    const lisinopril = drugs.find(d => d.name === 'Lisinopril');
    const metformin = drugs.find(d => d.name === 'Metformin');
    const atorvastatin = drugs.find(d => d.name === 'Atorvastatin');
    
    if (!lisinopril || !metformin || !atorvastatin) {
      console.log('❌ Required drugs not found. Please run: node seed-drugs-firebase.js');
      return;
    }
    
    // 2. Create test users if they don't exist
    const userModel = new User();
    let testPatient = await userModel.findByEmail('alert-test@example.com');
    
    if (!testPatient) {
      testPatient = await userModel.create({
        email: 'alert-test@example.com',
        password: 'testpass123',
        firstName: 'Alert',
        lastName: 'Test',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        phone: '555-0000',
        address: '123 Alert St',
        isActive: true
      });
      console.log('✅ Created test patient');
    } else {
      console.log('✅ Found existing test patient');
    }
    
    // 3. Create recent side effects (last 7 days) to trigger alerts
    const sideEffectModel = new SideEffect();
    const now = new Date();
    
    const recentSideEffects = [
      // Lisinopril - should trigger spike alert
      {
        patientId: testPatient.id,
        drugId: lisinopril.id,
        description: 'Severe persistent dry cough that started 2 days ago',
        severity: 'severe',
        impactOnDailyLife: 'Cannot sleep, constant coughing at night',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        patientId: testPatient.id,
        drugId: lisinopril.id,
        description: 'Dry cough and throat irritation',
        severity: 'moderate',
        impactOnDailyLife: 'Difficulty speaking and sleeping',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        patientId: testPatient.id,
        drugId: lisinopril.id,
        description: 'Mild dry cough started this morning',
        severity: 'mild',
        impactOnDailyLife: 'Slight discomfort',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      // Metformin - should trigger spike alert
      {
        patientId: testPatient.id,
        drugId: metformin.id,
        description: 'Severe nausea and vomiting after taking medication',
        severity: 'severe',
        impactOnDailyLife: 'Cannot eat or work, constant vomiting',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        patientId: testPatient.id,
        drugId: metformin.id,
        description: 'Diarrhea and stomach cramps',
        severity: 'moderate',
        impactOnDailyLife: 'Frequent bathroom visits, cannot leave house',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      // Atorvastatin - should trigger spike alert
      {
        patientId: testPatient.id,
        drugId: atorvastatin.id,
        description: 'Severe muscle pain and weakness in legs',
        severity: 'severe',
        impactOnDailyLife: 'Cannot walk properly, constant pain',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        patientId: testPatient.id,
        drugId: atorvastatin.id,
        description: 'Muscle aches and fatigue',
        severity: 'moderate',
        impactOnDailyLife: 'Difficulty with daily activities',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];
    
    console.log('📝 Creating recent side effects...');
    const createdSideEffects = [];
    for (const seData of recentSideEffects) {
      const sideEffect = await sideEffectModel.create(seData);
      createdSideEffects.push(sideEffect);
    }
    
    console.log(`✅ Created ${createdSideEffects.length} recent side effects`);
    
    // 4. Show summary
    console.log('\n📊 Recent Side Effects Summary:');
    console.log(`- Total created: ${createdSideEffects.length}`);
    console.log(`- Severe side effects: ${createdSideEffects.filter(se => se.severity === 'severe').length}`);
    console.log(`- Concerning side effects: ${createdSideEffects.filter(se => se.isConcerning).length}`);
    console.log(`- Last 7 days: ${createdSideEffects.filter(se => 
      new Date(se.createdAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length}`);
    
    console.log('\n🎉 Recent alert data created successfully!');
    console.log('\nNow run: node test-analytics-direct.js');
    console.log('You should see alerts being generated!');
    
  } catch (error) {
    console.error('❌ Error creating recent alerts:', error.message);
  }
}

createRecentAlerts().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
