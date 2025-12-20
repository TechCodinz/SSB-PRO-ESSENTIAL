#!/bin/bash

# EchoForge Landing Page Production Deployment Script
# This script deploys the landing page to production

set -e  # Exit on any error

echo "🚀 Starting EchoForge Landing Page Production Deployment..."

# Configuration
APP_NAME="echoforge-landing"
PORT=3000
HOST=0.0.0.0

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please do not run as root"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Test the application
echo "🧪 Testing application..."
npm run start &
APP_PID=$!
sleep 10

# Test if the app is running
if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    echo "✅ Application is running successfully"
    kill $APP_PID
else
    echo "❌ Application failed to start"
    kill $APP_PID
    exit 1
fi

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/echoforge-landing.service > /dev/null <<EOF
[Unit]
Description=EchoForge Landing Page
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=$(pwd)
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
Environment=PORT=$PORT
ExecStart=/usr/bin/npm start
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
echo "🔄 Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable echoforge-landing
sudo systemctl start echoforge-landing

# Check service status
echo "📊 Checking service status..."
sleep 5
if sudo systemctl is-active --quiet echoforge-landing; then
    echo "✅ EchoForge Landing Page is running successfully!"
    echo "🌐 Landing page available at: http://$HOST:$PORT"
else
    echo "❌ Failed to start EchoForge Landing Page"
    sudo systemctl status echoforge-landing
    exit 1
fi

# Setup nginx reverse proxy (optional)
if command -v nginx &> /dev/null; then
    echo "🌐 Setting up nginx reverse proxy..."
    sudo tee /etc/nginx/sites-available/echoforge-landing > /dev/null <<EOF
server {
    listen 80;
    server_name echoforge.com www.echoforge.com;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/echoforge-landing /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx configured successfully!"
fi

echo "🎉 EchoForge Landing Page Deployment Complete!"
echo "📊 Service Status: sudo systemctl status echoforge-landing"
echo "📝 Logs: sudo journalctl -u echoforge-landing -f"
echo "🔄 Restart: sudo systemctl restart echoforge-landing"