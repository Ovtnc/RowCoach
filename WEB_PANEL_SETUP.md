# Web Coach Panel Kurulumu

## Hızlı Kurulum (Sunucuda)

Sunucuya SSH ile bağlanın ve şu komutları çalıştırın:

```bash
ssh root@161.97.132.240

# Setup script'ini çalıştır
bash /root/setup-web-panel.sh
```

Veya manuel olarak:

```bash
# 1. Klasör oluştur
mkdir -p /var/www/rowcoach-panel

# 2. Dosyaları kopyala (Git repo'dan)
cp -r /opt/rowcoach-backend/web-coach-panel/* /var/www/rowcoach-panel/

# 3. HTTP server başlat
cd /var/www/rowcoach-panel
python3 -m http.server 8000 &
```

## Erişim

Web paneli şu adresten erişilebilir:

**http://161.97.132.240:8000**

## Firewall Ayarları

Port 8000'in açık olduğundan emin olun:

```bash
ufw allow 8000/tcp
ufw status
```

## Systemd Service (Otomatik Başlatma)

Otomatik başlatma için systemd service oluşturuldu:

```bash
# Durumu kontrol et
systemctl status rowcoach-panel

# Yeniden başlat
systemctl restart rowcoach-panel

# Logları görüntüle
journalctl -u rowcoach-panel -f

# Durdur
systemctl stop rowcoach-panel

# Başlat
systemctl start rowcoach-panel
```

## Kullanım

1. Tarayıcıda `http://161.97.132.240:8000` adresine gidin
2. "Kayıt Ol" ile coach hesabı oluşturun
3. Giriş yapın
4. Antrenman ekleyin!

## Güncelleme

Kod değişikliklerinden sonra:

```bash
cd /opt/rowcoach-backend
git pull
cp -r web-coach-panel/* /var/www/rowcoach-panel/
systemctl restart rowcoach-panel
```

