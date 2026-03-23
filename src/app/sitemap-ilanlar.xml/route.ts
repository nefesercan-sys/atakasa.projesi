export const dynamic = "force-static";

export async function GET() {
  const BASE = "https://www.atakasa.com";

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/kesfet", priority: "0.9", changefreq: "daily" },
    { loc: "/takas", priority: "0.9", changefreq: "daily" },
    { loc: "/ilan-ver", priority: "0.9", changefreq: "weekly" },
    { loc: "/kayit", priority: "0.8", changefreq: "monthly" },
    { loc: "/giris", priority: "0.7", changefreq: "monthly" },
    { loc: "/rehber", priority: "0.7", changefreq: "weekly" },
    { loc: "/premium", priority: "0.7", changefreq: "monthly" },
    { loc: "/sozlesme", priority: "0.5", changefreq: "monthly" },
    { loc: "/sepet", priority: "0.5", changefreq: "monthly" },
    // Kategori sayfaları
    { loc: "/kategori/Elektronik", priority: "0.9", changefreq: "daily" },
    { loc: "/kategori/Arac", priority: "0.9", changefreq: "daily" },
    { loc: "/kategori/Emlak", priority: "0.9", changefreq: "daily" },
    { loc: "/kategori/Mobilya", priority: "0.8", changefreq: "daily" },
    { loc: "/kategori/Oyun-Konsol", priority: "0.8", changefreq: "daily" },
    { loc: "/kategori/Antika-Eserler", priority: "0.8", changefreq: "weekly" },
    { loc: "/kategori/Elektronik/Telefon", priority: "0.9", changefreq: "daily" },
    { loc: "/kategori/Elektronik/Bilgisayar", priority: "0.8", changefreq: "daily" },
    // Şehir sayfaları
    { loc: "/sehir/istanbul", priority: "0.9", changefreq: "daily" },
    { loc: "/sehir/ankara", priority: "0.9", changefreq: "daily" },
    { loc: "/sehir/izmir", priority: "0.8", changefreq: "daily" },
    { loc: "/sehir/bursa", priority: "0.7", changefreq: "daily" },
    { loc: "/sehir/antalya", priority: "0.7", changefreq: "daily" },
  ];

  const today = new Date().toISOString().split("T")[0];

  const urls = staticPages.map(p => `
  <url>
    <loc>${BASE}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
