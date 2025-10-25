const { db } = require('./server/config/firebase');
const { Drug, SideEffect, Prescription, User, AnalyticsAlert } = require('./server/models/firebaseModels');

async function populateAnalyticsReportData() {
  console.log('📊 Populating Firestore with Analytics Report Data...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing Firebase connection...');
    await db.collection('test').doc('analytics-setup').set({ test: true });
    console.log('✅ Firebase connection successful\n');

    // Create test users (patients and doctors)
    console.log('2️⃣ Creating test users...');
    const userModel = new User();
    
    const testUsers = [
      {
        email: 'doctor3@test.com',
        password: 'password123',
        firstName: 'Dr. Emily',
        lastName: 'Chen',
        role: 'doctor',
        licenseNumber: 'MD345678',
        specialization: 'Endocrinology'
      },
      {
        email: 'patient6@test.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Miller',
        role: 'patient',
        dateOfBirth: '1988-12-03',
        phoneNumber: '+1234567895'
      },
      {
        email: 'patient7@test.com',
        password: 'password123',
        firstName: 'Lisa',
        lastName: 'Garcia',
        role: 'patient',
        dateOfBirth: '1992-04-25',
        phoneNumber: '+1234567896'
      },
      {
        email: 'patient8@test.com',
        password: 'password123',
        firstName: 'Tom',
        lastName: 'Anderson',
        role: 'patient',
        dateOfBirth: '1975-08-14',
        phoneNumber: '+1234567897'
      },
      {
        email: 'patient9@test.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Taylor',
        role: 'patient',
        dateOfBirth: '1985-11-30',
        phoneNumber: '+1234567898'
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await userModel.create(userData);
      createdUsers.push(user);
      console.log(`✅ Created ${userData.role}: ${userData.firstName} ${userData.lastName}`);
    }

    const doctor = createdUsers.find(u => u.role === 'doctor');
    const patients = createdUsers.filter(u => u.role === 'patient');

    // Create diverse test drugs for comprehensive analytics
    console.log('\n3️⃣ Creating diverse test drugs...');
    const drugModel = new Drug();
    
    const testDrugs = [
      {
        name: "Metformin",
        genericName: "Metformin",
        manufacturer: "Various",
        drugClass: "Biguanide",
        description: "First-line treatment for type 2 diabetes",
        commonSideEffects: ["nausea", "diarrhea", "stomach upset", "metallic taste"],
        contraindications: ["kidney disease", "liver disease", "heart failure"],
        dosageForms: ["tablet", "extended-release tablet"],
        fdaApprovalDate: "1994-12-29",
        isActive: true
      },
      {
        name: "Atorvastatin",
        genericName: "Atorvastatin",
        manufacturer: "Various",
        drugClass: "Statin",
        description: "Used to lower cholesterol and prevent cardiovascular events",
        commonSideEffects: ["muscle pain", "liver problems", "digestive issues"],
        contraindications: ["active liver disease", "pregnancy"],
        dosageForms: ["tablet"],
        fdaApprovalDate: "1996-12-17",
        isActive: true
      },
      {
        name: "Omeprazole",
        genericName: "Omeprazole",
        manufacturer: "Various",
        drugClass: "Proton Pump Inhibitor",
        description: "Used to treat acid reflux and stomach ulcers",
        commonSideEffects: ["headache", "nausea", "diarrhea", "stomach pain"],
        contraindications: ["hypersensitivity to PPIs"],
        dosageForms: ["capsule", "tablet"],
        fdaApprovalDate: "1989-09-13",
        isActive: true
      },
      {
        name: "Sertraline",
        genericName: "Sertraline",
        manufacturer: "Various",
        drugClass: "SSRI",
        description: "Antidepressant used to treat depression and anxiety",
        commonSideEffects: ["nausea", "insomnia", "dizziness", "dry mouth"],
        contraindications: ["MAOI use", "pimozide use"],
        dosageForms: ["tablet", "oral concentrate"],
        fdaApprovalDate: "1991-12-30",
        isActive: true
      },
      {
        name: "Losartan",
        genericName: "Losartan",
        manufacturer: "Various",
        drugClass: "ARB",
        description: "Used to treat high blood pressure and diabetic kidney disease",
        commonSideEffects: ["dizziness", "fatigue", "cough", "chest pain"],
        contraindications: ["pregnancy", "severe liver disease"],
        dosageForms: ["tablet"],
        fdaApprovalDate: "1995-04-14",
        isActive: true
      }
    ];

    const createdDrugs = [];
    for (const drugData of testDrugs) {
      const drug = await drugModel.create(drugData);
      createdDrugs.push(drug);
      console.log(`✅ Created drug: ${drugData.name}`);
    }

    // Create prescriptions for different drugs
    console.log('\n4️⃣ Creating prescriptions...');
    const prescriptionModel = new Prescription();
    
    const prescriptions = [];
    
    // Create prescriptions for each patient with different drugs
    const prescriptionData = [
      { patient: patients[0], drug: createdDrugs[0], dosage: '500mg', frequency: 'twice daily' }, // Metformin
      { patient: patients[1], drug: createdDrugs[1], dosage: '20mg', frequency: 'once daily' },   // Atorvastatin
      { patient: patients[2], drug: createdDrugs[2], dosage: '20mg', frequency: 'once daily' }, // Omeprazole
      { patient: patients[3], drug: createdDrugs[3], dosage: '50mg', frequency: 'once daily' }, // Sertraline
      { patient: patients[4], drug: createdDrugs[4], dosage: '50mg', frequency: 'once daily' }, // Losartan
    ];

    for (const data of prescriptionData) {
      const prescription = await prescriptionModel.create({
        patientId: data.patient.id,
        doctorId: doctor.id,
        drugId: data.drug.id,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        instructions: 'Take as directed'
      });
      prescriptions.push(prescription);
      console.log(`✅ Created prescription for ${data.patient.firstName} - ${data.drug.name}`);
    }

    // Create diverse side effects for analytics
    console.log('\n5️⃣ Creating diverse side effects for analytics...');
    const sideEffectModel = new SideEffect();
    
    // Side effects data organized by drug and severity
    const sideEffectsData = [
      // Metformin side effects
      { drug: createdDrugs[0], effects: [
        { description: 'Mild nausea after meals', severity: 'mild', isConcerning: false },
        { description: 'Occasional diarrhea', severity: 'mild', isConcerning: false },
        { description: 'Stomach upset', severity: 'mild', isConcerning: false },
        { description: 'Metallic taste in mouth', severity: 'mild', isConcerning: false },
        { description: 'Severe nausea and vomiting', severity: 'severe', isConcerning: true },
        { description: 'Persistent diarrhea', severity: 'moderate', isConcerning: true }
      ]},
      // Atorvastatin side effects
      { drug: createdDrugs[1], effects: [
        { description: 'Mild muscle aches', severity: 'mild', isConcerning: false },
        { description: 'Occasional headache', severity: 'mild', isConcerning: false },
        { description: 'Digestive discomfort', severity: 'mild', isConcerning: false },
        { description: 'Severe muscle pain', severity: 'severe', isConcerning: true },
        { description: 'Liver enzyme elevation', severity: 'moderate', isConcerning: true },
        { description: 'Memory problems', severity: 'moderate', isConcerning: true }
      ]},
      // Omeprazole side effects
      { drug: createdDrugs[2], effects: [
        { description: 'Mild headache', severity: 'mild', isConcerning: false },
        { description: 'Occasional nausea', severity: 'mild', isConcerning: false },
        { description: 'Stomach pain', severity: 'mild', isConcerning: false },
        { description: 'Diarrhea', severity: 'mild', isConcerning: false },
        { description: 'Severe headache', severity: 'severe', isConcerning: true },
        { description: 'Persistent nausea', severity: 'moderate', isConcerning: true }
      ]},
      // Sertraline side effects
      { drug: createdDrugs[3], effects: [
        { description: 'Mild nausea', severity: 'mild', isConcerning: false },
        { description: 'Insomnia', severity: 'mild', isConcerning: false },
        { description: 'Dizziness', severity: 'mild', isConcerning: false },
        { description: 'Dry mouth', severity: 'mild', isConcerning: false },
        { description: 'Severe anxiety', severity: 'severe', isConcerning: true },
        { description: 'Suicidal thoughts', severity: 'severe', isConcerning: true }
      ]},
      // Losartan side effects
      { drug: createdDrugs[4], effects: [
        { description: 'Mild dizziness', severity: 'mild', isConcerning: false },
        { description: 'Fatigue', severity: 'mild', isConcerning: false },
        { description: 'Dry cough', severity: 'mild', isConcerning: false },
        { description: 'Chest pain', severity: 'moderate', isConcerning: true },
        { description: 'Severe dizziness', severity: 'severe', isConcerning: true },
        { description: 'Fainting episodes', severity: 'severe', isConcerning: true }
      ]}
    ];

    let totalSideEffects = 0;
    for (const drugData of sideEffectsData) {
      const prescription = prescriptions.find(p => p.drugId === drugData.drug.id);
      
      for (const effect of drugData.effects) {
        // Create multiple instances of each side effect over time
        const instances = Math.floor(Math.random() * 5) + 1; // 1-5 instances
        
        for (let i = 0; i < instances; i++) {
          const effectDate = new Date();
          effectDate.setDate(effectDate.getDate() - Math.random() * 30); // Last 30 days
          
          await sideEffectModel.create({
            ...effect,
            prescriptionId: prescription.id,
            drugId: drugData.drug.id,
            patientId: prescription.patientId,
            isAnonymous: true,
            createdAt: effectDate
          });
          totalSideEffects++;
        }
      }
    }

    console.log(`✅ Created ${totalSideEffects} diverse side effects`);

    // Create some existing analytics alerts for context
    console.log('\n6️⃣ Creating existing analytics alerts...');
    const analyticsAlertModel = new AnalyticsAlert();
    
    const existingAlerts = [
      {
        alertType: 'side_effect_spike',
        title: 'Side Effect Spike Detected for Metformin',
        description: 'A 25% increase in side effects has been detected for Metformin over the past 30 days.',
        severity: 'medium',
        drugIds: [createdDrugs[0].id],
        affectedPatientCount: 12,
        confidenceScore: 0.85,
        isResolved: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        dataPoints: {
          recentRate: 0.4,
          baselineRate: 0.32,
          increaseRatio: 0.25,
          timeWindow: 30
        },
        recommendations: [
          'Review prescribing guidelines',
          'Consider additional monitoring',
          'Investigate potential causes'
        ]
      },
      {
        alertType: 'drug_interaction',
        title: 'Potential Drug Interaction Detected: Atorvastatin + Grapefruit',
        description: 'Grapefruit consumption may increase Atorvastatin levels, increasing risk of side effects.',
        severity: 'high',
        drugIds: [createdDrugs[1].id],
        affectedPatientCount: 3,
        confidenceScore: 0.92,
        isResolved: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        dataPoints: {
          analysis: {
            hasInteractions: true,
            confidence: 0.92,
            severity: 'major',
            description: 'Grapefruit inhibits CYP3A4 enzyme, increasing statin levels'
          }
        },
        recommendations: [
          'Advise patients to avoid grapefruit',
          'Monitor for muscle pain symptoms',
          'Consider dose reduction if needed'
        ]
      }
    ];

    for (const alertData of existingAlerts) {
      await analyticsAlertModel.create(alertData);
      console.log(`✅ Created alert: ${alertData.title}`);
    }

    // Clean up test data
    console.log('\n7️⃣ Cleaning up test data...');
    await db.collection('test').doc('analytics-setup').delete();
    console.log('✅ Cleanup complete\n');

    console.log('🎉 Analytics Report Data Population Complete!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdUsers.length} users (1 doctor, ${patients.length} patients)`);
    console.log(`- Created ${createdDrugs.length} diverse drugs across different classes`);
    console.log(`- Created ${prescriptions.length} prescriptions`);
    console.log(`- Created ${totalSideEffects} diverse side effects`);
    console.log(`- Created ${existingAlerts.length} existing analytics alerts`);
    console.log('\n📈 This data will generate comprehensive analytics reports!');
    console.log('   - Side effect trends across different drug classes');
    console.log('   - Severity distribution analysis');
    console.log('   - Drug-specific side effect patterns');
    console.log('   - Patient safety insights');
    console.log('   Run the analytics service to generate detailed reports.');

  } catch (error) {
    console.error('❌ Analytics report data population failed:', error.message);
  }
}

// Run the script
populateAnalyticsReportData();
