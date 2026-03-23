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

    const yuksekOncelikli = ["Elektronik", "Araç", "Emlak", "Mobilya"];

    const urls = ilanlar.map((ilan: any) => {
      const slug = ilan.slug || ilan._id.toString();
      const lastmod = new Date(ilan.updatedAt || ilan.createdAt || Date.now())
        .toISOString().split("T")[0];
      const kategori = ilan.kategori || "";
      const priority = yuksekOncelikli.some(k => kategori.includes(k)) ? "0.8" : "0.7";
      return `  <url>
    <loc>${BASE}/varlik/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
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
