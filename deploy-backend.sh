#!/bin/bash

# Backend Deployment Script for RowCoach
# Usage: ./deploy-backend.sh [SSH_USER] [SSH_KEY_PATH]

SERVER_IP="161.97.132.240"
SSH_USER="${1:-root}"
SSH_KEY="${2:-}"
BACKEND_DIR="/opt/rowcoach-backend"
SERVICE_NAME="rowcoach-backend"

echo "🚀 RowCoach Backend Deployment Script"
echo "========================================"
echo "Server: $SSH_USER@$SERVER_IP"
echo ""

# Check if SSH key is provided
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY $SSH_USER@$SERVER_IP"
    SCP_CMD="scp -i $SSH_KEY -r"
else
    SSH_CMD="ssh $SSH_USER@$SERVER_IP"
    SCP_CMD="scp -r"
fi

echo "📦 Step 1: Checking server connection..."
$SSH_CMD "echo 'Connection successful!'" || {
    echo "❌ Failed to connect to server"
    exit 1
}

echo "✅ Server connection OK"
echo ""

echo "📦 Step 2: Installing required packages..."
$SSH_CMD << 'ENDSSH'
    # Update system
    apt-get update -y
    
    # Install Node.js 18.x
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install MongoDB
    if ! command -v mongod &> /dev/null; then
        curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        apt-get update -y
        apt-get install -y mongodb-org
        systemctl enable mongod
        systemctl start mongod
    fi
    
    # Install PM2 for process management
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Install git if not present
    apt-get install -y git
    
    echo "✅ Packages installed"
ENDSSH

echo "📦 Step 3: Creating backend directory..."
$SSH_CMD "mkdir -p $BACKEND_DIR"

echo "📦 Step 4: Copying backend files..."
$SCP_CMD backend/* $SSH_USER@$SERVER_IP:$BACKEND_DIR/ 2>/dev/null || {
    echo "⚠️  Some files may not have been copied. Continuing..."
}

echo "📦 Step 5: Setting up environment..."
$SSH_CMD << ENDSSH
    cd $BACKEND_DIR
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << 'ENVFILE'
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rowcoach

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*

# Socket.IO Configuration
SOCKET_PORT=3000
ENVFILE
        echo "✅ Created .env file"
    else
        echo "ℹ️  .env file already exists"
    fi
    
    # Install dependencies
    echo "📦 Installing npm dependencies..."
    npm install --production
    
    # Build TypeScript
    echo "🔨 Building TypeScript..."
    npm run build || echo "⚠️  Build failed, but continuing..."
ENDSSH

echo "📦 Step 6: Creating PM2 ecosystem file..."
$SSH_CMD << ENDSSH
    cd $BACKEND_DIR
    cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'rowcoach-backend',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
ECOSYSTEM
    
    mkdir -p logs
ENDSSH

echo "📦 Step 7: Setting up PM2 service..."
$SSH_CMD << 'ENDSSH'
    # Stop existing PM2 process if running
    pm2 stop rowcoach-backend 2>/dev/null || true
    pm2 delete rowcoach-backend 2>/dev/null || true
    
    # Start the application
    cd /opt/rowcoach-backend
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    echo "✅ PM2 service configured"
ENDSSH

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. SSH into server: ssh $SSH_USER@$SERVER_IP"
echo "2. Edit .env file: nano $BACKEND_DIR/.env"
echo "3. Update JWT_SECRET and MONGODB_URI"
echo "4. Restart service: pm2 restart rowcoach-backend"
echo "5. Check logs: pm2 logs rowcoach-backend"
echo ""
echo "🔍 Useful commands:"
echo "  - View logs: pm2 logs rowcoach-backend"
echo "  - Restart: pm2 restart rowcoach-backend"
echo "  - Status: pm2 status"
echo "  - Stop: pm2 stop rowcoach-backend"
echo ""

