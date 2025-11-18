# TestFlight Build Guide - RowCoach

## 📋 Ön Hazırlık

### 1. Apple Developer Hesabı
- ✅ Apple Developer Program üyeliği ($99/yıl)
- ✅ App Store Connect erişimi
- ✅ Certificates & Provisioning Profiles

### 2. Bundle Identifier
- **Mevcut:** `org.reactjs.native.example.RowCoach`
- **Önerilen:** `com.yourcompany.rowcoach` (unique olmalı)
- **Değiştirmek için:** Xcode'da veya `project.pbxproj` dosyasında

---

## 🚀 Yöntem 1: Xcode ile Archive (Önerilen)

### Adım 1: Xcode'u Aç
```bash
cd /Users/okanvatanci/Desktop/row-coach/RowCoach/ios
open RowCoach.xcworkspace
```

### Adım 2: Scheme Ayarları
1. Xcode menü: **Product** → **Scheme** → **Edit Scheme**
2. **Run** sekmesi → **Build Configuration**: **Release** seç
3. **Archive** sekmesi → **Build Configuration**: **Release** olduğundan emin ol

### Adım 3: Signing & Capabilities
1. Xcode'da **RowCoach** project seç (sol panel)
2. **Signing & Capabilities** tab'ına git
3. **Team** seç (Apple Developer hesabın)
4. **Bundle Identifier** düzenle (unique olmalı)
5. **Automatically manage signing** işaretle

### Adım 4: Archive Oluştur
1. Xcode menü: **Product** → **Destination** → **Any iOS Device (arm64)**
2. Xcode menü: **Product** → **Archive**
3. Build başlayacak (~5-10 dakika)
4. Organizer penceresi açılacak

### Adım 5: TestFlight'a Yükle
1. Archive'i seç
2. **Distribute App** butonuna tıkla
3. **TestFlight & App Store** seç → **Next**
4. **Upload** seç → **Next**
5. **Automatically manage signing** seç → **Next**
6. **Upload** → Yükleme başlar

---

## 🛠️ Yöntem 2: Command Line ile Build

### Hazırlık
```bash
cd /Users/okanvatanci/Desktop/row-coach/RowCoach/ios
pod install
```

### Archive Oluştur
```bash
xcodebuild clean archive \
  -workspace RowCoach.xcworkspace \
  -scheme RowCoach \
  -configuration Release \
  -archivePath ./build/RowCoach.xcarchive \
  -destination 'generic/platform=iOS' \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  DEVELOPMENT_TEAM="YOUR_TEAM_ID"
```

### IPA Export
```bash
xcodebuild -exportArchive \
  -archivePath ./build/RowCoach.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

### ExportOptions.plist Oluştur
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

### IPA Yükle (Transporter ile)
1. **Transporter** uygulamasını aç (Mac App Store'dan indir)
2. IPA dosyasını sürükle-bırak
3. **Deliver** butonuna tıkla
4. Apple'ın işlemesi ~10-30 dakika sürer

---

## 🎯 Yöntem 3: Fastlane (Otomatik - İleri Seviye)

### Fastlane Kurulumu
```bash
cd /Users/okanvatanci/Desktop/row-coach/RowCoach/ios
gem install fastlane
fastlane init
```

### Fastfile Oluştur
```ruby
default_platform(:ios)

platform :ios do
  desc "Push to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "RowCoach.xcodeproj")
    build_app(
      workspace: "RowCoach.xcworkspace",
      scheme: "RowCoach",
      configuration: "Release",
      export_method: "app-store"
    )
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end
end
```

### Çalıştır
```bash
fastlane beta
```

---

## ⚙️ Gerekli Ayarlar

### 1. App Store Connect'te Uygulama Oluştur
1. https://appstoreconnect.apple.com → **Apps** → **+**
2. **Name:** RowCoach
3. **Bundle ID:** Xcode'daki ile aynı olmalı
4. **SKU:** rowcoach-1
5. **User Access:** Full Access

### 2. Bundle Identifier Değiştir (Önerilir)
```bash
# Xcode project dosyasında değiştir
# org.reactjs.native.example.RowCoach → com.yourcompany.rowcoach
```

### 3. Version & Build Number
- **Version:** 1.0 (MARKETING_VERSION)
- **Build:** 1 (CURRENT_PROJECT_VERSION)
- Her upload için build number artırılmalı

---

## ✅ Build Checklist

- [ ] Apple Developer hesabı aktif
- [ ] App Store Connect'te app oluşturuldu
- [ ] Bundle identifier unique
- [ ] Signing certificates hazır
- [ ] Provisioning profile hazır
- [ ] Version ve build number ayarlandı
- [ ] Backend URL production'a ayarlandı (opsiyonel)
- [ ] Test edildi ve çalışıyor

---

## 🐛 Yaygın Sorunlar

### "No signing identity found"
**Çözüm:** Xcode → **Preferences** → **Accounts** → Apple ID ekle

### "Bundle identifier is not available"
**Çözüm:** Unique bir bundle ID kullan (App Store Connect'te de aynı)

### "Provisioning profile doesn't match"
**Çözüm:** Xcode'da **Automatically manage signing** işaretle

### "Archive failed"
**Çözüm:** 
```bash
cd ios
pod deintegrate
pod install
```

---

## 📱 TestFlight Test Etmek

### Internal Testing (Hemen)
1. App Store Connect → **TestFlight** tab
2. **Internal Testing** → **+** → Testers ekle
3. Build işlendikten sonra (10-30 dk) link gelir
4. TestFlight app ile indir

### External Testing (Beta Review)
1. **External Testing** → **+** → Group oluştur
2. Testers ekle (email ile)
3. Build seç → **Submit for Review**
4. Apple onayı (~24-48 saat)
5. Onaylanınca link gönderilir

---

## 🎯 Hızlı Başlangıç (En Kolay)

### Xcode ile 5 Adımda TestFlight:

```bash
# 1. Workspace'i aç
cd /Users/okanvatanci/Desktop/row-coach/RowCoach/ios
open RowCoach.xcworkspace

# 2. Xcode'da:
#    - Team seç
#    - Bundle ID düzenle
#    - Product → Archive
#    - Distribute App → Upload

# 3. App Store Connect'te bekle (10-30 dk)

# 4. TestFlight → Internal Testing → Tester ekle

# 5. Link ile indir ve test et!
```

---

## 📦 Build Dosyaları

Archive sonrası şurada olacak:
```
~/Library/Developer/Xcode/Archives/
```

IPA dosyası:
```
./build/RowCoach.ipa
```

---

## 💡 İpuçları

- **Backend URL:** Production URL kullan (localhost değil)
- **API Keys:** Gizli tutulmalı
- **Version:** Her release'de artır (1.0, 1.1, 1.2...)
- **Build Number:** Her upload'da artır (1, 2, 3...)
- **Test:** Internal testing'de önce kendin test et
- **Feedback:** TestFlight otomatik crash reports toplar

---

## 🚨 Önemli

TestFlight yüklemeden önce:
1. ✅ Backend production'da çalışıyor olmalı
2. ✅ API URLs production'a ayarlanmalı
3. ✅ Tüm özellikler test edilmeli
4. ✅ Crash yok, stabil çalışıyor olmalı

---

Sorularınız varsa sorun! 🚀


