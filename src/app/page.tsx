import Link from "next/link";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import IlanKart, { IlanOzet } from "@/components/IlanKart";
import { KATEGORILER } from "@/lib/kategoriler";
import { MUSAIT_FILTRE } from "@/lib/yardimci";

export const dynamic = "force-dynamic";

async function sonIlanlar(): Promise<IlanOzet[]> {
  try {
    await connectMongoDB();
    const l = await Varlik.find(MUSAIT_FILTRE).sort({ createdAt: -1 }).limit(12).select("baslik slug resimler videolar sehir ilce kategori takasIstegi durum").lean();
    return JSON.parse(JSON.stringify(l));
  } catch { return []; }
}

export default async function Anasayfa() {
  const ilanlar = await sonIlanlar();
  return (
    <div>
      <section className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">İhtiyaç fazlası ürününü<br />ihtiyacın olanla takas et</h1>
        <p className="mt-4 max-w-xl text-teal-50">Fotoğraf ve video ekle, ilanını yayınla. Başkası kendi ürününü teklif eder, ikiniz de onaylayınca takas olur. Satış yok, komisyon yok, tamamen ücretsiz.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/ilan-ver" className="btn bg-amber-400 text-slate-900 hover:bg-amber-300">+ Ücretsiz ilan ver</Link>
          <Link href="/ilanlar" className="btn border border-white/40 text-white hover:bg-white/10">İlanlara göz at</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {[["1", "İlan ver", "Ürününün fotoğraf ve videosunu ekle, karşılığında ne istediğini yaz."], ["2", "Teklif al / ver", "Beğendiğin ilana kendi ürünlerinden birini teklif et."], ["3", "İkiniz onaylayın", "Teklif kabul edilince iletişim bilgileri açılır; takası yapın ve onaylayın."]].map(([n, b, a]) => (
          <div key={n} className="card p-4"><div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">{n}</div><h2 className="font-bold">{b}</h2><p className="mt-1 text-sm text-slate-600">{a}</p></div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Kategoriler</h2>
        <div className="flex flex-wrap gap-2">
          {KATEGORILER.map((k) => <Link key={k.slug} href={`/ilanlar?kategori=${k.slug}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-teal-600 hover:text-teal-800">{k.emoji} {k.ad}</Link>)}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between"><h2 className="text-lg font-bold">Son ilanlar</h2><Link href="/ilanlar" className="text-sm font-medium text-teal-700">Tümünü gör →</Link></div>
        {ilanlar.length === 0 ? (
          <div className="card p-8 text-center text-slate-600">Henüz ilan yok. İlk ilanı sen ver! <Link href="/ilan-ver" className="font-semibold text-teal-700">İlan ver →</Link></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} ilan={i} />)}</div>
        )}
      </section>
    </div>
  );
}
