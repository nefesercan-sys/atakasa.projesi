import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";
import User from "../../../models/User";

export const revalidate = 5;

const requestCounts = new Map<string, number[]>();

const checkRateLimit = (req: Request, limit: number, windowMs: number) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
  const currentTime = Date.now();
  if (!requestCounts.has(ip)) { requestCounts.set(ip, [currentTime]); return true; }
  const userRequests = requestCounts.get(ip) || [];
  const recentRequests = userRequests.filter(time => currentTime - time < windowMs);
  recentRequests.push(currentTime);
  requestCounts.set(ip, recentRequests);
  return recentRequests.length <= limit;
};

const siberTemizleyici = (veri: any): any => {
  if (veri instanceof Object) {
    for (const key in veri) {
      if (/^\$/.test(key)) delete veri[key];
      else siberTemizleyici(veri[key]);
    }
  }
  return veri;
};

export async function GET(req: Request) {
  if (!checkRateLimit(req, 150, 60000)) {
    return NextResponse.json({ error: "Sisteme aşırı yüklenmeyin." }, { status: 429 });
  }

  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    let query: any = {};

    if (id) {
      query._id = id;
    } else {
      const sektor = searchParams.get("sektor");
      if (sektor) query.kategori = siberTemizleyici(sektor);
    }

    const ilanlar = await Varlik.find(query)
      .sort({ createdAt: -1 })
      .limit(id ? 1 : 100)
      .lean();

    // ✅ TypeScript uyumlu unique ID listesi
    const saticiIdleriSet = new Set<string>();
    ilanlar.forEach((i: any) => {
      if (i.satici) saticiIdleriSet.add(i.satici.toString());
    });
    const saticiIdleri = Array.from(saticiIdleriSet);

    const saticilar = await User.find({ _id: { $in: saticiIdleri } })
      .select("_id email name")
      .lean();

    const saticiMap = new Map<string, any>();
    saticilar.forEach((s: any) => {
      saticiMap.set(s._id.toString(), s);
    });

    const borsaVeriliIlanlar = ilanlar.map((ilan: any) => {
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat > 0 && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }
      const saticiObj = saticiMap.get(ilan.satici?.toString());
      return {
        ...ilan,
        _id: ilan._id.toString(),
        satici: {
          _id: ilan.satici?.toString() || "",
          email: saticiObj?.email || "",
          name: saticiObj?.name || "",
        },
        saticiEmail: saticiObj?.email || "",
        sellerEmail: saticiObj?.email || "",
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(1)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });

    return NextResponse.json(borsaVeriliIlanlar, { status: 200 });

  } catch (error) {
    console.error("Turbo Motor Hatası:", error);
    return NextResponse.json({ message: "Sinyal kesildi." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!checkRateLimit(req, 20, 60000)) {
    return NextResponse.json({ error: "Çok fazla işlem denemesi." }, { status: 429 });
  }

  try {
    await connectMongoDB();
    const data = siberTemizleyici(await req.json());

    if (!data.id) return NextResponse.json({ error: "Kimlik eksik." }, { status: 400 });

    const mevcutVarlik = await Varlik.findById(data.id);
    if (!mevcutVarlik) return NextResponse.json({ error: "Varlık bulunamadı." }, { status: 404 });

    if (data.fiyat && Number(data.fiyat) !== mevcutVarlik.fiyat) {
      mevcutVarlik.eskiFiyat = mevcutVarlik.fiyat;
      mevcutVarlik.fiyat = Number(data.fiyat);
      mevcutVarlik.fiyatGuncellemeTarihi = new Date();
    }

    const guvenliAlanlar = ["baslik", "title", "aciklama", "description", "kategori", "sehir", "resimler", "images"];
    guvenliAlanlar.forEach((alan) => {
      if (data[alan] !== undefined) mevcutVarlik[alan] = data[alan];
    });

    await mevcutVarlik.save();
    return NextResponse.json({ message: "Güncellendi." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
