import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB SİBER BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// ⭐ SİBER YORUM VE PUAN ŞEMASI
const YorumSchema = new mongoose.Schema({
  gonderenEmail: { type: String, required: true },
  gonderenAd: { type: String, default: "Gizli Kullanıcı" },
  saticiEmail: { type: String, required: true },
  ilanId: { type: String, required: true },
  puan: { type: Number, required: true, min: 1, max: 5 }, // 1 ile 5 yıldız arası
  icerik: { type: String, required: true, maxlength: 500 } // Maksimum 500 karakter
}, { timestamps: true });

const Yorum = mongoose.models.Yorum || mongoose.model("Yorum", YorumSchema);

// 🔍 GET: SATICIYA AİT YORUMLARI VE PUAN ORTALAMASINI ÇEK
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const saticiEmail = searchParams.get("satici");

    if (!saticiEmail) return NextResponse.json({ error: "Satıcı sinyali eksik!" }, { status: 400 });

    const yorumlar = await Yorum.find({ saticiEmail: saticiEmail.toLowerCase() }).sort({ createdAt: -1 });

    const ortalama = yorumlar.length > 0 
      ? (yorumlar.reduce((acc, y) => acc + y.puan, 0) / yorumlar.length).toFixed(1) 
      : 0;

    return NextResponse.json({ 
      yorumlar, 
      ortalama: Number(ortalama), 
      toplamYorum: yorumlar.length 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Siber yorum ağına ulaşılamadı." }, { status: 500 });
  }
}

// 🚀 POST: YENİ YORUM VE PUAN MÜHÜRLE
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Siber ağa giriş yapmalısınız!" }, { status: 401 });
    }

    const gonderenEmail = session.user.email.toLowerCase();
    const data = await req.json();

    // 🚨 SİBER ZIRH: Eğer e-posta boş gelirse çökmeyi (toLowerCase hatasını) engellemek için varsayılan ata
    const saticiEmail = data.saticiEmail ? data.saticiEmail.toLowerCase() : "sistem@atakasa.com";

    // ZIRH 1: Kendi kendine puan veremez
    if (gonderenEmail === saticiEmail) {
      return NextResponse.json({ error: "Kendi kendinize puan veremezsiniz!" }, { status: 400 });
    }

    // ZIRH 2: Spam Koruması (Aynı takas/ilan için sadece 1 yorum yapılabilir)
    const oncekiYorum = await Yorum.findOne({ gonderenEmail, ilanId: data.ilanId });
    if (oncekiYorum) {
      return NextResponse.json({ error: "Bu işlem için zaten değerlendirme yaptınız!" }, { status: 400 });
    }

    const yeniYorum = await Yorum.create({
      gonderenEmail,
      gonderenAd: session.user.name || session.user.email.split("@")[0], 
      saticiEmail: saticiEmail,
      ilanId: data.ilanId,
      puan: Number(data.puan),
      icerik: String(data.icerik).substring(0, 500)
    });

    return NextResponse.json({ message: "Yıldızlar ve yorum başarıyla mühürlendi!", yorum: yeniYorum }, { status: 201 });

  } catch (error) {
    console.error("Yorum Hatası:", error);
    return NextResponse.json({ error: "Yorum motoru çöktü." }, { status: 500 });
  }
}
