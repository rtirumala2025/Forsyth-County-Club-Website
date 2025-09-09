# 🔥 Firebase User Sync - Complete Automation

This is a production-ready Node.js solution that automatically syncs all existing Firebase Auth users to Firestore with comprehensive error handling, verification, and security features.

## 🚀 Quick Start (One Command)

```bash
node run-complete-sync.js
```

That's it! This single command will:
1. ✅ Install dependencies automatically
2. ✅ Set up service account key (if needed)
3. ✅ Sync all Firebase Auth users to Firestore
4. ✅ Verify the results

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `run-complete-sync.js` | **Main automation script** - runs everything |
| `sync-users-to-firestore.js` | Core sync logic with batch processing |
| `verify-sync.js` | Comprehensive verification and validation |
| `setup-service-account.js` | Interactive service account setup |
| `package.json` | Dependencies and npm scripts |
| `.gitignore` | Security protection for service account keys |

## 🛠️ Manual Setup (Alternative)

If you prefer to run steps individually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Service Account Key
```bash
node setup-service-account.js
```

### 3. Run Sync
```bash
node sync-users-to-firestore.js
```

### 4. Verify Results
```bash
node verify-sync.js
```

## 🔑 Service Account Key Setup

### Option A: Interactive Setup (Recommended)
```bash
node setup-service-account.js
```

### Option B: Manual Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Rename it to `serviceAccountKey.json`
7. Place it in this directory

### Option C: Environment Variable
```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## 🔒 Security Features

- ✅ **Service account key protection** (never committed to git)
- ✅ **Environment variable support** for production
- ✅ **Automatic .gitignore** configuration
- ✅ **Key validation** before use
- ✅ **Permission verification** with test connection

## 📊 What Gets Created

Each Firebase Auth user gets a Firestore document at `users/{uid}` with:

```json
{
  "name": "User Name or Email Prefix",
  "email": "user@example.com",
  "bio": "",
  "grade": "",
  "clubs": [],
  "profilePic": "",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Expected Output

### Successful Run
```
🚀 Firebase User Sync - Complete Automation
===========================================

📋 Step 1: Installing Dependencies
==================================================
✅ firebase-admin is already installed

📋 Step 2: Setting Up Service Account Key
==================================================
✅ Service account key already exists

📋 Step 3: Running User Sync
==================================================
🔥 Firebase Auth to Firestore User Sync Script
==============================================

🔑 Loading service account key from file...
✅ Firebase Admin SDK initialized for project: your-project-id
🚀 Starting Firebase Auth to Firestore user sync...

👥 Fetching users from Firebase Auth...
📊 Found 25 total users in Firebase Auth

📦 Processing batch 1/1 (25 users)
⏭️  Skipping user abc123... (user1@example.com) - profile already exists
📝 Creating profile for user def456... (user2@example.com)
✅ Created profile for user def456... (user2@example.com)

🎉 Sync completed!
📊 Final Results:
   • Total processed: 25
   • Profiles created: 15
   • Profiles skipped (already exist): 10
   • Errors: 0
   • Total Firestore profiles: 25

✅ All users synced successfully!

📋 Step 4: Verifying Results
==================================================
🔍 Firebase User Sync Verification Script
==========================================

✅ Firebase Admin SDK initialized for project: your-project-id
✅ Found 25 users in Firebase Auth
✅ Found 25 documents in Firestore

📋 Verification Results:
   • Firebase Auth users: 25
   • Firestore profiles: 25
   • Missing profiles: 0
   • Extra profiles: 0
   • Valid profiles: 25
   • Invalid profiles: 0

🎯 Verification Summary:
   • Sync Completeness: 100%
   • Data Integrity: 100%

🎉 All users have valid Firestore profiles!

🎯 Final Summary
================
✅ Step 1: Dependencies Installation
✅ Step 2: Service Account Setup
✅ Step 3: User Sync Process
✅ Step 4: Results Verification

🎉 All steps completed successfully!
Your Firebase users have been synced to Firestore.
```

## ⚙️ Configuration

You can modify these settings in `sync-users-to-firestore.js`:

```javascript
const CONFIG = {
  BATCH_SIZE: 100,           // Users processed per batch
  MAX_USERS: 1000,          // Safety limit (remove for unlimited)
  DELAY_BETWEEN_BATCHES: 1000, // Delay in milliseconds
  SERVICE_ACCOUNT_KEY_FILE: 'serviceAccountKey.json',
  ENV_VAR_NAME: 'FIREBASE_SERVICE_ACCOUNT_KEY'
};
```

## 🛡️ Error Handling

The scripts include comprehensive error handling:

- **Dependency installation failures**
- **Service account key validation**
- **Firebase connection issues**
- **Individual user processing errors**
- **Firestore write failures**
- **Network timeouts and retries**

## 🔍 Verification Features

The verification script checks:

- **User count comparison** (Auth vs Firestore)
- **Missing profiles detection**
- **Extra profiles detection**
- **Profile structure validation**
- **Field type validation**
- **Timestamp validation**
- **Sample profile display**

## 📋 Prerequisites

- Node.js 14+ installed
- Firebase project with Authentication and Firestore enabled
- Admin access to your Firebase project
- Service account with proper permissions

## 🔐 Required Permissions

Your service account needs these roles:
- `Firebase Authentication Admin`
- `Cloud Firestore User` (or `Cloud Firestore Admin`)
- `Firebase Admin SDK Administrator Service Agent`

## 🚨 Troubleshooting

### Common Issues

1. **"Service account key not found"**
   - Run `node setup-service-account.js`
   - Or manually create `serviceAccountKey.json`

2. **"Permission denied"**
   - Check service account has proper roles
   - Verify Firestore security rules
   - Ensure project ID is correct

3. **"Failed to install firebase-admin"**
   - Check Node.js version (14+ required)
   - Ensure npm is working
   - Try `npm install firebase-admin` manually

4. **"Too many users"**
   - Increase `MAX_USERS` in config
   - Or remove the limit entirely

### Debug Mode

For detailed logging, set environment variable:
```bash
DEBUG=true node run-complete-sync.js
```

## 📈 Performance

- **Batch processing** for large user bases
- **Memory efficient** with pagination
- **Rate limiting** to avoid API limits
- **Progress tracking** with detailed logs
- **Configurable batch sizes**

## 🔄 Re-running

The scripts are safe to run multiple times:
- **Existing profiles are skipped**
- **Only missing profiles are created**
- **No duplicate data**
- **Idempotent operation**

## 📞 Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your Firebase project configuration
3. Ensure all dependencies are installed correctly
4. Check Firebase Console for any service issues
5. Review the troubleshooting section above

## 🎯 Next Steps

After successful sync:

1. **Test your React app** to ensure profiles load correctly
2. **Update your app** to handle the new profile structure
3. **Monitor Firestore** for any issues
4. **Set up monitoring** for new user registrations
5. **Consider automated backups** of your Firestore data

---

**🎉 Ready to sync your users? Just run:**
```bash
node run-complete-sync.js
```
