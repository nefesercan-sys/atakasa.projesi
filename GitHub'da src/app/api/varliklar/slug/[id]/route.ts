import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectMongoDB();
    const varlik = await Varlik.findById(id).select("slug").lean();
    if (!varlik || !(varlik as any).slug) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ slug: (varlik as any).slug });
  } catch {
    return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  }
}
