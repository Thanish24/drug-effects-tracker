const { sequelize, User, Drug, Prescription, SideEffect } = require('./server/models');
const { Op } = require('sequelize');

async function populateSideEffectSpikeData() {
  console.log('🚨 Populating PostgreSQL with Side Effect Spike Alert Data...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Create test users
    console.log('👥 Creating test users...');
    const testUsers = [];
    
    // Create patients
    for (let i = 1; i <= 5; i++) {
      const [user, created] = await User.findOrCreate({
        where: { email: `patient${i}@test.com` },
        defaults: {
          email: `patient${i}@test.com`,
          password: 'password123',
          firstName: `Patient`,
          lastName: `${i}`,
          role: 'patient',
          dateOfBirth: new Date(1980 + i, 0, 1),
          phone: `555-000${i}`,
          address: `${i}00 Test Street, Test City, TC 12345`
        }
      });
      testUsers.push(user);
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${user.firstName} ${user.lastName} (${user.role})`);
    }

    // Create doctors
    for (let i = 1; i <= 2; i++) {
      const [user, created] = await User.findOrCreate({
        where: { email: `doctor${i}@test.com` },
        defaults: {
          email: `doctor${i}@test.com`,
          password: 'password123',
          firstName: `Dr. Doctor`,
          lastName: `${i}`,
          role: 'doctor',
          medicalLicense: `MD${i.toString().padStart(6, '0')}`,
          specialization: i === 1 ? 'Cardiology' : 'Internal Medicine',
          phone: `555-100${i}`,
          address: `${i}00 Medical Plaza, Medical City, MC 54321`
        }
      });
      testUsers.push(user);
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${user.firstName} ${user.lastName} (${user.role})`);
    }

    // Create test drugs
    console.log('\n💊 Creating test drugs...');
    const testDrugs = [];
    const drugNames = ['Aspirin', 'Warfarin', 'Metformin', 'Lisinopril', 'Atorvastatin'];
    
    for (const drugName of drugNames) {
      const [drug, created] = await Drug.findOrCreate({
        where: { name: drugName },
        defaults: {
          name: drugName,
          genericName: drugName.toLowerCase(),
          manufacturer: 'Test Pharma',
          drugClass: 'Test Class',
          description: `Test drug: ${drugName}`,
          commonSideEffects: ['nausea', 'headache', 'dizziness'],
          contraindications: ['allergy'],
          dosageForms: ['tablet'],
          fdaApprovalDate: new Date('2020-01-01')
        }
      });
      testDrugs.push(drug);
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${drug.name}`);
    }

    // Create prescriptions
    console.log('\n📋 Creating prescriptions...');
    const prescriptions = [];
    const doctors = testUsers.filter(u => u.role === 'doctor');
    const patients = testUsers.filter(u => u.role === 'patient');

    for (let i = 0; i < 10; i++) {
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      const drug = testDrugs[i % testDrugs.length];

      const [prescription, created] = await Prescription.findOrCreate({
        where: {
          patientId: patient.id,
          drugId: drug.id,
          doctorId: doctor.id
        },
        defaults: {
          patientId: patient.id,
          drugId: drug.id,
          doctorId: doctor.id,
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          instructions: 'Take with food'
        }
      });
      prescriptions.push(prescription);
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${drug.name} for ${patient.firstName} ${patient.lastName}`);
    }

    // Create side effects with spike pattern
    console.log('\n🚨 Creating side effects with spike pattern...');
    
    // Create baseline side effects (older data)
    const baselineDate = new Date();
    baselineDate.setDate(baselineDate.getDate() - 60); // 60 days ago
    
    for (let i = 0; i < 20; i++) {
      const prescription = prescriptions[i % prescriptions.length];
      const sideEffectDate = new Date(baselineDate);
      sideEffectDate.setDate(baselineDate.getDate() + Math.floor(Math.random() * 30));
      
      await SideEffect.create({
        prescriptionId: prescription.id,
        drugId: prescription.drugId,
        patientId: prescription.patientId,
        description: `Baseline side effect ${i + 1}`,
        severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
        isConcerning: Math.random() > 0.8,
        isAnonymous: true,
        createdAt: sideEffectDate
      });
    }

    // Create recent spike in side effects (last 7 days)
    const spikeDate = new Date();
    spikeDate.setDate(spikeDate.getDate() - 7);
    
    const spikeDrug = testDrugs[0]; // Aspirin
    const spikePrescriptions = prescriptions.filter(p => p.drugId === spikeDrug.id);
    
    console.log(`📈 Creating spike for ${spikeDrug.name}...`);
    
    for (let i = 0; i < 25; i++) { // 25 recent reports (vs 4 baseline)
      const prescription = spikePrescriptions[i % spikePrescriptions.length];
      const sideEffectDate = new Date(spikeDate);
      sideEffectDate.setDate(spikeDate.getDate() + Math.floor(Math.random() * 7));
      
      const severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
      const isConcerning = severity === 'severe' || Math.random() > 0.7;
      
      await SideEffect.create({
        prescriptionId: prescription.id,
        drugId: prescription.drugId,
        patientId: prescription.patientId,
        description: `Recent spike side effect ${i + 1}: ${['nausea', 'headache', 'dizziness', 'stomach pain', 'bleeding'][Math.floor(Math.random() * 5)]}`,
        severity: severity,
        isConcerning: isConcerning,
        isAnonymous: true,
        createdAt: sideEffectDate
      });
    }

    // Create another spike for a different drug
    const spikeDrug2 = testDrugs[1]; // Warfarin
    const spikePrescriptions2 = prescriptions.filter(p => p.drugId === spikeDrug2.id);
    
    console.log(`📈 Creating spike for ${spikeDrug2.name}...`);
    
    for (let i = 0; i < 15; i++) { // 15 recent reports
      const prescription = spikePrescriptions2[i % spikePrescriptions2.length];
      const sideEffectDate = new Date(spikeDate);
      sideEffectDate.setDate(spikeDate.getDate() + Math.floor(Math.random() * 7));
      
      const severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
      const isConcerning = severity === 'severe' || Math.random() > 0.6;
      
      await SideEffect.create({
        prescriptionId: prescription.id,
        drugId: prescription.drugId,
        patientId: prescription.patientId,
        description: `Warfarin spike effect ${i + 1}: ${['bleeding', 'bruising', 'nausea', 'dizziness'][Math.floor(Math.random() * 4)]}`,
        severity: severity,
        isConcerning: isConcerning,
        isAnonymous: true,
        createdAt: sideEffectDate
      });
    }

    console.log('\n🎉 Side effect spike data population completed!');
    console.log(`👥 Created ${testUsers.length} users`);
    console.log(`💊 Created ${testDrugs.length} drugs`);
    console.log(`📋 Created ${prescriptions.length} prescriptions`);
    console.log(`🚨 Created side effects with spike patterns`);
    console.log('📊 Spike data ready for analytics testing');

  } catch (error) {
    console.error('❌ Error populating side effect spike data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the population script
populateSideEffectSpikeData();