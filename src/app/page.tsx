import Link from "next/link";
import { KATEGORILER } from "@/lib/kategoriler";
import { sonIlanlar } from "@/lib/ilanlar";
import IlanKart from "@/components/IlanKart";
import Sss from "@/components/Sss";
import JsonLd from "@/components/JsonLd";
import { GENEL_SSS } from "@/lib/sss";
import { REHBER } from "@/lib/rehber";
import { ILLER, slugla } from "@/lib/iller";

const POPULER_ILLER = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"];

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

      <section className="kart space-y-3 p-5">
        <h2 className="text-xl font-bold">A-Takasa'da neleri takas edebilirsin?</h2>
        <p className="text-gray-700">İhtiyacın olmayan ya da satamadığın eşyayı ilan et, karşılığında istediğin başka bir eşyayı yaz. Telefon, araba, ev, saat, çakmak, mobilya, giyim, elektronik ve çok daha fazlası için ücretsiz ilan verebilirsin. Satış ve para transferi yok; takas, iki tarafın karşılıklı onayıyla yüz yüze tamamlanır.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {KATEGORILER.slice(0, 8).map((k) => (
            <li key={k.slug}><Link href={`/kategori/${k.slug}`} className="font-semibold text-marka underline">{k.emoji} {k.ad.replace(" & ", " ve ")} takası</Link><span className="text-sm text-gray-600"> – {k.ornekler.slice(0, 3).join(", ")}</span></li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Takas nasıl çalışır?</h2>
        <ol className="grid gap-3 sm:grid-cols-4">
          {["İlan ver: eşyanın fotoğrafını ekle, karşılığında ne istediğini yaz.", "Teklif al veya ver: beğendiğin ilana kendi eşyanı öner.", "Kabul et: iki taraf anlaşınca iletişim bilgileri açılır.", "Buluş ve onayla: eşyaları yüz yüze değiş, iki taraf da onaylasın."].map((t, n) => (
            <li key={n} className="kart p-4 text-sm"><b className="text-marka">{n + 1}.</b> {t}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-bold">Takas rehberi</h2>
        <div className="flex flex-wrap gap-2">
          {REHBER.map((r) => <Link key={r.slug} href={`/takas-rehberi/${r.slug}`} className="kart px-3 py-2 text-sm hover:bg-marka-acik">{r.baslik}</Link>)}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-bold">Şehrine göre takas ilanları</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {POPULER_ILLER.filter((i) => ILLER.includes(i)).map((i) => <Link key={i} href={`/sehir/${slugla(i)}`} className="kart px-3 py-1.5 hover:bg-marka-acik">{i} takas</Link>)}
        </div>
      </section>

      <Sss baslik="A-Takasa hakkında sık sorulanlar" oge={GENEL_SSS} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: "A-Takasa | Ücretsiz Takas Sitesi", description: "Ücretsiz eşya takas platformu: telefon, araba, ev, saat, mobilya ve daha fazlası.", inLanguage: "tr" }} />
    </div>
  );
}
