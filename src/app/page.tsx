import Link from "next/link";
import { KATEGORILER } from "@/lib/kategoriler";
import { sonIlanlar } from "@/lib/ilanlar";
import IlanKart from "@/components/IlanKart";

export const revalidate = 60;

export default async function Home() {
  const ilanlar = await sonIlanlar();
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-marka to-marka-koyu p-8 text-white">
        <h1 className="text-3xl font-extrabold sm:text-4xl">İhtiyacın olmayanı ver, ihtiyacın olanı al.</h1>
        <p className="mt-2 max-w-xl text-white/90">Satın alma yok, ücret yok. Eşyanın fotoğrafını ekle, karşılığında istediğini yaz; teklifler gelsin, karşılıklı onayla takas gerçekleşsin.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/ilan-ver" className="rounded-lg bg-white px-5 py-2.5 font-bold text-marka-koyu">+ Ücretsiz İlan Ver</Link>
          <Link href="/nasil-calisir" className="rounded-lg border border-white/60 px-5 py-2.5 font-semibold">Nasıl çalışır?</Link>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {KATEGORILER.map((k) => (
          <Link key={k.slug} href={`/kategori/${k.slug}`} className="kart shrink-0 px-4 py-2 text-sm hover:bg-marka-acik">{k.emoji} {k.ad}</Link>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Yeni ilanlar</h2>
        {ilanlar.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} i={i} />)}</div>
        ) : (
          <div className="kart p-8 text-center text-gray-600">Henüz ilan yok. <Link href="/ilan-ver" className="font-semibold text-marka underline">İlk ilanı sen ver!</Link></div>
        )}
      </section>
    </div>
  );
}
