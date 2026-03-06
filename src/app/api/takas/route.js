import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB SİBER BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 🔄 TAKAS ŞEMASI (Verilerin şablonu)
const TakasSchema = new mongoose.Schema({
  gonderenEmail: { type: String, required: true }, 
  aliciEmail: { type: String, required: true },    
  hedefIlanId: { type: String, required: true },   
  hedefIlanBaslik: { type: String, required: true },
  teklifEdilenIlanId: { type: String, required: true }, 
  teklifEdilenIlanBaslik: { type: String, required: true },
  eklenenNakit: { type: Number, default: 0, min: 0 }, 
  durum: { type: String, default: "bekliyor", enum: ["bekliyor", "kabul", "red", "iptal"] }
}, { timestamps: true });

const Takas = mongoose.models.Takas || mongoose.model("Takas", TakasSchema);

// 🔍 GET: Panel için teklifleri veritabanından çeker
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum yok!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    
    const teklifler = await Takas.find({
      $or: [{ gonderenEmail: email }, { aliciEmail: email }]
    }).sort({ createdAt: -1 });

    return NextResponse.json(teklifler, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veritabanı bağlantısı koptu." }, { status: 500 });
  }
}

// 🚀 POST: Yeni teklifi veritabanına yazar (ÇÖKMEYEN ZIRHLI VERSİYON)
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum açmalısınız!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const data = await req.json();

    // 🚨 KRİTİK ZIRH: Eğer hedefin e-postası boş gelirse (eski ilan vs), sistemi çökertme, güvenliğe al!
    const karsiHedefEmail = data.aliciEmail ? data.aliciEmail.toLowerCase() : "bilinmeyen@satici.com";

    // Kendi kendine teklif etme engeli
    if (email === karsiHedefEmail) {
      return NextResponse.json({ error: "Kendi ürününüze takas teklif edemezsiniz!" }, { status: 400 });
    }

    const yeniTakas = await Takas.create({
      gonderenEmail: email,
      aliciEmail: karsiHedefEmail,
      hedefIlanId: data.hedefIlanId,
      hedefIlanBaslik: data.hedefIlanBaslik,
      teklifEdilenIlanId: data.teklifEdilenIlanId,
      teklifEdilenIlanBaslik: data.teklifEdilenIlanBaslik,
      eklenenNakit: Math.abs(Number(data.eklenenNakit)) || 0,
      durum: "bekliyor"
    });

    return NextResponse.json({ message: "Teklif mühürlendi!", takas: yeniTakas }, { status: 201 });
  } catch (error) {
    console.error("Takas POST hatası:", error);
    return NextResponse.json({ error: "Veri eksik veya hatalı." }, { status: 500 });
  }
}

// 🔄 PUT: Teklifi Kabul Et veya Reddet
export async function PUT(req) {
  try {
    await connectDB();
    const { takasId, yeniDurum } = await req.json();

    const takas = await Takas.findById(takasId);
    if (!takas) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

    takas.durum = yeniDurum;
    await takas.save();

    return NextResponse.json({ message: "Durum güncellendi." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
