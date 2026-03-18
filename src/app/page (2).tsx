// ✅ SERVER COMPONENT — "use client" YOK
// İlk 20 ilanı sunucuda çeker, LCP görselini <head>'e preload ekler
import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "A-TAKASA — İster Sat, İster Takas Et | Güvenli İkinci El Platform",
  description:
    "Türkiye'nin en güvenli takas ve ikinci el satış platformu. Elektronik, araç, emlak, mobilya — hemen ilan ver, hemen kazan.",
  openGraph: {
    title: "A-TAKASA — İster Sat, İster Takas Et",
    description: "Türkiye'nin en güvenli takas ve ikinci el satış platformu.",
    url: "https://atakasa.com",
    siteName: "A-TAKASA",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "https://atakasa.com/og-default.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://atakasa.com" },
};

async function getIlkIlanlar(): Promise<any[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${base}/api/varliklar?limit=20&durum=aktif`, {
      next: { revalidate: 60 }, // 60 saniyede bir taze veri
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || data.ilanlar || data.varliklar || [];
  } catch {
    return [];
  }
}

function optimizeCloudinary(url: string, w = 520, h = 220): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_") || url.includes("/upload/q_")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},h_${h},c_fill/`);
}

function getFirstImage(ilanlar: any[]): string | null {
  if (!ilanlar.length) return null;
  const ilan = ilanlar[0];
  const checkArray = (arr: any) =>
    Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "string" ? arr[0] : null;
  return (
    checkArray(ilan.resimler) ||
    checkArray(ilan.medyalar) ||
    checkArray(ilan.images) ||
    null
  );
}

export default async function HomePage() {
  const ilkIlanlar = await getIlkIlanlar();
  const ilkGorsel = getFirstImage(ilkIlanlar);
  const preloadUrl = ilkGorsel ? optimizeCloudinary(ilkGorsel, 520, 220) : null;

  return (
    <>
      {/* ✅ LCP preload — sunucu tarafında head'e eklenir, JS beklenmez */}
      {preloadUrl && (
        <link
          rel="preload"
          as="image"
          href={preloadUrl}
          // @ts-ignore
          fetchpriority="high"
        />
      )}
      <HomeClient ilkIlanlar={ilkIlanlar} />
    </>
  );
}
