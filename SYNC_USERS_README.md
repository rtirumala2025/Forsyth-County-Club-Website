# Firebase Auth to Firestore User Sync Script

This script syncs all existing Firebase Auth users to Firestore by creating default profile documents for users who don't already have them.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Firebase project with Authentication and Firestore enabled
- Admin access to your Firebase project

### Step 1: Install Dependencies

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Or if you prefer to use the provided package.json
cp package-sync.json package.json
npm install
```

### Step 2: Generate Service Account Key

1. **Go to Firebase Console**:
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Project Settings**:
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

3. **Generate Service Account Key**:
   - Go to "Service accounts" tab
   - Click "Generate new private key"
   - Download the JSON file
   - **Rename it to `serviceAccountKey.json`**
   - **Place it in the same directory as the sync script**

4. **Set Permissions** (Important!):
   - The service account needs these roles:
     - `Firebase Authentication Admin`
     - `Cloud Firestore User` or `Cloud Firestore Admin`

### Step 3: Configure Firestore Security Rules

Make sure your Firestore security rules allow the service account to write to the `users` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow service account to read/write users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Step 4: Run the Script

```bash
# Make the script executable (optional)
chmod +x sync-users-to-firestore.js

# Run the sync script
node sync-users-to-firestore.js
```

### Step 5: Verify Results

1. **Check Console Output**:
   The script will show detailed logs like:
   ```
   🚀 Starting Firebase Auth to Firestore user sync...
   👥 Fetching users from Firebase Auth...
   📊 Found 25 total users in Firebase Auth
   📦 Processing batch of 25 users...
   ⏭️  Skipping user abc123... (user1@example.com) - profile already exists
   📝 Creating profile for user def456... (user2@example.com)
   ✅ Created profile for user def456... (user2@example.com)
   🎉 Sync completed!
   📊 Final Results:
      • Total processed: 25
      • Profiles created: 15
      • Profiles skipped (already exist): 10
      • Errors: 0
   ```

2. **Check Firebase Console**:
   - Go to Firestore Database
   - Navigate to `users` collection
   - Verify documents exist with the correct structure

3. **Verify Document Structure**:
   Each user document should have:
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

## 🔧 Configuration Options

### Environment Variables (Alternative to JSON file)

Instead of using `serviceAccountKey.json`, you can set an environment variable:

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
node sync-users-to-firestore.js
```

### Script Configuration

You can modify these constants in the script:

```javascript
const BATCH_SIZE = 100; // Process users in batches
const MAX_USERS = 1000; // Safety limit (remove for unlimited)
```

## 🛠️ Troubleshooting

### Common Issues

1. **"No service account key found"**:
   - Ensure `serviceAccountKey.json` is in the same directory
   - Check the file name is exactly `serviceAccountKey.json`
   - Verify the JSON file is valid

2. **"Permission denied"**:
   - Check service account has proper roles
   - Verify Firestore security rules
   - Ensure the project ID is correct

3. **"Failed to initialize Firebase Admin SDK"**:
   - Verify the service account key is valid
   - Check the project ID matches your Firebase project
   - Ensure all required fields are present in the key

4. **"Too many users"**:
   - Increase `MAX_USERS` constant if needed
   - The script processes users in batches to avoid memory issues

### Debug Mode

For more detailed logging, you can modify the script to include additional debug information:

```javascript
// Add this at the top of the script for debug mode
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('🐛 Debug mode enabled');
  // Additional debug logging here
}
```

Then run with:
```bash
DEBUG=true node sync-users-to-firestore.js
```

## 📊 Expected Output

### Successful Run
```
🔥 Firebase Auth to Firestore User Sync Script
==============================================

🔑 Loading service account key from file...
✅ Firebase Admin SDK initialized successfully
🚀 Starting Firebase Auth to Firestore user sync...

👥 Fetching users from Firebase Auth...
📊 Found 25 total users in Firebase Auth

📦 Processing batch of 25 users...
⏭️  Skipping user abc123... (user1@example.com) - profile already exists
📝 Creating profile for user def456... (user2@example.com)
✅ Created profile for user def456... (user2@example.com)
⏭️  Skipping user ghi789... (user3@example.com) - profile already exists
📝 Creating profile for user jkl012... (user4@example.com)
✅ Created profile for user jkl012... (user4@example.com)

🎉 Sync completed!
📊 Final Results:
   • Total processed: 25
   • Profiles created: 15
   • Profiles skipped (already exist): 10
   • Errors: 0

✅ All users synced successfully!

🔍 Verifying Firestore documents...
📊 Found 25 documents in Firestore users collection

📋 Sample documents:
   • abc123...: John Doe (john@example.com)
   • def456...: Jane Smith (jane@example.com)
   • ghi789...: Bob Johnson (bob@example.com)
   • ... and 22 more documents

🎯 Script completed successfully!
```

## 🔒 Security Notes

1. **Never commit service account keys to version control**
2. **Use environment variables in production**
3. **Rotate service account keys regularly**
4. **Limit service account permissions to minimum required**
5. **Monitor Firestore usage and costs**

## 📝 Next Steps

After running the sync script:

1. **Test your React app** to ensure profiles load correctly
2. **Update your app** to handle the new profile structure
3. **Monitor Firestore** for any issues
4. **Set up monitoring** for new user registrations

## 🆘 Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your Firebase project configuration
3. Ensure all dependencies are installed correctly
4. Check Firebase Console for any service issues

---

**Note**: This script is designed to be run once for migration purposes. For ongoing user management, rely on your React app's profile creation logic.
