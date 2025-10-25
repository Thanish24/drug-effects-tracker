const { db } = require('./server/config/firebase');
const { Drug, SideEffect, Prescription, User } = require('./server/models/firebaseModels');

async function populateSideEffectSpikeData() {
  console.log('🚨 Populating Firestore with Side Effect Spike Alert Data...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing Firebase connection...');
    await db.collection('test').doc('spike-setup').set({ test: true });
    console.log('✅ Firebase connection successful\n');

    // Create test users (patients and doctors)
    console.log('2️⃣ Creating test users...');
    const userModel = new User();
    
    const testUsers = [
      {
        email: 'doctor1@test.com',
        password: 'password123',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'doctor',
        licenseNumber: 'MD123456',
        specialization: 'Internal Medicine'
      },
      {
        email: 'patient1@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'patient',
        dateOfBirth: '1985-03-15',
        phoneNumber: '+1234567890'
      },
      {
        email: 'patient2@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'patient',
        dateOfBirth: '1990-07-22',
        phoneNumber: '+1234567891'
      },
      {
        email: 'patient3@test.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'patient',
        dateOfBirth: '1978-11-08',
        phoneNumber: '+1234567892'
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

    // Create test drugs
    console.log('\n3️⃣ Creating test drugs...');
    const drugModel = new Drug();
    
    const testDrugs = [
      {
        name: "Lisinopril",
        genericName: "Lisinopril",
        manufacturer: "Various",
        drugClass: "ACE Inhibitor",
        description: "Used to treat high blood pressure and heart failure",
        commonSideEffects: ["dry cough", "dizziness", "fatigue", "headache"],
        contraindications: ["pregnancy", "angioedema history"],
        dosageForms: ["tablet", "oral solution"],
        fdaApprovalDate: "1987-12-29",
        isActive: true
      },
      {
        name: "Metformin",
        genericName: "Metformin",
        manufacturer: "Various",
        drugClass: "Biguanide",
        description: "Used to treat type 2 diabetes",
        commonSideEffects: ["nausea", "diarrhea", "stomach upset"],
        contraindications: ["kidney disease", "liver disease"],
        dosageForms: ["tablet", "extended-release tablet"],
        fdaApprovalDate: "1994-12-29",
        isActive: true
      }
    ];

    const createdDrugs = [];
    for (const drugData of testDrugs) {
      const drug = await drugModel.create(drugData);
      createdDrugs.push(drug);
      console.log(`✅ Created drug: ${drugData.name}`);
    }

    // Create prescriptions
    console.log('\n4️⃣ Creating prescriptions...');
    const prescriptionModel = new Prescription();
    
    const prescriptions = [];
    for (let i = 0; i < patients.length; i++) {
      const prescription = await prescriptionModel.create({
        patientId: patients[i].id,
        doctorId: doctor.id,
        drugId: createdDrugs[0].id, // All patients on Lisinopril
        dosage: '10mg',
        frequency: 'once daily',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        instructions: 'Take with food'
      });
      prescriptions.push(prescription);
      console.log(`✅ Created prescription for ${patients[i].firstName}`);
    }

    // Create baseline side effects (older data - 60-30 days ago)
    console.log('\n5️⃣ Creating baseline side effects (older data)...');
    const sideEffectModel = new SideEffect();
    
    const baselineSideEffects = [
      { description: 'Mild dizziness', severity: 'mild', isConcerning: false },
      { description: 'Occasional headache', severity: 'mild', isConcerning: false },
      { description: 'Slight fatigue', severity: 'mild', isConcerning: false }
    ];

    for (let i = 0; i < 15; i++) { // Create 15 baseline side effects
      const sideEffectData = baselineSideEffects[i % baselineSideEffects.length];
      const prescription = prescriptions[i % prescriptions.length];
      
      const baselineDate = new Date();
      baselineDate.setDate(baselineDate.getDate() - (45 + Math.random() * 15)); // 45-60 days ago
      
      await sideEffectModel.create({
        ...sideEffectData,
        prescriptionId: prescription.id,
        drugId: createdDrugs[0].id,
        patientId: prescription.patientId,
        isAnonymous: true,
        createdAt: baselineDate
      });
    }
    console.log('✅ Created 15 baseline side effects');

    // Create recent side effects (last 30 days) - HIGH VOLUME to trigger spike
    console.log('\n6️⃣ Creating recent side effects (spike data)...');
    
    const spikeSideEffects = [
      { description: 'Severe dizziness', severity: 'severe', isConcerning: true },
      { description: 'Persistent headache', severity: 'moderate', isConcerning: true },
      { description: 'Extreme fatigue', severity: 'severe', isConcerning: true },
      { description: 'Nausea and vomiting', severity: 'moderate', isConcerning: true },
      { description: 'Chest pain', severity: 'severe', isConcerning: true },
      { description: 'Shortness of breath', severity: 'severe', isConcerning: true },
      { description: 'Rapid heartbeat', severity: 'moderate', isConcerning: true },
      { description: 'Swelling in hands/feet', severity: 'moderate', isConcerning: true }
    ];

    for (let i = 0; i < 50; i++) { // Create 50 recent side effects to trigger spike
      const sideEffectData = spikeSideEffects[i % spikeSideEffects.length];
      const prescription = prescriptions[i % prescriptions.length];
      
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.random() * 30); // Last 30 days
      
      await sideEffectModel.create({
        ...sideEffectData,
        prescriptionId: prescription.id,
        drugId: createdDrugs[0].id,
        patientId: prescription.patientId,
        isAnonymous: true,
        createdAt: recentDate
      });
    }
    console.log('✅ Created 50 recent side effects (spike data)');

    // Clean up test data
    console.log('\n7️⃣ Cleaning up test data...');
    await db.collection('test').doc('spike-setup').delete();
    console.log('✅ Cleanup complete\n');

    console.log('🎉 Side Effect Spike Alert Data Population Complete!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdUsers.length} users (1 doctor, ${patients.length} patients)`);
    console.log(`- Created ${createdDrugs.length} drugs`);
    console.log(`- Created ${prescriptions.length} prescriptions`);
    console.log(`- Created 15 baseline side effects (older data)`);
    console.log(`- Created 50 recent side effects (spike data)`);
    console.log('\n🚨 This data will trigger a side effect spike alert for Lisinopril!');
    console.log('   Run the analytics service to see the alert generated.');

  } catch (error) {
    console.error('❌ Side effect spike data population failed:', error.message);
  }
}

// Run the script
populateSideEffectSpikeData();
