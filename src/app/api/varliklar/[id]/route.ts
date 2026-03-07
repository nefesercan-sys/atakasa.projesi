import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Varlik from "../../../../models/Varlik";

// 🔥 DELETE: Varlığı Veritabanından Tamamen Sil
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const { id } = params; // URL'den ilanın ID'sini alıyoruz

    const silinenVarlik = await Varlik.findByIdAndDelete(id);
    
    if (!silinenVarlik) {
      return NextResponse.json({ error: "Varlık zaten silinmiş veya bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Varlık siber ağdan tamamen imha edildi." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "İmha işlemi başarısız oldu." }, { status: 500 });
  }
}
