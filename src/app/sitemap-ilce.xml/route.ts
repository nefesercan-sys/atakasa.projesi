import { NextResponse } from "next/server";
import { SEHIR_ILCE, KATEGORILER } from "@/lib/sehirler";

const BASE = "https://atakasa.com";
const KAT_SLUGLARI = KATEGORILER.map(k => k.slug);

export const dynamic = "force-dynamic";

export async function GET() {
  const urls: string[] = [];
  const now = new Date().toISOString();

  for (const [sehir, ilceler] of Object.entries(SEHIR_ILCE)) {
    for (const ilce of ilceler) {
      for (const kat of KAT_SLUGLARI) {
        urls.push(`  <url>
    <loc>${BASE}/sehir/${sehir}/${ilce}/${kat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.65</priority>
  </url>`);
      }
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
