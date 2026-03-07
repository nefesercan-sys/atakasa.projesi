import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Basit bir Sipariş Şeması (Eğer modelin yoksa anında oluşturur)
const orderSchema = new mongoose.Schema({
  listingId: String,
  buyerEmail: String,
  sellerEmail: String,
  adSoyad: String,
  adres: String,
  odemeYontemi: String,
  fiyat: Number,
  durum: { type: String, default: "bekliyor" }, // bekliyor, onaylandi, kargoda, teslim_edildi, iptal
  kargoKodu: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// 🛒 POST: YENİ SİPARİŞ OLUŞTUR
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const data = await req.json();
    
    // Alıcı e-postasını güvenlik için session'dan da alabilirsin, şimdilik frontend'den gelen alıcı bilgisini farz edelim.
    // Eğer frontend alıcı mailini yollamıyorsa, NextAuth token'ından alman gerekir.
    
    const yeniSiparis = await Order.create(data);
    return NextResponse.json({ message: "Sipariş mühürlendi!", order: yeniSiparis }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Sipariş motoru arızalandı." }, { status: 500 });
  }
}

// 📡 GET: KULLANICININ SİPARİŞLERİNİ GETİR
export async function GET(req: Request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Ajan kimliği eksik." }, { status: 400 });

    // Hem aldığım (buyer) hem de sattığım (seller) siparişleri getir
    const orders = await Order.find({
      $or: [{ buyerEmail: email }, { sellerEmail: email }]
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veri çekilemedi." }, { status: 500 });
  }
}

// 🔄 PUT: SİPARİŞ DURUMUNU VE KARGO KODUNU GÜNCELLE
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { orderId, yeniDurum, kargoKodu } = await req.json();

    const siparis = await Order.findById(orderId);
    if (!siparis) return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });

    siparis.durum = yeniDurum;
    if (kargoKodu) siparis.kargoKodu = kargoKodu;
    
    await siparis.save();

    return NextResponse.json({ message: "Siber kargo durumu güncellendi!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
