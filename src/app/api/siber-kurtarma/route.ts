import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();
    
    const masterEmail = "nefesercan@gmail.com";
    const yeniSifre = "Komutan123!";
    
    // Şifreyi siber ağ standartlarında (bcrypt) kriptola
    const hashedPassword = await bcrypt.hash(yeniSifre, 10);
    
    // Veritabanında seni bul ve şifreni zorla değiştir
    let user = await User.findOne({ email: masterEmail });
    
    if (!user) {
      // Eğer sistemde tamamen yoksan, seni Master yetkisiyle baştan yaratıyoruz
      await User.create({ 
        email: masterEmail, 
        password: hashedPassword, 
        rol: "MASTER", 
        durum: "aktif" 
      });
      return NextResponse.json({ message: "🔥 SİBER HESAP SIFIRDAN YARATILDI! Şifre: Komutan123!" });
    }

    // Hesabın varsa sadece şifreyi güncelle
    user.password = hashedPassword;
    user.rol = "MASTER"; // Rolünü garanti altına alalım
    user.durum = "aktif";
    await user.save();

    return NextResponse.json({ message: "⚡ KİLİT KIRILDI KOMUTAN! Yeni Şifreniz: Komutan123!" });

  } catch (error) {
    console.error("Kurtarma Hatası:", error);
    return NextResponse.json({ error: "Sinyal koptu, kilit kırılamadı!" }, { status: 500 });
  }
}
