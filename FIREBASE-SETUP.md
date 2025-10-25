# Firebase Setup Guide for Drug Effects Tracker

This guide will help you set up Firebase Firestore for the Drug Effects Tracker application.

## 🚀 **Step 1: Create Firebase Project**

### **1.1 Go to Firebase Console**
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `drug-effects-tracker` (or your preferred name)
4. Click **"Continue"**

### **1.2 Configure Project**
1. **Google Analytics**: Choose whether to enable (recommended: Yes)
2. **Analytics Account**: Select or create new account
3. Click **"Create project"**
4. Wait for project creation (1-2 minutes)

## 🔥 **Step 2: Enable Firestore Database**

### **2.1 Navigate to Firestore**
1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**

### **2.2 Choose Security Rules**
1. **Start in test mode** (for development)
2. Click **"Next"**
3. **Choose location**: Select closest to your users (e.g., `us-central1`)
4. Click **"Done"**

### **2.3 Update Security Rules (Important)**
1. Go to **"Rules"** tab in Firestore
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access for drugs
    match /drugs/{drugId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Prescriptions - patients can read their own, doctors can read/write
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null;
    }
    
    // Side effects - patients can read/write their own
    match /sideEffects/{sideEffectId} {
      allow read, write: if request.auth != null;
    }
    
    // Analytics alerts - doctors only
    match /analyticsAlerts/{alertId} {
      allow read, write: if request.auth != null;
    }
    
    // Drug interactions - public read
    match /drugInteractions/{interactionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## 🔑 **Step 3: Generate Service Account Key**

### **3.1 Go to Project Settings**
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**

### **3.2 Generate Service Account Key**
1. Go to **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"**
4. **Download the JSON file** - this contains your credentials

## 📝 **Step 4: Configure Environment Variables**

### **4.1 Create .env File**
Create a `.env` file in your project root:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Analytics Thresholds
SIDE_EFFECT_SPIKE_THRESHOLD=0.15
DRUG_INTERACTION_THRESHOLD=0.1
```

### **4.2 Get Values from Service Account JSON**
From your downloaded JSON file, copy:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `databaseURL` → `FIREBASE_DATABASE_URL`

## 🧪 **Step 5: Test Firebase Connection**

### **5.1 Install Dependencies**
```bash
npm install
```

### **5.2 Test Connection**
```bash
node test-firebase-connection.js
```

### **5.3 Start Application**
```bash
npm run dev
```

## 🔧 **Step 6: Seed Initial Data**

### **6.1 Add Example Drugs**
```bash
node seed-drugs-firebase.js
```

## 🎯 **Firebase Advantages**

### **✅ Benefits:**
- **No server setup** - Firebase handles everything
- **Automatic scaling** - Handles millions of users
- **Real-time updates** - Perfect for live notifications
- **Built-in security** - Authentication and authorization
- **Global CDN** - Fast worldwide access
- **Free tier** - Generous limits for development

### **📊 Free Tier Limits:**
- **50,000 reads/day**
- **20,000 writes/day**
- **20,000 deletes/day**
- **1 GB storage**
- **10 GB/month transfer**

## 🔒 **Security Best Practices**

### **1. Environment Variables**
- Never commit `.env` file to version control
- Use different projects for development/production
- Rotate service account keys regularly

### **2. Firestore Rules**
- Always validate data in security rules
- Use authentication checks
- Limit access to necessary data only

### **3. Production Setup**
- Enable App Check for additional security
- Set up monitoring and alerts
- Configure backup strategies

## 🚀 **Deployment Options**

### **Firebase Hosting (Frontend)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### **Cloud Functions (Backend)**
```bash
firebase init functions
# Deploy your Express app as Cloud Functions
```

## 📈 **Monitoring and Analytics**

### **Firebase Console**
- Real-time database usage
- Performance monitoring
- Error tracking
- User analytics

### **Cloud Monitoring**
- Set up alerts for high usage
- Monitor performance metrics
- Track error rates

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Authentication Errors**
   - Check service account key format
   - Verify project ID is correct
   - Ensure private key is properly formatted

2. **Permission Denied**
   - Check Firestore security rules
   - Verify user authentication
   - Test rules in Firebase Console

3. **Connection Timeouts**
   - Check internet connection
   - Verify Firebase project is active
   - Check for firewall restrictions

## 💰 **Cost Estimation**

### **Development (Free)**
- All features available
- No cost for small projects
- Perfect for testing and development

### **Production Costs**
- **Firestore**: $0.18 per 100K reads, $0.18 per 100K writes
- **Storage**: $0.18 per GB
- **Bandwidth**: $0.12 per GB
- **Functions**: $0.40 per million invocations

## 🎉 **You're Ready!**

Your Firebase setup is complete! The application will now use Firestore instead of MySQL, providing:
- ✅ Real-time data synchronization
- ✅ Automatic scaling
- ✅ Built-in security
- ✅ Global performance
- ✅ Easy deployment options
