#!/usr/bin/env node

/**
 * Firebase Auth to Firestore User Sync Script
 * 
 * This script automatically syncs all existing Firebase Auth users to Firestore
 * by creating default profile documents for users who don't already have them.
 * 
 * Features:
 * - Automatic dependency installation
 * - Service account key validation
 * - Batch processing for large user bases
 * - Comprehensive error handling and logging
 * - Production-ready with safety limits
 * 
 * Usage: node sync-users-to-firestore.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  BATCH_SIZE: 100,
  MAX_USERS: 1000,
  DELAY_BETWEEN_BATCHES: 1000, // 1 second
  SERVICE_ACCOUNT_KEY_FILE: 'serviceAccountKey.json',
  ENV_VAR_NAME: 'FIREBASE_SERVICE_ACCOUNT_KEY'
};

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
 * Check if firebase-admin is installed
 */
function checkDependencies() {
  try {
    require.resolve('firebase-admin');
    logSuccess('firebase-admin is already installed');
    return true;
  } catch (error) {
    logWarning('firebase-admin not found, installing...');
    return false;
  }
}

/**
 * Install firebase-admin dependency
 */
function installDependencies() {
  try {
    logProgress('Installing firebase-admin...');
    execSync('npm install firebase-admin', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    logSuccess('firebase-admin installed successfully');
    return true;
  } catch (error) {
    logError(`Failed to install firebase-admin: ${error.message}`);
    return false;
  }
}

/**
 * Validate service account key structure
 */
function validateServiceAccountKey(serviceAccount) {
  const requiredFields = [
    'type', 'project_id', 'private_key_id', 'private_key',
    'client_email', 'client_id', 'auth_uri', 'token_uri'
  ];
  
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    logError(`Service account key missing required fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  if (serviceAccount.type !== 'service_account') {
    logError('Invalid service account type');
    return false;
  }
  
  return true;
}

/**
 * Load and validate service account key
 */
function loadServiceAccountKey() {
  const keyPath = path.join(__dirname, CONFIG.SERVICE_ACCOUNT_KEY_FILE);
  
  // Try loading from file first
  if (fs.existsSync(keyPath)) {
    try {
      logInfo(`Loading service account key from ${CONFIG.SERVICE_ACCOUNT_KEY_FILE}`);
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      
      if (validateServiceAccountKey(serviceAccount)) {
        logSuccess('Service account key loaded and validated');
        return serviceAccount;
      }
    } catch (error) {
      logError(`Failed to load service account key from file: ${error.message}`);
    }
  }
  
  // Try environment variable
  if (process.env[CONFIG.ENV_VAR_NAME]) {
    try {
      logInfo('Loading service account key from environment variable');
      const serviceAccount = JSON.parse(process.env[CONFIG.ENV_VAR_NAME]);
      
      if (validateServiceAccountKey(serviceAccount)) {
        logSuccess('Service account key loaded from environment');
        return serviceAccount;
      }
    } catch (error) {
      logError(`Failed to load service account key from environment: ${error.message}`);
    }
  }
  
  logError(`Service account key not found. Please provide ${CONFIG.SERVICE_ACCOUNT_KEY_FILE} file or set ${CONFIG.ENV_VAR_NAME} environment variable.`);
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
 * Create default profile for a user
 */
async function createDefaultProfile(user) {
  const defaultProfile = {
    name: user.displayName || user.email?.split('@')[0] || "User",
    email: user.email || "",
    bio: "",
    grade: "",
    clubs: [],
    profilePic: "",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    const userRef = admin.firestore().collection('users').doc(user.uid);
    await userRef.set(defaultProfile);
    return defaultProfile;
  } catch (error) {
    throw new Error(`Failed to create profile for user ${user.uid}: ${error.message}`);
  }
}

/**
 * Check if user profile exists in Firestore
 */
async function profileExists(uid) {
  try {
    const userRef = admin.firestore().collection('users').doc(uid);
    const doc = await userRef.get();
    return doc.exists;
  } catch (error) {
    throw new Error(`Failed to check profile existence for user ${uid}: ${error.message}`);
  }
}

/**
 * Process a batch of users
 */
async function processUserBatch(users, batchNumber, totalBatches) {
  const results = {
    processed: 0,
    created: 0,
    skipped: 0,
    errors: 0
  };

  logProgress(`Processing batch ${batchNumber}/${totalBatches} (${users.length} users)`);

  for (const user of users) {
    try {
      results.processed++;
      
      // Check if profile already exists
      const exists = await profileExists(user.uid);
      
      if (exists) {
        logInfo(`Skipping user ${user.uid} (${user.email}) - profile already exists`);
        results.skipped++;
      } else {
        // Create default profile
        logProgress(`Creating profile for user ${user.uid} (${user.email})`);
        await createDefaultProfile(user);
        logSuccess(`Created profile for user ${user.uid} (${user.email})`);
        results.created++;
      }
    } catch (error) {
      logError(`Error processing user ${user.uid}: ${error.message}`);
      results.errors++;
    }
  }

  return results;
}

/**
 * Fetch all users from Firebase Auth with pagination
 */
async function fetchAllUsers() {
  logProgress('Fetching users from Firebase Auth...');
  
  let allUsers = [];
  let nextPageToken = null;
  let pageCount = 0;

  do {
    pageCount++;
    logProgress(`Fetching page ${pageCount}...`);
    
    const listUsersResult = await admin.auth().listUsers(CONFIG.BATCH_SIZE, nextPageToken);
    allUsers = allUsers.concat(listUsersResult.users);
    nextPageToken = listUsersResult.pageToken;
    
    logInfo(`Fetched ${listUsersResult.users.length} users (${allUsers.length} total so far)`);
    
    // Safety check
    if (allUsers.length >= CONFIG.MAX_USERS) {
      logWarning(`Reached maximum user limit (${CONFIG.MAX_USERS}). Stopping fetch.`);
      break;
    }
    
  } while (nextPageToken);

  logSuccess(`Fetched ${allUsers.length} total users from Firebase Auth`);
  return allUsers;
}

/**
 * Main sync function
 */
async function syncUsersToFirestore() {
  log('🚀 Starting Firebase Auth to Firestore user sync...\n', 'bright');

  try {
    // Fetch all users
    const allUsers = await fetchAllUsers();

    if (allUsers.length === 0) {
      logInfo('No users found in Firebase Auth');
      return { processed: 0, created: 0, skipped: 0, errors: 0 };
    }

    // Process users in batches
    const totalResults = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: 0
    };

    const totalBatches = Math.ceil(allUsers.length / CONFIG.BATCH_SIZE);
    logInfo(`Processing ${allUsers.length} users in ${totalBatches} batches`);

    for (let i = 0; i < allUsers.length; i += CONFIG.BATCH_SIZE) {
      const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
      const batch = allUsers.slice(i, i + CONFIG.BATCH_SIZE);
      
      const batchResults = await processUserBatch(batch, batchNumber, totalBatches);
      
      // Add batch results to total
      totalResults.processed += batchResults.processed;
      totalResults.created += batchResults.created;
      totalResults.skipped += batchResults.skipped;
      totalResults.errors += batchResults.errors;

      // Add delay between batches (except for the last batch)
      if (i + CONFIG.BATCH_SIZE < allUsers.length) {
        logProgress(`Waiting ${CONFIG.DELAY_BETWEEN_BATCHES}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }

    return totalResults;

  } catch (error) {
    logError(`Fatal error during sync: ${error.message}`);
    throw error;
  }
}

/**
 * Verify Firestore documents
 */
async function verifyFirestoreDocuments() {
  logProgress('Verifying Firestore documents...');
  
  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    logSuccess(`Found ${usersSnapshot.size} documents in Firestore users collection`);
    
    if (usersSnapshot.size > 0) {
      logInfo('Sample documents:');
      let count = 0;
      usersSnapshot.forEach(doc => {
        if (count < 3) {
          const data = doc.data();
          logInfo(`  • ${doc.id}: ${data.name} (${data.email})`);
          count++;
        }
      });
      
      if (usersSnapshot.size > 3) {
        logInfo(`  • ... and ${usersSnapshot.size - 3} more documents`);
      }
    }
    
    return usersSnapshot.size;
  } catch (error) {
    logError(`Error verifying Firestore documents: ${error.message}`);
    return 0;
  }
}

/**
 * Print final results
 */
function printResults(results, firestoreCount) {
  log('\n🎉 Sync completed!', 'bright');
  log('📊 Final Results:', 'bright');
  log(`   • Total processed: ${results.processed}`, 'cyan');
  log(`   • Profiles created: ${results.created}`, 'green');
  log(`   • Profiles skipped (already exist): ${results.skipped}`, 'yellow');
  log(`   • Errors: ${results.errors}`, results.errors > 0 ? 'red' : 'green');
  log(`   • Total Firestore profiles: ${firestoreCount}`, 'cyan');

  if (results.errors > 0) {
    logWarning('Some errors occurred during sync. Check the logs above for details.');
  } else {
    logSuccess('All users synced successfully!');
  }
}

/**
 * Main execution function
 */
async function main() {
  log('🔥 Firebase Auth to Firestore User Sync Script', 'bright');
  log('==============================================\n', 'bright');

  try {
    // Step 1: Check and install dependencies
    if (!checkDependencies()) {
      if (!installDependencies()) {
        process.exit(1);
      }
    }

    // Step 2: Initialize Firebase
    if (!initializeFirebase()) {
      process.exit(1);
    }

    // Step 3: Run the sync
    const results = await syncUsersToFirestore();
    
    // Step 4: Verify results
    const firestoreCount = await verifyFirestoreDocuments();
    
    // Print final results
    printResults(results, firestoreCount);
    
    log('\n🎯 Script completed successfully!', 'bright');
    
    // Exit with appropriate code
    process.exit(results.errors > 0 ? 1 : 0);
    
  } catch (error) {
    logError(`Script failed: ${error.message}`);
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
  syncUsersToFirestore,
  createDefaultProfile,
  profileExists,
  initializeFirebase,
  CONFIG
};