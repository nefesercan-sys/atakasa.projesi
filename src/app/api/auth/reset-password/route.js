import nodemailer from 'nodemailer';
import crypto from 'crypto'; // Token üretmek için
// Kendi User modelini ve veritabanı bağlantını buraya ekle

export async function POST(req) {
  const { email } = await req.json();

  // 1. Kullanıcıyı DB'de bul
  // 2. Benzersiz bir token oluştur (Örn: crypto.randomBytes(32).toString('hex'))
  // 3. Token'ı ve son kullanma tarihini (expiry) veritabanında bu kullanıcıya kaydet

  // 4. E-posta Gönderim Ayarları
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Veya kullandığın servis
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `https://www.atakasa.com/sifre-sifirla?token=${token}`;

  const mailOptions = {
    from: '"A-TAKASA Güvenlik" <no-reply@atakasa.com>',
    to: email,
    subject: 'Şifre Sıfırlama Talebi',
    html: `
      <h1>Şifrenizi mi unuttunuz?</h1>
      <p>A-TAKASA hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
      <a href="${resetUrl}" style="background-color: #00ff00; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
      <p>Bu bağlantı 1 saat boyunca geçerlidir.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return Response.json({ message: "Sıfırlama bağlantısı gönderildi." });
  } catch (error) {
    return Response.json({ error: "E-posta gönderilemedi." }, { status: 500 });
  }
}
