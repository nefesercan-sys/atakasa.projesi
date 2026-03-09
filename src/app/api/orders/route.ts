import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "../../../models/Order";
// 🚀 GÜVENLİK KİLİDİ: Oturumu kontrol etmek için eklendi
import { getServerSession } from "next-auth/next";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export const dynamic = "force-dynamic";

// 🛒 YENİ SİPARİŞ OLUŞTUR (Satın Al Butonu Buraya Geliyor)
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    // 🛡️ SİBER KİMLİK TESPİTİ: Frontend'e güvenme, alıcıyı sunucudan bul!
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Siber ağda kimliğiniz doğrulanamadı. Lütfen giriş yapın." }, { status: 401 });
    }

    const aktifAlici = session.user.email.toLowerCase();

    // MongoDB'nin katı kurallarına (Order.ts) göre veriyi mühürle
    const mappedData = {
      productId: data.listingId || data.productId || "Bilinmiyor",
      buyerEmail: aktifAlici, // 🎯 Alıcı adresi artık kesinlikle boş kalamaz!
      sellerEmail: data.sellerEmail || data.saticiEmail,
      price: Number(data.fiyat || data.price || 0),
      shippingAddress: `${data.adSoyad ? data.adSoyad + " - " : ""}${data.adres || data.shippingAddress || "Adres belirtilmedi"}`,
      paymentStatus: data.odemeYontemi === "kredi_karti" ? "odendi" : "bekliyor",
      status: "isleme_alindi",
      trackingNumber: data.kargoKodu || null
    };

    // Eğer satıcı maili yoksa sistemi çökertmemek için kontrollü reddet
    if (!mappedData.sellerEmail) {
       return NextResponse.json({ error: "Satıcı bilgisi eksik, işlem kilitlendi!" }, { status: 400 });
    }

    // Siparişi veritabanına yaz
    const yeniSiparis = await Order.create(mappedData);

    return NextResponse.json({ message: "Sipariş başarıyla mühürlendi!", order: yeniSiparis }, { status: 201 });

  } catch (error: any) {
    console.error("Sipariş Yaratma Arızası:", error);
    // 🚨 Hata olursa artık 500 yerine, hatanın tam sebebini ekrana basacak!
    return NextResponse.json({ error: "Sistem çöküşü: " + error.message }, { status: 500 });
  }
}

// 📡 SİPARİŞLERİ GETİR (Panel SWR Motoru Buradan Veri Çeker)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let query = {};
    if (email) {
      const aktifEmail = email.toLowerCase();
      query = {
        $or: [
          { buyerEmail: aktifEmail },
          { sellerEmail: aktifEmail }
        ]
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Siber veri çekilemedi." }, { status: 500 });
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

    if (yeniDurum) siparis.status = yeniDurum;
    if (kargoKodu) siparis.trackingNumber = kargoKodu;

    await siparis.save();
    return NextResponse.json({ message: "Durum başarıyla güncellendi!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
