# Oturum Bulunamadı Hatası - Debug Rehberi

## Sorun Tespiti

"Oturum bulunamadı" hatası alıyorsanız, şu adımları takip edin:

### 1. Backend Loglarını Kontrol Et

Sunucuda backend loglarını kontrol edin:

```bash
# PM2 kullanıyorsanız:
pm2 logs row-coach-backend --lines 50

# Systemd kullanıyorsanız:
sudo journalctl -u row-coach-backend -n 50 --no-pager

# Manuel çalıştırıyorsanız:
# Terminal çıktısını kontrol edin
```

**Aranacak log mesajları:**
- `Update interval plan request:` - Gönderilen code ve userId
- `Session not found for code:` - Aranan code ve mevcut session'lar

### 2. Frontend Console Loglarını Kontrol Et

React Native debugger'da veya Metro bundler console'da şu log'u arayın:
```
Saving interval plan: { code: ..., userId: ..., stepsCount: ... }
```

### 3. Backend'de Mevcut Session'ları Kontrol Et

Sunucuda MongoDB'ye bağlanıp session'ları kontrol edin:

```bash
# MongoDB'ye bağlan
mongo
# veya
mongosh

# Database'i seç
use rowcoach

# Session'ları listele
db.multirowsessions.find({}, {code: 1, hostId: 1, status: 1, createdAt: 1}).sort({createdAt: -1}).limit(10)
```

### 4. Code Formatını Kontrol Et

Frontend'den gönderilen code'un uppercase olduğundan emin olun. Backend loglarında şunu görmelisiniz:

```
Update interval plan request: {
  originalCode: 'ABC123',
  upperCode: 'ABC123',
  userId: '...',
  ...
}
```

### 5. Backend Route'unun Çalıştığını Doğrula

Sunucuda test edin:

```bash
# Test endpoint'i (400 hatası normal - body eksik):
curl -X PUT http://localhost:3000/api/multi-row/interval-plan \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST","userId":"test","intervalPlan":[]}'

# Eğer 404 alıyorsanız, route çalışmıyor demektir
# Eğer 400 alıyorsanız, route çalışıyor demektir (bu iyi!)
```

### 6. Backend Kodlarının Güncel Olduğunu Kontrol Et

Sunucuda şu dosyaları kontrol edin:

```bash
cd /opt/rowcoach-backend/backend

# Route sırasını kontrol et (/:code en sonda olmalı):
grep -A 5 "interval-plan" src/routes/multiRowRoutes.ts

# Controller'da code.toUpperCase() kullanıldığını kontrol et:
grep -A 3 "upperCode" src/controllers/multiRowController.ts
```

### 7. Backend'i Yeniden Başlat

Kodları güncelledikten sonra mutlaka yeniden başlatın:

```bash
cd /opt/rowcoach-backend/backend
npm run build
pm2 restart row-coach-backend
# veya
systemctl restart row-coach-backend
```

## Olası Sorunlar ve Çözümleri

### Sorun 1: Backend Henüz Güncellenmedi
**Çözüm:** Backend kodlarını güncelleyip yeniden başlatın

### Sorun 2: Route Sırası Yanlış
**Çözüm:** `multiRowRoutes.ts` dosyasında `/:code` route'unu en sona taşıyın

### Sorun 3: Session Code Formatı Yanlış
**Çözüm:** Frontend'den gönderilen code'un uppercase olduğundan emin olun

### Sorun 4: Session Gerçekten Yok
**Çözüm:** Yeni bir session oluşturup tekrar deneyin

### Sorun 5: Backend Route Çalışmıyor
**Çözüm:** Backend'i yeniden başlatın ve logları kontrol edin

## Hızlı Test

1. Yeni bir Multi Row session oluştur
2. Interval seç
3. Interval programı ekle
4. Backend loglarını kontrol et
5. Frontend console loglarını kontrol et

Eğer hala sorun varsa, backend loglarını paylaşın.

