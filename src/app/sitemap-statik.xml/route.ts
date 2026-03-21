import { NextResponse } from "next/server";

const BASE = "https://atakasa.com";

const sayfalar = [
  { url: BASE,                            priority: "1.0", freq: "daily" },
  { url: `${BASE}/kesfet`,               priority: "0.95", freq: "hourly" },
  { url: `${BASE}/ilan-ver`,             priority: "0.8",  freq: "monthly" },
  { url: `${BASE}/sss`,                  priority: "0.7",  freq: "monthly" },
  { url: `${BASE}/kategori/takas`,       priority: "0.9",  freq: "daily" },
  { url: `${BASE}/kategori/ikinci-el`,   priority: "0.9",  freq: "daily" },
  { url: `${BASE}/kategori/elektronik`,  priority: "0.85", freq: "daily" },
  { url: `${BASE}/kategori/moda`,        priority: "0.8",  freq: "daily" },
  { url: `${BASE}/kategori/hizmet`,      priority: "0.8",  freq: "daily" },
  { url: `${BASE}/kategori/kiralama`,    priority: "0.8",  freq: "daily" },
  { url: `${BASE}/kategori/antika`,      priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/sanat`,       priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/petshop`,     priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/kitap`,       priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/egitim`,      priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/oyuncak`,     priority: "0.65", freq: "weekly" },
  { url: `${BASE}/kategori/dogal`,       priority: "0.65", freq: "weekly" },
  { url: `${BASE}/kategori/bakim`,       priority: "0.65", freq: "weekly" },
  { url: `${BASE}/kategori/bagis`,       priority: "0.6",  freq: "weekly" },
  { url: `${BASE}/kategori/rezervasyon`, priority: "0.6",  freq: "weekly" },
];

function buildXml(urls: typeof sayfalar) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildXml(sayfalar), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
