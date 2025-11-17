# RowCoach Backend Deployment Guide

## Sunucu Bilgileri
- **IP:** 161.97.132.240
- **SSH:** `ssh root@161.97.132.240` (veya kullanıcı adınız)

## Git ile Deployment (Önerilen)

### 1. Git Repository'ye Push

```bash
# Git repository oluştur (GitHub, GitLab, vb.)
# Sonra backend'i push et

cd /Users/okanvatanci/Desktop/row-coach
git init
git add backend/
git commit -m "Initial backend commit"
git remote add origin <YOUR_GIT_REPO_URL>
git push -u origin main
```

### 2. Sunucuya Deploy Et

```bash
# Otomatik deployment script ile
./deploy-from-git.sh <YOUR_GIT_REPO_URL> root

# SSH key ile
./deploy-from-git.sh <YOUR_GIT_REPO_URL> root /path/to/key.pem
```

Script otomatik olarak:
- Gerekli paketleri yükler
- Git repository'den kodu çeker
- Bağımlılıkları yükler
- Build eder
- PM2 ile başlatır

## Hızlı Kurulum

### Otomatik Kurulum (Önerilen)

```bash
# SSH key ile
./deploy-backend.sh root /path/to/your/key.pem

# Şifre ile (interaktif)
./deploy-backend.sh root
```

### Manuel Kurulum

#### 1. Sunucuya Bağlan
```bash
ssh root@161.97.132.240
```

#### 2. Gerekli Yazılımları Yükle
```bash
# Sistem güncellemesi
apt-get update -y

# Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update -y
apt-get install -y mongodb-org
systemctl enable mongod
systemctl start mongod

# PM2 (Process Manager)
npm install -g pm2
```

#### 3. Backend Dosyalarını Kopyala
```bash
# Lokal makineden
scp -r backend/* root@161.97.132.240:/opt/rowcoach-backend/
```

#### 4. Environment Variables Ayarla
```bash
cd /opt/rowcoach-backend
nano .env
```

`.env` dosyası içeriği:
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/rowcoach
JWT_SECRET=your-very-secure-secret-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

#### 5. Bağımlılıkları Yükle ve Build Et
```bash
cd /opt/rowcoach-backend
npm install --production
npm run build
```

#### 6. PM2 ile Başlat
```bash
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

# Uygulamayı başlat
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# Sistem başlangıcında otomatik başlat
pm2 startup systemd -u root --hp /root
```

## Firewall Ayarları

```bash
# UFW firewall varsa
ufw allow 3000/tcp
ufw allow 22/tcp
ufw enable

# veya iptables
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

## MongoDB Güvenlik

```bash
# MongoDB'ye bağlan
mongosh

# Admin kullanıcı oluştur
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: [ { role: "root", db: "admin" } ]
})

# Authentication'ı etkinleştir
# /etc/mongod.conf dosyasını düzenle
nano /etc/mongod.conf
# security: authorization: enabled ekle

systemctl restart mongod
```

## Yönetim Komutları

```bash
# Logları görüntüle
pm2 logs rowcoach-backend

# Durumu kontrol et
pm2 status

# Yeniden başlat
pm2 restart rowcoach-backend

# Durdur
pm2 stop rowcoach-backend

# Başlat
pm2 start rowcoach-backend

# MongoDB durumu
systemctl status mongod

# MongoDB logları
tail -f /var/log/mongodb/mongod.log
```

## Güncelleme

```bash
# Yeni kodları kopyala
scp -r backend/* root@161.97.132.240:/opt/rowcoach-backend/

# Sunucuda
cd /opt/rowcoach-backend
npm install --production
npm run build
pm2 restart rowcoach-backend
```

## Sorun Giderme

### Backend başlamıyor
```bash
# Logları kontrol et
pm2 logs rowcoach-backend

# Manuel çalıştır
cd /opt/rowcoach-backend
node dist/server.js
```

### MongoDB bağlantı hatası
```bash
# MongoDB servisini kontrol et
systemctl status mongod

# MongoDB'yi başlat
systemctl start mongod
```

### Port kullanımda
```bash
# Port 3000'i kullanan process'i bul
lsof -i :3000

# Process'i sonlandır
kill -9 <PID>
```

## Güvenlik Önerileri

1. **JWT_SECRET'ı değiştirin** - Güçlü bir secret key kullanın
2. **MongoDB authentication** - MongoDB için kullanıcı/şifre ayarlayın
3. **Firewall** - Sadece gerekli portları açın
4. **SSH Key** - Şifre yerine SSH key kullanın
5. **Fail2ban** - Brute force saldırılarına karşı koruma
6. **SSL/TLS** - Nginx reverse proxy ile HTTPS ekleyin

## Nginx Reverse Proxy (Opsiyonel)

```bash
# Nginx yükle
apt-get install -y nginx

# Config dosyası
cat > /etc/nginx/sites-available/rowcoach << 'EOF'
server {
    listen 80;
    server_name 161.97.132.240;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/rowcoach /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

