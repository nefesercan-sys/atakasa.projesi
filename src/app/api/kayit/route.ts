import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    // Veritabanına bağlan
    await connectMongoDB();
    
    // Bu mail daha önce alınmış mı kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "SİBER HATA: Bu e-posta ağda zaten mevcut." }, { status: 400 });
    }
    
    // Şifreyi siber kriptolama ile şifrele (Hacklenemez yap)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcıyı yarat ve veritabanına mühürle
    await User.create({ name, email, password: hashedPassword });
    
    return NextResponse.json({ message: "Siber kimlik başarıyla oluşturuldu." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Sistem Hatası: Kayıt yapılamadı." }, { status: 500 });
  }
}
