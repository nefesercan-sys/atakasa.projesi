// Sayfa başına GERÇEK son içerik güncelleme tarihi (tek kaynak). src/lib/lastmod.json, scripts/lastmod.mjs ile
// derlenmiş sitenin içeriği karşılaştırılarak üretilir: elle tarih yazmayın, içerik değiştiren her PR'da script'i çalıştırın.
import DATES from "./lastmod.json";

const pathOf = (pathOrUrl) => pathOrUrl.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0].replace(/\/$/, "") || "/";

/** Sayfanın son içerik güncellemesi (YYYY-MM-DD) ya da kayıt yoksa undefined. */
export const lastMod = (pathOrUrl) => DATES[pathOf(pathOrUrl)];
