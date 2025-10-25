const { db } = require('./server/config/firebase');
require('dotenv').config();

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Firestore Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`Project ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`Private Key: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`Client Email: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing'}`);
  console.log(`Database URL: ${process.env.FIREBASE_DATABASE_URL ? '✅ Set' : '❌ Missing'}\n`);

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('❌ Missing required Firebase environment variables');
    console.log('\nPlease check your .env file and ensure all Firebase variables are set.');
    return;
  }

  try {
    console.log('🔌 Testing Firebase connection...');
    
    // Test write operation
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Firebase connection test successful'
    };
    
    await db.collection('test').doc('connection').set(testDoc);
    console.log('✅ Write operation successful');
    
    // Test read operation
    const doc = await db.collection('test').doc('connection').get();
    if (doc.exists) {
      console.log('✅ Read operation successful');
      console.log('📄 Test data:', doc.data());
    } else {
      console.log('❌ Read operation failed - document not found');
    }
    
    // Test query operation
    const snapshot = await db.collection('test').get();
    console.log(`✅ Query operation successful - found ${snapshot.size} documents`);
    
    // Clean up test data
    await db.collection('test').doc('connection').delete();
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\nYour Firebase setup is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. The application will automatically create collections');
    console.log('3. Test the API endpoints');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check Firestore security rules');
      console.log('2. Verify service account permissions');
      console.log('3. Ensure the project ID is correct');
    } else if (error.code === 'unauthenticated') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check your service account key format');
      console.log('2. Verify the private key is correctly formatted');
      console.log('3. Ensure the client email matches the service account');
    } else if (error.code === 'not-found') {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Verify the project ID is correct');
      console.log('2. Check if Firestore is enabled in your project');
      console.log('3. Ensure you have the correct region selected');
    } else {
      console.log('\n🔧 General troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify Firebase project is active');
      console.log('3. Check if Firestore is enabled');
      console.log('4. Verify all environment variables are correct');
    }
  }
}

testFirebaseConnection();
