# 🚨 Firestore Alert Data Population Scripts

This collection of scripts populates your Firestore database with test data that triggers different types of analytics alerts in the Drug Effects Tracker application.

## 📋 Available Scripts

### 1. **Side Effect Spike Alert Data** (`populate-side-effect-spike-data.js`)
Creates data that triggers **side effect spike alerts** when side effects increase significantly for a specific drug.

**What it creates:**
- 1 doctor, 3 patients
- 2 drugs (Lisinopril, Metformin)
- 3 prescriptions for Lisinopril
- 15 baseline side effects (older data)
- 50 recent side effects (spike data)

**Alert Triggered:** Side effect spike for Lisinopril (significant increase in side effects)

### 2. **Drug Interaction Alert Data** (`populate-drug-interaction-data.js`)
Creates data that triggers **drug interaction alerts** when multiple drugs interact causing side effects.

**What it creates:**
- 1 doctor, 2 patients
- 3 drugs (Warfarin, Aspirin, Digoxin)
- 4 prescriptions (multiple drugs per patient)
- Side effects indicating dangerous interactions
- Known drug interaction records

**Alerts Triggered:**
- Patient 1: Warfarin + Aspirin (major bleeding risk)
- Patient 2: Digoxin + Warfarin (moderate interaction)

### 3. **Analytics Report Data** (`populate-analytics-report-data.js`)
Creates comprehensive data for generating detailed analytics reports.

**What it creates:**
- 1 doctor, 4 patients
- 5 diverse drugs across different classes
- 5 prescriptions
- 50+ diverse side effects
- 2 existing analytics alerts

**Reports Generated:** Comprehensive analytics with trends, severity distribution, and insights

### 4. **Test Analytics Service** (`test-analytics-service.js`)
Tests the analytics service with the populated data to generate alerts and reports.

### 5. **Master Script** (`populate-all-alert-data.js`)
Runs all population scripts in sequence with progress tracking.

## 🚀 Quick Start

### Prerequisites
1. **Firebase Project Setup**
   - Create Firebase project
   - Enable Firestore Database
   - Generate service account key

2. **Environment Configuration**
   - Create `.env` file with Firebase credentials
   - Or place `serviceAccountKey.json` in project root

3. **Dependencies**
   ```bash
   npm install
   ```

### Run All Scripts
```bash
node populate-all-alert-data.js
```

### Run Individual Scripts
```bash
# Side effect spike data
node populate-side-effect-spike-data.js

# Drug interaction data
node populate-drug-interaction-data.js

# Analytics report data
node populate-analytics-report-data.js

# Test analytics service
node test-analytics-service.js
```

## 📊 Expected Results

After running the scripts, you should see:

### In Firestore Console:
- **Users Collection**: Doctors and patients
- **Drugs Collection**: Various medications
- **Prescriptions Collection**: Active prescriptions
- **SideEffects Collection**: Side effect reports
- **AnalyticsAlerts Collection**: Generated alerts
- **DrugInteractions Collection**: Known interactions

### In Analytics Service:
- **Side Effect Spike Alerts**: For drugs with increased side effects
- **Drug Interaction Alerts**: For dangerous drug combinations
- **Analytics Reports**: Comprehensive insights and trends

## 🔧 Configuration

### Alert Thresholds (in `.env`)
```env
SIDE_EFFECT_SPIKE_THRESHOLD=0.15    # 15% increase threshold
DRUG_INTERACTION_THRESHOLD=0.1      # 10% confidence threshold
```

### Customizing Data
You can modify the scripts to:
- Change drug names and classes
- Adjust side effect descriptions
- Modify patient demographics
- Change alert severity levels

## 🧪 Testing Scenarios

### Scenario 1: Side Effect Spike
1. Run `populate-side-effect-spike-data.js`
2. Run `test-analytics-service.js`
3. Check for Lisinopril spike alert

### Scenario 2: Drug Interaction
1. Run `populate-drug-interaction-data.js`
2. Run `test-analytics-service.js`
3. Check for Warfarin + Aspirin interaction alert

### Scenario 3: Comprehensive Analytics
1. Run `populate-analytics-report-data.js`
2. Run `test-analytics-service.js`
3. Review detailed analytics report

## 🚨 Alert Types Generated

### 1. Side Effect Spike Alert
```json
{
  "alertType": "side_effect_spike",
  "title": "Side Effect Spike Detected for [Drug Name]",
  "severity": "medium|high",
  "confidenceScore": 0.85,
  "dataPoints": {
    "recentRate": 0.4,
    "baselineRate": 0.32,
    "increaseRatio": 0.25
  }
}
```

### 2. Drug Interaction Alert
```json
{
  "alertType": "drug_interaction",
  "title": "Potential Drug Interaction Detected: [Drug1] + [Drug2]",
  "severity": "medium|high",
  "confidenceScore": 0.92,
  "dataPoints": {
    "analysis": {
      "hasInteractions": true,
      "severity": "major|moderate",
      "description": "Interaction description"
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues:

1. **Firebase Connection Failed**
   - Check `.env` file has correct Firebase credentials
   - Verify service account key is valid
   - Ensure Firestore is enabled

2. **No Alerts Generated**
   - Check if data was created successfully
   - Verify alert thresholds in `.env`
   - Run `test-analytics-service.js` to debug

3. **Script Errors**
   - Ensure all dependencies are installed
   - Check Firebase configuration
   - Verify Firestore security rules allow writes

### Debug Steps:
1. Check Firestore console for created data
2. Verify Firebase connection with `test-firebase-connection.js`
3. Run individual scripts to isolate issues
4. Check console output for specific error messages

## 📈 Next Steps

After populating data:
1. **Test Analytics Dashboard**: View alerts in your application
2. **Modify Thresholds**: Adjust sensitivity in `.env`
3. **Add More Scenarios**: Create additional test data
4. **Production Testing**: Use similar patterns for real data

## 🎯 Use Cases

These scripts are perfect for:
- **Development Testing**: Verify alert generation works
- **Demo Preparation**: Show analytics features
- **Performance Testing**: Test with realistic data volumes
- **Feature Validation**: Ensure all alert types work correctly
- **Training**: Learn how the analytics system works

---

**Happy Testing! 🚀**

For questions or issues, check the main project documentation or create an issue in the repository.
