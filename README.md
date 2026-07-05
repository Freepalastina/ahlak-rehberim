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
