import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 🔄 SİBER TAKAS ŞEMASI (Strict Mode)
const TakasSchema = new mongoose.Schema({
  gonderenEmail: { type: String, required: true }, // Teklifi yapan
  aliciEmail: { type: String, required: true },    // İlanın asıl sahibi
  hedefIlanId: { type: String, required: true },   // İstenen ürünün ID'si
  hedefIlanBaslik: { type: String, required: true },
  teklifEdilenIlanId: { type: String, required: true }, // Verilen ürünün ID'si
  teklifEdilenIlanBaslik: { type: String, required: true },
  eklenenNakit: { type: Number, default: 0, min: 0 }, // Üstüne verilecek para (Varsa)
  durum: { type: String, default: "bekliyor", enum: ["bekliyor", "kabul", "red", "iptal"] }
}, { timestamps: true });

const Takas = mongoose.models.Takas || mongoose.model("Takas", TakasSchema);

// 🔍 GET: TAKAS TEKLİFLERİNİ ÇEK (Sadece kendi tekliflerini/gelenleri görebilir)
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Siber İhlal!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    
    // Bana gelenler veya benim gönderdiklerim
    const teklifler = await Takas.find({
      $or: [{ gonderenEmail: email }, { aliciEmail: email }]
    }).sort({ createdAt: -1 });

    return NextResponse.json(teklifler, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Takas ağına ulaşılamadı." }, { status: 500 });
  }
}

// 🚀 POST: YENİ TAKAS TEKLİFİ GÖNDER
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum açmalısınız!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const data = await req.json();

    // Kendi ilanına takas teklif edemez!
    if (email === data.aliciEmail.toLowerCase()) {
      return NextResponse.json({ error: "Kendi ürününüze takas teklif edemezsiniz!" }, { status: 400 });
    }

    const yeniTakas = await Takas.create({
      gonderenEmail: email,
      aliciEmail: data.aliciEmail,
      hedefIlanId: data.hedefIlanId,
      hedefIlanBaslik: data.hedefIlanBaslik,
      teklifEdilenIlanId: data.teklifEdilenIlanId,
      teklifEdilenIlanBaslik: data.teklifEdilenIlanBaslik,
      eklenenNakit: Math.abs(Number(data.eklenenNakit)) || 0,
      durum: "bekliyor"
    });

    return NextResponse.json({ message: "Siber Teklif Gönderildi!", takas: yeniTakas }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Teklif iletilemedi." }, { status: 500 });
  }
}

// 🔄 PUT: TEKLİFİ KABUL ET VEYA REDDET
export async function PUT(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const { takasId, yeniDurum } = await req.json();

    const takas = await Takas.findById(takasId);
    if (!takas) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });

    // Sadece ilanın sahibi (alıcı) teklifi Kabul/Red edebilir
    if (takas.aliciEmail !== email && takas.gonderenEmail !== email) {
      return NextResponse.json({ error: "Bu teklife müdahale edemezsiniz." }, { status: 403 });
    }

    takas.durum = yeniDurum;
    await takas.save();

    return NextResponse.json({ message: `Teklif ${yeniDurum} olarak işaretlendi.` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Durum güncellenemedi." }, { status: 500 });
  }
}
