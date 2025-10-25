const { db } = require('./server/config/firebase');

async function testFirebaseSimple() {
  try {
    console.log('🔥 Testing Firebase Firestore Connection...\n');
    
    // Test write operation
    console.log('📝 Testing write operation...');
    await db.collection('test').doc('simple-test').set({
      message: 'Hello Firebase!',
      timestamp: new Date(),
      test: true
    });
    console.log('✅ Write successful');
    
    // Test read operation
    console.log('📖 Testing read operation...');
    const doc = await db.collection('test').doc('simple-test').get();
    if (doc.exists) {
      console.log('✅ Read successful');
      console.log('📄 Data:', doc.data());
    } else {
      console.log('❌ Document not found');
    }
    
    // Test query operation
    console.log('🔍 Testing query operation...');
    const snapshot = await db.collection('test').get();
    console.log(`✅ Query successful - found ${snapshot.size} documents`);
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await db.collection('test').doc('simple-test').delete();
    console.log('✅ Cleanup successful');
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\nYour Firebase setup is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. The application will automatically create collections');
    console.log('3. Test the API endpoints');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Solution: Check Firestore security rules in Firebase Console');
    } else if (error.code === 'unauthenticated') {
      console.log('\n🔧 Solution: Check your service account key or environment variables');
    } else {
      console.log('\n🔧 General troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify Firebase project is active');
      console.log('3. Check if Firestore is enabled');
    }
  }
}

testFirebaseSimple();
