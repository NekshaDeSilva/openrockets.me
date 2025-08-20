@echo off
REM OpenRockets Community Server Startup Script for Windows
echo 🚀 Starting OpenRockets Community Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    echo 📁 Creating uploads directory...
    mkdir uploads
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    copy community-package.json package.json >nul
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

REM Start the community server
echo 🌟 Starting community server on port 3001...
echo 📡 WebSocket server enabled for real-time features
echo 💬 Community chat, posts, and collaboration ready!
echo.
echo 🔗 Access the community at: http://localhost:3000/community.html
echo 🛠️  API endpoints available at: http://localhost:3001/api/
echo.
echo Press Ctrl+C to stop the server
echo ============================================

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found. Using default configuration.
)

REM Start the server
node community-server.js

pause
