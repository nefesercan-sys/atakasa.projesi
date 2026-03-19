// src/app/borsa/page.tsx
// SERVER COMPONENT — veri server'da çekilir, LCP düşer

import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import BorsaClient from "./BorsaClient";
import { headers } from "next/headers";

// 30 saniyede bir yeniden oluştur
export const revalidate = 30;

export async function generateMetadata() {
  // İlk görseli çek, <head>'e preload olarak ekle
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
      // Next.js bu link'i <head>'e preload olarak ekler
      other: gorsel
        ? {
            "link-preload-image": gorsel,
          }
        : {},
    };
  } catch {
    return {
      title: "Borsa Vitrini | A-TAKASA",
    };
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
    <>
      {/*
        Next.js App Router'da <head> içine preload eklemek için
        doğrudan JSX'te <link> kullanılır — Next.js bunu <head>'e taşır.
        fetchPriority="high" LCP görselini öncelikli yükler.
      */}
      {ilkGorsel && (
        <link
          rel="preload"
          as="image"
          href={ilkGorsel}
          // @ts-ignore — fetchPriority Next.js 14'te desteklenir
          fetchPriority="high"
          imageSrcSet={`${ilkGorsel} 1x`}
        />
      )}
      <BorsaClient ilkIlanlar={ilanlar} ilkGorsel={ilkGorsel} />
    </>
  );
}
