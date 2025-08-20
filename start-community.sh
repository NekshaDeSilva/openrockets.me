#!/bin/bash

# OpenRockets Community Server Startup Script
echo "🚀 Starting OpenRockets Community Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    cp community-package.json package.json
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please check your internet connection and try again."
        exit 1
    fi
fi

# Start the community server
echo "🌟 Starting community server on port 3001..."
echo "📡 WebSocket server enabled for real-time features"
echo "💬 Community chat, posts, and collaboration ready!"
echo ""
echo "🔗 Access the community at: http://localhost:3000/community.html"
echo "🛠️  API endpoints available at: http://localhost:3001/api/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "============================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
fi

# Start the server
node community-server.js
