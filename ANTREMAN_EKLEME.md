# Antrenman Ekleme Rehberi

## Yöntem 1: Web Coach Panel (Önerilen - Antrenörler İçin)

### 1. Web Panel'e Erişim

Web coach paneli dosyalarını bir web sunucusunda çalıştırmanız gerekiyor. İki seçenek:

#### Seçenek A: Lokal Makinede (Test İçin)

```bash
cd /Users/okanvatanci/Desktop/row-coach/web-coach-panel

# Python ile basit HTTP server
python3 -m http.server 8000

# veya Node.js ile
npx http-server -p 8000
```

Tarayıcıda açın: `http://localhost:8000`

#### Seçenek B: Sunucuya Yükle (Production)

```bash
# Sunucuya kopyala
scp -r web-coach-panel/* root@161.97.132.240:/var/www/rowcoach-panel/

# Sunucuda Nginx kurulumu (opsiyonel)
# veya basit HTTP server
cd /var/www/rowcoach-panel
python3 -m http.server 8000
```

### 2. Coach Hesabı Oluştur

1. Web panelde "Kayıt Ol" butonuna tıklayın
2. Bilgileri doldurun:
   - İsim
   - Email
   - Şifre
   - Rol: "Coach" seçin
3. Kayıt olduktan sonra otomatik giriş yapılır

**Not:** Web'den kayıt olan coach'lara otomatik olarak bir klüp oluşturulur.

### 3. Antrenman Ekleme

1. Dashboard'da "Antrenman Ekle" sayfasına gidin
2. Formu doldurun:
   - **Başlık**: Antrenman adı (örn: "Teknik Çalışma")
   - **Açıklama**: Detaylı bilgi
   - **Tarih**: Antrenman tarihi
   - **Tip**: 
     - 🌊 Su Antrenmanı
     - 🏋️ Ergo Antrenmanı
     - 📝 Özel
   - **Mesafe**: (Opsiyonel) Metre cinsinden
   - **Süre**: (Opsiyonel) Saniye cinsinden
   - **ErgData ID**: (Sadece Ergo antrenmanları için)
3. "Antrenman Ekle" butonuna tıklayın

### 4. Klüp Seçimi

- Header'da "Klüp Seçici" dropdown'ından hangi klüp için antrenman eklediğinizi seçin
- Her klüp için ayrı antrenman programları oluşturabilirsiniz

## Yöntem 2: Mobil Uygulama (Kullanıcılar İçin)

### 1. Uygulamada Giriş Yap

- Login ekranından giriş yapın veya kayıt olun
- Mobil uygulamadan kayıt olanlar otomatik olarak "athlete" rolü alır

### 2. Klübe Katıl

- "Clubs" tab'ına gidin
- Davet kodunu girin veya public klüplere katılın

### 3. Antrenman Ekle

1. "Antrenman Takvimi" ekranına gidin
2. "+" butonuna tıklayın
3. Antrenman bilgilerini girin:
   - Başlık
   - Açıklama
   - Tarih seçin
   - Tip seçin (Su/Ergo)
4. "Kaydet" butonuna tıklayın

**Not:** Kullanıcıların eklediği antrenmanlar sadece kendi cihazlarında görünür (AsyncStorage).

## Yöntem 3: API ile (Geliştiriciler İçin)

### Coach Antrenman Ekleme

```bash
# Login yap ve token al
TOKEN=$(curl -X POST http://161.97.132.240:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@example.com","password":"password"}' \
  | jq -r '.token')

# Antrenman ekle
curl -X POST http://161.97.132.240:3000/api/trainings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teknik Çalışma",
    "description": "Teknik geliştirme antrenmanı",
    "date": "2025-11-20T10:00:00Z",
    "type": "water",
    "distance": 5000,
    "duration": 1800,
    "clubId": "CLUB_ID_BURAYA"
  }'
```

## Test Coach Hesabı

Eğer test coach hesabı yoksa, backend'de oluşturabilirsiniz:

```bash
ssh root@161.97.132.240
cd /opt/rowcoach-backend/backend
node create-coach.js
```

Veya web panelden kayıt olun.

## Sorun Giderme

### Web panel backend'e bağlanamıyor
- `web-coach-panel/app.js` dosyasında `API_BASE_URL` doğru mu kontrol edin
- CORS hatası alıyorsanız, backend'de CORS ayarlarını kontrol edin

### Antrenman görünmüyor
- Klüp seçicisinde doğru klübü seçtiğinizden emin olun
- Mobil uygulamada klübe üye olduğunuzdan emin olun
- Refresh butonuna basın

### Permission denied
- Coach rolüne sahip olduğunuzdan emin olun
- Klübe erişim yetkiniz olduğundan emin olun

