const { db } = require('./server/config/firebase');
const { Drug } = require('./server/models/firebaseModels');

async function setupFirebaseComplete() {
  console.log('🔥 Setting up Firebase Firestore for Drug Effects Tracker...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing Firebase connection...');
    await db.collection('test').doc('setup').set({ test: true });
    console.log('✅ Firebase connection successful\n');

    // Check if drugs already exist
    console.log('2️⃣ Checking for existing drugs...');
    const drugModel = new Drug();
    const existingDrugs = await drugModel.count();

    if (existingDrugs > 0) {
      console.log(`✅ ${existingDrugs} drugs already exist in Firestore`);
      console.log('Skipping drug seeding to avoid duplicates\n');
    } else {
      console.log('3️⃣ Seeding example drugs...');
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
        // ... add other drugs here
      ];

      for (const drugData of exampleDrugs) {
        await drugModel.create(drugData);
      }

      console.log(`✅ Successfully created ${exampleDrugs.length} example drugs\n`);
    }

    // Clean up test data
    console.log('4️⃣ Cleaning up test data...');
    await db.collection('test').doc('setup').delete();
    console.log('✅ Cleanup complete\n');

    console.log('🎉 Firebase setup completed successfully!');
  } catch (error) {
    console.error('❌ Firebase setup failed:', error.message);
  }
}

setupFirebaseComplete();
