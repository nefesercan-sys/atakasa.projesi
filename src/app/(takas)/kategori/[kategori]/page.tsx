import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { kategoriBul, KATEGORILER } from "@/lib/kategoriler";
import { REHBER } from "@/lib/rehber";
import { SITE_URL } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Sss from "@/components/Sss";
import { sonIlanlar } from "@/lib/ilanlar";
import IlanKart from "@/components/IlanKart";

export const revalidate = 120;
type P = { params: { kategori: string } };

export function generateMetadata({ params }: P): Metadata {
  const k = kategoriBul(params.kategori);
  if (!k) return {};
  return {
    title: `${k.ad} Takas İlanları`,
    description: k.tanim,
    keywords: [...k.anahtar, `${k.ad} takas`, `ücretsiz ${k.ad.toLowerCase()} takası`],
    alternates: { canonical: `/kategori/${k.slug}` },
    openGraph: { title: `${k.ad} Takas İlanları | A-Takasa`, description: k.tanim, url: `${SITE_URL}/kategori/${k.slug}` },
  };
}

export default async function Page({ params }: P) {
  const k = kategoriBul(params.kategori);
  if (!k) notFound();
  const ilanlar = await sonIlanlar({ kategori: k.slug }, 48);
  const url = `${SITE_URL}/kategori/${k.slug}`;
  const sss = [
    { s: `${k.ad} takası nasıl yapılır?`, c: `${k.ad} kategorisinde ilan ver, karşılığında ne istediğini yaz ve gelen teklifleri değerlendir. Anlaşınca eşyaları yüz yüze, birlikte kontrol ederek değişin. ${k.ipucu}` },
    { s: `A-Takasa'da ${k.ad.toLowerCase()} satabilir miyim?`, c: "Hayır, A-Takasa'da satış ve para transferi yoktur; yalnızca eşyanı başka bir eşyayla takas edebilirsin. İlan vermek ve teklif göndermek ücretsizdir." },
  ];
  const rehber = REHBER.find((r) => r.kategori === k.slug);
  return (
    <div className="space-y-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", name: `${k.ad} Takas İlanları`, description: k.tanim, url, inLanguage: "tr" },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `${k.ad} takas`, item: url },
        ] },
        ...(ilanlar.length ? [{ "@type": "ItemList", itemListElement: ilanlar.slice(0, 20).map((i, n) => ({ "@type": "ListItem", position: n + 1, url: `${SITE_URL}/ilan/${i.slug}`, name: i.baslik })) }] : []),
      ] }} />
      <div>
        <h1 className="mb-2 text-2xl font-bold">{k.emoji} {k.ad} takas ilanları</h1>
        <p className="text-gray-700">{k.tanim}</p>
      </div>
      {ilanlar.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} i={i} />)}</div> : <div className="kart p-6 text-center text-gray-600">Bu kategoride henüz ilan yok. <Link href="/ilan-ver" className="font-semibold text-marka underline">İlk ilanı sen ver!</Link></div>}
      <section className="kart space-y-2 p-5">
        <h2 className="text-lg font-bold">{k.ad} kategorisinde neler takas edilir?</h2>
        <p className="text-gray-700">{k.ornekler.join(", ")} ve benzeri eşyalar için ücretsiz ilan verebilirsin.</p>
        <p className="text-sm text-gray-700"><b>Güvenlik ipucu:</b> {k.ipucu}</p>
        {rehber && <p><Link href={`/takas-rehberi/${rehber.slug}`} className="font-semibold text-marka underline">{rehber.baslik} →</Link></p>}
      </section>
      <Sss oge={sss} />
      <section>
        <h2 className="mb-2 text-lg font-semibold">Diğer kategoriler</h2>
        <div className="flex flex-wrap gap-2 text-sm">{KATEGORILER.filter((x) => x.slug !== k.slug).map((x) => <Link key={x.slug} href={`/kategori/${x.slug}`} className="kart px-3 py-1.5 hover:bg-marka-acik">{x.emoji} {x.ad}</Link>)}</div>
      </section>
    </div>
  );
}
