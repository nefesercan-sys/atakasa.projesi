import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REHBER, rehberBul } from "@/lib/rehber";
import { kategoriBul } from "@/lib/kategoriler";
import { SITE_URL, SITE_ADI } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Sss from "@/components/Sss";

type P = { params: { konu: string } };
export const dynamicParams = false;
export const generateStaticParams = () => REHBER.map((r) => ({ konu: r.slug }));

export function generateMetadata({ params }: P): Metadata {
  const r = rehberBul(params.konu);
  if (!r) return {};
  return { title: r.baslik, description: r.ozet, keywords: r.anahtar, alternates: { canonical: `/takas-rehberi/${r.slug}` }, openGraph: { title: r.baslik, description: r.ozet, type: "article", url: `${SITE_URL}/takas-rehberi/${r.slug}` } };
}

export default function Page({ params }: P) {
  const r = rehberBul(params.konu);
  if (!r) notFound();
  const k = kategoriBul(r.kategori);
  const url = `${SITE_URL}/takas-rehberi/${r.slug}`;
  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "Article", headline: r.baslik, description: r.ozet, mainEntityOfPage: url, inLanguage: "tr", author: { "@type": "Organization", name: SITE_ADI }, publisher: { "@type": "Organization", name: SITE_ADI, url: SITE_URL } },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Takas rehberi", item: `${SITE_URL}/takas-rehberi` },
          { "@type": "ListItem", position: 3, name: r.baslik, item: url },
        ] },
      ] }} />
      <nav className="text-sm text-gray-500"><Link href="/" className="underline">Ana sayfa</Link> › <Link href="/takas-rehberi" className="underline">Takas rehberi</Link></nav>
      <h1 className="text-2xl font-bold sm:text-3xl">{r.baslik}</h1>
      <p className="text-gray-700">{r.ozet}</p>
      {r.bolumler.map((b) => (
        <section key={b.h} className="space-y-2">
          <h2 className="text-xl font-semibold">{b.h}</h2>
          {b.p.map((t) => <p key={t} className="text-gray-800">{t}</p>)}
        </section>
      ))}
      <div className="kart flex flex-wrap items-center gap-3 p-4">
        <Link href="/ilan-ver" className="btn">+ Ücretsiz ilan ver</Link>
        {k && <Link href={`/kategori/${k.slug}`} className="btn-ikinci">{k.emoji} {k.ad} ilanlarına bak</Link>}
      </div>
      <Sss oge={r.sss} />
      <section>
        <h2 className="mb-2 text-lg font-semibold">Diğer rehberler</h2>
        <ul className="list-disc space-y-1 pl-5 text-marka">
          {REHBER.filter((x) => x.slug !== r.slug).map((x) => <li key={x.slug}><Link href={`/takas-rehberi/${x.slug}`} className="underline">{x.baslik}</Link></li>)}
        </ul>
      </section>
    </article>
  );
}
