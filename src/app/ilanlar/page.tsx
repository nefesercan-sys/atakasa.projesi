import type { Metadata } from "next";
import Link from "next/link";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import IlanKart, { IlanOzet } from "@/components/IlanKart";
import { KATEGORILER, kategoriGecerli, kategoriAdi } from "@/lib/kategoriler";
import { ILLER, ilGecerli, ilAdi } from "@/lib/iller";
import { MUSAIT_FILTRE, regexKacis } from "@/lib/yardimci";

export const dynamic = "force-dynamic";
type SP = { sehir?: string; kategori?: string; q?: string; sayfa?: string };

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const parca = [searchParams.sehir && ilGecerli(searchParams.sehir) ? ilAdi(searchParams.sehir) : "", searchParams.kategori && kategoriGecerli(searchParams.kategori) ? kategoriAdi(searchParams.kategori) : ""].filter(Boolean).join(" ");
  const baslik = parca ? `${parca} takas ilanları` : "Takas ilanları";
  const filtreli = !!(searchParams.q || searchParams.sayfa);
  return {
    title: baslik,
    description: `${parca ? parca + " için " : ""}ücretsiz takas ilanları. Fotoğraf ve videolu ilanlara göz at, ürününle takas teklif et.`,
    alternates: { canonical: "/ilanlar" + (parca ? `?${new URLSearchParams({ ...(searchParams.sehir && ilGecerli(searchParams.sehir) ? { sehir: searchParams.sehir } : {}), ...(searchParams.kategori && kategoriGecerli(searchParams.kategori) ? { kategori: searchParams.kategori } : {}) })}` : "") },
    robots: filtreli ? { index: false, follow: true } : undefined,
  };
}

export default async function IlanlarSayfasi({ searchParams }: { searchParams: SP }) {
  const sehir = searchParams.sehir && ilGecerli(searchParams.sehir) ? searchParams.sehir : "";
  const kategori = searchParams.kategori && kategoriGecerli(searchParams.kategori) ? searchParams.kategori : "";
  const q = (searchParams.q || "").slice(0, 60).trim();
  const sayfa = Math.max(1, parseInt(searchParams.sayfa || "1", 10) || 1);
  const LIMIT = 24;

  const filtre: Record<string, unknown> = { ...MUSAIT_FILTRE };
  if (sehir) filtre.sehir = sehir;
  if (kategori) filtre.kategori = kategori;
  if (q) { const r = new RegExp(regexKacis(q), "i"); filtre.$or = [{ baslik: r }, { aciklama: r }, { takasIstegi: r }]; }

  let liste: IlanOzet[] = []; let toplam = 0;
  try {
    await connectMongoDB();
    const [l, t] = await Promise.all([
      Varlik.find(filtre).sort({ createdAt: -1 }).skip((sayfa - 1) * LIMIT).limit(LIMIT).select("baslik slug resimler videolar sehir ilce kategori takasIstegi durum").lean(),
      Varlik.countDocuments(filtre),
    ]);
    liste = JSON.parse(JSON.stringify(l)); toplam = t;
  } catch { /* veritabanı yoksa boş liste */ }
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / LIMIT));
  const link = (p: number) => `/ilanlar?${new URLSearchParams({ ...(sehir ? { sehir } : {}), ...(kategori ? { kategori } : {}), ...(q ? { q } : {}), sayfa: String(p) })}`;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{[sehir && ilAdi(sehir), kategori && kategoriAdi(kategori)].filter(Boolean).join(" · ") || "Tüm"} takas ilanları</h1>
      <form className="card mt-4 grid gap-2 p-3 sm:grid-cols-4" action="/ilanlar">
        <input name="q" defaultValue={q} placeholder="Ürün ara…" className="input sm:col-span-1" />
        <select name="sehir" defaultValue={sehir} className="input"><option value="">Tüm şehirler</option>{ILLER.map((i) => <option key={i.slug} value={i.slug}>{i.ad}</option>)}</select>
        <select name="kategori" defaultValue={kategori} className="input"><option value="">Tüm kategoriler</option>{KATEGORILER.map((k) => <option key={k.slug} value={k.slug}>{k.ad}</option>)}</select>
        <button className="btn btn-primary">Ara</button>
      </form>
      <p className="mt-3 text-sm text-slate-500">{toplam} ilan bulundu</p>
      {liste.length === 0 ? (
        <div className="card mt-4 p-8 text-center text-slate-600">Bu filtrede ilan yok. <Link href="/ilan-ver" className="font-semibold text-teal-700">İlk ilanı sen ver →</Link></div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{liste.map((i) => <IlanKart key={i._id} ilan={i} />)}</div>
      )}
      {sayfaSayisi > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {sayfa > 1 && <Link href={link(sayfa - 1)} className="btn btn-ghost">← Önceki</Link>}
          <span className="text-slate-500">{sayfa} / {sayfaSayisi}</span>
          {sayfa < sayfaSayisi && <Link href={link(sayfa + 1)} className="btn btn-ghost">Sonraki →</Link>}
        </div>
      )}
    </div>
  );
}
