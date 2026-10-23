# A-Takasa

Ücretsiz, **yalnızca takas** platformu. İhtiyacın olmayan eşyayı fotoğraf/videoyla ilan et, başkasının ilanı için kendi ilanını öner; karşılıklı onayla takas tamamlanır. Satın alma ve ödeme yoktur.

## Akış
1. Üye ol → ilan ver (en az 1, en fazla 8 fotoğraf/video; Cloudinary)
2. Başkasının ilanında "Takas teklif et" → kendi ilanlarından birini öner
3. İlan sahibi kabul eder → iki ilan "takasta" olur, telefon/e-posta karşılıklı açılır
4. Buluşup teslim sonrası **iki taraf da** "Takas gerçekleşti" der → tamamlandı
Durum makinesi: `src/lib/teklif-akis.ts` (test: `npm run test:akis`).

## Kurulum
```bash
cp .env.example .env.local   # değerleri doldur
npm install
npm run dev
```
Gerekli ortam değişkenleri `.env.example` içinde: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAILS`, Cloudinary anahtarları, `EMAIL_USER/EMAIL_PASS` (şifre sıfırlama).
