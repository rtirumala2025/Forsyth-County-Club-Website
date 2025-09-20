#!/bin/bash

# Firebase User Sync - Quick Start Script
# This script makes all files executable and runs the complete sync

echo "🔥 Firebase User Sync - Quick Start"
echo "=================================="
echo ""

# Make scripts executable
echo "📋 Making scripts executable..."
chmod +x sync-users-to-firestore.js
chmod +x verify-sync.js
chmod +x setup-service-account.js
chmod +x run-complete-sync.js

echo "✅ Scripts are now executable"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Run the complete sync
echo "🚀 Starting complete Firebase user sync..."
echo ""

node run-complete-sync.js

echo ""
echo "🎯 Quick start completed!"
echo "Check the output above for results."
