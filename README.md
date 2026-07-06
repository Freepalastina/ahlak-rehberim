# Ahlak Rehberim V10 Clean

Temiz sürüm:
- Supabase profesyonel tablo yapısı
- ODS / XLSX / CSV içe aktarma
- Admin panel
- Görsel URL
- Barkod
- Favoriler
- Dark mode
- Bayraklı dil seçimi
- data.json yedek sistemi

## Kurulum
1. Supabase > SQL Editor aç
2. `supabase_setup_v10.sql` içindeki SQL'i çalıştır
3. GitHub'a ZIP içindeki dosyaları yükle
4. Siteyi aç
5. Yönetim bölümüne gir
6. Admin girişi yap
7. ODS / Excel / CSV dosyanı seç ve Supabase'e aktar

Desteklenen sütunlar:
marka, anaFirma, kategori, alternatif, kaynak, barkod, image_url, not, durum


## V10.1 ODS Fix
- ODS / Excel / CSV yükleme alanı Yönetim sayfasında en üste alındı
- Giriş yapmadan da dosya seçme alanı görünür
- Supabase’e aktarmak için giriş gerekir
- Alan daha büyük ve belirgin hale getirildi


## V11 ODS Raw Import Fix
- Başlıksız LibreOffice ODS dosyaları desteklendi
- İlk sütun otomatik marka kabul edilir
- İkinci sütun `o`, `x`, `✓` gibi işaretleri durum olarak yorumlar
- Tüm sayfalar taranır, en çok kayıt bulunan sayfa kullanılır
- Aktarım durum mesajı ve hata mesajı görünür


## V13 Master ODS Sistemi
Bu sürüm `master.xlsx / master.ods` dosyasındaki ayrı sayfaları okuyabilir:

- Markalar
- Firmalar
- Kategoriler
- Kaynaklar
- Barkodlar
- Alternatifler

İçe aktarma sırasında önce Markalar sayfasını okur, sonra Kaynaklar/Barkodlar/Alternatifler sayfalarını marka adına göre bağlar.


## V13.1 Durum Fix
Bu sürümde şu değerlerin tamamı `Boykotta Değil` olarak okunur:
- `boykottaDegil`
- `boykot_degil`
- `boykot degil`
- `boykotta degil`
- `safe`
- `notBoycotted`

Master dosya içe aktarılırken durum değerleri otomatik normalize edilir.


## V13.2 Safe Detection Fix
Bu sürüm sadece `durum` alanına bakmaz.
Aşağıdaki alanlarda işaret varsa kayıt otomatik `Boykotta Değil` sayılır:
- kategori = Boykotta Değil
- kaynak = alternatif.ods
- not = Boykot listesinde olmayan
- durum = boykottaDegil / boykot_degil / safe / notBoycotted

Bu, eski Supabase aktarımında yanlış `boykot` görünen kayıtları da ekranda doğru gösterir.

## V15.1 Ülke + Kategori Filtre Fix
Bu sürüm V15 master dosyasındaki şu alanları okur:
- Ana Kategori
- Alt Kategori
- Ülke

Eklenenler:
- Ülkeler hızlı erişim butonu
- Ülkeye göre listeleme
- Kategori filtresinin Alt Kategori / Ana Kategori ile çalışması
- Marka kartında ülke gösterimi


## V16 Pages Workflow Fix

Bu sürüm GitHub Pages için gerekli workflow dosyasını içerir:

`.github/workflows/deploy.yml`

Kurulum:
1. Bu ZIP'i aç.
2. İçindeki tüm dosyaları repo klasörünün içine kopyala.
3. `.github` klasörünün de kopyalandığından emin ol.
4. Terminalde:
   git add .
   git commit -m "V16 Pages workflow fix"
   git push
