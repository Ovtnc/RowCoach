#!/bin/bash

# Token Debug Script
# Run this on the server to check JWT configuration

echo "🔍 Checking JWT Configuration..."
echo ""

# Check if .env exists
if [ -f "/opt/rowcoach-backend/backend/.env" ]; then
    echo "✅ .env file exists"
    echo ""
    echo "JWT_SECRET (first 10 chars):"
    grep JWT_SECRET /opt/rowcoach-backend/backend/.env | cut -d'=' -f2 | cut -c1-10
    echo ""
else
    echo "❌ .env file not found!"
    echo "Creating default .env..."
    cat > /opt/rowcoach-backend/backend/.env << 'EOF'
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/rowcoach
JWT_SECRET=change-this-to-a-very-secure-random-string-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
EOF
    echo "⚠️  Created default .env - PLEASE CHANGE JWT_SECRET!"
fi

echo ""
echo "📋 Current environment variables:"
cd /opt/rowcoach-backend/backend
source .env 2>/dev/null || true
echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

echo ""
echo "🔍 Testing token validation..."
echo "Run this command to test:"
echo "curl -X POST http://localhost:3000/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'"

