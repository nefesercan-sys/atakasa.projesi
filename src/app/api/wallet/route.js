import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 💰 CÜZDAN ŞEMASI (Kullanıcıların bakiyelerini tutan siber kasa)
const WalletSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

// 🔍 GET: Panel açıldığında kullanıcının mevcut bakiyesini getirir
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Oturum yok" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    
    // Kullanıcının cüzdanı var mı bak, yoksa 0 TL ile yeni cüzdan oluştur
    let cuzdan = await Wallet.findOne({ email });
    if (!cuzdan) {
      cuzdan = await Wallet.create({ email, balance: 0 });
    }

    return NextResponse.json({ balance: cuzdan.balance }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Siber kasa bağlantısı koptu" }, { status: 500 });
  }
}

// 🚀 POST: Bakiye Yükleme (Hacklenemez Race Condition Zırhı ile)
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession();

    if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz işlem!" }, { status: 401 });

    const email = session.user.email.toLowerCase();
    const data = await req.json();
    const miktar = Number(data.miktar);
    
    // 🛡️ ZIRH 1: Limitör (Eksi bakiye, harf girme veya tek seferde 100.000 TL üstü yükleme engeli)
    if (!miktar || isNaN(miktar) || miktar <= 0 || miktar > 100000) {
      return NextResponse.json({ error: "Şüpheli işlem tespit edildi!" }, { status: 400 });
    }

    // 🛡️ ZIRH 2: MongoDB $inc (Saniyede 100 kez tıklansa bile matematiği şaşırtmayan atomik toplama)
    const guncelCuzdan = await Wallet.findOneAndUpdate(
      { email },
      { $inc: { balance: miktar } }, 
      { new: true, upsert: true }    
    );

    return NextResponse.json({ message: "Bakiye mühürlendi", balance: guncelCuzdan.balance }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Yükleme reddedildi." }, { status: 500 });
  }
}
