// Create recent test data for analytics
require('dotenv').config();
const { Drug, SideEffect, User } = require('./server/models/firebaseModels');

async function createRecentTestData() {
  try {
    console.log('🔄 Creating recent test data for analytics...\n');
    
    const drugModel = new Drug();
    const sideEffectModel = new SideEffect();
    const userModel = new User();
    
    // 1. Get or create test user
    let testUser = await userModel.findByEmail('analytics-test@example.com');
    if (!testUser) {
      testUser = await userModel.create({
        email: 'analytics-test@example.com',
        password: 'testpass123',
        firstName: 'Analytics',
        lastName: 'Test',
        role: 'patient',
        dateOfBirth: '1985-01-01',
        phone: '555-0000',
        address: '123 Test St',
        isActive: true
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // 2. Get active drugs
    const drugs = await drugModel.findAll({ isActive: true });
    if (drugs.length === 0) {
      console.log('❌ No active drugs found. Please run: node seed-drugs-firebase.js');
      return;
    }
    
    console.log(`📊 Found ${drugs.length} active drugs`);
    
    // 3. Create recent side effects (last 7 days)
    const now = new Date();
    const recentSideEffects = [
      {
        patientId: testUser.id,
        drugId: drugs[0].id,
        description: 'Severe persistent dry cough that started 3 days ago',
        severity: 'severe',
        impactOnDailyLife: 'Cannot sleep, constant coughing at night',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[0].id,
        description: 'Dry cough and throat irritation',
        severity: 'moderate',
        impactOnDailyLife: 'Difficulty speaking and sleeping',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[0].id,
        description: 'Mild cough and throat clearing',
        severity: 'mild',
        impactOnDailyLife: 'Slight discomfort',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[1] ? drugs[1].id : drugs[0].id,
        description: 'Severe nausea and vomiting after taking medication',
        severity: 'severe',
        impactOnDailyLife: 'Cannot eat or work, constant vomiting',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[1] ? drugs[1].id : drugs[0].id,
        description: 'Mild stomach upset and nausea',
        severity: 'mild',
        impactOnDailyLife: 'Slight discomfort after meals',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[2] ? drugs[2].id : drugs[0].id,
        description: 'Severe muscle pain and weakness',
        severity: 'severe',
        impactOnDailyLife: 'Cannot walk or perform daily activities',
        isAnonymous: true,
        isConcerning: true,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[2] ? drugs[2].id : drugs[0].id,
        description: 'Mild muscle aches',
        severity: 'mild',
        impactOnDailyLife: 'Slight discomfort during exercise',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    // Create side effects
    for (const seData of recentSideEffects) {
      await sideEffectModel.create(seData);
    }
    
    console.log(`✅ Created ${recentSideEffects.length} recent side effects`);
    
    // 4. Create some older side effects for comparison (baseline)
    const olderSideEffects = [
      {
        patientId: testUser.id,
        drugId: drugs[0].id,
        description: 'Occasional mild cough',
        severity: 'mild',
        impactOnDailyLife: 'Minimal impact',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: testUser.id,
        drugId: drugs[1] ? drugs[1].id : drugs[0].id,
        description: 'Mild digestive discomfort',
        severity: 'mild',
        impactOnDailyLife: 'Minimal impact',
        isAnonymous: true,
        isConcerning: false,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const seData of olderSideEffects) {
      await sideEffectModel.create(seData);
    }
    
    console.log(`✅ Created ${olderSideEffects.length} baseline side effects`);
    
    // 5. Summary
    const totalSideEffects = await sideEffectModel.count();
    const recentCount = await sideEffectModel.findAll().then(se => 
      se.filter(s => s.createdAt && new Date(s.createdAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length
    );
    
    console.log('\n📊 Data Summary:');
    console.log(`   - Total side effects: ${totalSideEffects}`);
    console.log(`   - Recent side effects (last 7 days): ${recentCount}`);
    console.log(`   - Test user: ${testUser.email}`);
    console.log(`   - Active drugs: ${drugs.length}`);
    
    console.log('\n🎉 Recent test data created successfully!');
    console.log('\n🧪 Now test with: node test-groq-complete.js');
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error.message);
  }
}

createRecentTestData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
