// 📩 POST: ŞİFRE SIFIRLAMA SİNYALİ ÜRET VE GÜVENLİ MAİL AT
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { email } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Siber ağda bu ajan bulunamadı." }, { status: 404 });
    }

    // Güvenlik Jetonu (Token) üretimi
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenSuresi = Date.now() + 3600000; // 1 saat geçerli

    // Jetonu veritabanına mühürle
    await User.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: resetToken, resetPasswordExpire: tokenSuresi } }
    );

    const baseUrl = process.env.NEXTAUTH_URL || "https://atakasa.com";
    const resetLink = `${baseUrl}/sifre-yenile?token=${resetToken}`;

    // 🚀 NODEMAILER ATEŞLENİYOR (Simülasyon Bitti, Gerçek Operasyon Başladı)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, // Gmail Uygulama Şifresi
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "A-TAKASA | Şifre Sıfırlama Bağlantısı",
      html: `
        <div style="background-color: #050505; color: white; padding: 40px; text-align: center; font-family: sans-serif;">
          <h1 style="color: #00f260;">A-TAKASA.</h1>
          <p>Şifrenizi sıfırlamak için güvenli bir sinyal aldık.</p>
          <a href="${resetLink}" style="background: #00f260; color: black; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">ŞİFREYİ YENİLE</a>
          <p style="color: #666; font-size: 11px; margin-top: 30px;">Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
      `
    });

    return NextResponse.json({ 
      message: "Kurtarma sinyali mail adresinize gönderildi! ⚡" 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Sinyal gönderilemedi." }, { status: 500 });
  }
}
