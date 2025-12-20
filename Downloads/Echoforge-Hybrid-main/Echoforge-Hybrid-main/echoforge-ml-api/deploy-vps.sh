#!/bin/bash
# ===========================================
# EchoForge ML API - VPS Deployment Script
# Run this on your VPS: 194.163.151.208
# ===========================================

set -e

echo "🚀 EchoForge ML API Deployment"
echo "=============================="

# Configuration
APP_DIR="/opt/echoforge-ml-api"
PORT=8000

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  Please run as root (sudo)"
  exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update -qq

# Install dependencies
echo "📦 Installing Python and Docker..."
apt-get install -y python3 python3-pip python3-venv docker.io docker-compose git

# Enable Docker
systemctl enable docker
systemctl start docker

# Create app directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or update repo (replace with your actual repo URL)
if [ -d ".git" ]; then
  echo "📥 Updating existing repository..."
  git pull
else
  echo "📥 Cloning repository..."
  # Copy files instead of cloning for now
  echo "Please copy echoforge-ml-api files to $APP_DIR"
fi

# Create virtual environment
echo "🐍 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn uvicorn

# Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/echoforge-ml.service << 'EOF'
[Unit]
Description=EchoForge ML API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/echoforge-ml-api
Environment=PYTHONPATH=/opt/echoforge-ml-api
ExecStart=/opt/echoforge-ml-api/venv/bin/gunicorn main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8000 --timeout 120
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload and start service
echo "🔄 Starting service..."
systemctl daemon-reload
systemctl enable echoforge-ml
systemctl restart echoforge-ml

# Check status
sleep 3
if systemctl is-active --quiet echoforge-ml; then
  echo "✅ EchoForge ML API is running on port $PORT"
  echo "🔗 Access at: http://194.163.151.208:$PORT"
  echo "📊 Health: http://194.163.151.208:$PORT/health"
else
  echo "❌ Service failed to start. Check logs:"
  echo "   journalctl -u echoforge-ml -n 50"
fi

# Open firewall port
echo "🔓 Opening firewall port $PORT..."
ufw allow $PORT/tcp 2>/dev/null || iptables -A INPUT -p tcp --dport $PORT -j ACCEPT || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Commands:"
echo "  Status:  systemctl status echoforge-ml"
echo "  Logs:    journalctl -u echoforge-ml -f"
echo "  Restart: systemctl restart echoforge-ml"
