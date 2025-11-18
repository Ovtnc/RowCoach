# Git ile Deployment - Sunucuda Yapılacaklar

## 1. Sunucuya Bağlan

```bash
ssh root@sunucu-ip
cd /opt/rowcoach-backend
```

## 2. Git Pull Yap

```bash
git pull origin main
# veya
git pull origin master
# (hangi branch kullanıyorsanız)
```

## 3. Backend Build ve Restart

```bash
cd backend
npm run build
pm2 restart row-coach-backend
```

## 4. Logları Kontrol Et

```bash
pm2 logs row-coach-backend --lines 30
```

## 5. Test Et

Backend başladıktan sonra:
- Multi Row oturumu oluştur
- Interval seç
- Interval programı ekle
- Artık `just_row` hatası görünmemeli
- Interval plan kaydedilmeli

## Sorun Giderme

### Git pull hata verirse:

```bash
# Değişiklikleri stash et:
git stash

# Pull yap:
git pull

# Stash'i geri yükle (eğer gerekiyorsa):
git stash pop
```

### Build hatası alırsanız:

```bash
# node_modules'ı temizle:
rm -rf node_modules
npm install
npm run build
```

### PM2 restart çalışmazsa:

```bash
# PM2 listesini kontrol et:
pm2 list

# Manuel restart:
pm2 restart all
# veya
pm2 restart rowcoach-backend
```

