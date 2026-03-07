import { NextResponse } from "next/server";
// 🛰️ Siber Pusula: Projenin orijinal klasör yapısına göre yollar mühürlendi
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

export const dynamic = "force-dynamic"; // 📡 CANLI VERİ ZORUNLULUĞU

// 🛡️ SİBER KALKAN 1: Kaba Kuvvet (Brute Force) ve DDoS Radarı
const requestCounts = new Map<string, number[]>();

const checkRateLimit = (req: Request, limit: number, windowMs: number) => {
  // Güvenlik: Vercel gibi ortamlarda gerçek IP adresini yakalamak için x-forwarded-for kullanılır.
  const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
  const currentTime = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, [currentTime]);
    return true; // Sinyal Temiz
  }

  const userRequests = requestCounts.get(ip) || [];
  // Sadece belirtilen zaman dilimi (windowMs) içindeki istekleri tut
  const recentRequests = userRequests.filter(time => currentTime - time < windowMs);
  recentRequests.push(currentTime);
  requestCounts.set(ip, recentRequests);

  // Belirlenen limiti aştıysa engelle
  if (recentRequests.length > limit) {
    return false; // SİBER İHLAL: Sınır aşıldı!
  }
  return true; // Sinyal Temiz
};

// 🛡️ SİBER KALKAN 2: NoSQL Enjeksiyon Temizleyici Algoritma
// Dışarıdan gelen verilerdeki "$" ve "." gibi tehlikeli MongoDB operatörlerini yok eder.
const siberTemizleyici = (veri: any): any => {
  if (veri instanceof Object) {
    for (const key in veri) {
      if (/^\$/.test(key)) {
        delete veri[key]; // $ komutlarını imha et
      } else {
        siberTemizleyici(veri[key]);
      }
    }
  }
  return veri;
};

// 🔍 GET: GELİŞMİŞ BORSA VE FİLTRELEME MOTORU (ZIRHLANDI)
export async function GET(req: Request) {
  // ⚡ RADAR AKTİF: 1 Dakikada (60000ms) maksimum 100 istek atılabilir.
  if (!checkRateLimit(req, 100, 60000)) {
    console.warn("⚠️ SİBER SALDIRI ENGELLENDİ: Aşırı GET isteği!");
    return NextResponse.json({ error: "SİBER ENGEL: Çok fazla istek attınız. Sisteme aşırı yüklenmeyin, lütfen bekleyin." }, { status: 429 });
  }

  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);

    // 📡 Filtre Parametrelerini Yakala ve Temizle
    const sektor = siberTemizleyici(searchParams.get("sektor"));
    const kategori = siberTemizleyici(searchParams.get("kategori"));
    const sirala = siberTemizleyici(searchParams.get("sirala")); // ucuz, pahali, yeni, degisim

    // 🛡️ SORGULAMA RADARI
    let matchStage: any = { aktif: true };
    if (sektor) matchStage.kategori = sektor; 
    if (kategori) matchStage.kategori = kategori;

    // 📈 SIRALAMA ALGORİTMASI
    let sortStage: any = { createdAt: -1 };
    if (sirala === "ucuz") sortStage = { fiyat: 1 };
    if (sirala === "pahali") sortStage = { fiyat: -1 };
    if (sirala === "degisim") sortStage = { eskiFiyat: 1 }; // Düşüşte olanlar

    // 🌪️ AGGREGATION (BİRLEŞTİRME) İŞLEMİ
    const ilanlar = await Varlik.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users", // Veritabanındaki kullanıcılar tablosu
          localField: "satici",
          foreignField: "_id",
          as: "satici_bilgisi",
        },
      },
      { $sort: sortStage },
    ]);

    // 🧬 BORSA VERİSİNE DÖNÜŞTÜRME (Yüzdesel Değişim Analizi)
    const borsaVeriliIlanlar = ilanlar.map((ilan) => {
      // 📈 Fiyat Değişim Yüzdesi Hesaplama
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat > 0 && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }

      return {
        ...ilan,
        _id: ilan._id.toString(),
        satici: ilan.satici_bilgisi?.[0]?.email || ilan.satici,
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(1)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });

    return NextResponse.json(borsaVeriliIlanlar, { status: 200 });

  } catch (error) {
    console.error("Varlıklar Borsa Hatası:", error);
    return NextResponse.json({ message: "Sinyal kesildi." }, { status: 500 });
  }
}

// 🛡️ PUT: FİYAT GÜNCELLEME VE ESKİ FİYAT MÜHÜRLEME (ZIRHLANDI)
export async function PUT(req: Request) {
  // ⚡ RADAR AKTİF: 1 Dakikada (60000ms) maksimum 20 güncelleme (Spam engeli)
  if (!checkRateLimit(req, 20, 60000)) {
    console.warn("⚠️ SİBER SALDIRI ENGELLENDİ: Aşırı PUT (Güncelleme) isteği!");
    return NextResponse.json({ error: "SİBER ENGEL: Çok fazla işlem denemesi. Lütfen bekleyin." }, { status: 429 });
  }

  try {
    await connectMongoDB();
    const rawData = await req.json();
    
    // 1. ZIRH: Dışarıdan gelen tüm JSON verisini NoSQL enjeksiyonuna karşı temizle
    const data = siberTemizleyici(rawData);

    if (!data.id) return NextResponse.json({ error: "Siber İhlal: Varlık kimliği eksik." }, { status: 400 });

    const mevcutVarlik = await Varlik.findById(data.id);
    if (!mevcutVarlik) return NextResponse.json({ error: "Varlık bulunamadı." }, { status: 404 });

    // 💸 Fiyat Değişimi Tespit Edilirse Eski Fiyatı Arşive Al
    if (data.fiyat && Number(data.fiyat) !== mevcutVarlik.fiyat) {
      mevcutVarlik.eskiFiyat = mevcutVarlik.fiyat;
      mevcutVarlik.fiyat = Number(data.fiyat);
      mevcutVarlik.fiyatGuncellemeTarihi = new Date();
    }

    // 2. ZIRH: MASS ASSIGNMENT (Toplu Atama) KORUMASI
    // Sadece izin verilen güvenli alanların güncellenmesine izin verilir:
    const guvenliAlanlar = ["baslik", "title", "aciklama", "description", "kategori", "sehir", "resimler", "images"];
    
    guvenliAlanlar.forEach((alan) => {
      if (data[alan] !== undefined) {
        mevcutVarlik[alan] = data[alan];
      }
    });

    await mevcutVarlik.save();

    return NextResponse.json({ message: "Borsa verisi güvenli şekilde güncellendi." }, { status: 200 });

  } catch (error) {
    console.error("Güncelleme Hatası:", error);
    return NextResponse.json({ error: "İşlem başarısız oldu." }, { status: 500 });
  }
}
