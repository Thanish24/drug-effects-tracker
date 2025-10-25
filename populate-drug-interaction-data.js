const { db } = require('./server/config/firebase');
const { Drug, SideEffect, Prescription, User, DrugInteraction } = require('./server/models/firebaseModels');

async function populateDrugInteractionData() {
  console.log('💊 Populating Firestore with Drug Interaction Alert Data...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing Firebase connection...');
    await db.collection('test').doc('interaction-setup').set({ test: true });
    console.log('✅ Firebase connection successful\n');

    // Create test users (patients and doctors)
    console.log('2️⃣ Creating test users...');
    const userModel = new User();
    
    const testUsers = [
      {
        email: 'doctor2@test.com',
        password: 'password123',
        firstName: 'Dr. Michael',
        lastName: 'Brown',
        role: 'doctor',
        licenseNumber: 'MD789012',
        specialization: 'Cardiology'
      },
      {
        email: 'patient4@test.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'patient',
        dateOfBirth: '1975-05-10',
        phoneNumber: '+1234567893'
      },
      {
        email: 'patient5@test.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Davis',
        role: 'patient',
        dateOfBirth: '1982-09-18',
        phoneNumber: '+1234567894'
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

    // Create test drugs that are known to interact
    console.log('\n3️⃣ Creating test drugs with known interactions...');
    const drugModel = new Drug();
    
    const testDrugs = [
      {
        name: "Warfarin",
        genericName: "Warfarin",
        manufacturer: "Various",
        drugClass: "Anticoagulant",
        description: "Blood thinner used to prevent blood clots",
        commonSideEffects: ["bleeding", "bruising", "nausea"],
        contraindications: ["active bleeding", "severe liver disease"],
        dosageForms: ["tablet"],
        fdaApprovalDate: "1954-06-01",
        isActive: true
      },
      {
        name: "Aspirin",
        genericName: "Acetylsalicylic Acid",
        manufacturer: "Various",
        drugClass: "NSAID/Antiplatelet",
        description: "Pain reliever and blood thinner",
        commonSideEffects: ["stomach upset", "bleeding", "nausea"],
        contraindications: ["active bleeding", "stomach ulcers"],
        dosageForms: ["tablet", "chewable tablet"],
        fdaApprovalDate: "1899-03-06",
        isActive: true
      },
      {
        name: "Digoxin",
        genericName: "Digoxin",
        manufacturer: "Various",
        drugClass: "Cardiac Glycoside",
        description: "Used to treat heart failure and irregular heartbeat",
        commonSideEffects: ["nausea", "vomiting", "dizziness", "confusion"],
        contraindications: ["ventricular fibrillation", "severe heart block"],
        dosageForms: ["tablet", "injection"],
        fdaApprovalDate: "1954-01-01",
        isActive: true
      }
    ];

    const createdDrugs = [];
    for (const drugData of testDrugs) {
      const drug = await drugModel.create(drugData);
      createdDrugs.push(drug);
      console.log(`✅ Created drug: ${drugData.name}`);
    }

    // Create multiple prescriptions for each patient (drug interactions)
    console.log('\n4️⃣ Creating multiple prescriptions per patient...');
    const prescriptionModel = new Prescription();
    
    const prescriptions = [];
    
    // Patient 1: Warfarin + Aspirin (dangerous combination)
    const prescription1 = await prescriptionModel.create({
      patientId: patients[0].id,
      doctorId: doctor.id,
      drugId: createdDrugs[0].id, // Warfarin
      dosage: '5mg',
      frequency: 'once daily',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      instructions: 'Take at same time each day'
    });
    prescriptions.push(prescription1);

    const prescription2 = await prescriptionModel.create({
      patientId: patients[0].id,
      doctorId: doctor.id,
      drugId: createdDrugs[1].id, // Aspirin
      dosage: '81mg',
      frequency: 'once daily',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      instructions: 'Take with food'
    });
    prescriptions.push(prescription2);

    // Patient 2: Digoxin + Warfarin (moderate interaction)
    const prescription3 = await prescriptionModel.create({
      patientId: patients[1].id,
      doctorId: doctor.id,
      drugId: createdDrugs[2].id, // Digoxin
      dosage: '0.25mg',
      frequency: 'once daily',
      startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      instructions: 'Take at same time each day'
    });
    prescriptions.push(prescription3);

    const prescription4 = await prescriptionModel.create({
      patientId: patients[1].id,
      doctorId: doctor.id,
      drugId: createdDrugs[0].id, // Warfarin
      dosage: '3mg',
      frequency: 'once daily',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      instructions: 'Take at same time each day'
    });
    prescriptions.push(prescription4);

    console.log(`✅ Created ${prescriptions.length} prescriptions`);

    // Create side effects that indicate drug interactions
    console.log('\n5️⃣ Creating side effects indicating drug interactions...');
    const sideEffectModel = new SideEffect();
    
    // Side effects for Patient 1 (Warfarin + Aspirin - bleeding risk)
    const bleedingSideEffects = [
      { description: 'Excessive bleeding from minor cuts', severity: 'severe', isConcerning: true },
      { description: 'Large bruises appearing without injury', severity: 'moderate', isConcerning: true },
      { description: 'Nosebleeds lasting more than 10 minutes', severity: 'severe', isConcerning: true },
      { description: 'Blood in urine', severity: 'severe', isConcerning: true },
      { description: 'Black, tarry stools', severity: 'severe', isConcerning: true },
      { description: 'Vomiting blood', severity: 'severe', isConcerning: true },
      { description: 'Unusual fatigue and weakness', severity: 'moderate', isConcerning: true }
    ];

    for (let i = 0; i < bleedingSideEffects.length; i++) {
      const sideEffectData = bleedingSideEffects[i];
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.random() * 20); // Last 20 days
      
      await sideEffectModel.create({
        ...sideEffectData,
        prescriptionId: prescriptions[i % 2].id, // Alternate between Warfarin and Aspirin prescriptions
        drugId: prescriptions[i % 2].drugId,
        patientId: patients[0].id,
        isAnonymous: true,
        createdAt: recentDate
      });
    }

    // Side effects for Patient 2 (Digoxin + Warfarin - moderate interaction)
    const digoxinSideEffects = [
      { description: 'Nausea and vomiting', severity: 'moderate', isConcerning: true },
      { description: 'Dizziness and confusion', severity: 'moderate', isConcerning: true },
      { description: 'Irregular heartbeat', severity: 'severe', isConcerning: true },
      { description: 'Visual disturbances (yellow-green vision)', severity: 'moderate', isConcerning: true },
      { description: 'Loss of appetite', severity: 'mild', isConcerning: false },
      { description: 'Fatigue and weakness', severity: 'moderate', isConcerning: true }
    ];

    for (let i = 0; i < digoxinSideEffects.length; i++) {
      const sideEffectData = digoxinSideEffects[i];
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.random() * 15); // Last 15 days
      
      await sideEffectModel.create({
        ...sideEffectData,
        prescriptionId: prescriptions[2 + (i % 2)].id, // Alternate between Digoxin and Warfarin prescriptions
        drugId: prescriptions[2 + (i % 2)].drugId,
        patientId: patients[1].id,
        isAnonymous: true,
        createdAt: recentDate
      });
    }

    console.log('✅ Created side effects indicating drug interactions');

    // Create known drug interaction records
    console.log('\n6️⃣ Creating known drug interaction records...');
    const drugInteractionModel = new DrugInteraction();
    
    const knownInteractions = [
      {
        drugId1: createdDrugs[0].id, // Warfarin
        drugId2: createdDrugs[1].id, // Aspirin
        severity: 'major',
        description: 'Increased bleeding risk when taken together',
        clinicalEffect: 'Significantly increased risk of bleeding, including life-threatening hemorrhage',
        management: 'Monitor INR closely, consider reducing warfarin dose, avoid aspirin unless absolutely necessary',
        evidenceLevel: 'strong',
        isDetectedByAnalytics: false,
        confidenceScore: 0.95
      },
      {
        drugId1: createdDrugs[2].id, // Digoxin
        drugId2: createdDrugs[0].id, // Warfarin
        severity: 'moderate',
        description: 'Digoxin may increase warfarin sensitivity',
        clinicalEffect: 'Increased risk of bleeding due to enhanced anticoagulant effect',
        clinicalEffect: 'Monitor INR and digoxin levels, adjust doses as needed',
        evidenceLevel: 'fair',
        isDetectedByAnalytics: false,
        confidenceScore: 0.75
      }
    ];

    for (const interactionData of knownInteractions) {
      await drugInteractionModel.create(interactionData);
      console.log(`✅ Created interaction: ${interactionData.description}`);
    }

    // Clean up test data
    console.log('\n7️⃣ Cleaning up test data...');
    await db.collection('test').doc('interaction-setup').delete();
    console.log('✅ Cleanup complete\n');

    console.log('🎉 Drug Interaction Alert Data Population Complete!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${createdUsers.length} users (1 doctor, ${patients.length} patients)`);
    console.log(`- Created ${createdDrugs.length} drugs with known interactions`);
    console.log(`- Created ${prescriptions.length} prescriptions (multiple per patient)`);
    console.log(`- Created ${bleedingSideEffects.length + digoxinSideEffects.length} side effects indicating interactions`);
    console.log(`- Created ${knownInteractions.length} known drug interaction records`);
    console.log('\n💊 This data will trigger drug interaction alerts!');
    console.log('   - Patient 1: Warfarin + Aspirin (major bleeding risk)');
    console.log('   - Patient 2: Digoxin + Warfarin (moderate interaction)');
    console.log('   Run the analytics service to see the alerts generated.');

  } catch (error) {
    console.error('❌ Drug interaction data population failed:', error.message);
  }
}

// Run the script
populateDrugInteractionData();
