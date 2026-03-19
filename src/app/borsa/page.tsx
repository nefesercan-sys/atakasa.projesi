// src/app/borsa/page.tsx
// SERVER COMPONENT — veri server'da çekilir, LCP düşer

import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import BorsaClient from "./BorsaClient";

export const revalidate = 30;

export async function generateMetadata() {
  try {
    await connectMongoDB();
    const ilk = await Varlik.findOne({})
      .sort({ createdAt: -1 })
      .select("resimler baslik")
      .lean() as any;

    const gorsel = ilk?.resimler?.[0] || null;

    return {
      title: "Borsa Vitrini | A-TAKASA",
      description: "Türkiye'nin en büyük takas ve ikinci el borsa vitrini.",
      openGraph: {
        title: "Borsa Vitrini | A-TAKASA",
        images: gorsel ? [{ url: gorsel }] : [],
      },
    };
  } catch {
    return { title: "Borsa Vitrini | A-TAKASA" };
  }
}

async function getIlanlar() {
  try {
    await connectMongoDB();
    const ilanlar = await Varlik.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .select("baslik fiyat eskiFiyat kategori sehir resimler aciklama createdAt")
      .lean();

    return (ilanlar as any[]).map((ilan) => {
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
  const ilkGorsel: string | null = ilanlar[0]?.resimler?.[0] ?? null;

  return (
    <BorsaClient ilkIlanlar={ilanlar} ilkGorsel={ilkGorsel} />
  );
}
