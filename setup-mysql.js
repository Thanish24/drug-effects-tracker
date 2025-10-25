const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupMySQLDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL server...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'drug_effects_tracker';
    console.log(`📁 Creating database: ${dbName}`);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Test the connection to the specific database
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection test successful');

    console.log('\n🎉 MySQL database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure your .env file has the correct MySQL credentials');
    console.log('2. Run: npm run dev');
    console.log('3. The application will automatically create all tables');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your .env file has correct credentials');
    console.log('3. Verify MySQL user has CREATE DATABASE privileges');
    console.log('4. Try connecting with MySQL Workbench or command line first');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupMySQLDatabase();
