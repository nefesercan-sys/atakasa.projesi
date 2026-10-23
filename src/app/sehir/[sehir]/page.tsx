import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ilBul } from "@/lib/iller";
import { sonIlanlar } from "@/lib/ilanlar";
import IlanKart from "@/components/IlanKart";

export const revalidate = 120;
type P = { params: { sehir: string } };

export function generateMetadata({ params }: P): Metadata {
  const il = ilBul(params.sehir);
  if (!il) return {};
  return { title: `${il} Takas İlanları`, description: `${il} ücretsiz eşya takas ilanları. Eşyanı ilan et, ${il}'daki üyelerle takas et.`, keywords: [`${il} takas`, `${il} eşya takası`, `${il} ücretsiz takas`, `${il} takas ilanları`], alternates: { canonical: `/sehir/${params.sehir}` } };
}

export default async function Page({ params }: P) {
  const il = ilBul(params.sehir);
  if (!il) notFound();
  const ilanlar = await sonIlanlar({ sehir: il }, 48);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">📍 {il} takas ilanları</h1>
      {ilanlar.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ilanlar.map((i) => <IlanKart key={i._id} i={i} />)}</div> : <p className="text-gray-600">{il} için henüz ilan yok.</p>}
    </div>
  );
}
