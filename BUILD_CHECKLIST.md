# 🚀 RowCoach - TestFlight Build Checklist

## ✅ ŞU AN XCODE AÇIK - İZLEYECEĞİN ADIMLAR:

### 1️⃣ PROJE AYARLARI (5 dakika)

#### Xcode'da (şu an açık):

1. **Sol panelde** `RowCoach` project'e tıkla (en üstteki mavi ikon)

2. **TARGETS** → `RowCoach` seç

3. **General** tab'ında:
   - ✏️ **Display Name:** `RowCoach`
   - ✏️ **Bundle Identifier:** `com.yourname.rowcoach` (değiştir!)
   - ✏️ **Version:** `1.0`
   - ✏️ **Build:** `1`

4. **Signing & Capabilities** tab'ına git:
   - ✅ **Automatically manage signing** işaretle
   - ✏️ **Team** seç (Apple Developer hesabın)
   - ✅ Provisioning Profile otomatik oluşacak

5. **Build Settings** tab'ında ara: "code signing"
   - ✅ **Code Signing Identity (Release):** Apple Distribution
   - ✅ **Code Signing Style:** Automatic

---

### 2️⃣ APP STORE CONNECT HAZIRLIK (10 dakika)

#### App Store Connect'te:

1. https://appstoreconnect.apple.com → **Giriş yap**

2. **Apps** → **➕ (Add Apps)** tıkla

3. **New App** formunu doldur:
   - **Platforms:** ☑️ iOS
   - **Name:** `RowCoach`
   - **Primary Language:** Turkish veya English
   - **Bundle ID:** Xcode'da yazdığın bundle ID'yi seç (dropdown'dan)
   - **SKU:** `rowcoach-001` (unique olmalı)
   - **User Access:** Full Access

4. **Create** → App oluşturulacak

5. **App Information** tab'ında:
   - Category seç (Health & Fitness)
   - Privacy Policy URL (varsa)

---

### 3️⃣ ARCHIVE OLUŞTUR (10 dakika)

#### Xcode'a dön:

1. **Menü bar** → **Product** → **Destination** → **Any iOS Device (arm64)**

2. **Menü bar** → **Product** → **Clean Build Folder** (⌘⇧K)
   - 30 saniye bekle

3. **Menü bar** → **Product** → **Archive**
   - Build başlayacak (~5-10 dakika)
   - Sağ üstte progress bar görünecek

4. **Archive başarılı olunca:**
   - Organizer penceresi otomatik açılır
   - Archive listesinde yeni bir satır görünür

---

### 4️⃣ TESTFLIGHT'A YÜKLE (5 dakika)

#### Organizer penceresinde:

1. Yeni archive'i seç (en üstteki)

2. **Distribute App** butonuna tıkla

3. **Distribution method** → **TestFlight & App Store** → **Next**

4. **Destination** → **Upload** → **Next**

5. **Distribution options:**
   - ✅ Upload your app's symbols
   - ✅ Manage version and build number (otomatik artırır)
   - **Next**

6. **Automatically manage signing** → **Next**

7. **Review** → Son kontrol → **Upload**

8. Yükleme başlar (~2-5 dakika, internet hızına bağlı)

9. **Upload Successful!** mesajı gelince → **Done**

---

### 5️⃣ TESTFLIGHT'TA TEST ETME (10-30 dakika bekleme)

#### App Store Connect'e dön:

1. **Apps** → **RowCoach** → **TestFlight** tab

2. **Build** işlenecek (10-30 dakika):
   - Status: **Processing**
   - İşlem bitince: **Ready to Submit** / **Ready to Test**

3. **Internal Testing:**
   - Sol panel → **Internal Testing**
   - **➕** → **Create Group** (örn: "Team")
   - **➕** → **Add Testers** → Email ekle (kendi email'in)
   - Build seç → **Add Build to Group**

4. **Email gelecek:**
   - "You've been invited to test RowCoach"
   - **View in TestFlight** linkine tıkla

5. **iPhone/iPad'de:**
   - TestFlight app'i indir (App Store'dan)
   - Email'deki linke tıkla veya TestFlight'ta aç
   - **Install** → App inecek
   - Test et! 🎉

---

## 🐛 Sorun Giderme

### ❌ "No signing certificate found"
**Çözüm:**
1. Xcode → **Settings** (⌘,)
2. **Accounts** tab
3. Apple ID ekle
4. **Download Manual Profiles**

### ❌ "Bundle identifier is not available"
**Çözüm:**
- App Store Connect'te bundle ID oluşturdun mu?
- Bundle ID unique olmalı (başka biri kullanmış olabilir)

### ❌ "Archive failed"
**Çözüm:**
```bash
cd /Users/okanvatanci/Desktop/row-coach/RowCoach/ios
pod deintegrate
pod install
```
Sonra Xcode'da tekrar Archive dene

### ❌ "Provisioning profile doesn't match"
**Çözüm:**
- Xcode → Signing & Capabilities → **Automatically manage signing** işaretle
- Team seçtiğinden emin ol

---

## 📱 Hızlı Özet

```
1. Xcode açıldı ✅
2. Project settings → Bundle ID değiştir
3. Signing & Capabilities → Team seç
4. Product → Archive
5. Distribute App → Upload
6. App Store Connect'te bekle (10-30 dk)
7. TestFlight → Internal Testing → Tester ekle
8. Email ile link gelir → TestFlight'ta indir
```

---

## 🎯 ÖNEMLİ NOTLAR

### Production Backend URL
TestFlight build'i production backend kullanmalı:

**Değiştir:**
```typescript
// RowCoach/src/services/api.ts
const API_BASE_URL = 'https://your-production-backend.com/api'; // localhost değil!

// RowCoach/src/services/socket.ts
const SOCKET_URL = 'https://your-production-backend.com'; // localhost değil!
```

### Version Management
Her yeni build için:
- **Build number** artır: 1 → 2 → 3...
- **Version** sadece önemli değişikliklerde: 1.0 → 1.1 → 2.0

### İlk Upload
- İlk upload'ta Apple'ın review süresi yok
- Internal Testing için direkt kullanabilirsin
- External Testing için Beta Review gerekir (1-2 gün)

---

## 🔥 HEMEN BAŞLA

Xcode zaten açık! Şu adımları takip et:

1. ✏️ **Bundle ID değiştir** (com.yourname.rowcoach)
2. ✏️ **Team seç** (Signing & Capabilities)
3. 🏗️ **Product → Archive** (5-10 dk)
4. 📤 **Distribute → Upload** (2-5 dk)
5. ⏳ **App Store Connect'te bekle** (10-30 dk)
6. 📧 **TestFlight link gelir**
7. 📱 **iPhone'da test et!**

---

**Soru:** Backend production'da mı yoksa localhost mu kullanacaksın?
- Production → URL'leri değiştir
- Localhost → Sadece simulator'da test edebilirsin (TestFlight'ta çalışmaz)

Hazır mısın? Xcode'da başlayabilirsin! 🚀


