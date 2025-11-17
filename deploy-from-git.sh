#!/bin/bash

# Backend Deployment Script from Git
# Usage: ./deploy-from-git.sh [GIT_REPO_URL] [SSH_USER] [SSH_KEY_PATH]

GIT_REPO="${1:-}"
SERVER_IP="161.97.132.240"
SSH_USER="${2:-root}"
SSH_KEY="${3:-}"
BACKEND_DIR="/opt/rowcoach-backend"
SERVICE_NAME="rowcoach-backend"

if [ -z "$GIT_REPO" ]; then
    echo "❌ Git repository URL is required"
    echo "Usage: ./deploy-from-git.sh <GIT_REPO_URL> [SSH_USER] [SSH_KEY_PATH]"
    exit 1
fi

echo "🚀 RowCoach Backend Deployment from Git"
echo "========================================"
echo "Git Repo: $GIT_REPO"
echo "Server: $SSH_USER@$SERVER_IP"
echo ""

# Check if SSH key is provided
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY $SSH_USER@$SERVER_IP"
else
    SSH_CMD="ssh $SSH_USER@$SERVER_IP"
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
    if ! command -v git &> /dev/null; then
        apt-get install -y git
    fi
    
    echo "✅ Packages installed"
ENDSSH

echo "📦 Step 3: Cloning/Updating repository..."
$SSH_CMD << ENDSSH
    if [ -d "$BACKEND_DIR" ]; then
        echo "📁 Existing directory found, updating..."
        cd $BACKEND_DIR
        git pull origin main || git pull origin master
    else
        echo "📥 Cloning repository..."
        mkdir -p $(dirname $BACKEND_DIR)
        git clone $GIT_REPO $BACKEND_DIR
    fi
    
    cd $BACKEND_DIR
    
    # Navigate to backend directory if repo is root
    if [ -d "backend" ]; then
        cd backend
    fi
    
    echo "✅ Repository ready"
ENDSSH

echo "📦 Step 4: Setting up environment..."
$SSH_CMD << 'ENDSSH'
    cd /opt/rowcoach-backend
    if [ -d "backend" ]; then
        cd backend
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << 'ENVFILE'
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rowcoach

# JWT Configuration
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*

# Socket.IO Configuration
SOCKET_PORT=3000
ENVFILE
        echo "✅ Created .env file"
        echo "⚠️  IMPORTANT: Edit .env file and change JWT_SECRET!"
    else
        echo "ℹ️  .env file already exists"
    fi
ENDSSH

echo "📦 Step 5: Installing dependencies and building..."
$SSH_CMD << 'ENDSSH'
    cd /opt/rowcoach-backend
    if [ -d "backend" ]; then
        cd backend
    fi
    
    # Install dependencies
    echo "📦 Installing npm dependencies..."
    npm install --production
    
    # Build TypeScript
    echo "🔨 Building TypeScript..."
    npm run build || {
        echo "⚠️  Build failed, trying to continue..."
    }
ENDSSH

echo "📦 Step 6: Creating PM2 ecosystem file..."
$SSH_CMD << 'ENDSSH'
    cd /opt/rowcoach-backend
    if [ -d "backend" ]; then
        cd backend
    fi
    
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
    if [ -d "backend" ]; then
        cd backend
    fi
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    
    echo "✅ PM2 service configured"
ENDSSH

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. SSH into server: ssh $SSH_USER@$SERVER_IP"
echo "2. Edit .env file:"
if [ -d "backend" ]; then
    echo "   nano /opt/rowcoach-backend/backend/.env"
else
    echo "   nano /opt/rowcoach-backend/.env"
fi
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

