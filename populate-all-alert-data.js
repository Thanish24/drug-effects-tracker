#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Drug Effects Tracker - Firestore Data Population Suite\n');
console.log('This suite will populate your Firestore database with test data');
console.log('that triggers different types of analytics alerts.\n');

async function runScript(scriptName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${description}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    execSync(`node ${scriptName}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log(`\n✅ ${scriptName} completed successfully!`);
  } catch (error) {
    console.error(`\n❌ ${scriptName} failed:`, error.message);
    return false;
  }
  return true;
}

async function main() {
  const scripts = [
    {
      name: 'populate-side-effect-spike-data.js',
      description: 'Side Effect Spike Alert Data'
    },
    {
      name: 'populate-drug-interaction-data.js', 
      description: 'Drug Interaction Alert Data'
    },
    {
      name: 'populate-analytics-report-data.js',
      description: 'Analytics Report Data'
    }
  ];

  console.log('🔧 Prerequisites:');
  console.log('   - Firebase project configured');
  console.log('   - .env file with Firebase credentials');
  console.log('   - Firestore database enabled');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  // Wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  let successCount = 0;
  let totalScripts = scripts.length;

  for (const script of scripts) {
    const success = await runScript(script.name, script.description);
    if (success) successCount++;
    
    // Wait 2 seconds between scripts
    if (scripts.indexOf(script) < scripts.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next script...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 POPULATION SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful: ${successCount}/${totalScripts} scripts`);
  console.log(`❌ Failed: ${totalScripts - successCount}/${totalScripts} scripts`);

  if (successCount === totalScripts) {
    console.log('\n🎉 All data population scripts completed successfully!');
    console.log('\n🧪 Next Steps:');
    console.log('   1. Run: node test-analytics-service.js');
    console.log('   2. Check Firestore console for generated alerts');
    console.log('   3. Test the analytics dashboard in your app');
  } else {
    console.log('\n⚠️ Some scripts failed. Check the errors above.');
    console.log('   Make sure your Firebase configuration is correct.');
  }

  console.log('\n📚 Available Scripts:');
  console.log('   • populate-side-effect-spike-data.js - Creates data that triggers side effect spike alerts');
  console.log('   • populate-drug-interaction-data.js - Creates data that triggers drug interaction alerts');
  console.log('   • populate-analytics-report-data.js - Creates comprehensive analytics data');
  console.log('   • test-analytics-service.js - Tests the analytics service with populated data');
  console.log('   • populate-all-alert-data.js - This master script (runs all above)');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Data population cancelled by user.');
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error('\n❌ Master script failed:', error.message);
  process.exit(1);
});
