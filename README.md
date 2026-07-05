# Ahlak Rehberim V7.1 - Supabase Fix

Bu sürümde:
- ON CONFLICT tamamen kaldırıldı
- UNIQUE hatası çözülür
- Marka varsa UPDATE yapılır
- Marka yoksa INSERT yapılır
- data.json → Supabase aktarımı artık UNIQUE constraint gerektirmez

Kurulum:
1. Supabase SQL Editor'da `supabase_setup.sql` dosyasını çalıştır
2. ZIP içindeki dosyaları GitHub'a yükle
3. Uygulamada Yönetim'e gir
4. Admin kullanıcı ile giriş yap
5. `data.json → Supabase aktar` butonuna bas


## V7.2 düzeltme
- Alternatif sayacı düzeltildi
- `durum = alternatif` kayıtları da alternatif sayısına dahil edilir
- Boş, `-`, `yok`, `none` gibi alanlar sayılmaz


## V7.3 Görsel desteği
- `image_url`, `image`, `logo`, `resim`, `gorsel` alanları desteklenir
- Kartlarda marka/ürün görseli gösterilir
- Görsel yoksa zeytin ikonlu placeholder görünür
- Supabase tablosuna `image_url` alanı eklendi
- Admin panelde Görsel URL alanı eklendi
