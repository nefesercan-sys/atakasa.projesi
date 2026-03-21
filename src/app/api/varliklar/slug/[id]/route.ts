// UUID → slug çözümler (middleware için)
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const varlik = await Varlik
      .findById(params.id)
      .select("slug")
      .lean();

    if (!varlik || !varlik.slug) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ slug: varlik.slug });
  } catch {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }
}
