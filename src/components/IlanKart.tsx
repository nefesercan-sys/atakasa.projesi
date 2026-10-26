import Link from "next/link";
import { kategoriAdi } from "@/lib/kategoriler";
import { ilAdi } from "@/lib/iller";
import { kucuk, videoKapak } from "@/lib/medya";

export interface IlanOzet {
  _id: string; baslik: string; slug?: string; resimler?: string[]; videolar?: string[];
  sehir?: string; ilce?: string; kategori?: string; takasIstegi?: string; durum?: string;
}

export default function IlanKart({ ilan }: { ilan: IlanOzet }) {
  const kapak = ilan.resimler?.[0] ? kucuk(ilan.resimler[0]) : ilan.videolar?.[0] ? videoKapak(ilan.videolar[0]) : "";
  const href = `/varlik/${ilan.slug || ilan._id}`;
  return (
    <Link href={href} className="card group block overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100">
        {kapak ? <img src={kapak} alt={ilan.baslik} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl">📦</div>}
        {ilan.videolar && ilan.videolar.length > 0 && <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">▶ Video</span>}
        {ilan.durum === "takasta" && <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-white">Takasta</span>}
        {ilan.durum === "takasEdildi" && <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Takas edildi</span>}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{ilan.baslik}</h3>
        <p className="mt-1 text-xs text-slate-500">{ilAdi(ilan.sehir)}{ilan.ilce ? ` / ${ilan.ilce}` : ""} · {kategoriAdi(ilan.kategori)}</p>
        {ilan.takasIstegi && <p className="mt-2 line-clamp-2 rounded-lg bg-teal-50 px-2 py-1 text-xs text-teal-800">🔁 İstenen: {ilan.takasIstegi}</p>}
      </div>
    </Link>
  );
}
