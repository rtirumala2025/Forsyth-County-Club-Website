#!/usr/bin/env node

/**
 * Service Account Setup Script
 * 
 * This script helps set up the Firebase service account key for the sync process.
 * It provides instructions and templates for creating the serviceAccountKey.json file.
 * 
 * Usage: node setup-service-account.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask user a question and return the answer
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Check if service account key already exists
 */
function checkExistingKey() {
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  return fs.existsSync(keyPath);
}

/**
 * Validate service account key JSON
 */
function validateServiceAccountKey(keyData) {
  try {
    const key = JSON.parse(keyData);
    const requiredFields = [
      'type', 'project_id', 'private_key_id', 'private_key',
      'client_email', 'client_id', 'auth_uri', 'token_uri'
    ];
    
    const missingFields = requiredFields.filter(field => !key[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    
    if (key.type !== 'service_account') {
      return {
        valid: false,
        error: 'Invalid service account type'
      };
    }
    
    return { valid: true, key };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error.message}`
    };
  }
}

/**
 * Create service account key template
 */
function createServiceAccountTemplate() {
  const template = {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "your-private-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
    "client_id": "your-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
  };
  
  return JSON.stringify(template, null, 2);
}

/**
 * Save service account key to file
 */
function saveServiceAccountKey(keyData) {
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  
  try {
    fs.writeFileSync(keyPath, keyData, 'utf8');
    logSuccess(`Service account key saved to ${keyPath}`);
    return true;
  } catch (error) {
    logError(`Failed to save service account key: ${error.message}`);
    return false;
  }
}

/**
 * Show Firebase Console instructions
 */
function showFirebaseInstructions() {
  log('\n📋 Firebase Console Setup Instructions:', 'bright');
  log('=====================================\n', 'bright');
  
  log('1. Go to Firebase Console:', 'cyan');
  log('   https://console.firebase.google.com/\n', 'blue');
  
  log('2. Select your project\n', 'cyan');
  
  log('3. Navigate to Project Settings:', 'cyan');
  log('   • Click the gear icon ⚙️ next to "Project Overview"', 'blue');
  log('   • Select "Project settings"\n', 'blue');
  
  log('4. Generate Service Account Key:', 'cyan');
  log('   • Go to "Service accounts" tab', 'blue');
  log('   • Click "Generate new private key"', 'blue');
  log('   • Click "Generate key" to download the JSON file\n', 'blue');
  
  log('5. Required Permissions:', 'cyan');
  log('   The service account needs these roles:', 'blue');
  log('   • Firebase Authentication Admin', 'blue');
  log('   • Cloud Firestore User (or Admin)', 'blue');
  log('   • Firebase Admin SDK Administrator Service Agent\n', 'blue');
  
  log('6. Security Notes:', 'yellow');
  log('   • NEVER commit the service account key to version control', 'red');
  log('   • The key is already added to .gitignore', 'green');
  log('   • Use environment variables in production\n', 'blue');
}

/**
 * Interactive setup process
 */
async function interactiveSetup() {
  const rl = createReadlineInterface();
  
  try {
    log('🔧 Firebase Service Account Setup', 'bright');
    log('================================\n', 'bright');
    
    // Check if key already exists
    if (checkExistingKey()) {
      logWarning('Service account key already exists!');
      const overwrite = await askQuestion(rl, 'Do you want to overwrite it? (y/N): ');
      
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        logInfo('Setup cancelled. Using existing service account key.');
        return true;
      }
    }
    
    // Show instructions
    showFirebaseInstructions();
    
    const choice = await askQuestion(rl, '\nChoose an option:\n1. I have the service account key JSON\n2. Show me the template to fill out\n3. Exit\n\nEnter choice (1-3): ');
    
    switch (choice) {
      case '1':
        logInfo('\nPlease paste your service account key JSON below:');
        logInfo('(Press Ctrl+D when finished on Unix/Mac, or Ctrl+Z on Windows)\n');
        
        let keyData = '';
        rl.on('line', (line) => {
          keyData += line + '\n';
        });
        
        await new Promise((resolve) => {
          rl.on('close', resolve);
        });
        
        const validation = validateServiceAccountKey(keyData);
        if (validation.valid) {
          if (saveServiceAccountKey(keyData)) {
            logSuccess('Service account key setup completed successfully!');
            return true;
          }
        } else {
          logError(`Invalid service account key: ${validation.error}`);
          return false;
        }
        break;
        
      case '2':
        logInfo('\n📝 Service Account Key Template:');
        log('=====================================\n', 'bright');
        log(createServiceAccountTemplate(), 'blue');
        log('\n📋 Instructions:', 'bright');
        log('1. Copy the template above', 'cyan');
        log('2. Replace all placeholder values with your actual service account data', 'cyan');
        log('3. Save it as serviceAccountKey.json in this directory', 'cyan');
        log('4. Run the sync script again\n', 'cyan');
        return true;
        
      case '3':
        logInfo('Setup cancelled.');
        return false;
        
      default:
        logError('Invalid choice. Please run the script again.');
        return false;
    }
    
  } finally {
    rl.close();
  }
}

/**
 * Test service account key
 */
async function testServiceAccountKey() {
  logProgress('Testing service account key...');
  
  try {
    const admin = require('firebase-admin');
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(keyPath)) {
      logError('Service account key file not found');
      return false;
    }
    
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    // Test by listing users (this will fail if permissions are wrong)
    await admin.auth().listUsers(1);
    
    logSuccess('Service account key is valid and working!');
    logInfo(`Connected to project: ${serviceAccount.project_id}`);
    
    // Clean up
    await admin.app().delete();
    return true;
    
  } catch (error) {
    logError(`Service account key test failed: ${error.message}`);
    logInfo('Please check:');
    logInfo('• The JSON file is valid');
    logInfo('• The service account has proper permissions');
    logInfo('• The project ID is correct');
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const success = await interactiveSetup();
    
    if (success && checkExistingKey()) {
      logProgress('\nTesting the service account key...');
      const testSuccess = await testServiceAccountKey();
      
      if (testSuccess) {
        logSuccess('\n🎉 Setup completed successfully!');
        logInfo('You can now run: node sync-users-to-firestore.js');
      } else {
        logError('\n❌ Setup completed but service account key test failed.');
        logInfo('Please fix the issues above and run the test again.');
      }
    }
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
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
  checkExistingKey,
  validateServiceAccountKey,
  saveServiceAccountKey,
  testServiceAccountKey
};
