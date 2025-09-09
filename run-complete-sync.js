#!/usr/bin/env node

/**
 * Complete Firebase User Sync Automation Script
 * 
 * This master script automates the entire process:
 * 1. Installs dependencies automatically
 * 2. Sets up service account key (if needed)
 * 3. Runs the sync script
 * 4. Verifies the results
 * 
 * This is the main entry point for the complete automation.
 * 
 * Usage: node run-complete-sync.js
 */

const { execSync, spawn } = require('child_process');
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

function logStep(step, message) {
  log(`\n📋 Step ${step}: ${message}`, 'bright');
  log('='.repeat(50), 'bright');
}

/**
 * Check if a file exists
 */
function fileExists(filename) {
  return fs.existsSync(path.join(__dirname, filename));
}

/**
 * Check if firebase-admin is installed
 */
function isFirebaseAdminInstalled() {
  try {
    require.resolve('firebase-admin');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install dependencies
 */
async function installDependencies() {
  logStep(1, 'Installing Dependencies');
  
  if (isFirebaseAdminInstalled()) {
    logSuccess('firebase-admin is already installed');
    return true;
  }
  
  try {
    logProgress('Installing firebase-admin...');
    execSync('npm install firebase-admin', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    logSuccess('Dependencies installed successfully');
    return true;
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    return false;
  }
}

/**
 * Check if service account key exists
 */
function checkServiceAccountKey() {
  return fileExists('serviceAccountKey.json') || 
         process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
}

/**
 * Setup service account key
 */
async function setupServiceAccountKey() {
  logStep(2, 'Setting Up Service Account Key');
  
  if (checkServiceAccountKey()) {
    logSuccess('Service account key already exists');
    return true;
  }
  
  logWarning('Service account key not found');
  logInfo('Running setup script...');
  
  try {
    // Run the setup script
    const setupProcess = spawn('node', ['setup-service-account.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    return new Promise((resolve) => {
      setupProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Service account key setup completed');
          resolve(true);
        } else {
          logError('Service account key setup failed');
          resolve(false);
        }
      });
      
      setupProcess.on('error', (error) => {
        logError(`Setup process error: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`Failed to run setup script: ${error.message}`);
    return false;
  }
}

/**
 * Run the sync script
 */
async function runSyncScript() {
  logStep(3, 'Running User Sync');
  
  try {
    logProgress('Starting user sync process...');
    
    const syncProcess = spawn('node', ['sync-users-to-firestore.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    return new Promise((resolve) => {
      syncProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('User sync completed successfully');
          resolve(true);
        } else {
          logError(`User sync failed with exit code ${code}`);
          resolve(false);
        }
      });
      
      syncProcess.on('error', (error) => {
        logError(`Sync process error: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`Failed to run sync script: ${error.message}`);
    return false;
  }
}

/**
 * Run the verification script
 */
async function runVerificationScript() {
  logStep(4, 'Verifying Results');
  
  try {
    logProgress('Running verification...');
    
    const verifyProcess = spawn('node', ['verify-sync.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    return new Promise((resolve) => {
      verifyProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Verification completed successfully');
          resolve(true);
        } else {
          logWarning(`Verification found issues (exit code ${code})`);
          resolve(false);
        }
      });
      
      verifyProcess.on('error', (error) => {
        logError(`Verification process error: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`Failed to run verification script: ${error.message}`);
    return false;
  }
}

/**
 * Print final summary
 */
function printFinalSummary(results) {
  log('\n🎯 Final Summary', 'bright');
  log('================', 'bright');
  
  const steps = [
    { name: 'Dependencies Installation', success: results.dependencies },
    { name: 'Service Account Setup', success: results.serviceAccount },
    { name: 'User Sync Process', success: results.sync },
    { name: 'Results Verification', success: results.verification }
  ];
  
  steps.forEach((step, index) => {
    const status = step.success ? '✅' : '❌';
    const color = step.success ? 'green' : 'red';
    log(`${status} Step ${index + 1}: ${step.name}`, color);
  });
  
  const allSuccess = steps.every(step => step.success);
  
  if (allSuccess) {
    log('\n🎉 All steps completed successfully!', 'green');
    log('Your Firebase users have been synced to Firestore.', 'green');
  } else {
    log('\n⚠️  Some steps failed. Please check the logs above.', 'yellow');
    log('You may need to fix issues and re-run the script.', 'yellow');
  }
  
  log('\n📋 Next Steps:', 'bright');
  log('• Check your Firestore database to verify the profiles', 'cyan');
  log('• Test your React app to ensure profiles load correctly', 'cyan');
  log('• Monitor for any issues with new user registrations', 'cyan');
}

/**
 * Main execution function
 */
async function main() {
  log('🚀 Firebase User Sync - Complete Automation', 'bright');
  log('===========================================\n', 'bright');
  
  logInfo('This script will automatically:');
  logInfo('1. Install required dependencies');
  logInfo('2. Set up service account key (if needed)');
  logInfo('3. Sync all Firebase Auth users to Firestore');
  logInfo('4. Verify the results\n');
  
  const results = {
    dependencies: false,
    serviceAccount: false,
    sync: false,
    verification: false
  };
  
  try {
    // Step 1: Install dependencies
    results.dependencies = await installDependencies();
    if (!results.dependencies) {
      logError('Cannot continue without dependencies');
      process.exit(1);
    }
    
    // Step 2: Setup service account key
    results.serviceAccount = await setupServiceAccountKey();
    if (!results.serviceAccount) {
      logError('Cannot continue without service account key');
      process.exit(1);
    }
    
    // Step 3: Run sync
    results.sync = await runSyncScript();
    if (!results.sync) {
      logError('Sync failed, but continuing with verification...');
    }
    
    // Step 4: Verify results
    results.verification = await runVerificationScript();
    
    // Print final summary
    printFinalSummary(results);
    
    // Exit with appropriate code
    const allSuccess = Object.values(results).every(Boolean);
    process.exit(allSuccess ? 0 : 1);
    
  } catch (error) {
    logError(`Automation failed: ${error.message}`);
    printFinalSummary(results);
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
  installDependencies,
  setupServiceAccountKey,
  runSyncScript,
  runVerificationScript
};
