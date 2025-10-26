const { sequelize, Drug, DrugInteraction } = require('./server/models');
const { Op } = require('sequelize');

async function populateDrugInteractionData() {
  console.log('💊 Populating PostgreSQL with Drug Interaction Alert Data...\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sample drugs for interaction testing
    const sampleDrugs = [
      {
        name: 'Warfarin',
        genericName: 'warfarin',
        manufacturer: 'Various',
        drugClass: 'Anticoagulant',
        description: 'Blood thinner used to prevent blood clots',
        commonSideEffects: ['bleeding', 'bruising', 'nausea'],
        contraindications: ['pregnancy', 'active bleeding'],
        dosageForms: ['tablet', 'injection'],
        fdaApprovalDate: new Date('1954-01-01')
      },
      {
        name: 'Aspirin',
        genericName: 'acetylsalicylic acid',
        manufacturer: 'Various',
        drugClass: 'NSAID',
        description: 'Pain reliever and anti-inflammatory',
        commonSideEffects: ['stomach upset', 'bleeding', 'allergic reactions'],
        contraindications: ['bleeding disorders', 'stomach ulcers'],
        dosageForms: ['tablet', 'chewable', 'suppository'],
        fdaApprovalDate: new Date('1899-01-01')
      },
      {
        name: 'Digoxin',
        genericName: 'digoxin',
        manufacturer: 'Various',
        drugClass: 'Cardiac Glycoside',
        description: 'Heart medication for irregular heartbeat',
        commonSideEffects: ['nausea', 'vomiting', 'dizziness', 'confusion'],
        contraindications: ['ventricular fibrillation', 'heart block'],
        dosageForms: ['tablet', 'injection', 'liquid'],
        fdaApprovalDate: new Date('1930-01-01')
      },
      {
        name: 'Furosemide',
        genericName: 'furosemide',
        manufacturer: 'Various',
        drugClass: 'Loop Diuretic',
        description: 'Water pill for fluid retention',
        commonSideEffects: ['dehydration', 'low potassium', 'dizziness'],
        contraindications: ['anuria', 'severe dehydration'],
        dosageForms: ['tablet', 'injection', 'liquid'],
        fdaApprovalDate: new Date('1966-01-01')
      },
      {
        name: 'Metformin',
        genericName: 'metformin',
        manufacturer: 'Various',
        drugClass: 'Biguanide',
        description: 'Diabetes medication',
        commonSideEffects: ['nausea', 'diarrhea', 'stomach upset'],
        contraindications: ['kidney disease', 'liver disease'],
        dosageForms: ['tablet', 'extended-release'],
        fdaApprovalDate: new Date('1995-01-01')
      }
    ];

    // Create drugs
    console.log('📝 Creating sample drugs...');
    const createdDrugs = [];
    for (const drugData of sampleDrugs) {
      const [drug, created] = await Drug.findOrCreate({
        where: { name: drugData.name },
        defaults: drugData
      });
      createdDrugs.push(drug);
      console.log(`${created ? '✅ Created' : '⚠️  Exists'}: ${drug.name}`);
    }

    // Sample drug interactions
    const interactions = [
      {
        drug1Name: 'Warfarin',
        drug2Name: 'Aspirin',
        severity: 'major',
        description: 'Increased bleeding risk when warfarin and aspirin are taken together',
        clinicalEffect: 'Significantly increased risk of bleeding, including gastrointestinal and intracranial hemorrhage',
        management: 'Monitor INR closely, consider alternative pain management, educate patient about bleeding signs',
        evidenceLevel: 'Well-established',
        confidenceScore: 0.95
      },
      {
        drug1Name: 'Warfarin',
        drug2Name: 'Digoxin',
        severity: 'moderate',
        description: 'Digoxin may increase warfarin effects',
        clinicalEffect: 'Increased anticoagulant effect, higher INR values',
        management: 'Monitor INR more frequently, adjust warfarin dose as needed',
        evidenceLevel: 'Moderate',
        confidenceScore: 0.75
      },
      {
        drug1Name: 'Furosemide',
        drug2Name: 'Digoxin',
        severity: 'major',
        description: 'Furosemide can cause digoxin toxicity',
        clinicalEffect: 'Hypokalemia from furosemide increases digoxin sensitivity, risk of toxicity',
        management: 'Monitor potassium levels, consider potassium supplementation, adjust digoxin dose',
        evidenceLevel: 'Well-established',
        confidenceScore: 0.90
      },
      {
        drug1Name: 'Metformin',
        drug2Name: 'Furosemide',
        severity: 'moderate',
        description: 'Furosemide may affect metformin elimination',
        clinicalEffect: 'Potential for increased metformin levels and lactic acidosis risk',
        management: 'Monitor kidney function, consider dose adjustment',
        evidenceLevel: 'Limited',
        confidenceScore: 0.60
      },
      {
        drug1Name: 'Aspirin',
        drug2Name: 'Furosemide',
        severity: 'minor',
        description: 'Aspirin may reduce furosemide effectiveness',
        clinicalEffect: 'Slight reduction in diuretic effect',
        management: 'Monitor fluid status, consider timing of administration',
        evidenceLevel: 'Limited',
        confidenceScore: 0.45
      }
    ];

    // Create drug interactions
    console.log('\n🔗 Creating drug interactions...');
    for (const interactionData of interactions) {
      const drug1 = createdDrugs.find(d => d.name === interactionData.drug1Name);
      const drug2 = createdDrugs.find(d => d.name === interactionData.drug2Name);
      
      if (drug1 && drug2) {
        // Check if interaction already exists
        const existingInteraction = await DrugInteraction.findOne({
          where: {
            [Op.or]: [
              { drugId1: drug1.id, drugId2: drug2.id },
              { drugId1: drug2.id, drugId2: drug1.id }
            ]
          }
        });

        if (!existingInteraction) {
          await DrugInteraction.create({
            drugId1: drug1.id,
            drugId2: drug2.id,
            severity: interactionData.severity,
            description: interactionData.description,
            clinicalEffect: interactionData.clinicalEffect,
            management: interactionData.management,
            evidenceLevel: interactionData.evidenceLevel,
            confidenceScore: interactionData.confidenceScore,
            isDetectedByAnalytics: true
          });
          console.log(`✅ Created interaction: ${drug1.name} + ${drug2.name} (${interactionData.severity})`);
        } else {
          console.log(`⚠️  Interaction exists: ${drug1.name} + ${drug2.name}`);
        }
      }
    }

    // Create some high-severity interactions for alert testing
    console.log('\n🚨 Creating high-severity interactions for alert testing...');
    const highSeverityInteractions = [
      {
        drug1Name: 'Warfarin',
        drug2Name: 'Aspirin',
        additionalData: {
          recentReports: 15,
          severityIncrease: '300%',
          timeFrame: 'Last 7 days'
        }
      },
      {
        drug1Name: 'Furosemide',
        drug2Name: 'Digoxin',
        additionalData: {
          recentReports: 8,
          severityIncrease: '250%',
          timeFrame: 'Last 5 days'
        }
      }
    ];

    for (const interaction of highSeverityInteractions) {
      const drug1 = createdDrugs.find(d => d.name === interaction.drug1Name);
      const drug2 = createdDrugs.find(d => d.name === interaction.drug2Name);
      
      if (drug1 && drug2) {
        // Update existing interaction with alert data
        await DrugInteraction.update(
          {
            isDetectedByAnalytics: true,
            confidenceScore: 0.95,
            description: `${interaction.drug1Name} + ${interaction.drug2Name}: ${interaction.additionalData.recentReports} reports in ${interaction.additionalData.timeFrame} (${interaction.additionalData.severityIncrease} increase)`
          },
          {
            where: {
              [Op.or]: [
                { drugId1: drug1.id, drugId2: drug2.id },
                { drugId1: drug2.id, drugId2: drug1.id }
              ]
            }
          }
        );
        console.log(`✅ Updated high-severity interaction: ${drug1.name} + ${drug2.name}`);
      }
    }

    console.log('\n🎉 Drug interaction data population completed!');
    console.log(`📊 Created ${createdDrugs.length} drugs`);
    console.log(`🔗 Created ${interactions.length} drug interactions`);
    console.log('🚨 High-severity interactions ready for alert testing');

  } catch (error) {
    console.error('❌ Error populating drug interaction data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the population script
populateDrugInteractionData();