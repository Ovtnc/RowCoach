# Row Coach - Kürek Antrenörü Uygulaması

Kapsamlı bir kürek antrenman takip uygulaması. Sporcular ve antrenörler için tasarlanmıştır.

## 🚀 Özellikler

### ✅ Tamamlanan Temel Özellikler
- **Kullanıcı Kimlik Doğrulama**: Sporcu, Antrenör veya Her İkisi rolü ile kayıt ve giriş
- **Navigasyon Sistemi**: Alt tab navigasyon ve stack navigasyon
- **Backend API**: Express.js, MongoDB ve Socket.IO ile RESTful API
- **Kullanıcı Profil Yönetimi**

### 🔄 Geliştirilmekte Olan Özellikler
- **Tempo Hesaplama**: Manuel (dokunmatik) ve otomatik hesaplama
- **Zamanlayıcı & Kronometre**: Antrenman süresi takibi
- **Harita & Konum**: GPS ile gerçek zamanlı konum takibi
- **İnterval Antrenmanları**: Önceden programlanmış interval programları
- **Antrenman Kayıtları**: Detaylı log ve istatistikler
- **Tempo Uyarı Sistemi**: Hedef tempoda kalma uyarıları
- **Hayalet Yarış Modu**: Önceki performansa veya hedef tempoya karşı yarış
- **Arka Plan Bildirimleri**: Ekran kilitli iken bildirim gösterimi
- **Topluluk & Klüpler**: 
  - Kullanıcılar antrenman paylaşabilir
  - Klüp sahipleri grup oluşturabilir
  - Toplu interval programları
  - Senkronize grup antrenmanları

## 📁 Proje Yapısı

```
row-coach/
├── backend/                 # Node.js/Express Backend API
│   ├── src/
│   │   ├── models/         # MongoDB modelleri
│   │   ├── controllers/    # API controller'ları
│   │   ├── routes/         # API route'ları
│   │   ├── middleware/     # Auth middleware
│   │   ├── config/         # Database config
│   │   └── server.ts       # Ana server dosyası
│   ├── package.json
│   └── tsconfig.json
│
└── RowCoach/               # React Native Mobil Uygulama
    ├── src/
    │   ├── screens/        # Uygulama ekranları
    │   │   ├── auth/       # Login, Register
    │   │   ├── home/       # Ana sayfa
    │   │   ├── workout/    # Antrenman ekranları
    │   │   ├── history/    # Geçmiş ekranları
    │   │   ├── community/  # Topluluk ekranları
    │   │   └── profile/    # Profil ekranı
    │   ├── navigation/     # Navigasyon yapısı
    │   ├── components/     # Tekrar kullanılabilir componentler
    │   ├── context/        # React Context (Auth)
    │   ├── services/       # API servisleri
    │   ├── utils/          # Yardımcı fonksiyonlar
    │   ├── hooks/          # Custom hooks
    │   └── types/          # TypeScript tipleri
    ├── ios/               # iOS native kod
    ├── android/           # Android native kod
    └── package.json
```

## 🛠️ Teknolojiler

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- Socket.IO (Real-time sync)
- JWT Authentication
- bcrypt (Password hashing)

### Mobile (React Native)
- React Native 0.82.1
- TypeScript
- React Navigation
- Axios (API calls)
- AsyncStorage (Local storage)
- React Native Maps
- Geolocation
- React Native Chart Kit (Grafikler)
- Notifee (Bildirimler)

## 🚀 Kurulum

### Backend

1. Backend klasörüne gidin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun:
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rowcoach
JWT_SECRET=your_secret_key
NODE_ENV=development
```

4. MongoDB'nin çalıştığından emin olun ve sunucuyu başlatın:
```bash
npm run dev
```

### Mobile App

1. Mobil uygulama klasörüne gidin:
```bash
cd RowCoach
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. iOS için pods yükleyin:
```bash
cd ios && pod install && cd ..
```

4. Metro bundler'ı başlatın:
```bash
npx react-native start
```

5. Yeni terminalde iOS uygulamasını çalıştırın:
```bash
npx react-native run-ios
```

Android için:
```bash
npx react-native run-android
```

## 📱 Kullanım

1. **Kayıt Ol**: Uygulamayı açın ve yeni hesap oluşturun
2. **Rol Seç**: Sporcu, Antrenör veya Her İkisi
3. **Antrenman Başlat**: Serbest, İnterval veya Hayalet Yarış seç
4. **İstatistikleri Görüntüle**: Geçmiş antrenmanlarınızı ve istatistiklerinizi inceleyin
5. **Klüp Oluştur/Katıl**: Toplulukla bağlantı kurun

## 🔄 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/profile` - Profil bilgisi
- `PUT /api/auth/profile` - Profili güncelle

### Workouts
- `POST /api/workouts` - Antrenman oluştur
- `GET /api/workouts` - Antrenmanları listele
- `GET /api/workouts/:id` - Antrenman detayı
- `GET /api/workouts/stats` - İstatistikler
- `PUT /api/workouts/:id` - Antrenman güncelle
- `DELETE /api/workouts/:id` - Antrenman sil

### Clubs
- `POST /api/clubs` - Klüp oluştur
- `GET /api/clubs/:id` - Klüp detayı
- `POST /api/clubs/join` - Klübe katıl
- `GET /api/clubs/:id/workouts` - Klüp antrenmanları

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT

## 👥 İletişim

Proje Sahibi - Row Coach Team

---

**Not**: Bu uygulama aktif geliştirme aşamasındadır. Bazı özellikler henüz tamamlanmamıştır.









