# Firebase Configuration Troubleshooting

## 🚨 **Error: "Service account object must contain a string 'project_id' property"**

This error occurs when the Firebase service account configuration is incomplete. Here's how to fix it:

## 🔧 **Solution 1: Use Service Account JSON File (Recommended)**

### **Step 1: Download Service Account Key**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon (⚙️) → **"Project settings"**
4. Go to **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Place it in your project root directory

### **Step 2: Update Firebase Configuration**
Replace the content of `server/config/firebase.js` with:

```javascript
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let serviceAccount;

try {
  // Use the service account JSON file
  serviceAccount = require('../../serviceAccountKey.json');
} catch (error) {
  console.error('❌ Service account file not found. Please download it from Firebase Console.');
  console.log('📁 Place the file as: serviceAccountKey.json in your project root');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth
};
```

### **Step 3: Update .env File**
Your `.env` file only needs:

```env
# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🔧 **Solution 2: Fix Environment Variables**

If you prefer to use environment variables, make sure your `.env` file has ALL these fields:

```env
# Firebase Configuration - ALL REQUIRED
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## 📋 **Step-by-Step Firebase Setup**

### **1. Create Firebase Project**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `drug-effects-tracker`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### **2. Enable Firestore**
1. In your Firebase project, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select location (e.g., `us-central1`)
5. Click **"Done"**

### **3. Generate Service Account Key**
1. Click gear icon (⚙️) → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Download the JSON file
5. Rename to `serviceAccountKey.json`
6. Place in your project root

### **4. Test Connection**
```bash
# Install dependencies
npm install

# Test Firebase connection
node test-firebase-connection.js

# If successful, seed example data
node seed-drugs-firebase.js

# Start the application
npm run dev
```

## 🔍 **Common Issues and Solutions**

### **Issue 1: "Service account file not found"**
**Solution:** Download the service account JSON file from Firebase Console and place it in your project root.

### **Issue 2: "Permission denied"**
**Solution:** Check Firestore security rules in Firebase Console.

### **Issue 3: "Project not found"**
**Solution:** Verify the project ID in your service account file matches your Firebase project.

### **Issue 4: "Invalid private key"**
**Solution:** Make sure the private key in your JSON file is properly formatted with `\n` characters.

## 🎯 **Quick Fix Commands**

```bash
# 1. Download service account key from Firebase Console
# 2. Place it as serviceAccountKey.json in project root
# 3. Test connection
node test-firebase-connection.js

# 4. If successful, start the app
npm run dev
```

## 📞 **Need Help?**

If you're still having issues:
1. Check the Firebase Console to ensure your project is active
2. Verify Firestore is enabled
3. Make sure the service account key is valid
4. Check that all required fields are present in the JSON file

The service account JSON file method is much more reliable than environment variables for Firebase setup!
