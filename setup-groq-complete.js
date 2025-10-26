const { db } = require('./server/config/firebase');
const { Drug, SideEffect, User } = require('./server/models/firebaseModels');

async function setupGroqComplete() {
  console.log('🚀 Setting up Drug Effects Tracker with Groq AI...\n');

  try {
    // 1. Test Firebase connection
    console.log('1️⃣ Testing Firebase connection...');
    await db.collection('test').doc('groq-setup').set({ 
      test: true, 
      timestamp: new Date(),
      aiProvider: 'groq'
    });
    console.log('✅ Firebase connection successful\n');

    // 2. Check for existing data
    console.log('2️⃣ Checking for existing data...');
    const drugModel = new Drug();
    const sideEffectModel = new SideEffect();
    const userModel = new User();
    
    const drugCount = await drugModel.count();
    const sideEffectCount = await sideEffectModel.count();
    const userCount = await userModel.count();
    
    console.log(`📊 Current Database Status:`);
    console.log(`   - Drugs: ${drugCount}`);
    console.log(`   - Side Effects: ${sideEffectCount}`);
    console.log(`   - Users: ${userCount}\n`);

    // 3. Seed drugs if needed
    if (drugCount === 0) {
      console.log('3️⃣ Seeding drugs...');
      const exampleDrugs = [
        {
          name: "Lisinopril",
          genericName: "Lisinopril",
          manufacturer: "Various",
          drugClass: "ACE Inhibitor",
          description: "Used to treat high blood pressure and heart failure",
          commonSideEffects: ["dry cough", "dizziness", "fatigue", "headache"],
          contraindications: ["pregnancy", "angioedema history", "bilateral renal artery stenosis"],
          dosageForms: ["tablet", "oral solution"],
          fdaApprovalDate: "1987-12-29",
          isActive: true
        },
        {
          name: "Metformin",
          genericName: "Metformin",
          manufacturer: "Various",
          drugClass: "Biguanide",
          description: "First-line treatment for type 2 diabetes",
          commonSideEffects: ["nausea", "diarrhea", "stomach upset", "metallic taste"],
          contraindications: ["severe kidney disease", "liver disease", "heart failure"],
          dosageForms: ["tablet", "extended-release tablet"],
          fdaApprovalDate: "1994-12-29",
          isActive: true
        },
        {
          name: "Atorvastatin",
          genericName: "Atorvastatin",
          manufacturer: "Various",
          drugClass: "Statin",
          description: "Used to lower cholesterol and prevent cardiovascular disease",
          commonSideEffects: ["muscle pain", "liver enzyme elevation", "digestive problems"],
          contraindications: ["active liver disease", "pregnancy", "lactation"],
          dosageForms: ["tablet"],
          fdaApprovalDate: "1996-12-17",
          isActive: true
        }
      ];
      
      for (const drugData of exampleDrugs) {
        await drugModel.create(drugData);
      }
      console.log(`✅ Created ${exampleDrugs.length} drugs\n`);
    } else {
      console.log('✅ Drugs already exist\n');
    }

    // 4. Create test user if needed
    let testUser = await userModel.findByEmail('groq-test@example.com');
    if (!testUser) {
      console.log('4️⃣ Creating test user...');
      testUser = await userModel.create({
        email: 'groq-test@example.com',
        password: 'testpass123',
        firstName: 'Groq',
        lastName: 'Test',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        phone: '555-0000',
        address: '123 Test St',
        isActive: true
      });
      console.log('✅ Test user created\n');
    } else {
      console.log('✅ Test user already exists\n');
    }

    // 5. Create recent side effects for testing
    console.log('5️⃣ Creating recent side effects for testing...');
    const drugs = await drugModel.findAll({ isActive: true });
    const lisinopril = drugs.find(d => d.name === 'Lisinopril');
    const metformin = drugs.find(d => d.name === 'Metformin');
    
    if (lisinopril && metformin) {
      const now = new Date();
      const recentSideEffects = [
        {
          patientId: testUser.id,
          drugId: lisinopril.id,
          description: 'Severe persistent dry cough that started 2 days ago',
          severity: 'severe',
          impactOnDailyLife: 'Cannot sleep, constant coughing at night',
          isAnonymous: true,
          isConcerning: true,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          patientId: testUser.id,
          drugId: lisinopril.id,
          description: 'Dry cough and throat irritation',
          severity: 'moderate',
          impactOnDailyLife: 'Difficulty speaking and sleeping',
          isAnonymous: true,
          isConcerning: true,
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          patientId: testUser.id,
          drugId: metformin.id,
          description: 'Severe nausea and vomiting after taking medication',
          severity: 'severe',
          impactOnDailyLife: 'Cannot eat or work, constant vomiting',
          isAnonymous: true,
          isConcerning: true,
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
        }
      ];
      
      for (const seData of recentSideEffects) {
        await sideEffectModel.create(seData);
      }
      console.log(`✅ Created ${recentSideEffects.length} recent side effects\n`);
    }

    // 6. Test Groq integration
    console.log('6️⃣ Testing Groq integration...');
    const LLMService = require('./server/services/llmService');
    
    if (process.env.GROQ_API_KEY && 
        process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && 
        process.env.GROQ_API_KEY !== 'skip_llm_features') {
      
      console.log('🧠 Testing Groq AI analysis...');
      const testAnalysis = await LLMService.analyzeSideEffect({
        description: 'Severe persistent dry cough',
        severity: 'severe',
        impactOnDailyLife: 'Cannot sleep',
        drugName: 'Lisinopril',
        patientAge: 30,
        otherMedications: []
      });
      
      console.log('✅ Groq AI analysis successful!');
      console.log(`   - Concern Level: ${testAnalysis.concernLevel}`);
      console.log(`   - Urgency: ${testAnalysis.urgency}`);
      console.log(`   - Recommendations: ${testAnalysis.recommendations.length} items\n`);
    } else {
      console.log('⚠️ Groq API key not configured. Using fallback mode.\n');
    }

    // 7. Test analytics service
    console.log('7️⃣ Testing analytics service...');
    const AnalyticsService = require('./server/services/analyticsService');
    
    const report = await AnalyticsService.generateAnalyticsReport();
    console.log('📊 Analytics Report:');
    console.log(`   - Time Window: ${report.timeWindow} days`);
    console.log(`   - Total Side Effects: ${report.totalSideEffects}`);
    console.log(`   - Drug Stats: ${Object.keys(report.drugStats).length} drugs\n`);

    // 8. Summary
    console.log('🎉 Groq setup completed successfully!\n');
    console.log('📋 Next Steps:');
    console.log('1. Get Groq API key from https://console.groq.com/');
    console.log('2. Add GROQ_API_KEY=your_key_here to .env file');
    console.log('3. Run: node test-groq-integration.js');
    console.log('4. Start your server: node server/index.js');
    console.log('5. Test registration: node test-registration.js\n');
    
    console.log('🚀 Benefits of Groq:');
    console.log('   - 10x faster than OpenAI');
    console.log('   - 90% cheaper than OpenAI');
    console.log('   - Same API format');
    console.log('   - Open source models');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Firebase configuration');
    console.log('2. Verify your .env file');
    console.log('3. Make sure you have internet connection');
  }
}

setupGroqComplete().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
