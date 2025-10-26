const { Drug, SideEffect, User } = require('./server/models/firebaseModels');
require('dotenv').config();

async function seedTestData() {
  try {
    console.log('🔥 Starting to seed test data for analytics...\n');
    
    // 1. First, seed drugs if they don't exist
    console.log('1️⃣ Checking for drugs...');
    const drugModel = new Drug();
    const existingDrugs = await drugModel.count();
    
    if (existingDrugs === 0) {
      console.log('📦 No drugs found. Please run: node seed-drugs-firebase.js first');
      return;
    }
    
    console.log(`✅ Found ${existingDrugs} drugs in database`);
    
    // 2. Get some drugs to create side effects for
    const drugs = await drugModel.findAll({ isActive: true });
    const lisinopril = drugs.find(d => d.name === 'Lisinopril');
    const metformin = drugs.find(d => d.name === 'Metformin');
    const atorvastatin = drugs.find(d => d.name === 'Atorvastatin');
    
    if (!lisinopril || !metformin || !atorvastatin) {
      console.log('❌ Required drugs not found. Please run: node seed-drugs-firebase.js');
      return;
    }
    
    // 3. Create test users (patients)
    console.log('2️⃣ Creating test users...');
    const userModel = new User();
    
    // Create test patients
    const testPatients = [
      {
        email: 'patient1@test.com',
        password: 'testpass123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        dateOfBirth: '1985-01-15',
        phone: '555-0101',
        address: '123 Test St',
        isActive: true
      },
      {
        email: 'patient2@test.com',
        password: 'testpass123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'patient',
        dateOfBirth: '1990-05-20',
        phone: '555-0102',
        address: '456 Test Ave',
        isActive: true
      }
    ];
    
    const createdPatients = [];
    for (const patientData of testPatients) {
      const existingUser = await userModel.findByEmail(patientData.email);
      if (!existingUser) {
        const patient = await userModel.create(patientData);
        createdPatients.push(patient);
        console.log(`✅ Created patient: ${patient.firstName} ${patient.lastName}`);
      } else {
        createdPatients.push(existingUser);
        console.log(`✅ Found existing patient: ${existingUser.firstName} ${existingUser.lastName}`);
      }
    }
    
    // 4. Create side effects data with patterns that will trigger alerts
    console.log('3️⃣ Creating side effects data...');
    const sideEffectModel = new SideEffect();
    
    const sideEffectsData = [
      // Recent side effects for Lisinopril (should trigger spike alert)
      {
        patientId: createdPatients[0].id,
        drugId: lisinopril.id,
        description: 'Severe dry cough that started 2 days ago',
        severity: 'severe',
        impactOnDailyLife: 'Cannot sleep due to constant coughing',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        patientId: createdPatients[1].id,
        drugId: lisinopril.id,
        description: 'Persistent dry cough for 3 days',
        severity: 'moderate',
        impactOnDailyLife: 'Difficulty speaking and sleeping',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        patientId: createdPatients[0].id,
        drugId: lisinopril.id,
        description: 'Dry cough started this morning',
        severity: 'mild',
        impactOnDailyLife: 'Slight discomfort',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      // Historical data for baseline (older side effects)
      {
        patientId: createdPatients[0].id,
        drugId: lisinopril.id,
        description: 'Mild dizziness',
        severity: 'mild',
        impactOnDailyLife: 'None',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
      },
      // Metformin side effects
      {
        patientId: createdPatients[1].id,
        drugId: metformin.id,
        description: 'Severe nausea and vomiting',
        severity: 'severe',
        impactOnDailyLife: 'Cannot eat or work',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        patientId: createdPatients[0].id,
        drugId: metformin.id,
        description: 'Diarrhea and stomach upset',
        severity: 'moderate',
        impactOnDailyLife: 'Frequent bathroom visits',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      // Atorvastatin side effects
      {
        patientId: createdPatients[1].id,
        drugId: atorvastatin.id,
        description: 'Muscle pain and weakness',
        severity: 'moderate',
        impactOnDailyLife: 'Difficulty walking and lifting',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ];
    
    const createdSideEffects = [];
    for (const seData of sideEffectsData) {
      const sideEffect = await sideEffectModel.create(seData);
      createdSideEffects.push(sideEffect);
    }
    
    console.log(`✅ Created ${createdSideEffects.length} side effects`);
    
    // 5. Summary
    console.log('\n📊 Test Data Summary:');
    console.log(`- Drugs: ${drugs.length}`);
    console.log(`- Patients: ${createdPatients.length}`);
    console.log(`- Side Effects: ${createdSideEffects.length}`);
    console.log(`- Recent side effects (last 7 days): ${sideEffectsData.filter(se => 
      new Date(se.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length}`);
    
    console.log('\n🎉 Test data seeding completed!');
    console.log('\nNow you can:');
    console.log('1. Run: node test-analytics-service.js');
    console.log('2. Check for side effect spike alerts');
    console.log('3. View analytics reports');
    console.log('4. Test the registration system');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Firebase is configured');
    console.log('2. Run: node seed-drugs-firebase.js first');
    console.log('3. Check your .env file');
  }
}

// Run the seeding function
seedTestData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
