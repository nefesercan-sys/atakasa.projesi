import Link from "next/link";
import { onizleme, videoMu } from "@/lib/medya";

export type KartIlan = { slug?: string; baslik: string; sehir: string; resimler?: string[]; takasIstegi?: string; durum?: string };

export default function IlanKart({ i }: { i: KartIlan }) {
  const ilk = i.resimler?.[0];
  return (
    <Link href={`/ilan/${i.slug}`} className="kart group block overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-square bg-gray-100">
        {ilk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={onizleme(ilk, 500)} alt={i.baslik} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
        {ilk && videoMu(ilk) && <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 text-xs text-white">▶ Video</span>}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-semibold">{i.baslik}</h3>
        <p className="text-xs text-gray-500">📍 {i.sehir}</p>
        {i.takasIstegi && <p className="mt-1 line-clamp-1 text-xs text-marka-koyu">🔁 {i.takasIstegi}</p>}
      </div>
    </Link>
  );
}
