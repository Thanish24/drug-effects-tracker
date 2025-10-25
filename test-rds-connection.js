const mysql = require('mysql2/promise');
require('dotenv').config();

async function testRDSConnection() {
  console.log('🔍 Testing AWS RDS Connection with different options...\n');
  
  const connectionOptions = [
    {
      name: 'Standard Connection',
      options: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
          rejectUnauthorized: false
        },
        connectTimeout: 10000
      }
    },
    {
      name: 'Connection without SSL',
      options: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectTimeout: 10000
      }
    },
    {
      name: 'Connection with longer timeout',
      options: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
          rejectUnauthorized: false
        },
        connectTimeout: 30000
      }
    }
  ];

  for (const test of connectionOptions) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`Host: ${test.options.host}`);
    console.log(`Port: ${test.options.port}`);
    
    try {
      const connection = await mysql.createConnection(test.options);
      console.log('✅ Connection successful!');
      
      // Test a simple query
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Query test successful!');
      
      await connection.end();
      console.log('🎉 This connection method works!');
      return; // Exit on first successful connection
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      if (error.code === 'ETIMEDOUT') {
        console.log('   → Network timeout - check security groups and public access');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('   → Connection refused - check if RDS is running and accessible');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('   → Authentication failed - check username/password');
      } else if (error.code === 'ENOTFOUND') {
        console.log('   → DNS resolution failed - check endpoint URL');
      }
    }
  }
  
  console.log('\n❌ All connection methods failed.');
  console.log('\n🔧 Next steps:');
  console.log('1. Check AWS RDS Console - is the instance "Available"?');
  console.log('2. Verify "Publicly accessible" is "Yes"');
  console.log('3. Check security group allows port 3306 from your IP');
  console.log('4. Try connecting from AWS Console "Connect" button first');
}

testRDSConnection();
