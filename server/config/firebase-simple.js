const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let serviceAccount;

// Try to use service account JSON file first
try {
  // If you have a service account JSON file, place it in the root directory
  // and uncomment the line below:
  // serviceAccount = require('../../serviceAccountKey.json');
  
  // For now, we'll use environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };
} catch (error) {
  console.error('Error loading service account:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your .env file has all required Firebase variables');
    console.log('2. Verify the service account key is correctly formatted');
    console.log('3. Ensure the project ID matches your Firebase project');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth
};
