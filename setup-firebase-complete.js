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
        },
        {
          name: "Omeprazole",
          genericName: "Omeprazole",
          manufacturer: "Various",
          drugClass: "Proton Pump Inhibitor",
          description: "Used to treat acid reflux and stomach ulcers",
          commonSideEffects: ["headache", "nausea", "diarrhea", "stomach pain"],
          contraindications: ["hypersensitivity to omeprazole"],
          dosageForms: ["capsule", "tablet", "powder for suspension"],
          fdaApprovalDate: "1989-09-13",
          isActive: true
        },
        {
          name: "Amlodipine",
          genericName: "Amlodipine",
          manufacturer: "Various",
          drugClass: "Calcium Channel Blocker",
          description: "Used to treat high blood pressure and chest pain",
          commonSideEffects: ["swelling in ankles", "dizziness", "flushing", "fatigue"],
          contraindications: ["hypersensitivity to amlodipine"],
          dosageForms: ["tablet"],
          fdaApprovalDate: "1992-01-31",
          isActive: true
        }
      ];
      
      // Create drugs
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
    console.log('\n📋 What was set up:');
    console.log('✅ Firebase Firestore connection');
    console.log('✅ Example drugs seeded');
    console.log('✅ Database collections ready');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Register as a doctor or patient');
    console.log('4. Start using the application!');
    
    console.log('\n📚 Documentation:');
    console.log('- Firebase Console: https://console.firebase.google.com');
    console.log('- Setup Guide: FIREBASE-SETUP.md');
    console.log('- Troubleshooting: FIREBASE-TROUBLESHOOTING.md');
    
  } catch (error) {
    console.error('❌ Firebase setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct Firebase credentials');
    console.log('2. Verify your service account key is valid');
    console.log('3. Ensure Firestore is enabled in Firebase Console');
    console.log('4. Check your internet connection');
    console.log('\n📖 See FIREBASE-TROUBLESHOOTING.md for detailed help');
  }
}

setupFirebaseComplete();
