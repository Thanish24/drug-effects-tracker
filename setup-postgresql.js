#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐘 MedAlert Pro - PostgreSQL Setup Script\n');

async function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed!\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function checkPostgreSQL() {
  console.log('🔍 Checking PostgreSQL installation...');
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL is installed\n');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL not found. Please install PostgreSQL first.');
    console.log('   macOS: brew install postgresql');
    console.log('   Ubuntu: sudo apt-get install postgresql postgresql-contrib');
    console.log('   Windows: Download from https://www.postgresql.org/download/\n');
    return false;
  }
}

async function createDatabase() {
  console.log('🗄️  Creating database...');
  try {
    // Try to create database
    execSync('createdb medalert_pro', { stdio: 'pipe' });
    console.log('✅ Database "medalert_pro" created successfully\n');
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Database "medalert_pro" already exists\n');
      return true;
    } else {
      console.log('❌ Failed to create database. Please check PostgreSQL is running.');
      console.log('   Start PostgreSQL: brew services start postgresql (macOS)');
      console.log('   Or: sudo service postgresql start (Linux)\n');
      return false;
    }
  }
}

async function createEnvFile() {
  console.log('📝 Creating .env file...');
  
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Please update it with PostgreSQL credentials.\n');
    return true;
  }
  
  const envContent = `# Database Configuration
DB_NAME=medalert_pro
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Analytics Thresholds
SIDE_EFFECT_SPIKE_THRESHOLD=0.15
DRUG_INTERACTION_THRESHOLD=0.1
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');
    console.log('⚠️  Please update the database password and OpenAI API key in .env file\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    return false;
  }
}

async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const { sequelize } = require('./server/config/database');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('   Please check your .env file and ensure PostgreSQL is running\n');
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up MedAlert Pro with PostgreSQL...\n');
  
  // Check prerequisites
  const pgInstalled = await checkPostgreSQL();
  if (!pgInstalled) {
    process.exit(1);
  }
  
  // Create database
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    process.exit(1);
  }
  
  // Create .env file
  const envCreated = await createEnvFile();
  if (!envCreated) {
    process.exit(1);
  }
  
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('⚠️  Setup completed but connection test failed.');
    console.log('   Please update your .env file with correct credentials and try again.\n');
    process.exit(1);
  }
  
  console.log('🎉 Setup completed successfully!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Update .env file with your OpenAI API key');
  console.log('   2. Run: npm run dev');
  console.log('   3. Run: node populate-all-alert-data.js (to populate test data)');
  console.log('   4. Open http://localhost:3000 in your browser\n');
  
  console.log('🔧 Available Commands:');
  console.log('   • npm run dev - Start development server');
  console.log('   • npm run server - Start backend only');
  console.log('   • npm run client - Start frontend only');
  console.log('   • node populate-all-alert-data.js - Populate test data');
  console.log('   • node setup-postgresql.js - This setup script\n');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled by user.');
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
