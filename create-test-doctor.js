// Create a test doctor account
require('dotenv').config();
const { User } = require('./server/models/firebaseModels');

async function createTestDoctor() {
  try {
    console.log('👨‍⚕️ Creating Test Doctor Account...\n');
    
    const userModel = new User();
    
    // Check if test doctor already exists
    let testDoctor = await userModel.findByEmail('doctor@example.com');
    
    if (testDoctor) {
      console.log('✅ Test doctor already exists:');
      console.log(`   - Email: ${testDoctor.email}`);
      console.log(`   - Name: ${testDoctor.firstName} ${testDoctor.lastName}`);
      console.log(`   - Role: ${testDoctor.role}`);
      console.log(`   - Password: testpass123`);
    } else {
      // Create test doctor
      testDoctor = await userModel.create({
        email: 'doctor@example.com',
        password: 'testpass123',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'doctor',
        dateOfBirth: '1980-01-01',
        phone: '555-0100',
        address: '123 Medical Center Dr',
        isActive: true
      });
      
      console.log('✅ Test doctor created successfully:');
      console.log(`   - Email: ${testDoctor.email}`);
      console.log(`   - Name: ${testDoctor.firstName} ${testDoctor.lastName}`);
      console.log(`   - Role: ${testDoctor.role}`);
      console.log(`   - Password: testpass123`);
    }
    
    console.log('\n🔑 Login Instructions:');
    console.log('1. Start your frontend application:');
    console.log('   cd client && npm start');
    console.log('2. Go to the login page');
    console.log('3. Enter these credentials:');
    console.log(`   - Email: ${testDoctor.email}`);
    console.log(`   - Password: testpass123`);
    console.log('4. Click "Login"');
    console.log('5. You should see the doctor dashboard with analytics alerts');
    
    console.log('\n📊 What You\'ll See:');
    console.log('- Side effect spike alerts');
    console.log('- Drug interaction warnings');
    console.log('- Patient safety insights');
    console.log('- Analytics dashboard');
    console.log('- Real-time monitoring');
    
    console.log('\n🧪 Alternative Test Accounts:');
    console.log('If you need more test accounts, you can also use:');
    console.log('- analytics-test@example.com (patient account)');
    console.log('- Any other accounts you\'ve created');
    
  } catch (error) {
    console.error('❌ Error creating test doctor:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Firebase configuration');
    console.log('2. Ensure your .env file is correct');
    console.log('3. Check your internet connection');
  }
}

createTestDoctor().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
