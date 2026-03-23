// src/lib/indexNow.ts
// Yeni ilan eklendiğinde veya güncellendiğinde Bing/Google'a anında bildirim gönderir

const BASE = "https://www.atakasa.com";
const API_KEY = process.env.INDEXNOW_API_KEY || "";

/**
 * Tek URL bildir
 */
export async function indexNowUrl(url: string) {
  if (!API_KEY) return;
  try {
    const res = await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${API_KEY}`,
      { method: "GET" }
    );
    console.log(`[IndexNow] ${url} → ${res.status}`);
  } catch (err) {
    console.error("[IndexNow] Hata:", err);
  }
}

/**
 * Birden fazla URL bildir (toplu — max 10.000)
 */
export async function indexNowBulk(urls: string[]) {
  if (!API_KEY || urls.length === 0) return;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "www.atakasa.com",
        key: API_KEY,
        keyLocation: `${BASE}/${API_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });
    console.log(`[IndexNow] ${urls.length} URL gönderildi → ${res.status}`);
  } catch (err) {
    console.error("[IndexNow] Toplu gönderim hatası:", err);
  }
}

/**
 * İlan slug'ından URL oluşturup bildir
 */
export async function indexNowIlan(slug: string) {
  await indexNowUrl(`${BASE}/varlik/${slug}`);
}
