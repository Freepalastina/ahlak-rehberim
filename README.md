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
