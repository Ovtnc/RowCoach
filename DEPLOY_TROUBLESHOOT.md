# Sunucuda Sorun Giderme

## package.json Bulunamıyor Hatası

Eğer `/opt/rowcoach-backend/package.json` bulunamıyorsa:

### 1. Mevcut Dizini Kontrol Et
```bash
pwd
ls -la
```

### 2. Proje Dizinini Bul
```bash
# Tüm sistemde ara:
find / -name "package.json" -path "*/rowcoach*" 2>/dev/null

# Veya backend klasörünü ara:
find / -type d -name "backend" 2>/dev/null

# Veya row-coach klasörünü ara:
find / -type d -name "row-coach" 2>/dev/null
```

### 3. Doğru Dizine Git
Muhtemelen proje şu dizinlerden birinde:
```bash
# Seçenek 1: Proje root dizini
cd /opt/row-coach/backend
# veya
cd /opt/rowcoach/backend

# Seçenek 2: Backend direkt root'ta
cd /opt/rowcoach-backend

# Seçenek 3: Farklı bir lokasyon
cd /var/www/row-coach/backend
# veya
cd /home/user/row-coach/backend
```

### 4. Dizin Yapısını Kontrol Et
```bash
ls -la
# Şunları görmelisiniz:
# - package.json
# - src/
# - node_modules/
# - dist/ (build sonrası)
```

### 5. Eğer Dizin Yoksa - Projeyi Kopyala

#### Yerel makineden sunucuya kopyala:
```bash
# Yerel makinede (scp ile):
scp -r backend/ kullanici@sunucu-ip:/opt/rowcoach-backend/

# Veya rsync ile:
rsync -avz backend/ kullanici@sunucu-ip:/opt/rowcoach-backend/
```

#### Git'ten clone et:
```bash
cd /opt
git clone <repo-url> rowcoach-backend
cd rowcoach-backend/backend
```

### 6. Doğru Dizinde Olduğunuzdan Emin Olun
```bash
# package.json'ı kontrol et:
cat package.json

# Dizin yapısını kontrol et:
tree -L 2
# veya
ls -R | head -20
```

## Hızlı Çözüm

Eğer proje `/opt/rowcoach-backend/` altında değilse:

```bash
# 1. Mevcut dizini kontrol et
pwd

# 2. Backend klasörünü bul
find /opt -name "backend" -type d 2>/dev/null

# 3. Bulunan dizine git
cd /bulunan/dizin/path/backend

# 4. package.json'ı kontrol et
ls -la package.json

# 5. Artık npm komutlarını çalıştırabilirsiniz
npm install
npm run build
```

## Alternatif: Proje Yapısını Kontrol Et

Eğer proje yapısı farklıysa (örneğin backend root'ta değilse):

```bash
# Tüm proje yapısını gör:
cd /opt
find . -name "package.json" -type f 2>/dev/null | head -10

# Bu size projenin nerede olduğunu gösterecek
```

