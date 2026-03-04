import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// 🚨 VERCEL ÖNBELLEK KIRICI: Yeni ürün eklendiğinde anında görünmesini sağlar
export const dynamic = "force-dynamic";

// 📥 GET: Tüm Varlıkları (Ürünleri) Vitrine Çek
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ status: "aktif" }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error("Varlık Çekme Hatası:", error);
    return NextResponse.json({ success: false, error: "Veriler getirilemedi." }, { status: 500 });
  }
}

// 📤 POST: Sisteme Yeni Varlık (Ürün) Mühürle
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const newProduct = await Product.create({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      ownerEmail: body.ownerEmail || "anonim_kullanici", // İleride NextAuth ile bağlanacak
      image: body.image || "https://placehold.co/600x400/030712/00f260?text=ATAKASA"
    });

    return NextResponse.json({ success: true, message: "Varlık başarıyla kasaya eklendi!", data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Varlık Ekleme Hatası:", error);
    return NextResponse.json({ success: false, error: "Varlık kaydedilemedi." }, { status: 500 });
  }
}
