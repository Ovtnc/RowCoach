#!/bin/bash

# Fix Web Panel - Correct version
# Run this on the server

echo "🔧 Fixing Web Panel setup..."
echo ""

# Stop any existing HTTP server
pkill -f "http.server 8000" 2>/dev/null || true
systemctl stop rowcoach-panel 2>/dev/null || true

# Remove old directory
rm -rf /var/www/rowcoach-panel

# Create fresh directory
mkdir -p /var/www/rowcoach-panel

# Copy ONLY web-coach-panel files (not the whole repo)
echo "📦 Copying web-coach-panel files..."
if [ -d "/opt/rowcoach-backend/web-coach-panel" ]; then
    cp -r /opt/rowcoach-backend/web-coach-panel/* /var/www/rowcoach-panel/
    echo "✅ Files copied"
else
    echo "📥 web-coach-panel not found, cloning from Git..."
    cd /tmp
    rm -rf temp-repo
    git clone https://github.com/Ovtnc/RowCoach.git temp-repo
    cp -r temp-repo/web-coach-panel/* /var/www/rowcoach-panel/
    rm -rf temp-repo
    echo "✅ Files cloned and copied"
fi

# Verify index.html exists
cd /var/www/rowcoach-panel
if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found!"
    echo "Current directory: $(pwd)"
    echo "Files in directory:"
    ls -la
    exit 1
fi

echo "✅ index.html found"

# Update systemd service
cat > /etc/systemd/system/rowcoach-panel.service << 'EOF'
[Unit]
Description=RowCoach Web Panel HTTP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/rowcoach-panel
ExecStart=/usr/bin/python3 -m http.server 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload and start
systemctl daemon-reload
systemctl enable rowcoach-panel
systemctl start rowcoach-panel

# Wait a moment
sleep 2

# Check status
if systemctl is-active --quiet rowcoach-panel; then
    echo ""
    echo "✅ Web Coach Panel is running!"
    echo ""
    echo "📋 Access at: http://161.97.132.240:8000"
    echo ""
    echo "🔍 Check status: systemctl status rowcoach-panel"
    echo "📝 View logs: journalctl -u rowcoach-panel -f"
else
    echo "❌ Service failed to start"
    echo "Check logs: journalctl -u rowcoach-panel -n 50"
    exit 1
fi

