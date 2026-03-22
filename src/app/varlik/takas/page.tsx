import type { Metadata } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectMongoDB();
  const ilan = await Varlik.findOne({ slug }).lean() as any;
  if (!ilan) return {};

  return {
    title: `${ilan.baslik} — Takas Teklifi Gönder | A-TAKASA`,
    description: `${ilan.baslik} için takas teklifi gönder. Kendi ürününü teklif et, nakit farkıyla takas yap.`,
    alternates: {
      canonical: `https://atakasa.com/varlik/${slug}/takas`,
    },
    openGraph: {
      title: `${ilan.baslik} — Takas Et`,
      description: `${ilan.baslik} için takas teklifi gönder`,
      images: ilan.resimler?.[0] ? [{ url: ilan.resimler[0] }] : [],
    },
  };
}

export default async function TakasPage({ params }: Props) {
  const { slug } = await params;
  // Kullanıcıyı mevcut sayfaya yönlendir, sekmeyi takas olarak aç
  return (
    <>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.replace('/varlik/${slug}?islem=takas');`
      }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=/varlik/${slug}?islem=takas`} />
      </noscript>
    </>
  );
}
