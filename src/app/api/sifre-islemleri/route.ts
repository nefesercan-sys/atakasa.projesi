import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb"; 
import User from "../../../models/User"; 
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    // 1. Veritabanına Siber Bağlantı Kur
    await connectMongoDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "E-posta adresi eksik." }, { status: 400 });
    }

    // 2. Kullanıcıyı Radarda Bul
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Bu e-posta sistemde bulunamadı." }, { status: 404 });
    }

    // 3. Eşsiz Siber Jeton (Token) Oluştur
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // 4. Jetonu Kullanıcı Verisine Mühürle (1 Saat Ömrü Var)
    user.forgotPasswordToken = token;
    user.forgotPasswordTokenExpiry = Date.now() + 3600000; 
    await user.save();

    // 🛡️ SİBER KALKAN: "undefined" hatasını tamamen yok eden zırh!
    // Vercel'den NEXTAUTH_URL bulamazsa, public url'ye bakar, onu da bulamazsa direkt atakasa.com'a yönlendirir.
    const siteAdresi = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://atakasa.com";
    
    // Kusursuz Sıfırlama Linki:
    const resetUrl = `${siteAdresi}/sifre-yenile?token=${token}&email=${encodeURIComponent(email)}`;

    // 5. Siber Postacı (Nodemailer) Motoru
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER, // Vercel'deki e-posta adresin
        pass: process.env.EMAIL_PASS, // Vercel'deki e-posta uygulama şifren
      },
    });

    // 6. Şık ve Siber E-Posta Şablonu
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    // 7. Ateşle!
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Siber sinyal e-posta kutunuza fırlatıldı!" }, { status: 200 });

  } catch (error) {
    console.error("Siber Posta Hatası:", error);
    return NextResponse.json({ message: "Sistem yanıt vermiyor, lütfen tekrar deneyin." }, { status: 500 });
  }
}
