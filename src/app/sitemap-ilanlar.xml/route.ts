import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();
    const BASE = "https://www.atakasa.com";
    const ilanlar = await Varlik.find({})
      .sort({ updatedAt: -1 })
      .select("slug _id updatedAt createdAt kategori")
      .lean()
      .limit(50000);

    if (!ilanlar || ilanlar.length === 0) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
      );
    }

    const urls = (ilanlar as any[]).map((ilan) => {
      const slug = ilan.slug || ilan._id.toString();
      const lastmod = new Date(ilan.updatedAt || ilan.createdAt || Date.now())
        .toISOString().split("T")[0];
      return `  <url>\n    <loc>${BASE}/varlik/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("sitemap-ilanlar hatası:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
