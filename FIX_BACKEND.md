# Backend Kodlarını Güncelleme - Acil Düzeltme

## Sorun

Backend loglarında görülen hata:
```
workoutType: ValidatorError: `just_row` is not a valid enum value for path `workoutType`.
```

Backend model `'just-row'` bekliyor ama kod hala `'just_row'` gönderiyor.

## Sunucuda Yapılacaklar

### 1. Socket Handler'ı Güncelle

```bash
cd /opt/rowcoach-backend/backend

# Socket handler dosyasını düzenle:
nano src/socket/multiRowHandlers.ts
```

**Değiştirilecek yerler:**

1. **Tüm `findOne({ code: sessionCode })` çağrılarını** `findOne({ code: sessionCode.toUpperCase() })` yapın

2. **`multi-row:select-workout` handler'ında** workoutType normalizasyonu ekleyin:

```typescript
// Satır 73-89 arası değiştir:
socket.on('multi-row:select-workout', async (data: any) => {
  try {
    const { sessionCode, workoutType } = data;
    
    const session = await MultiRowSession.findOne({ code: sessionCode.toUpperCase() });
    if (session) {
      // Frontend'den gelen workoutType'ı normalize et
      const normalizedWorkoutType = workoutType === 'just_row' ? 'just-row' : workoutType;
      session.workoutType = normalizedWorkoutType as 'just-row' | 'interval' | null;
      await session.save();
      
      io.to(`session-${sessionCode}`).emit('multi-row:workout-selected', {
        workoutType: normalizedWorkoutType,
      });
    }
  } catch (error) {
    console.error('Select workout error:', error);
  }
});
```

### 2. Tüm Dosyaları Güncelle

Yerel makineden sunucuya dosyaları kopyalayın:

```bash
# Yerel makinede (bu komutları çalıştır):
cd /Users/okanvatanci/Desktop/row-coach

# Socket handler'ı kopyala:
scp backend/src/socket/multiRowHandlers.ts root@sunucu-ip:/opt/rowcoach-backend/backend/src/socket/

# Controller'ı kopyala:
scp backend/src/controllers/multiRowController.ts root@sunucu-ip:/opt/rowcoach-backend/backend/src/controllers/

# Routes'u kopyala:
scp backend/src/routes/multiRowRoutes.ts root@sunucu-ip:/opt/rowcoach-backend/backend/src/routes/

# Model'i kopyala:
scp backend/src/models/MultiRowSession.ts root@sunucu-ip:/opt/rowcoach-backend/backend/src/models/
```

### 3. Build ve Restart

```bash
cd /opt/rowcoach-backend/backend
npm run build
pm2 restart row-coach-backend
```

### 4. Test Et

```bash
# Logları kontrol et:
pm2 logs row-coach-backend --lines 20

# Artık `just_row` hatası görünmemeli
```

## Alternatif: Git Pull

Eğer Git kullanıyorsanız:

```bash
cd /opt/rowcoach-backend
git pull
cd backend
npm run build
pm2 restart row-coach-backend
```

## Önemli Not

Bu düzeltme hem socket handler'da hem de REST API'de workoutType formatını normalize edecek. Frontend'den `'just_row'` gelse bile backend `'just-row'` olarak kaydedecek.

