#!/bin/bash

# Fix Web Panel - Run this on the server

echo "🔧 Fixing Web Panel setup..."
echo ""

# Stop any existing HTTP server on port 8000
pkill -f "http.server 8000" 2>/dev/null || true

# Create directory if it doesn't exist
mkdir -p /var/www/rowcoach-panel

# Copy web-coach-panel files
echo "📦 Copying web-coach-panel files..."
if [ -d "/opt/rowcoach-backend/web-coach-panel" ]; then
    cp -r /opt/rowcoach-backend/web-coach-panel/* /var/www/rowcoach-panel/
    echo "✅ Files copied from /opt/rowcoach-backend/web-coach-panel"
else
    echo "📥 Cloning from Git..."
    cd /tmp
    git clone https://github.com/Ovtnc/RowCoach.git temp-repo 2>/dev/null || true
    if [ -d "temp-repo/web-coach-panel" ]; then
        cp -r temp-repo/web-coach-panel/* /var/www/rowcoach-panel/
        rm -rf temp-repo
        echo "✅ Files cloned and copied"
    else
        echo "❌ Could not find web-coach-panel directory"
        exit 1
    fi
fi

# Ensure we're in the right directory
cd /var/www/rowcoach-panel

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ index.html not found in /var/www/rowcoach-panel"
    echo "Current directory: $(pwd)"
    echo "Files: $(ls -la)"
    exit 1
fi

# Start HTTP server in background
echo "🚀 Starting HTTP server on port 8000..."
nohup python3 -m http.server 8000 > /var/log/rowcoach-panel.log 2>&1 &

# Wait a moment
sleep 2

# Check if server is running
if pgrep -f "http.server 8000" > /dev/null; then
    echo "✅ HTTP server started successfully"
    echo ""
    echo "📋 Web panel is now available at:"
    echo "   http://161.97.132.240:8000"
    echo ""
    echo "🔍 To check status:"
    echo "   ps aux | grep 'http.server 8000'"
    echo ""
    echo "📝 To view logs:"
    echo "   tail -f /var/log/rowcoach-panel.log"
else
    echo "❌ Failed to start HTTP server"
    echo "Check logs: cat /var/log/rowcoach-panel.log"
    exit 1
fi

