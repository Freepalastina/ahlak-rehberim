# Ahlak Rehberim V8 - Profesyonel Veritabanı

Bu sürümde veriler artık ayrı tablolara bölündü:

- `companies` → Ana firmalar
- `categories` → Kategoriler
- `brands` → Markalar
- `barcodes` → Barkodlar
- `sources` → Kaynaklar
- `brand_images` → Görseller
- `alternatives` → Alternatifler

Uygulama yine tek liste gibi çalışır. Bunun için Supabase içinde `brand_cards` görünümü oluşturulur.

## Kurulum

1. Supabase Dashboard > SQL Editor aç
2. `supabase_setup_v8.sql` dosyasını aç
3. İçindeki SQL'i yapıştır ve RUN bas
4. ZIP içindeki dosyaları GitHub'a yükle
5. Siteyi aç
6. Yönetim bölümünde giriş yap
7. `data.json → Supabase aktar` butonuna bas

## Avantaj

- Markalar ayrı
- Ana firmalar ayrı
- Kaynaklar ayrı
- Barkodlar ayrı
- Görseller ayrı
- Tekrar eden veri azalır
- Uzun vadede çok daha düzenli çalışır


## V8.1 düzeltme
- Admin sayfasından çıkış yapınca otomatik Ana sayfaya döner
- Arama ve filtreler temizlenir
- Alt menü aktif durumu düzeltilir


## V9 ODS / Excel / CSV içe aktarma
Yönetim panelinde:
1. ODS / XLSX / CSV dosyası seç
2. Önizlemeyi kontrol et
3. `Dosyayı Supabase’e aktar` butonuna bas

Desteklenen sütun adları:
- Marka / marka / brand
- Ana Firma / anaFirma / anafirma / ana_firma
- Kategori / kategori / category
- Alternatif / alternatif / alternative
- Kaynak / kaynak / source / url / link
- Barkod / barkod / barcode / ean / gtin
- Görsel URL / image_url / image / logo / resim / gorsel
- Not / not / note
- Durum / durum / status
