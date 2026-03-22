import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectMongoDB();
    const resolvedParams = await params; 
    const id = resolvedParams.id;

    const varlik = await Varlik.findById(id).lean();
    if (!varlik) {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(varlik, { status: 200 });
  } catch (error) {
    console.error("Varlık Çekme Hatası:", error);
    return NextResponse.json({ error: "Bağlantı motoru arızası." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectMongoDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const silinenVarlik = await Varlik.findByIdAndDelete(id);
    if (!silinenVarlik) {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ message: "İlan silindi." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Silme işlemi başarısız." }, { status: 500 });
  }
}
