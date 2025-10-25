# 🚀 Quick Start Guide - Drug Effects Tracker

Get your Firebase-powered drug effects tracking application running in 5 minutes!

## ⚡ **Super Quick Setup**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Set Up Firebase (2 minutes)**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter name: `drug-effects-tracker`
4. Click **"Create project"**
5. Click **"Firestore Database"** → **"Create database"** → **"Start in test mode"**
6. Click gear icon (⚙️) → **"Project settings"** → **"Service accounts"**
7. Click **"Generate new private key"** → Download JSON file
8. Rename to `serviceAccountKey.json` and place in project root

### **Step 3: Create .env File**
Create `.env` file in project root:
```env
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
```

### **Step 4: Test & Setup**
```bash
# Test Firebase connection
node test-firebase-simple.js

# Complete setup with example data
node setup-firebase-complete.js

# Start the application
npm run dev
```

### **Step 5: Open Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎉 **You're Done!**

Your application is now running with:
- ✅ Firebase Firestore database
- ✅ Example drugs seeded
- ✅ Real-time capabilities
- ✅ AI-powered side effect analysis
- ✅ Doctor and patient portals

## 🔧 **Troubleshooting**

**If Firebase connection fails:**
1. Check your `serviceAccountKey.json` file is in project root
2. Verify your `.env` file has the correct database URL
3. Ensure Firestore is enabled in Firebase Console

**If you get permission errors:**
1. Check Firestore security rules in Firebase Console
2. Make sure you're using the correct service account key

## 📚 **Full Documentation**

- **Complete Setup**: `FIREBASE-SETUP.md`
- **Troubleshooting**: `FIREBASE-TROUBLESHOOTING.md`
- **API Documentation**: See README.md

## 🎯 **What You Can Do Now**

1. **Register as a Doctor:**
   - Create prescriptions for patients
   - Monitor side effect reports
   - View analytics dashboard

2. **Register as a Patient:**
   - View your prescriptions
   - Report side effects
   - Get AI analysis of your symptoms

3. **Test Features:**
   - Real-time notifications
   - AI-powered side effect analysis
   - Drug interaction detection
   - Analytics and reporting

## 🚀 **Deploy to Production**

When ready to deploy:
1. **Firebase Hosting** (Frontend): `firebase deploy`
2. **Cloud Functions** (Backend): Deploy as Firebase Functions
3. **Environment Variables**: Set production values in Firebase Console

## 💡 **Pro Tips**

- Use Firebase Console to monitor your database in real-time
- Check the Analytics tab for usage statistics
- Use Firebase Authentication for additional security
- Set up Firebase Cloud Messaging for push notifications

**Happy coding! 🎉**
