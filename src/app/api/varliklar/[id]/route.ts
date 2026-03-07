import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Varlik from "../../../../models/Varlik";

export const dynamic = "force-dynamic";

// 🔍 GET: Tekil Varlık Detayını Getir (İnceleme Sayfası İçin)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const { id } = params;
    
    const varlik = await Varlik.findById(id);
    
    if (!varlik) {
      return NextResponse.json({ error: "Siber ağda böyle bir varlık bulunamadı." }, { status: 404 });
    }
    
    return NextResponse.json(varlik, { status: 200 });
  } catch (error) {
    console.error("Varlık Çekme Hatası:", error);
    return NextResponse.json({ error: "Bağlantı motoru arızası." }, { status: 500 });
  }
}

// 🔥 DELETE: Varlığı Veritabanından Tamamen İmha Et (Admin Paneli İçin)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const { id } = params;

    // Varlığı bul ve veritabanından tamamen kazı
    const silinenVarlik = await Varlik.findByIdAndDelete(id);
    
    if (!silinenVarlik) {
      return NextResponse.json({ error: "Bu varlık zaten silinmiş veya bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Varlık siber ağdan kalıcı olarak imha edildi." }, { status: 200 });
  } catch (error) {
    console.error("Varlık Silme Hatası:", error);
    return NextResponse.json({ error: "İmha işlemi sırasında motor arızası." }, { status: 500 });
  }
}
