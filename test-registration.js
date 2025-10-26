const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient',
      dateOfBirth: '1990-01-01',
      phone: '123-456-7890',
      address: '123 Test St'
    };

    console.log('📤 Sending registration request...');
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testRegistration();
