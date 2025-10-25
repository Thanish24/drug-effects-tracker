const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let serviceAccount;

try {
  // Try to use service account JSON file first (recommended)
  serviceAccount = require('../../serviceAccountKey.json');
  console.log('✅ Using service account JSON file');
} catch (error) {
  // Fallback to environment variables
  console.log('⚠️ Service account file not found, using environment variables');
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
    console.log('1. Download service account key from Firebase Console');
    console.log('2. Place it as serviceAccountKey.json in project root');
    console.log('3. Or check your .env file has all Firebase variables');
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
