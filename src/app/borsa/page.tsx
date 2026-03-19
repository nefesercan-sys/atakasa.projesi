// src/app/borsa/page.tsx
// SERVER COMPONENT — veri server'da çekilir, LCP düşer

import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import BorsaClient from "./BorsaClient";

// 30 saniyede bir yeniden oluştur
export const revalidate = 30;

async function getIlanlar() {
  try {
    await connectMongoDB();
    const ilanlar = await Varlik.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .select("baslik fiyat eskiFiyat kategori sehir resimler aciklama createdAt")
      .lean();

    return ilanlar.map((ilan: any) => {
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }
      return {
        ...ilan,
        _id: ilan._id.toString(),
        createdAt: ilan.createdAt?.toString() || "",
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(3)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });
  } catch (err) {
    console.error("Borsa veri hatası:", err);
    return [];
  }
}

export default async function BorsaPage() {
  const ilanlar = await getIlanlar();

  // İlk görseli bul (LCP preload için)
  const ilkGorsel = ilanlar[0]?.resimler?.[0] || null;

  return (
    <>
      {/* LCP görselini tarayıcıya önceden bildir */}
      {ilkGorsel && (
        <link
          rel="preload"
          as="image"
          href={ilkGorsel}
          // @ts-ignore
          fetchpriority="high"
        />
      )}
      <BorsaClient ilkIlanlar={ilanlar} />
    </>
  );
}
