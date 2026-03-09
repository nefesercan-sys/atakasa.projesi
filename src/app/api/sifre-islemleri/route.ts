import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer"; // 🚀 E-POSTA MOTORU EKLENDİ

export const dynamic = "force-dynamic";

// 📩 POST: SİFRE SIFIRLAMA SİNYALİ ÜRET VE MAİL AT
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Siber ağda bu ajan bulunamadı." }, { status: 404 });
    }

    // Güvenlik kilidi (Token) üret (Senin orijinal kodun)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenSuresi = Date.now() + 3600000; // 1 saat geçerli

    // Mongoose şemasını atlamadan doğrudan veritabanına yazıyoruz
    await User.collection.updateOne(
      { _id: user._id },
      { $set: { resetToken: resetToken, resetTokenExpiry: tokenSuresi } }
    );

    // Kullanıcının mailde tıklayacağı gerçek link
    const baseUrl = process.env.NEXTAUTH_URL || "https://atakasa.com";
    const resetLink = `${baseUrl}/sifre-yenile?token=${resetToken}`;

    // 🚀 MAİL GÖNDERME MOTORU ATEŞLENİYOR
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Vercel'deki mail adresin
        pass: process.env.EMAIL_PASS, // Vercel'deki Gmail Uygulama Şifren
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email, // Kullanıcının sistemdeki adresi
      subject: "A-TAKASA | Siber Ağ Şifre Sıfırlama Talebi",
      html: `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; text-align: center;">
          <h1 style="color: #00f260; font-style: italic; letter-spacing: 2px;">A-TAKASA.</h1>
          <p style="color: #ccc; margin-bottom: 30px;">Şifrenizi sıfırlamak için bir talep aldık. Aşağıdaki butona tıklayarak yeni şifrenizi mühürleyebilirsiniz.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #00f260; color: black; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 10px; margin-top: 20px;">ŞİFREYİ YENİLE</a>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz. Siber bağlantı 1 saat içinde kendi kendini imha edecektir.</p>
        </div>
      `,
    });

    // Artık linki ekrana yansıtmıyoruz, mail olarak gitti!
    return NextResponse.json({
      message: "Siber kurtarma sinyali e-posta adresinize fırlatıldı! ⚡"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Mail gönderme hatası:", error);
    return NextResponse.json({ error: "Sinyal koptu, mail gönderilemedi." }, { status: 500 });
  }
}

// 🔐 PUT: YENİ ŞİFREYİ MÜHÜRLE (Senin orijinal kodun - Dokunulmadı)
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { token, yeniSifre } = await req.json();

    if (!token || !yeniSifre) {
      return NextResponse.json({ error: "Eksik sinyal." }, { status: 400 });
    }

    // Token eşleşmesi ve süre kontrolü
    const user = await User.collection.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: "Kurtarma sinyalinin süresi dolmuş veya geçersiz!" }, { status: 400 });
    }

    // Şifreyi şifrele (Hash)
    const hashedPassword = await bcrypt.hash(yeniSifre, 10);

    // Yeni şifreyi kaydet ve eski tokenları imha et
    await User.collection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    return NextResponse.json({ message: "⚡ YENİ ŞİFRE BAŞARIYLA MÜHÜRLENDİ!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Mühürleme başarısız." }, { status: 500 });
  }
}
