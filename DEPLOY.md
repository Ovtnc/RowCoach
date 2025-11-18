# Sunucuda Deployment Talimatları

## Backend Güncellemesi

### 1. Sunucuya Bağlan
```bash
ssh kullanici@sunucu-ip
cd /opt/rowcoach-backend/backend
```

### 2. Kodları Güncelle
```bash
# Git kullanıyorsanız:
git pull origin main

# Veya manuel olarak dosyaları kopyalayın:
# - backend/src/routes/multiRowRoutes.ts
# - backend/src/controllers/multiRowController.ts
# - backend/src/models/MultiRowSession.ts
```

### 3. Dependencies Kontrol Et (Yeni paket yok, ama güvenli)
```bash
npm install
```

### 4. TypeScript Build
```bash
npm run build
```

### 5. Backend'i Yeniden Başlat

#### PM2 kullanıyorsanız:
```bash
pm2 restart row-coach-backend
# veya
pm2 restart all
```

#### Systemd kullanıyorsanız:
```bash
sudo systemctl restart row-coach-backend
```

#### Manuel çalıştırıyorsanız:
```bash
# Eski process'i durdur (Ctrl+C veya kill)
# Sonra başlat:
npm start
# veya development için:
npm run dev
```

### 6. Logları Kontrol Et
```bash
# PM2 için:
pm2 logs row-coach-backend

# Systemd için:
sudo journalctl -u row-coach-backend -f

# Manuel için:
# Terminal çıktısını kontrol edin
```

## Önemli Notlar

✅ **Yeni dependency YOK** - Sadece kod güncellemesi var
✅ **MongoDB migration GEREKMİYOR** - `intervalPlan` field'ı optional ve default `[]` olduğu için mevcut session'lar sorunsuz çalışır
✅ **Downtime minimal** - Sadece backend restart gerekiyor (birkaç saniye)

## Değişen Dosyalar

1. `backend/src/routes/multiRowRoutes.ts` - Route sırası düzeltildi
2. `backend/src/controllers/multiRowController.ts` - Interval plan endpoint'i eklendi
3. `backend/src/models/MultiRowSession.ts` - `intervalPlan` field'ı eklendi

## Test Et

Backend başladıktan sonra:
1. Health check: `curl http://localhost:3000/api/health`
2. Multi Row endpoint test: `curl -X PUT http://localhost:3000/api/multi-row/interval-plan` (404 yerine 400 dönmeli - bu normal, çünkü body eksik)

