import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }

    // 1. Senin Orijinal Veritabanı Bağlantın
    const db = await connectMongoDB();
    
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Bu e-posta sistemde bulunamadı." }, { status: 404 });
    }

    // Eski şifre sıfırlama taleplerini temizle
    await db.collection("password_resets").deleteMany({ email });

    // 2. Senin Orijinal Jeton (Token) Motorun
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 saat

    await db.collection("password_resets").insertOne({
      email,
      token,
      expires,
    });

    // 🛡️ 3. SİBER KALKAN: "undefined" hatasını tamamen yok eden zırh!
    const siteAdresi = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://atakasa.com";
    const resetUrl = `${siteAdresi}/sifre-yenile?token=${token}&email=${encodeURIComponent(email)}`;

    // 4. Senin Orijinal Siber Postacı (SMTP) Ayarların
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.SMTP_USER, // Senin sistemindeki orijinal isim
        pass: process.env.SMTP_PASS, // Senin sistemindeki orijinal isim
      },
    });

    // 5. Şık ve Siber E-Posta Şablonu
    const mailOptions = {
      from: `"A-TAKASA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "⚡ A-TAKASA Güvenlik Ağı - Şifre Sıfırlama Protokolü",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #00f260; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #00f260; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">A-Takasa Siber Güvenlik</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">Siber ağımıza yeniden katılmak için bir şifre sıfırlama talebinde bulundunuz. İşlemi tamamlamak için aşağıdaki butona tıklayın:</p>
          
          <a href="${resetUrl}" style="background-color: #00f260; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: 900; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">🔑 Şifremi Yenile</a>
          
          <p style="color: #ef4444; font-size: 11px; margin-top: 30px;">Uyarı: Bu talebi siz yapmadıysanız, bu mesajı derhal imha edin. Güvenliğiniz için bu bağlantı 1 saat içinde kendini yok edecektir.</p>
        </div>
      `,
    };

    // Ateşle!
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Siber sinyal e-posta kutunuza fırlatıldı!" }, { status: 200 });

  } catch (error) {
    console.error("Siber Posta Hatası:", error);
    return NextResponse.json({ message: "Siber ağda bir hata oluştu, lütfen tekrar deneyin." }, { status: 500 });
  }
}
