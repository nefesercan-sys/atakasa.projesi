import type { Metadata } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectMongoDB();
  const ilan = await Varlik.findOne({ slug }).lean() as any;
  if (!ilan) return {};

  return {
    title: `${ilan.baslik} — Satın Al | A-TAKASA`,
    description: `${ilan.baslik} güvenli ödeme ile satın al. ${Number(ilan.fiyat).toLocaleString("tr-TR")} ₺ — Alıcı korumalı ödeme sistemi.`,
    alternates: {
      canonical: `https://atakasa.com/varlik/${slug}/satin-al`,
    },
    openGraph: {
      title: `${ilan.baslik} — Satın Al`,
      description: `${Number(ilan.fiyat).toLocaleString("tr-TR")} ₺ — Güvenli satın al`,
      images: ilan.resimler?.[0] ? [{ url: ilan.resimler[0] }] : [],
    },
  };
}

export default async function SatinAlPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.replace('/varlik/${slug}?islem=satinal');`
      }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=/varlik/${slug}?islem=satinal`} />
      </noscript>
    </>
  );
}
