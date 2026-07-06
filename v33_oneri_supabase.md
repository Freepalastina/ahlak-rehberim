# V33 Önerileri Supabase'e Gönderme

Eklenenler:
- Kullanıcı önerilerini Supabase `suggestions` tablosuna gönderme
- `supabase_v33_suggestions.sql`
- Öneri/moderasyon altyapısı

Kurulum:
1. Supabase SQL Editor'de `supabase_v33_suggestions.sql` dosyasını çalıştır.
2. Yönetim panelinde Supabase URL ve key ayarlarını kaydet.
3. Öneri ekranında önerileri kaydet.
4. “Önerileri Supabase'e Gönder” butonuna bas.

Güvenlik:
- service_role key kullanma.
- Public insert policy spam riski taşır. Gerekirse ileride captcha veya login eklenmelidir.
