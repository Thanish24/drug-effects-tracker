// Check available doctor accounts
require('dotenv').config();
const { User } = require('./server/models/firebaseModels');

async function checkDoctorAccounts() {
  try {
    console.log('👨‍⚕️ Checking Doctor Accounts...\n');
    
    const userModel = new User();
    const allUsers = await userModel.findAll();
    
    // Filter for doctors
    const doctors = allUsers.filter(user => user.role === 'doctor');
    
    console.log(`📊 Found ${doctors.length} doctor accounts:\n`);
    
    if (doctors.length === 0) {
      console.log('❌ No doctor accounts found!');
      console.log('\n🔧 To create a doctor account, you can:');
      console.log('1. Use the registration form on the frontend');
      console.log('2. Run: node create-test-doctor.js');
      console.log('3. Check the database directly');
    } else {
      doctors.forEach((doctor, index) => {
        console.log(`${index + 1}. Doctor Account:`);
        console.log(`   - Email: ${doctor.email}`);
        console.log(`   - Name: ${doctor.firstName} ${doctor.lastName}`);
        console.log(`   - Role: ${doctor.role}`);
        console.log(`   - Active: ${doctor.isActive ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${doctor.createdAt}`);
        console.log('');
      });
      
      console.log('🔑 Login Instructions:');
      console.log('1. Go to your frontend application');
      console.log('2. Click "Login" or "Sign In"');
      console.log('3. Use one of the doctor emails above');
      console.log('4. The password should be the same as used during registration');
      console.log('');
      console.log('📱 If you need to reset passwords, run: node reset-doctor-passwords.js');
    }
    
    // Also check for any users with admin role
    const admins = allUsers.filter(user => user.role === 'admin');
    if (admins.length > 0) {
      console.log(`👑 Found ${admins.length} admin accounts:`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin: ${admin.email} (${admin.firstName} ${admin.lastName})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking doctor accounts:', error.message);
  }
}

checkDoctorAccounts().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
