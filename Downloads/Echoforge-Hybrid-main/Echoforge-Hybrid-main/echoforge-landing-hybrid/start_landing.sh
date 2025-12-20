#!/bin/bash

# EchoForge Landing Page Startup Script
# This script starts the landing page in development mode

set -e  # Exit on any error

echo "🚀 Starting EchoForge Landing Page..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Load environment variables
export $(cat .env.local | xargs) 2>/dev/null || echo "⚠️ No .env.local file found, using defaults"

# Start the development server
echo "🚀 Starting Next.js development server..."
echo "   Environment: $NODE_ENV"
echo "   Port: ${PORT:-3000}"
echo "   API URL: $NEXT_PUBLIC_ECHOFORGE_API_URL"
echo "   App URL: $NEXT_PUBLIC_ECHOFORGE_APP_URL"
echo ""

exec npm run dev