const fs = require('fs');
const path = require('path');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 Current .env file loaded');
} catch (error) {
  console.log('❌ Could not read .env file');
  process.exit(1);
}

// Extract the Groq API key
const groqMatch = envContent.match(/GROQ_API_KEY=(.+)/);
const groqKey = groqMatch ? groqMatch[1].trim() : null;

if (!groqKey) {
  console.log('❌ GROQ_API_KEY not found in .env file');
  process.exit(1);
}

console.log(`✅ Found Groq API key: ${groqKey.substring(0, 20)}...`);

// Create a properly formatted .env file
const newEnvContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=drug-effects-tracker
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDZWa5A+MyqjmhJ\\nRHe7jzx+wBpQoAAminSGVBTJhEYUOaqB+sPujAIjIBq22IjwOSdr9+JhTksGpg6U\\n8wu42PSld+sSWu+fETgT+9idwpNvZGc+ABiUdHTw++Op7HGk/e5hBpQ8fDYEJzoI\\nh+86iGKX1Z0t1fc/jaVqxrctIpZuL34p92qz8+o18lp70wW1lle6Set9N9K16LXX\\n2nIk+ikj3FlSZ87FRxBMbTCs3lmxYbf0FYePjP5NLsd7FWQXHADppaHIw5iBvk2p\\nfm2CnI3euDPycN0jYwHUGVHW5rJ7433k0dYxDxXdyla8EJBoJZHtvBd9qz/dv95v\\nskTtOCIVAgMBAAECggEALsjLxh732Q+RuZGkDyqQDD13/JpQJfugBOkU12KiPgjC\\nn7tVUOPwstReg7Sc106KIoanQyg55Iq6cUvWnlmO4Y4sOpV55jyr3DtV33FqUGwl\\nf/Y/1Da0FEo38VPci3YASYDDyDg5XU//QSZXc3s3c7TOojbgA11POapf8/ZxuHIZ\\njKMB8PiXRI19nkA4ZFaX29UvjYpEFZpNPSHqpNqQVRoSDqtuzUzlfM64JgjOa20r\\nozqFIL6wiCViF9moUBB1nN9hEU5RLrj5OupLsOIy7YJPFWIZFlr7FjDa3GFtbtsq\\nvKaN9JBueVWgztVYHoz2F+LyJK67XJa7Mmvp3wHteQKBgQDxCp4GeflhgiLONHek\\njNV1qk3/TgXKF7UQcNBLh72fYyKDmUNlkAIoDGtiDp8UkTA8+E8eGV+ivAaWxUjG\\nak7k6hcGtHpWaBgAFXe7MpfAiQ53ogDd0jpm0Nqwc3nZ/XX6WvPSOZjIDk+R91Re\\ntDgKAgt/pXdyhEUGjdd10ENUHQKBgQDm1q+qxk+7PqIZcUjnJ0+eDVVw4yEufUQx\\n34kBOvXXfQ5mCRvRl4Y7gHVHiKg8Le8IYobnRbfP9T26EVNMSOGtGS+PZxE9+uMV\\neSPxjq3SHgFgYqd0xaGtMp6NQjp8U9M5M4am+2gcrkgcvjMHQOrpG2KF0mgTI20j\\nCWQoCoI0WQKBgQCXr5DGjperDxQMI+RuvtnN1ECFO3pVNRoSoIvUHDXuSZp8qkRJ\\nc5iHz1j8OitN7BgpJjHTxS/z3tNeqgQkKN5BHDclVwntuk/wLZJNUYdB+H4MNvzI\\nmvV5olEc3W5/CgvmYroxP2Gv86GLP9PuTQc+9Q57Y4uJm0c82qIOV+Mm2QKBgQCC\\nkufVMs4A/aHVwHXbgyoPHj25WFD5qhP8HhSyZHaRiQSvBPH+cbaVS8mLSCrZt6Xh\\nWVIz2gTqli9vY8N5gDRfpMJ5XHStWZBAIkEJr4p1M1HWApf0fqJAhUSYZOEOWKA/\\nV/0P0WAH8TGLSK82qCr45uupBOaoBL8ENZi46ZDTKQKBgQDpzr5gOUuIyaYEOHv6\\nAE1krOMl/7u3XYG0k8m+ifvNBXpfY1AZi9BluYxQQFmCbq9cZwwsvCRrppvqOTGu\\nonFJhkIjZuGLnzNQgNwMeQakbuNjBkYYVjMNDuScxX3IpdcsMIFLCx4U60UsyN0Q\\nObIhJliVJwtq08gj9E8arKEOdg==\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@drug-effects-tracker.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://drug-effects-tracker-default-rtdb.firebaseio.com

# Database Configuration (AWS RDS MySQL)
DB_HOST=bhs.ckzcsqiqi4i0.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=bhs
DB_USER=admin
DB_PASSWORD=12345678

# AWS RDS Configuration
AWS_REGION=us-east-1
RDS_ENDPOINT=bhs.ckzcsqiqi4i0.us-east-1.rds.amazonaws.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Groq Configuration (faster and cheaper than OpenAI)
GROQ_API_KEY=${groqKey}

# OpenAI Configuration (deprecated - using Groq instead)
OPENAI_API_KEY=deprecated_use_groq

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

// Write the new .env file
try {
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ .env file updated successfully!');
  console.log('📋 Changes made:');
  console.log('   - Moved GROQ_API_KEY to proper location');
  console.log('   - Fixed formatting and structure');
  console.log('   - Added proper comments');
  console.log('\n🧪 Now test with: node test-current-groq-models.js');
} catch (error) {
  console.log('❌ Could not write .env file:', error.message);
}
