import HomeClient from "@/components/HomeClient";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

function optimizeCloudinary(url: string, w = 520, h = 220): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_") || url.includes("/upload/q_")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},h_${h},c_fill/`);
}

function getFirstImage(ilanlar: any[]): string | null {
  if (!ilanlar.length) return null;
  const ilan = ilanlar[0];
  const arr = ilan.resimler;
  if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string") return arr[0];
  return null;
}

export default async function Home() {
  let borsaVeriliIlanlar: any[] = [];

  try {
    await connectMongoDB();
    const ilanlar = await Varlik.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("baslik fiyat eskiFiyat kategori sehir resimler aciklama takasIstegi satici createdAt")
      .lean();

    borsaVeriliIlanlar = ilanlar.map((ilan: any) => {
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat > 0 && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }
      return {
        ...ilan,
        _id: ilan._id.toString(),
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(1)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });
  } catch {}

  // ✅ LCP preload — ilk görsel sunucu tarafında head'e eklenir
  const ilkGorsel = getFirstImage(borsaVeriliIlanlar);
  const preloadUrl = ilkGorsel ? optimizeCloudinary(ilkGorsel, 520, 220) : null;

  return (
    <>
      {preloadUrl && (
        <link
          rel="preload"
          as="image"
          href={preloadUrl}
          // @ts-ignore
          fetchpriority="high"
        />
      )}
      <HomeClient initialIlanlar={borsaVeriliIlanlar} />
    </>
  );
}
