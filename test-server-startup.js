const { db } = require('./server/config/firebase');

async function testServerStartup() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firebase connection
    await db.collection('test').doc('startup-test').set({ 
      test: true, 
      timestamp: new Date() 
    });
    console.log('✅ Firebase connection successful');
    
    // Test Firebase models
    console.log('📦 Testing Firebase models...');
    const { User } = require('./server/models/firebaseModels');
    const userModel = new User();
    console.log('✅ User model loaded successfully');
    
    // Test auth routes
    console.log('🔐 Testing auth routes...');
    const authRoutes = require('./server/routes/auth');
    console.log('✅ Auth routes loaded successfully');
    
    // Test middleware
    console.log('🛡️ Testing middleware...');
    const { authenticateToken } = require('./server/middleware/auth');
    console.log('✅ Middleware loaded successfully');
    
    console.log('\n🎉 All server components loaded successfully!');
    console.log('\nYour server should start without issues now.');
    console.log('\nNext steps:');
    console.log('1. Run: node server/index.js');
    console.log('2. Test registration: node test-registration.js');
    console.log('3. Run analytics: node test-analytics-service.js');
    
  } catch (error) {
    console.error('❌ Server startup test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your .env file has correct Firebase credentials');
    console.log('2. Make sure Firebase project is set up');
    console.log('3. Verify Firestore is enabled');
  }
}

testServerStartup().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
