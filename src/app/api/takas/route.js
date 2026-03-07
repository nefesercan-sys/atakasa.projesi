import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB SİBER BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 💰 CÜZDAN ŞEMASINI ÇAĞIR (İade işlemleri için gerekli)
const WalletSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });
const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

// 🔄 TAKAS ŞEMASI (Borsa, Escrow ve Komisyon Korumalı)
const TakasSchema = new mongoose.Schema({
  gonderenEmail: { type: String, required: true }, 
  aliciEmail: { type: String, required: true },    
  hedefIlanId: { type: String, required: true },   
  hedefIlanBaslik: { type: String, required: true },
  hedefIlanFiyat: { type: Number, required: true, default: 0 }, 
  teklifEdilenIlanId: { type: String, required: true }, 
  teklifEdilenIlanBaslik: { type: String, required: true },
  eklenenNakit: { type: Number, default: 0, min: 0 }, 
  
  durum: { 
    type: String, 
    default: "bekliyor", 
    enum: [
      "bekliyor", "kabul", "red", "teminat_odendi", 
      "kargoda", "teslim_edildi", "iptal_istendi", "iptal_onaylandi"
    ] 
  },
  
  gonderenTeminatOdediMi: { type: Boolean, default: false },
  aliciTeminatOdediMi: { type: Boolean, default: false },
  kesilenKomisyonTutari: { type: Number, default: 0 },
  komisyonKesildiMi: { type: Boolean, default: false } // Çift iadeyi (Hack) önleyen siber kilit!

}, { timestamps: true });

const Takas = mongoose.models.Takas || mongoose.model("Takas", TakasSchema);

// 🔍 GET: Panel için teklifleri çeker
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum yok!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const teklifler = await Takas.find({ $or: [{ gonderenEmail: email }, { aliciEmail: email }] }).sort({ createdAt: -1 });
    return NextResponse.json(teklifler, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Veritabanı bağlantısı koptu." }, { status: 500 });
  }
}

// 🚀 POST: Yeni teklifi veritabanına yazar
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum açmalısınız!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const data = await req.json();

    const karsiHedefEmail = data.aliciEmail ? data.aliciEmail.toLowerCase() : "bilinmeyen@satici.com";
    if (email === karsiHedefEmail) return NextResponse.json({ error: "Kendinize takas teklif edemezsiniz!" }, { status: 400 });

    const yeniTakas = await Takas.create({
      gonderenEmail: email,
      aliciEmail: karsiHedefEmail,
      hedefIlanId: data.hedefIlanId,
      hedefIlanBaslik: data.hedefIlanBaslik,
      hedefIlanFiyat: Number(data.hedefIlanFiyat) || 0,
      teklifEdilenIlanId: data.teklifEdilenIlanId,
      teklifEdilenIlanBaslik: data.teklifEdilenIlanBaslik,
      eklenenNakit: Math.abs(Number(data.eklenenNakit)) || 0,
      durum: "bekliyor"
    });

    return NextResponse.json({ message: "Teklif mühürlendi!", takas: yeniTakas }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Veri eksik veya hatalı." }, { status: 500 });
  }
}

// 🛡️ PUT: DURUM GÜNCELLEME VE FİNAL KOMİSYON MOTORU
export async function PUT(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz Erişim!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const { takasId, yeniDurum } = await req.json();

    const takas = await Takas.findById(takasId);
    if (!takas) return NextResponse.json({ error: "Varlık bulunamadı." }, { status: 404 });

    if (takas.aliciEmail !== email && takas.gonderenEmail !== email) {
      return NextResponse.json({ error: "Siber İhlal!" }, { status: 403 });
    }

    const gecerliDurumlar = ["bekliyor", "kabul", "red", "teminat_odendi", "kargoda", "teslim_edildi", "iptal_istendi", "iptal_onaylandi"];
    if (!gecerliDurumlar.includes(yeniDurum)) return NextResponse.json({ error: "Geçersiz sinyal!" }, { status: 400 });

    // 💸 💸 💸 SİBER TAHSİLAT VE İADE MOTORU 💸 💸 💸
    // Eğer işlem başarıyla bittiyse VEYA iptal edildiyse:
    if ((yeniDurum === "teslim_edildi" || yeniDurum === "iptal_onaylandi") && !takas.komisyonKesildiMi) {
      
      // Teminat Bedeli (Sisteme girerken kilitlenen para)
      const depozitoBedeli = takas.hedefIlanFiyat > 0 ? takas.hedefIlanFiyat : 1000;
      
      // %1 A-Takasa Komisyonu Hesaplama
      const komisyon = depozitoBedeli * 0.01; 
      
      // Kullanıcının cüzdanına yatacak net tutar (Depozito - Komisyon)
      const iadeTutar = depozitoBedeli - komisyon; 

      // 1. Gönderen Teminat Yatırdıysa İadesini Yap (%1 keserek)
      if (takas.gonderenTeminatOdediMi) {
        await Wallet.findOneAndUpdate(
          { email: takas.gonderenEmail }, 
          { $inc: { balance: iadeTutar } },
          { upsert: true }
        );
      }

      // 2. Alıcı Teminat Yatırdıysa İadesini Yap (%1 keserek)
      if (takas.aliciTeminatOdediMi) {
        await Wallet.findOneAndUpdate(
          { email: takas.aliciEmail }, 
          { $inc: { balance: iadeTutar } },
          { upsert: true }
        );
      }

      // Mühürle: Sisteme A-Takasa'nın kazandığı toplam parayı yaz ve işlemi kilitle!
      takas.kesilenKomisyonTutari = komisyon * 2; // İki taraftan da %1 kesildi
      takas.komisyonKesildiMi = true; // Bu kilit, sisteme aynı anda 2 kere basıp 2 kere para iadesi almayı engeller!
    }

    // Durumu Güncelle ve Kaydet
    takas.durum = yeniDurum;
    await takas.save();

    return NextResponse.json({ message: "İşlem tamamlandı, havuz hesapları güncellendi!" }, { status: 200 });
  } catch (error) {
    console.error("PUT Hatası:", error);
    return NextResponse.json({ error: "Siber tahsilat motoru çöktü." }, { status: 500 });
  }
}
