import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import User from "@/models/User";
import { oturumAl } from "@/lib/oturum";
import { kategoriBul } from "@/lib/kategoriler";
import { slugla } from "@/lib/iller";
import { onizleme, videoMu } from "@/lib/medya";
import TeklifFormu from "@/components/TeklifFormu";

export const dynamic = "force-dynamic";
type P = { params: { slug: string } };

async function getir(slug: string) {
  await connectMongoDB();
  return Varlik.findOne({ slug, durum: { $ne: "silindi" } }).lean();
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const i = await getir(params.slug).catch(() => null);
  if (!i) return { title: "İlan bulunamadı", robots: { index: false } };
  const d = (i.aciklama || `${i.sehir} ${i.baslik} takas ilanı.`).slice(0, 150);
  return {
    title: `${i.baslik} - Takas | ${i.sehir}`.slice(0, 60),
    description: d,
    alternates: { canonical: `/ilan/${i.slug}` },
    openGraph: { images: i.resimler?.[0] ? [onizleme(i.resimler[0], 1000)] : [] },
    robots: i.durum === "aktif" ? undefined : { index: false },
  };
}

export default async function Page({ params }: P) {
  const i = await getir(params.slug);
  if (!i) notFound();
  const o = await oturumAl();
  const sahip = !!o && String(i.satici) === o.id;
  const satici = await User.findById(i.satici).select("name tamamlananTakas").lean();
  if (!sahip) await Varlik.updateOne({ _id: i._id }, { $inc: { goruntulenme: 1 } });

  const benim = o && !sahip && i.durum === "aktif"
    ? (await Varlik.find({ satici: o.id, durum: "aktif" }).select("baslik").lean()).map((x) => ({ _id: String(x._id), baslik: x.baslik }))
    : [];
  const kat = kategoriBul(i.kategori);

  return (
    <article className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        {i.resimler.map((u, k) =>
          videoMu(u) ? (
            <video key={u} src={u} poster={onizleme(u, 800)} controls preload="metadata" className="w-full rounded-xl bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={onizleme(u, 900)} alt={`${i.baslik} - ${k + 1}`} className="w-full rounded-xl" loading={k ? "lazy" : "eager"} />
          )
        )}
      </div>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{i.baslik}</h1>
          <p className="text-sm text-gray-600">
            <Link href={`/sehir/${slugla(i.sehir)}`} className="underline">📍 {i.sehir}</Link>{i.ilce ? ` / ${i.ilce}` : ""} ·{" "}
            {kat && <Link href={`/kategori/${kat.slug}`} className="underline">{kat.emoji} {kat.ad}</Link>}
          </p>
        </div>
        {i.aciklama && <p className="whitespace-pre-line text-gray-800">{i.aciklama}</p>}
        {i.takasIstegi && <div className="rounded-lg bg-marka-acik p-3 text-sm"><b>Karşılığında istiyor:</b> {i.takasIstegi}</div>}
        <p className="text-sm text-gray-500">Üye: {satici?.name?.split(" ")[0] || "Üye"} · {satici?.tamamlananTakas || 0} tamamlanan takas</p>

        {i.durum !== "aktif" ? (
          <p className="kart p-4 text-center text-gray-600">{i.durum === "takas_oldu" ? "✅ Bu ürün takas edildi." : i.durum === "takasta" ? "⏳ Bu ürün için takas sürüyor." : "Bu ilan şu an yayında değil."}</p>
        ) : sahip ? (
          <Link href="/panel" className="btn-ikinci w-full">Bu senin ilanın · Panele git</Link>
        ) : (
          <div className="kart p-4"><TeklifFormu hedefId={String(i._id)} benimIlanlar={benim} girisli={!!o} /></div>
        )}
      </div>
    </article>
  );
}
