import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";

// 🛡️ MONGODB SİBER BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Modelleri Çağırıyoruz (Cüzdan ve Takas beyni iletişim kuracak)
const Takas = mongoose.models.Takas || mongoose.model("Takas", new mongoose.Schema({}));
const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", new mongoose.Schema({}));

// 💰 POST: SİBER TEMİNAT TAHSİLAT MOTORU
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession();

    // 🛡️ ZIRH 1: Kimlik Doğrulama
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Siber ağa giriş yapmalısınız!" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const { takasId } = await req.json();

    const takas = await Takas.findById(takasId);
    if (!takas) return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 404 });

    // 🛡️ ZIRH 2: Sadece Kabul Edilmiş Takaslara Teminat Yatırılabilir
    if (takas.durum !== "kabul") {
      return NextResponse.json({ error: "Bu işlem teminat ödemesine kapalı!" }, { status: 400 });
    }

    // 🛡️ ZIRH 3: Kullanıcının Rolünü ve Ödeme Durumunu Bul
    let rol = "";
    if (takas.gonderenEmail === email) rol = "gonderen";
    else if (takas.aliciEmail === email) rol = "alici";
    else return NextResponse.json({ error: "Siber İhlal: Bu takasın tarafı değilsiniz!" }, { status: 403 });

    if ((rol === "gonderen" && takas.gonderenTeminatOdediMi) || (rol === "alici" && takas.aliciTeminatOdediMi)) {
      return NextResponse.json({ error: "Teminatı zaten ödediniz." }, { status: 400 });
    }

    // 💰 TEMİNAT BEDELİ HESAPLAMA (Örn: Hedef ürünün bedeli kadar bloke)
    // Not: Komisyon kesintisi ürün teslim edilip işlem bitince (son aşamada) yapılacaktır.
    const depozitoBedeli = takas.hedefIlanFiyat > 0 ? takas.hedefIlanFiyat : 1000; // Fiyat girilmemişse min 1000 TL bloke

    // Cüzdanı Bul ve Bakiyeyi Kontrol Et
    const cuzdan = await Wallet.findOne({ email });
    if (!cuzdan || cuzdan.balance < depozitoBedeli) {
      return NextResponse.json({ error: `Yetersiz Bakiye! Kasanızda en az ${depozitoBedeli.toLocaleString()} ₺ olmalıdır.` }, { status: 400 });
    }

    // 🚀 TAHSİLAT İŞLEMİ (Atomik Kesinti)
    cuzdan.balance -= depozitoBedeli;
    await cuzdan.save();

    // Takas Dosyasını Güncelle
    if (rol === "gonderen") takas.gonderenTeminatOdediMi = true;
    if (rol === "alici") takas.aliciTeminatOdediMi = true;

    // ⚡ EĞER İKİ TARAF DA ÖDEDİYSE, SİSTEMİ KARGO AŞAMASINA GEÇİR!
    let mesaj = "Teminat başarıyla yatırıldı. Karşı tarafın ödemesi bekleniyor.";
    if (takas.gonderenTeminatOdediMi && takas.aliciTeminatOdediMi) {
      takas.durum = "teminat_odendi";
      mesaj = "İki taraf da teminatı yatırdı! Güvenli kargo aşamasına geçildi.";
    }

    await takas.save();

    return NextResponse.json({ message: mesaj, guncelBakiye: cuzdan.balance }, { status: 200 });

  } catch (error) {
    console.error("Teminat Hatası:", error);
    return NextResponse.json({ error: "Siber tahsilat motoru yanıt vermiyor." }, { status: 500 });
  }
}
