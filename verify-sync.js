#!/usr/bin/env node

/**
 * Verification Script for Firebase User Sync
 * 
 * This script verifies that the user sync was successful by checking
 * Firestore documents and comparing with Firebase Auth users.
 * 
 * Features:
 * - Comprehensive verification of sync results
 * - Detailed comparison between Auth and Firestore
 * - Profile structure validation
 * - Missing/extra profile detection
 * - Sample profile display
 * 
 * Usage: node verify-sync.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logProgress(message) {
  log(`🔄 ${message}`, 'cyan');
}

/**
 * Load and validate service account key (same as main script)
 */
function loadServiceAccountKey() {
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  
  // Try loading from file first
  if (fs.existsSync(keyPath)) {
    try {
      logInfo(`Loading service account key from serviceAccountKey.json`);
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      return serviceAccount;
    } catch (error) {
      logError(`Failed to load service account key from file: ${error.message}`);
    }
  }
  
  // Try environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      logInfo('Loading service account key from environment variable');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return serviceAccount;
    } catch (error) {
      logError(`Failed to load service account key from environment: ${error.message}`);
    }
  }
  
  logError('Service account key not found. Please provide serviceAccountKey.json file or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
  return null;
}

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  const serviceAccount = loadServiceAccountKey();
  if (!serviceAccount) {
    return false;
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    logSuccess(`Firebase Admin SDK initialized for project: ${serviceAccount.project_id}`);
    return true;
  } catch (error) {
    logError(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    return false;
  }
}

/**
 * Validate profile structure
 */
function validateProfileStructure(data, uid) {
  const requiredFields = ['name', 'email', 'bio', 'grade', 'clubs', 'profilePic', 'createdAt'];
  const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      issues: [`Missing fields: ${missingFields.join(', ')}`]
    };
  }
  
  const issues = [];
  
  // Check field types
  if (typeof data.name !== 'string') issues.push('name should be string');
  if (typeof data.email !== 'string') issues.push('email should be string');
  if (typeof data.bio !== 'string') issues.push('bio should be string');
  if (typeof data.grade !== 'string') issues.push('grade should be string');
  if (!Array.isArray(data.clubs)) issues.push('clubs should be array');
  if (typeof data.profilePic !== 'string') issues.push('profilePic should be string');
  
  // Check createdAt
  if (!data.createdAt) {
    issues.push('createdAt is missing');
  } else if (typeof data.createdAt.toDate !== 'function' && typeof data.createdAt !== 'object') {
    issues.push('createdAt should be Firestore timestamp');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Main verification function
 */
async function verifySync() {
  log('🔍 Verifying Firebase User Sync Results\n', 'bright');

  try {
    // Get all Firebase Auth users
    logProgress('Fetching Firebase Auth users...');
    const authUsers = await admin.auth().listUsers();
    logSuccess(`Found ${authUsers.users.length} users in Firebase Auth`);

    // Get all Firestore user documents
    logProgress('Fetching Firestore user documents...');
    const firestoreSnapshot = await admin.firestore().collection('users').get();
    logSuccess(`Found ${firestoreSnapshot.size} documents in Firestore`);

    // Check for missing profiles
    const authUids = new Set(authUsers.users.map(user => user.uid));
    const firestoreUids = new Set(firestoreSnapshot.docs.map(doc => doc.id));
    
    const missingProfiles = [...authUids].filter(uid => !firestoreUids.has(uid));
    const extraProfiles = [...firestoreUids].filter(uid => !authUids.has(uid));

    log('\n📋 Verification Results:', 'bright');
    log(`   • Firebase Auth users: ${authUsers.users.length}`, 'cyan');
    log(`   • Firestore profiles: ${firestoreSnapshot.size}`, 'cyan');
    log(`   • Missing profiles: ${missingProfiles.length}`, missingProfiles.length > 0 ? 'red' : 'green');
    log(`   • Extra profiles: ${extraProfiles.length}`, extraProfiles.length > 0 ? 'yellow' : 'green');

    if (missingProfiles.length > 0) {
      logWarning('\nUsers missing Firestore profiles:');
      missingProfiles.forEach(uid => {
        const user = authUsers.users.find(u => u.uid === uid);
        log(`   • ${uid} (${user?.email || 'no email'})`, 'red');
      });
    }

    if (extraProfiles.length > 0) {
      logWarning('\nFirestore profiles without Auth users:');
      extraProfiles.forEach(uid => {
        log(`   • ${uid}`, 'yellow');
      });
    }

    // Check profile structure
    logProgress('\nChecking profile structure...');
    let validProfiles = 0;
    let invalidProfiles = 0;
    const invalidProfileDetails = [];

    firestoreSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const validation = validateProfileStructure(data, doc.id);
      
      if (validation.valid) {
        validProfiles++;
      } else {
        invalidProfiles++;
        invalidProfileDetails.push({
          uid: doc.id,
          issues: validation.issues
        });
      }
    });

    log(`   • Valid profiles: ${validProfiles}`, validProfiles > 0 ? 'green' : 'red');
    log(`   • Invalid profiles: ${invalidProfiles}`, invalidProfiles > 0 ? 'red' : 'green');

    if (invalidProfiles > 0) {
      logWarning('\nInvalid profile structures:');
      invalidProfileDetails.forEach(detail => {
        log(`   • ${detail.uid}:`, 'red');
        detail.issues.forEach(issue => {
          log(`     - ${issue}`, 'red');
        });
      });
    }

    // Show sample profiles
    log('\n📋 Sample profiles:', 'bright');
    const sampleCount = Math.min(3, firestoreSnapshot.size);
    firestoreSnapshot.docs.slice(0, sampleCount).forEach((doc, index) => {
      const data = doc.data();
      log(`   ${index + 1}. ${doc.id}:`, 'cyan');
      log(`      - Name: ${data.name || '(empty)'}`, 'blue');
      log(`      - Email: ${data.email || '(empty)'}`, 'blue');
      log(`      - Bio: ${data.bio || '(empty)'}`, 'blue');
      log(`      - Grade: ${data.grade || '(empty)'}`, 'blue');
      log(`      - Clubs: ${data.clubs?.length || 0} selected`, 'blue');
      log(`      - Profile Pic: ${data.profilePic ? 'Yes' : 'No'}`, 'blue');
      log(`      - Created: ${data.createdAt?.toDate?.() || data.createdAt || '(unknown)'}`, 'blue');
    });

    if (firestoreSnapshot.size > sampleCount) {
      log(`   • ... and ${firestoreSnapshot.size - sampleCount} more profiles`, 'blue');
    }

    // Calculate sync statistics
    const syncStats = {
      totalAuthUsers: authUsers.users.length,
      totalFirestoreProfiles: firestoreSnapshot.size,
      missingProfiles: missingProfiles.length,
      extraProfiles: extraProfiles.length,
      validProfiles: validProfiles,
      invalidProfiles: invalidProfiles,
      syncCompleteness: authUsers.users.length > 0 ? 
        ((authUsers.users.length - missingProfiles.length) / authUsers.users.length * 100).toFixed(1) : 100
    };

    // Final summary
    log('\n🎯 Verification Summary:', 'bright');
    log(`   • Sync Completeness: ${syncStats.syncCompleteness}%`, 
        syncStats.syncCompleteness == 100 ? 'green' : 'yellow');
    log(`   • Data Integrity: ${invalidProfiles === 0 ? '100%' : 'Issues Found'}`, 
        invalidProfiles === 0 ? 'green' : 'red');
    
    if (missingProfiles.length === 0 && invalidProfiles === 0) {
      logSuccess('\n🎉 All users have valid Firestore profiles!');
      return { success: true, stats: syncStats };
    } else {
      logWarning('\n⚠️  Some issues found. Consider re-running the sync script.');
      return { success: false, stats: syncStats };
    }

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution function
 */
async function main() {
  log('🔍 Firebase User Sync Verification Script', 'bright');
  log('==========================================\n', 'bright');

  try {
    // Initialize Firebase
    if (!initializeFirebase()) {
      process.exit(1);
    }

    // Run verification
    const result = await verifySync();
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    logError(`Verification script failed: ${error.message}`);
    process.exit(1);
  } finally {
    // Clean up
    if (admin.apps.length > 0) {
      try {
        await admin.app().delete();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(error => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  verifySync,
  validateProfileStructure,
  initializeFirebase
};