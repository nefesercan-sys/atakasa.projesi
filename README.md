# Likya Home — Sineklik ve Panjur (atakasa.com)

Antalya'da sineklik ve panjur imalatı/montajı için 10 dilli tanıtım sitesi. Üyelik, ilan, takas ve veritabanı yoktur.

- Sayfalar: `/sineklik-panjur/<dil>` (tr, en, de, ru, es, fr, pl, uk, nl, ar). `/` kalıcı olarak `/sineklik-panjur/tr` adresine yönlenir.
- İçerik: `src/lib/sineklik-panjur.js` (metinler, telefon, WhatsApp), `src/lib/likya-home.js` (görseller).
- Ortam değişkenleri (isteğe bağlı): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SINEKLIK_URL`.
- Geliştirme: `npm install && npm run dev`
- Güncelleme tarihleri: `src/lib/lastmod.json` (sitemap `lastmod`, JSON-LD `dateModified`, sayfa altındaki "Son güncelleme" satırı). Elle yazılmaz: içerik değiştiren her PR'da `npm run build && npx next start -p 3100` ardından `npm run lastmod -- http://localhost:3100`.
- IndexNow: Production deploy sonrası `.github/workflows/indexnow.yml` site haritasını Bing ve Yandex'e bildirir (anahtar dosyası `public/<anahtar>.txt`).
