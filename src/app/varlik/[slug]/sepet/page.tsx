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
    title: `${ilan.baslik} — Sepete Ekle | A-TAKASA`,
    description: `${ilan.baslik} sepetinize ekleyin. Güvenli alışveriş için A-TAKASA'yı tercih edin.`,
    alternates: {
      canonical: `https://atakasa.com/varlik/${slug}/sepet`,
    },
  };
}

export default async function SepetPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.replace('/sepet?ekle=${slug}');`
      }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=/sepet?ekle=${slug}`} />
      </noscript>
    </>
  );
}
