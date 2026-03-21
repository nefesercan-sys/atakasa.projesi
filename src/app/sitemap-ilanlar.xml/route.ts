import { NextResponse } from "next/server";

const BASE = "https://atakasa.com";

export const dynamic = "force-dynamic";

export async function GET() {
  let urls: string[] = [];

  try {
    const res = await fetch(`${BASE}/api/varliklar/sitemap`);
    if (res.ok) {
      const liste = await res.json();
      const now = new Date().toISOString();

      urls = (Array.isArray(liste) ? liste : [])
        .filter((v: any) => v.slug)
        .map((v: any) => `  <url>
    <loc>${BASE}/varlik/${v.slug}</loc>
    <lastmod>${new Date(v.updatedAt || v.createdAt || now).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
