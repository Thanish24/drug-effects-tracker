const { Drug } = require('./server/models');
require('dotenv').config();

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
    fdaApprovalDate: "1987-12-29"
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
    fdaApprovalDate: "1994-12-29"
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
    fdaApprovalDate: "1996-12-17"
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
    fdaApprovalDate: "1989-09-13"
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
    fdaApprovalDate: "1992-01-31"
  },
  {
    name: "Sertraline",
    genericName: "Sertraline",
    manufacturer: "Various",
    drugClass: "SSRI",
    description: "Used to treat depression, anxiety, and panic disorders",
    commonSideEffects: ["nausea", "diarrhea", "insomnia", "drowsiness", "dry mouth"],
    contraindications: ["MAOI use", "pimozide use"],
    dosageForms: ["tablet", "oral concentrate"],
    fdaApprovalDate: "1991-12-30"
  },
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    manufacturer: "Various",
    drugClass: "NSAID",
    description: "Used to treat pain, inflammation, and fever",
    commonSideEffects: ["stomach upset", "nausea", "heartburn", "dizziness"],
    contraindications: ["severe heart failure", "active bleeding", "allergy to NSAIDs"],
    dosageForms: ["tablet", "capsule", "liquid", "gel"],
    fdaApprovalDate: "1974-09-20"
  },
  {
    name: "Lorazepam",
    genericName: "Lorazepam",
    manufacturer: "Various",
    drugClass: "Benzodiazepine",
    description: "Used to treat anxiety and insomnia",
    commonSideEffects: ["drowsiness", "dizziness", "weakness", "unsteadiness"],
    contraindications: ["narrow-angle glaucoma", "severe respiratory insufficiency"],
    dosageForms: ["tablet", "injection", "oral concentrate"],
    fdaApprovalDate: "1977-05-16"
  },
  {
    name: "Furosemide",
    genericName: "Furosemide",
    manufacturer: "Various",
    drugClass: "Loop Diuretic",
    description: "Used to treat fluid retention and high blood pressure",
    commonSideEffects: ["frequent urination", "dizziness", "dehydration", "low potassium"],
    contraindications: ["anuria", "hypersensitivity to sulfonamides"],
    dosageForms: ["tablet", "injection", "oral solution"],
    fdaApprovalDate: "1966-01-01"
  },
  {
    name: "Warfarin",
    genericName: "Warfarin",
    manufacturer: "Various",
    drugClass: "Anticoagulant",
    description: "Used to prevent blood clots",
    commonSideEffects: ["bleeding", "bruising", "nausea", "diarrhea"],
    contraindications: ["active bleeding", "severe liver disease", "pregnancy"],
    dosageForms: ["tablet"],
    fdaApprovalDate: "1954-06-01"
  },
  {
    name: "Hydrochlorothiazide",
    genericName: "Hydrochlorothiazide",
    manufacturer: "Various",
    drugClass: "Thiazide Diuretic",
    description: "Used to treat high blood pressure and fluid retention",
    commonSideEffects: ["frequent urination", "dizziness", "muscle cramps", "weakness"],
    contraindications: ["anuria", "hypersensitivity to sulfonamides"],
    dosageForms: ["tablet", "capsule"],
    fdaApprovalDate: "1959-01-01"
  },
  {
    name: "Prednisone",
    genericName: "Prednisone",
    manufacturer: "Various",
    drugClass: "Corticosteroid",
    description: "Used to treat inflammation and autoimmune conditions",
    commonSideEffects: ["weight gain", "mood changes", "insomnia", "increased appetite"],
    contraindications: ["systemic fungal infections", "hypersensitivity to prednisone"],
    dosageForms: ["tablet", "oral solution"],
    fdaApprovalDate: "1955-01-01"
  },
  {
    name: "Tramadol",
    genericName: "Tramadol",
    manufacturer: "Various",
    drugClass: "Opioid Analgesic",
    description: "Used to treat moderate to severe pain",
    commonSideEffects: ["nausea", "dizziness", "constipation", "headache"],
    contraindications: ["severe respiratory depression", "acute intoxication"],
    dosageForms: ["tablet", "capsule", "injection"],
    fdaApprovalDate: "1995-03-03"
  },
  {
    name: "Ciprofloxacin",
    genericName: "Ciprofloxacin",
    manufacturer: "Various",
    drugClass: "Fluoroquinolone Antibiotic",
    description: "Used to treat bacterial infections",
    commonSideEffects: ["nausea", "diarrhea", "dizziness", "headache"],
    contraindications: ["hypersensitivity to quinolones", "pregnancy"],
    dosageForms: ["tablet", "injection", "oral suspension"],
    fdaApprovalDate: "1987-10-22"
  },
  {
    name: "Albuterol",
    genericName: "Albuterol",
    manufacturer: "Various",
    drugClass: "Bronchodilator",
    description: "Used to treat asthma and COPD",
    commonSideEffects: ["tremor", "nervousness", "headache", "dizziness"],
    contraindications: ["hypersensitivity to albuterol"],
    dosageForms: ["inhaler", "nebulizer solution", "tablet"],
    fdaApprovalDate: "1981-01-01"
  }
];

async function seedDrugs() {
  try {
    console.log('🌱 Starting to seed drugs...');
    
    // Check if drugs already exist
    const existingDrugs = await Drug.count();
    if (existingDrugs > 0) {
      console.log(`✅ ${existingDrugs} drugs already exist in the database`);
      console.log('Skipping seed to avoid duplicates');
      return;
    }

    // Create all drugs
    const createdDrugs = await Drug.bulkCreate(exampleDrugs);
    console.log(`✅ Successfully created ${createdDrugs.length} drugs`);
    
    // Display created drugs
    console.log('\n📋 Created drugs:');
    createdDrugs.forEach((drug, index) => {
      console.log(`${index + 1}. ${drug.name} (${drug.drugClass})`);
    });

    console.log('\n🎉 Drug seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Register as a doctor');
    console.log('2. Create prescriptions using these drugs');
    console.log('3. Test the side effect reporting system');

  } catch (error) {
    console.error('❌ Error seeding drugs:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure the database is running');
    console.log('2. Check your .env file has correct database credentials');
    console.log('3. Ensure the database tables have been created');
  }
}

// Run the seeding function
seedDrugs().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
