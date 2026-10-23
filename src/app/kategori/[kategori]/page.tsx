import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { kategoriBul } from "@/lib/kategoriler";
import { sonIlanlar } from "@/lib/ilanlar";
import IlanKart from "@/components/IlanKart";

export const revalidate = 120;
type P = { params: { kategori: string } };

export function generateMetadata({ params }: P): Metadata {
  const k = kategoriBul(params.kategori);
  if (!k) return {};
  return { title: `${k.ad} Takas İlanları`, description: `${k.ad} kategorisinde ücretsiz takas ilanları. İhtiyacın olmayanı ver, istediğinle takas et.`, alternates: { canonical: `/kategori/${k.slug}` } };
}

export default async function Page({ params }: P) {
  const k = kategoriBul(params.kategori);
  if (!k) notFound();
  const ilanlar = await sonIlanlar({ kategori: k.slug }, 48);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{k.emoji} {k.ad} takas ilanları</h1>
      {ilanlar.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} i={i} />)}</div> : <p className="text-gray-600">Bu kategoride henüz ilan yok.</p>}
    </div>
  );
}
