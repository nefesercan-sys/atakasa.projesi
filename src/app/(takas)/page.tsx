import Link from "next/link";
import { KATEGORILER } from "@/lib/kategoriler";
import { sonIlanlar, istatistik } from "@/lib/ilanlar";
import IlanKart from "@/components/IlanKart";
import Sss from "@/components/Sss";
import JsonLd from "@/components/JsonLd";
import { GENEL_SSS } from "@/lib/sss";
import { REHBER } from "@/lib/rehber";
import { ILLER, slugla } from "@/lib/iller";

const POPULER_ILLER = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"];

export const revalidate = 60;

export default async function Home() {
  const [ilanlar, st] = await Promise.all([sonIlanlar(), istatistik()]);
  const sayac = [["Üye", st.uye], ["Aktif ilan", st.ilan], ["Tamamlanan takas", st.takas]].filter(([, n]) => (n as number) >= 10);
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-marka to-marka-koyu p-6 text-white sm:p-10">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">100% ücretsiz · satış yok · karşılıklı onay</p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">İhtiyacın olmayanı ver, ihtiyacın olanı al.</h1>
            <p className="mt-3 max-w-xl text-white/90">Eşyanın fotoğrafını veya videosunu ekle, karşılığında ne istediğini yaz. Teklifler gelsin, iki taraf onaylayınca takas tamam.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/ilan-ver" className="rounded-lg bg-white px-5 py-3 font-bold text-marka-koyu shadow">+ Ücretsiz İlan Ver</Link>
              <Link href="/nasil-calisir" className="rounded-lg border border-white/60 px-5 py-3 font-semibold">Nasıl çalışır?</Link>
            </div>
            {sayac.length > 0 && (
              <dl className="mt-6 flex gap-6">
                {sayac.map(([ad, n]) => (<div key={ad as string}><dt className="text-xs text-white/80">{ad}</dt><dd className="text-2xl font-extrabold">{n}</dd></div>))}
              </dl>
            )}
          </div>
          <div className="hidden items-center justify-center gap-3 md:flex" aria-hidden="true">
            <div className="rotate-[-6deg] rounded-2xl bg-white p-6 text-center text-gray-800 shadow-xl"><div className="text-6xl">📱</div><p className="mt-2 text-sm font-semibold">Telefon</p></div>
            <div className="text-4xl">🔁</div>
            <div className="rotate-[6deg] rounded-2xl bg-white p-6 text-center text-gray-800 shadow-xl"><div className="text-6xl">🚴</div><p className="mt-2 text-sm font-semibold">Bisiklet</p></div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Kategoriler</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {KATEGORILER.map((k) => (
            <Link key={k.slug} href={`/kategori/${k.slug}`} className="kart flex items-center gap-3 p-3 transition hover:border-marka hover:bg-marka-acik">
              <span className="text-3xl" aria-hidden="true">{k.emoji}</span>
              <span className="text-sm font-semibold leading-tight">{k.ad}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Yeni ilanlar</h2>
        {ilanlar.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} i={i} />)}</div>
        ) : (
          <div className="kart space-y-3 p-8 text-center"><p className="text-4xl" aria-hidden="true">📦</p><p className="font-semibold">Vitrin yeni açıldı, ilk ilanlar yolda.</p><p className="text-sm text-gray-600">Evde kullanmadığın bir eşya varsa ilan ver; karşılığında ihtiyacın olanı yaz.</p><Link href="/ilan-ver" className="btn">İlk ilanı sen ver</Link></div>
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
