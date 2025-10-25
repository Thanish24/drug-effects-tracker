const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAWSRDS() {
  let connection;
  
  try {
    console.log('🔌 Connecting to AWS RDS MySQL...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    
    // Connect to AWS RDS MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false // For AWS RDS SSL
      }
    });

    console.log('✅ Connected to AWS RDS MySQL');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'drug_effects_tracker';
    console.log(`📁 Creating database: ${dbName}`);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Test the connection
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection test successful');

    console.log('\n🎉 AWS RDS setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure your .env file has the correct AWS RDS credentials');
    console.log('2. Run: npm run dev');
    console.log('3. The application will automatically create all tables');

  } catch (error) {
    console.error('❌ AWS RDS setup failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your AWS RDS instance is running');
    console.log('2. Check your .env file has correct RDS credentials');
    console.log('3. Verify security groups allow connections from your IP');
    console.log('4. Ensure the RDS instance is publicly accessible (if needed)');
    console.log('5. Check VPC and subnet configurations');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupAWSRDS();
