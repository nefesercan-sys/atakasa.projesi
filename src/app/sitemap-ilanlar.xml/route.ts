import { NextResponse } from "next/server";

const BASE = "https://atakasa.com";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  let urls: string[] = [];

  try {
    const res = await fetch(`${BASE}/api/varliklar`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const liste = Array.isArray(data) ? data : [];

      urls = liste
        .filter((v: any) => v.slug)
        .flatMap((v: any) => {
          const loc = `${BASE}/varlik/${v.slug}`;
          const mod = new Date(v.updatedAt || v.createdAt || now).toISOString();
          return [
            `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
            `  <url><loc>${loc}/takas</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
            `  <url><loc>${loc}/satin-al</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          ];
        });
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
