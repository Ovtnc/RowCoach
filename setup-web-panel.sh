#!/bin/bash

# Web Coach Panel Setup Script
# Run this on the server

echo "🚀 Setting up Web Coach Panel..."
echo ""

# Create directory
mkdir -p /var/www/rowcoach-panel

# Copy from Git repository (already cloned)
if [ -d "/opt/rowcoach-backend/web-coach-panel" ]; then
    echo "📦 Copying web-coach-panel files..."
    cp -r /opt/rowcoach-backend/web-coach-panel/* /var/www/rowcoach-panel/
    echo "✅ Files copied"
else
    echo "📥 Cloning from Git..."
    cd /var/www
    git clone https://github.com/Ovtnc/RowCoach.git temp-repo
    cp -r temp-repo/web-coach-panel/* rowcoach-panel/
    rm -rf temp-repo
    echo "✅ Files cloned and copied"
fi

# Create systemd service for auto-start
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

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable rowcoach-panel
systemctl start rowcoach-panel

echo ""
echo "✅ Web Coach Panel setup completed!"
echo ""
echo "📋 Access the panel at:"
echo "   http://161.97.132.240:8000"
echo ""
echo "🔍 Useful commands:"
echo "   - Status: systemctl status rowcoach-panel"
echo "   - Restart: systemctl restart rowcoach-panel"
echo "   - Logs: journalctl -u rowcoach-panel -f"
echo "   - Stop: systemctl stop rowcoach-panel"
echo ""

