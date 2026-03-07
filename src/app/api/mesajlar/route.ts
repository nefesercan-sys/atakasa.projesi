import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

// 💬 SİBER MESAJ ŞEMASI
const MesajSchema = new mongoose.Schema({
  gonderenEmail: { type: String, required: true },
  aliciEmail: { type: String, required: true },
  icerik: { type: String, required: true, maxlength: 1000 }, // Spam engelleme (Max 1000 karakter)
  okunduMu: { type: Boolean, default: false },
  ilanId: { type: String }, // Hangi ilan üzerinden konuşuluyor? (Opsiyonel)
}, { timestamps: true });

const Mesaj = mongoose.models.Mesaj || mongoose.model("Mesaj", MesajSchema);

// 🔍 GET: KULLANICININ MESAJLARINI ÇEK
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum yok!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const { searchParams } = new URL(req.url);
    const karsiKullanici = searchParams.get("karsiKullanici");

    // Eğer belirli biriyle olan sohbet isteniyorsa:
    if (karsiKullanici) {
      const sohbet = await Mesaj.find({
        $or: [
          { gonderenEmail: email, aliciEmail: karsiKullanici.toLowerCase() },
          { gonderenEmail: karsiKullanici.toLowerCase(), aliciEmail: email }
        ]
      }).sort({ createdAt: 1 }); // Eskiden yeniye sırala
      
      return NextResponse.json(sohbet, { status: 200 });
    }

    // Belirli biri yoksa, kullanıcının dahil olduğu TÜM mesajları son atılandan geriye doğru getir
    const tumMesajlar = await Mesaj.find({
      $or: [{ gonderenEmail: email }, { aliciEmail: email }]
    }).sort({ createdAt: -1 });

    return NextResponse.json(tumMesajlar, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Siber ağa ulaşılamadı." }, { status: 500 });
  }
}

// 🚀 POST: YENİ MESAJ GÖNDER
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Giriş yapmalısınız!" }, { status: 401 });

    const gonderenEmail = session.user.email.toLowerCase();
    const data = await req.json();

    if (!data.icerik || data.icerik.trim() === "") {
      return NextResponse.json({ error: "Boş sinyal gönderilemez." }, { status: 400 });
    }

    if (gonderenEmail === data.aliciEmail.toLowerCase()) {
      return NextResponse.json({ error: "Kendinize mesaj gönderemezsiniz." }, { status: 400 });
    }

    // 🛡️ ZIRH: SPAM / DoS KALKANI (Son 3 saniye içinde mesaj atmış mı?)
    const sonMesaj = await Mesaj.findOne({ gonderenEmail }).sort({ createdAt: -1 });
    
    if (sonMesaj) {
      const gecenSure = Date.now() - new Date(sonMesaj.createdAt).getTime();
      if (gecenSure < 3000) { // 3000 milisaniye = 3 saniye
        return NextResponse.json({ error: "Sinyal çok hızlı! Lütfen 3 saniye bekleyin." }, { status: 429 });
      }
    }

    // Her şey güvenliyse mesajı mühürle
    const yeniMesaj = await Mesaj.create({
      gonderenEmail,
      aliciEmail: data.aliciEmail.toLowerCase(),
      icerik: String(data.icerik).substring(0, 1000), // Hack koruması
      ilanId: data.ilanId || null
    });

    return NextResponse.json({ message: "Sinyal iletildi!", mesaj: yeniMesaj }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Mesaj iletilemedi." }, { status: 500 });
  }
}
