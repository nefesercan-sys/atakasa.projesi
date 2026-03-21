import { NextResponse } from "next/server";
import { SEHIR_ILCE, KATEGORILER } from "@/lib/sehirler";

const BASE = "https://atakasa.com";
const KAT_SLUGLARI = KATEGORILER.map(k => k.slug);

export const dynamic = "force-dynamic";

export async function GET() {
  const urls: string[] = [];
  const now = new Date().toISOString();

  for (const sehir of Object.keys(SEHIR_ILCE)) {
    for (const kat of KAT_SLUGLARI) {
      urls.push(`  <url>
    <loc>${BASE}/sehir/${sehir}/${kat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
  </url>`);
    }
  }

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
