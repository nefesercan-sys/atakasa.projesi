import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import User from "@/models/User";
import TeklifButonu from "@/components/TeklifButonu";
import { kategoriAdi } from "@/lib/kategoriler";
import { ilAdi } from "@/lib/iller";
import { ilanMusait } from "@/lib/yardimci";
import { videoKapak } from "@/lib/medya";

export const dynamic = "force-dynamic";
const SITE = "https://www.atakasa.com";

async function getir(slug: string) {
  try {
    await connectMongoDB();
    const ilan = mongoose.Types.ObjectId.isValid(slug) && String(new mongoose.Types.ObjectId(slug)) === slug ? await Varlik.findById(slug).lean() : await Varlik.findOne({ slug }).lean();
    if (!ilan) return null;
    const satici = await User.findById((ilan as { satici: unknown }).satici).select("name").lean() as { name?: string } | null;
    return { ilan: JSON.parse(JSON.stringify(ilan)) as Record<string, any>, saticiAd: satici?.name || "Üye" };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const d = await getir(params.slug);
  if (!d) return { title: "İlan bulunamadı", robots: { index: false } };
  const i = d.ilan;
  const aciklama = `${i.baslik} — ${ilAdi(i.sehir)} · ${kategoriAdi(i.kategori)}. ${i.takasIstegi ? "İstenen: " + i.takasIstegi + ". " : ""}Ücretsiz takas ilanı.`.slice(0, 158);
  const url = `/varlik/${i.slug || i._id}`;
  return {
    title: `${i.baslik} takas — ${ilAdi(i.sehir)}`.slice(0, 60),
    description: aciklama,
    alternates: { canonical: url },
    openGraph: { title: i.baslik, description: aciklama, url, images: i.resimler?.[0] ? [i.resimler[0]] : undefined },
    robots: i.durum === "takasEdildi" || i.aktif === false ? { index: false, follow: true } : undefined,
  };
}

export default async function IlanDetay({ params }: { params: { slug: string } }) {
  const d = await getir(params.slug);
  if (!d) notFound();
  const i = d.ilan;
  const resimler: string[] = i.resimler || [];
  const videolar: string[] = i.videolar || [];
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: i.baslik, description: i.aciklama || i.baslik, image: resimler.slice(0, 4), url: `${SITE}/varlik/${i.slug || i._id}` };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div>
        {resimler[0] ? <img src={resimler[0]} alt={i.baslik} className="w-full rounded-2xl bg-slate-100 object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100 text-5xl">📦</div>}
        {resimler.length > 1 && <div className="mt-2 grid grid-cols-4 gap-2">{resimler.slice(1).map((u) => <img key={u} src={u} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />)}</div>}
        {videolar.map((u) => <video key={u} src={u} poster={videoKapak(u)} controls preload="metadata" playsInline className="mt-3 w-full rounded-2xl bg-black" />)}
      </div>
      <div>
        <p className="text-sm text-slate-500"><Link href="/ilanlar" className="hover:underline">İlanlar</Link> / <Link href={`/ilanlar?kategori=${i.kategori}`} className="hover:underline">{kategoriAdi(i.kategori)}</Link></p>
        <h1 className="mt-1 text-2xl font-extrabold">{i.baslik}</h1>
        <p className="mt-1 text-sm text-slate-600">📍 {ilAdi(i.sehir)}{i.ilce ? ` / ${i.ilce}` : ""} · 👤 {d.saticiAd}</p>
        {i.durum === "takasta" && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Bu ürün için takas süreci devam ediyor.</p>}
        {i.durum === "takasEdildi" && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">✅ Bu ürün takas edildi.</p>}
        {i.takasIstegi && <div className="mt-4 rounded-xl bg-teal-50 p-3"><p className="text-xs font-semibold uppercase text-teal-700">Karşılığında istenen</p><p className="mt-1 text-teal-900">{i.takasIstegi}</p></div>}
        {i.aciklama && <div className="mt-4"><h2 className="text-sm font-bold text-slate-700">Açıklama</h2><p className="mt-1 whitespace-pre-line text-slate-700">{i.aciklama}</p></div>}
        <div className="mt-6"><TeklifButonu hedefId={i._id} saticiId={String(i.satici)} musait={ilanMusait(i)} /></div>
        <p className="mt-3 text-xs text-slate-500">Teklif kabul edilene kadar iletişim bilgileri gizli kalır. Takası yüz yüze, ürünü görerek yapmanızı öneririz.</p>
      </div>
    </div>
  );
}
