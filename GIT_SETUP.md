# Git Repository Kurulumu

## 1. Git Repository Oluştur

### GitHub'da:
1. GitHub'a git: https://github.com
2. "New repository" butonuna tıkla
3. Repository adı: `rowcoach-backend` (veya istediğiniz isim)
4. Public veya Private seç
5. "Create repository" butonuna tıkla
6. Repository URL'ini kopyala (örn: `https://github.com/username/rowcoach-backend.git`)

### GitLab'da:
1. GitLab'a git: https://gitlab.com
2. "New project" butonuna tıkla
3. Repository adı: `rowcoach-backend`
4. "Create project" butonuna tıkla
5. Repository URL'ini kopyala

## 2. Lokal Repository'yi Hazırla

```bash
cd /Users/okanvatanci/Desktop/row-coach

# Git repository başlat (eğer yoksa)
git init

# Backend klasörünü ekle
git add backend/

# Commit yap
git commit -m "Initial backend commit"

# Remote repository ekle
git remote add origin <YOUR_GIT_REPO_URL>

# Push et
git push -u origin main
```

## 3. .gitignore Kontrolü

Backend klasöründe `.gitignore` dosyası olmalı ve şunları içermeli:
- `node_modules/`
- `dist/`
- `.env`
- `logs/`

## 4. Sunucuya Deploy

```bash
# Deployment script'i çalıştır
./deploy-from-git.sh <YOUR_GIT_REPO_URL> root
```

## 5. Güncelleme

Kod değişikliklerinden sonra:

```bash
# Lokal makinede
cd /Users/okanvatanci/Desktop/row-coach
git add backend/
git commit -m "Update backend"
git push

# Sunucuda (SSH ile)
ssh root@161.97.132.240
cd /opt/rowcoach-backend
git pull
npm install --production
npm run build
pm2 restart rowcoach-backend
```

## Hızlı Güncelleme Script'i

Sunucuda otomatik güncelleme için:

```bash
# Sunucuda
cat > /opt/rowcoach-backend/update.sh << 'EOF'
#!/bin/bash
cd /opt/rowcoach-backend
if [ -d "backend" ]; then
    cd backend
fi
git pull
npm install --production
npm run build
pm2 restart rowcoach-backend
echo "✅ Update completed!"
EOF

chmod +x /opt/rowcoach-backend/update.sh
```

Kullanım:
```bash
ssh root@161.97.132.240
/opt/rowcoach-backend/update.sh
```

