import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ilBul } from "@/lib/iller";
import { KATEGORILER } from "@/lib/kategoriler";
import { sonIlanlar } from "@/lib/ilanlar";
import { SITE_URL } from "@/lib/site";
import IlanKart from "@/components/IlanKart";
import JsonLd from "@/components/JsonLd";
import Sss from "@/components/Sss";

export const revalidate = 120;
type P = { params: { sehir: string } };

export function generateMetadata({ params }: P): Metadata {
  const il = ilBul(params.sehir);
  if (!il) return {};
  const d = `${il} ücretsiz takas ilanları: telefon, araba, ev, saat, mobilya ve her türlü eşya. Eşyanı ilan et, ${il}'daki üyelerle takas et.`;
  return {
    title: `${il} Takas İlanları`,
    description: d,
    keywords: [`${il} takas`, `${il} eşya takası`, `${il} ücretsiz takas`, `${il} telefon takas`, `${il} araba takas`, `${il} ev takas`, `${il} mobilya takas`, `${il} takas ilanları`],
    alternates: { canonical: `/sehir/${params.sehir}` },
    openGraph: { title: `${il} Takas İlanları | A-Takasa`, description: d, url: `${SITE_URL}/sehir/${params.sehir}` },
  };
}

export default async function Page({ params }: P) {
  const il = ilBul(params.sehir);
  if (!il) notFound();
  const ilanlar = await sonIlanlar({ sehir: il }, 48);
  const url = `${SITE_URL}/sehir/${params.sehir}`;
  const sss = [
    { s: `${il}'da takas nasıl yapılır?`, c: `${il}'da eşyanı A-Takasa'da ücretsiz ilan edebilir, karşılığında istediğini yazabilirsin. Teklifi kabul edince iletişim bilgileri açılır; eşyaları ${il}'da kalabalık ve güvenli bir yerde yüz yüze değişirsiniz.` },
    { s: `${il}'da hangi eşyalar takas edilir?`, c: "Telefon, bilgisayar, mobilya, giyim, bebek ürünleri, saat, koleksiyon, araç ve daha birçok eşya için ilan verilebilir." },
  ];
  return (
    <div className="space-y-6">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", name: `${il} Takas İlanları`, url, inLanguage: "tr" },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: `${il} takas`, item: url },
        ] },
      ] }} />
      <div>
        <h1 className="mb-2 text-2xl font-bold">📍 {il} takas ilanları</h1>
        <p className="text-gray-700">{il}'da ihtiyacın olmayan eşyayı ilan et, karşılığında istediğini yaz. Satış yok, ücret yok; karşılıklı onayla takas.</p>
      </div>
      {ilanlar.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} i={i} />)}</div> : <div className="kart p-6 text-center text-gray-600">{il} için henüz ilan yok. <Link href="/ilan-ver" className="font-semibold text-marka underline">İlk ilanı sen ver!</Link></div>}
      <section>
        <h2 className="mb-2 text-lg font-semibold">{il}'da kategoriye göre takas</h2>
        <div className="flex flex-wrap gap-2 text-sm">{KATEGORILER.map((k) => <Link key={k.slug} href={`/kategori/${k.slug}`} className="kart px-3 py-1.5 hover:bg-marka-acik">{k.emoji} {k.ad}</Link>)}</div>
      </section>
      <Sss oge={sss} />
    </div>
  );
}
