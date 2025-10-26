// Debug Firestore timestamp structure
require('dotenv').config();
const { SideEffect } = require('./server/models/firebaseModels');

async function debugTimestamp() {
  try {
    console.log('🔍 Debugging Firestore timestamp structure...\n');
    
    const sideEffectModel = new SideEffect();
    const allSideEffects = await sideEffectModel.findAll();
    
    if (allSideEffects.length > 0) {
      const sample = allSideEffects[0];
      console.log('📅 Sample createdAt field:');
      console.log('   Raw value:', sample.createdAt);
      console.log('   Type:', typeof sample.createdAt);
      console.log('   Constructor:', sample.createdAt?.constructor?.name);
      console.log('   Keys:', Object.keys(sample.createdAt || {}));
      
      // Try different ways to convert
      console.log('\n🔄 Conversion attempts:');
      
      // Method 1: Direct conversion
      try {
        const date1 = new Date(sample.createdAt);
        console.log('   new Date():', date1, 'Valid:', !isNaN(date1.getTime()));
      } catch (e) {
        console.log('   new Date(): Error -', e.message);
      }
      
      // Method 2: toDate() method
      try {
        const date2 = sample.createdAt?.toDate?.();
        console.log('   toDate():', date2, 'Valid:', !isNaN(date2?.getTime()));
      } catch (e) {
        console.log('   toDate(): Error -', e.message);
      }
      
      // Method 3: toMillis() method
      try {
        const millis = sample.createdAt?.toMillis?.();
        const date3 = new Date(millis);
        console.log('   toMillis():', date3, 'Valid:', !isNaN(date3.getTime()));
      } catch (e) {
        console.log('   toMillis(): Error -', e.message);
      }
      
      // Method 4: seconds property
      try {
        const seconds = sample.createdAt?.seconds;
        const date4 = new Date(seconds * 1000);
        console.log('   seconds * 1000:', date4, 'Valid:', !isNaN(date4.getTime()));
      } catch (e) {
        console.log('   seconds * 1000: Error -', e.message);
      }
      
      // Method 5: _seconds property
      try {
        const _seconds = sample.createdAt?._seconds;
        const date5 = new Date(_seconds * 1000);
        console.log('   _seconds * 1000:', date5, 'Valid:', !isNaN(date5.getTime()));
      } catch (e) {
        console.log('   _seconds * 1000: Error -', e.message);
      }
      
      // Method 6: JSON stringify
      try {
        const json = JSON.stringify(sample.createdAt);
        console.log('   JSON stringify:', json);
      } catch (e) {
        console.log('   JSON stringify: Error -', e.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugTimestamp().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
