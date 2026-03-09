import { NextResponse } from "next/server";
import mongoose from "mongoose";
// Merkezi modelimizi içeri alıyoruz
import Order from "../../../models/Order";

// Veritabanı bağlantı motoru
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
  } catch (err) {
    console.error("Veritabanı bağlantı hatası:", err);
  }
};

export const dynamic = "force-dynamic";

// 📦 YENİ SİPARİŞ OLUŞTUR (Satın Al Butonu Buraya Geliyor)
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    // 🚨 SİBER KÖPRÜ: Frontend'den gelen Türkçe verileri, 
    // MongoDB'nin beklediği yeni nesil (İngilizce) modele çeviriyoruz!
    const mappedData = {
      productId: data.listingId || data.productId || "Bilinmiyor",
      buyerEmail: data.buyerEmail,
      sellerEmail: data.sellerEmail || data.saticiEmail,
      price: Number(data.fiyat || data.price || 0),
      // Ad Soyad ve Adresi birleştirip tek bir kargo adresine çeviriyoruz
      shippingAddress: `${data.adSoyad ? data.adSoyad + " - " : ""}${data.adres || data.shippingAddress || "Adres belirtilmedi"}`,
      paymentStatus: data.odemeYontemi === "kredi_karti" ? "odendi" : "bekliyor",
      status: "isleme_alindi", // Sistemin tanıdığı ilk standart durum
      trackingNumber: data.kargoKodu || null
    };

    const yeniSiparis = await Order.create(mappedData);
    return NextResponse.json({ message: "Sipariş mühürlendi", order: yeniSiparis }, { status: 200 });

  } catch (error: any) {
    console.error("Sipariş Yaratma Arızası:", error);
    return NextResponse.json({ error: "Sistem çakışması: " + error.message }, { status: 500 });
  }
}

// 📡 SİPARİŞLERİ GETİR (Panel SWR Motoru Buradan Veri Çeker)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let query = {};
    // Hem sattığım hem satın aldığım ürünleri getir
    if (email) {
      query = { 
        $or: [
          { buyerEmail: email.toLowerCase() }, 
          { sellerEmail: email.toLowerCase() }
        ] 
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Veri çekilemedi" }, { status: 500 });
  }
}

// 🔄 DURUM GÜNCELLE (Paneldeki Onayla/Kargola Butonları)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { orderId, yeniDurum, kargoKodu } = body;

    const siparis = await Order.findById(orderId);
    if (!siparis) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    // Yeni modelimize uygun şekilde kelimeleri eşitliyoruz
    if (yeniDurum) siparis.status = yeniDurum;
    if (kargoKodu) siparis.trackingNumber = kargoKodu;

    await siparis.save();
    return NextResponse.json({ message: "Durum güncellendi" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}
