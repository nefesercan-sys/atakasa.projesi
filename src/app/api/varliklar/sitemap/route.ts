// Sitemap için hafif endpoint — sadece slug + tarih döner
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const varliklar = await Varlik
      .find(
        { aktif: true, slug: { $exists: true, $ne: null } },
        { slug: 1, updatedAt: 1, createdAt: 1, _id: 0 }
      )
      .lean();

    return NextResponse.json(varliklar, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    console.error("Sitemap API hatası:", err);
    return NextResponse.json([], { status: 500 });
  }
}
