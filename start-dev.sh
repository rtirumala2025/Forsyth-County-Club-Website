#!/bin/bash

# Forsyth County Club Website - Development Startup Script
# This script starts both the backend and frontend services

echo "🚀 Starting Forsyth County Club Website Development Environment"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start backend
echo "🐍 Starting Python backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt is newer than last install
if [ ! -f ".deps_installed" ] || [ "requirements.txt" -nt ".deps_installed" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one from .env.example"
    echo "   and add your OpenAI API key."
    echo ""
fi

# Start backend in background
echo "🚀 Starting FastAPI backend on port 8000..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Go back to root directory
cd ..

# Start frontend
echo "⚛️  Starting React frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Starting React frontend on port 3000..."
npm start &
FRONTEND_PID=$!

# Go back to root directory
cd ..

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
