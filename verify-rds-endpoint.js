const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyRDSEndpoint() {
  console.log('🔍 Verifying AWS RDS Configuration...\n');
  
  // Display current configuration
  console.log('Current Configuration:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}\n`);

  // Check if all required environment variables are set
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('\nPlease check your .env file and ensure all variables are set.');
    return;
  }

  // Test DNS resolution
  console.log('🔍 Testing DNS resolution...');
  try {
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    const result = await lookup(process.env.DB_HOST);
    console.log(`✅ DNS resolution successful: ${result.address}`);
  } catch (error) {
    console.error('❌ DNS resolution failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Check if the RDS instance is running in AWS Console');
    console.log('2. Verify the endpoint URL is correct');
    console.log('3. Ensure the RDS instance is in the correct region');
    console.log('4. Check if the instance is publicly accessible');
    return;
  }

  // Test connection
  console.log('\n🔌 Testing database connection...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 10000 // 10 second timeout
    });

    console.log('✅ Database connection successful!');
    
    // Test database creation
    const dbName = process.env.DB_NAME;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' is ready`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nPossible solutions:');
      console.log('1. Check if the RDS instance is running');
      console.log('2. Verify the port number (should be 3306)');
      console.log('3. Check security group allows connections from your IP');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nPossible solutions:');
      console.log('1. Check username and password');
      console.log('2. Verify the user has proper permissions');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\nPossible solutions:');
      console.log('1. Verify the endpoint URL in AWS Console');
      console.log('2. Check if the RDS instance is in the correct region');
      console.log('3. Ensure the instance is publicly accessible');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyRDSEndpoint();
