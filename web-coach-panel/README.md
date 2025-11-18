# RowCoach - Antrenör Paneli

Antrenörler için web tabanlı antrenman yönetim paneli.

## Özellikler

- 🔐 Antrenör girişi (JWT authentication)
- ➕ Antrenman ekleme (Su, Ergo, Özel)
- 📋 Antrenman listesi görüntüleme
- ✏️ Antrenman düzenleme
- 🗑️ Antrenman silme
- 📱 Mobil uygulamada görüntüleme

## Kurulum

1. Backend sunucusunun çalıştığından emin olun:
```bash
cd backend
npm run dev
```

2. Web panelini açın:
- `index.html` dosyasını bir web tarayıcısında açın
- Veya bir web sunucusu kullanın (örn: `python -m http.server 8000`)

3. API URL'ini ayarlayın:
- `app.js` dosyasındaki `API_BASE_URL` değişkenini backend URL'inize göre güncelleyin
- Varsayılan: `http://localhost:3000/api`

## Kullanım

1. **Giriş Yap:**
   - Antrenör hesabıyla giriş yapın (role: 'coach' veya 'both')

2. **Antrenman Ekle:**
   - Başlık, tarih ve tür bilgilerini doldurun
   - Ergo antrenmanı için ErgData ID ekleyebilirsiniz
   - Mesafe ve süre bilgileri opsiyoneldir

3. **Antrenman Yönetimi:**
   - Listeden antrenmanları görüntüleyin
   - Düzenle butonu ile antrenman bilgilerini güncelleyin
   - Sil butonu ile antrenmanları silebilirsiniz

## API Endpoints

- `GET /api/trainings` - Tüm antrenmanları getir (public)
- `GET /api/trainings/coach` - Antrenör antrenmanlarını getir (auth required)
- `POST /api/trainings` - Yeni antrenman ekle (auth required)
- `PUT /api/trainings/:id` - Antrenman güncelle (auth required)
- `DELETE /api/trainings/:id` - Antrenman sil (auth required)

## Mobil Uygulama Entegrasyonu

Antrenörün eklediği antrenmanlar otomatik olarak mobil uygulamada görüntülenir:
- `TrainingCalendarScreen` component'i `/api/trainings` endpoint'ini kullanır
- Antrenmanlar tarihe göre sıralanır
- Antrenör antrenmanları "Antrenör" rozeti ile işaretlenir

## Notlar

- Backend sunucusu çalışırken web paneli kullanılabilir
- CORS ayarları backend'de yapılandırılmış olmalı
- JWT token localStorage'da saklanır
- Mobil uygulama için API URL'i `config/network.ts` dosyasında ayarlanmalı

