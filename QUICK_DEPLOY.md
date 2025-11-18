# Hızlı Deploy Rehberi

## Sunucuya Deploy Etme

### 1. Deployment Script'ini Çalıştır

```bash
cd /Users/okanvatanci/Desktop/row-coach
./deploy-from-git.sh https://github.com/Ovtnc/RowCoach.git root
```

**Not:** SSH şifresi istenecek. Şifreyi girin.

### 2. Manuel Adımlar (Eğer Script Hata Verirse)

SSH ile sunucuya bağlan:
```bash
ssh root@161.97.132.240
```

Sunucuda:
```bash
# Gerekli paketleri yükle
apt-get update -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git

# MongoDB yükle
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update -y
apt-get install -y mongodb-org
systemctl enable mongod
systemctl start mongod

# PM2 yükle
npm install -g pm2

# Repository'yi clone et
mkdir -p /opt/rowcoach-backend
cd /opt/rowcoach-backend
git clone https://github.com/Ovtnc/RowCoach.git .

# Backend klasörüne git
cd backend

# Tüm bağımlılıkları yükle (devDependencies dahil)
npm install

# Build et
npm run build

# .env dosyası oluştur
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/rowcoach
JWT_SECRET=change-this-to-a-very-secure-random-string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
EOF

# PM2 ecosystem dosyası oluştur
cat > ecosystem.config.js << 'EOF'
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
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

mkdir -p logs

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
```

### 3. Önemli: .env Dosyasını Düzenle

```bash
nano /opt/rowcoach-backend/backend/.env
```

**JWT_SECRET** değerini mutlaka değiştirin! Güçlü bir random string kullanın.

### 4. Servisi Yeniden Başlat

```bash
pm2 restart rowcoach-backend
pm2 logs rowcoach-backend
```

## Güncelleme

Kod değişikliklerinden sonra:

```bash
ssh root@161.97.132.240
cd /opt/rowcoach-backend
git pull
cd backend
npm install
npm run build
pm2 restart rowcoach-backend
```

## Sorun Giderme

### TypeScript Bulunamıyor
```bash
npm install -g typescript ts-node
npm install
npm run build
```

### MongoDB Bağlantı Hatası
```bash
systemctl status mongod
systemctl start mongod
```

### Port Kullanımda
```bash
lsof -i :3000
kill -9 <PID>
```

