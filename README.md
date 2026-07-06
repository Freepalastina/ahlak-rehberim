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

## V17 Hukuki Güvenlik
Eklenenler:
- Açılışta bilgilendirme/sorumluluk reddi
- Marka detaylarında kısa hukuki not
- Daha yumuşak etiketler: “İncele / Dikkat”, “Alternatif / Tercih Edilebilir”
- `hukuki-bilgilendirme.html`
- Riskli kesin suçlama dilinden kaçınan metinler

## V20 Mevcut Tasarım + Güvenli Bilgilendirme
Bu sürüm V17 dosyasının üzerine hazırlandı.
- Mevcut ikonlar ve tasarım korundu.
- Çok dilli bilgilendirme metni eklendi: TR / DE / EN.
- Açılış notu V20 anahtarıyla tekrar gösterilir.
- Hukuki/kaynak/düzeltme sayfaları üç dilli içerikle güncellendi.
- UI dili daha tarafsız yapıldı.
- Cache temizleme için `?v20-clear-cache` parametresi desteklenir.

## V21 Ana Firma + Kırmızı Durum Düzeltmesi
- “İncelenmesi Önerilir” artık kırmızı rozetle gösterilir.
- `companies.json` ana firma sözlüğü eklendi.
- `data.json` içinde 151 kayıt için ana firma temel sözlükle güncellendi.
- `ana_firma_duzeltme_raporu.csv` raporu eklendi.
- Yeni veri yüklense bile uygulama `companies.json` üzerinden ana firma eşleştirmesi yapabilir.

Not: Ana firma eşleştirmeleri temel sözlükle yapılmıştır. Büyük veri seti için sonraki aşamada eksik kalan markalar manuel/ kaynaklı kontrol edilmelidir.

## V22 Marka Görselleri
- Kartlara marka/ürün görsel alanı eklendi.
- Detay sayfasına büyük görsel alanı eklendi.
- `image_url` alanı desteklenir.
- Görsel yoksa otomatik güvenli varsayılan görsel gösterilir.
- `images/` klasörü eklendi.
- data.json içinde image_url alanı olmayan 1571 kayda boş image_url alanı eklendi.

Görsel ekleme:
1. Görseli `images/` klasörüne koy.
2. `data.json` içinde ilgili markaya `"image_url": "images/dosya-adi.png"` yaz.
3. Commit ve push yap.

## V23 Kaynak Merkezi
- Marka detayında düzenli Kaynak Merkezi eklendi.
- `kaynaklar` alanı desteklenir: başlık, URL, tür, tarih, not.
- `sonGuncelleme`, `ozet`, `kaynakDurumu` alanları eklendi.
- Eski `kaynak` metinlerinden 2000 adet kaynak nesnesi üretildi.
- Kaynaksız kayıtlar için “Kaynak kontrolü gerekli” mesajı gösterilir.
- `kaynak_sablonu.json` eklendi.

## V24 Alternatif Merkezi
- Marka kartlarında alternatif sayısı gösterilir.
- Marka detayında `⭐ Alternatif Merkezi` bölümü eklendi.
- `alternatifler` alanı desteklenir: marka, kategori, ülke, not.
- Eski `alternatif` metinlerinden 2156 alternatif nesnesi üretildi.
- Alternatif yoksa “Alternatif önerisi bekleniyor” mesajı gösterilir.
- `alternatif_sablonu.json` eklendi.

## V25 Barkod Merkezi
- Marka kartlarında barkod sayısı gösterilir.
- Marka detayında `📦 Barkod Merkezi` bölümü eklendi.
- Barkod arama alanı eklendi.
- `barkodlar` alanı desteklenir: kod, tür, not.
- Mevcut veriden 0 barkod nesnesi üretildi.
- `barkod_sablonu.json` eklendi.

Not: Bu sürüm kamera ile canlı barkod tarama değil, barkod numarasıyla arama yapar. Kamera tarama V26’da eklenebilir.

## V26 Admin Panel
- Tarayıcıdan marka taslağı oluşturma
- Kaynak / alternatif / barkod alanları
- Yerel taslak kaydetme
- Tek kayıt JSON indirme
- Tüm veri JSON dışa aktarma
- `admin_kullanim.md` eklendi

Not: Bu sürüm Supabase'e doğrudan yazmaz. Güvenli ilk adım olarak yerel taslak + JSON dışa aktarma kullanır.

## V27 Supabase Admin Sync
- Admin paneline Supabase bağlantı ayarları eklendi.
- Bağlantı testi eklendi.
- Tek kaydı Supabase `brands` tablosuna gönderme eklendi.
- `supabase_v27_schema.sql` eklendi.
- `supabase_admin_kullanim.md` eklendi.

Güvenlik:
- service_role key kullanmayın.
- Public anon/publishable key kullanın.
- Yazma izinlerini Supabase RLS ile sınırlandırın.

## V28 Supabase Live Read
- Uygulama veriyi Supabase `brands` tablosundan okuyabilir.
- Ayar yönetim panelinden açılıp kapatılır.
- Supabase çalışmazsa otomatik `data.json` yedeğine döner.
- `supabase_live_read_kullanim.md` eklendi.

## V29 Akıllı Ürün Sayfası
- Detay sayfasında güven/özet kutuları eklendi.
- Aynı ana firmaya ait markalar gösterilir.
- Aynı kategorideki diğer kayıtlar gösterilir.
- Mini marka butonlarıyla ilişkili kayıtlara hızlı geçiş yapılır.

## V30 Karşılaştırma
- İki marka yan yana karşılaştırılabilir.
- Marka detayında “Karşılaştır” butonu eklendi.
- Karşılaştırma sayfasında arama ile marka ekleme eklendi.

## V31 QR + Paylaşım
- Marka detayına QR kod eklendi.
- Link kopyalama ve mobil paylaşım eklendi.
- `?marka=` parametresiyle doğrudan marka açma eklendi.

## V32 Kullanıcı Öneri Sistemi
- Öneri / düzeltme formu eklendi.
- Marka detayından doğrudan düzeltme önerisi başlatılabilir.
- Öneriler localStorage içinde saklanır.
- Öneriler JSON olarak dışa aktarılabilir.
