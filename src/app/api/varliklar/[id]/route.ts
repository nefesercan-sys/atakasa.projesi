import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Varlik from "../../../../models/Varlik";
import User from "../../../../models/User"; // 🚨 İŞTE EKSİK OLAN SİBER ANAHTAR!

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectMongoDB();
    
    // 🚨 Next.js güvenlik kilidi: params'ı her ihtimale karşı çözümlüyoruz
    const resolvedParams = await params; 
    const id = resolvedParams.id;

    // User modelini yukarıda import ettiğimiz için populate artık asla çökmeyecek!
    const varlik = await Varlik.findById(id).populate("satici", "email name");

    if (!varlik) {
      return NextResponse.json({ error: "Siber ağda böyle bir varlık bulunamadı." }, { status: 404 });
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
      return NextResponse.json({ error: "Bu varlık zaten silinmiş veya bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ message: "Varlık siber ağdan kalıcı olarak imha edildi." }, { status: 200 });
  } catch (error) {
    console.error("Varlık Silme Hatası:", error);
    return NextResponse.json({ error: "İmha işlemi sırasında motor arızası." }, { status: 500 });
  }
}
