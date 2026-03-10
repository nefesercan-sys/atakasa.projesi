import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "../../../lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { token, email, yeniSifre } = await req.json();

    if (!token || !email || !yeniSifre) {
      return NextResponse.json({ message: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    if (yeniSifre.length < 6) {
      return NextResponse.json({ message: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    // 🛡️ AKILLI VERİTABANI BAĞLANTISI (Hatayı Çözen Ana Zırh)
    const conn = (await connectMongoDB()) as any;
    let db;

    if (conn && typeof conn.db === 'function') {
      db = conn.db();
    } else if (conn && conn.connection) {
      db = conn.connection;
    } else {
      db = conn;
    }
    
    // 🛡️ SİBER ZIRH 1: Büyük/Küçük Harf Uyumsuzluğunu Yok Et
    const guvenliEmail = email.toLowerCase();

    // Veritabanında e-postayı ararken büyük/küçük harf duyarlılığını kaldırıyoruz (RegExp)
    const resetRecord = await db
      .collection("password_resets")
      .findOne({ email: new RegExp(`^${guvenliEmail}$`, "i"), token });

    if (!resetRecord) {
      return NextResponse.json({ message: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 400 });
    }

    if (new Date() > new Date(resetRecord.expires)) {
      await db.collection("password_resets").deleteOne({ token });
      return NextResponse.json({ message: "Bağlantı süresi dolmuş. Lütfen tekrar isteyin." }, { status: 400 });
    }

    // 🛡️ SİBER ZIRH 2: NextAuth ile en uyumlu olan 10 Round Şifreleme kullanıyoruz
    const hashedPassword = await bcrypt.hash(yeniSifre, 10);

    // 🎯 SİBER ZIRH 3: ÇİFT NAMLULU GÜNCELLEME!
    // NextAuth giriş yaparken 'password' mü arıyor 'sifre' mi arıyor riske atmıyoruz. İkisini de mühürlüyoruz!
    await db.collection("users").updateOne(
      { email: new RegExp(`^${guvenliEmail}$`, "i") },
      { 
        $set: { 
          password: hashedPassword, 
          sifre: hashedPassword, 
          updatedAt: new Date() 
        } 
      }
    );

    // İşlem bittikten sonra tek kullanımlık jetonu (token) imha et
    await db.collection("password_resets").deleteOne({ token });

    return NextResponse.json({ message: "Şifreniz siber kasaya kilitlendi. Başarıyla giriş yapabilirsiniz." });
    
  } catch (error) {
    console.error("Siber Şifreleme Hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
