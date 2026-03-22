import type { Metadata } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectMongoDB();
  const ilan = await Varlik.findOne({ slug }).lean() as any;
  if (!ilan) return {};

  const url = `https://atakasa.com/varlik/${slug}`;
  const resim = ilan.resimler?.[0] || "";

  return {
    title: `${ilan.baslik} — Paylaş | A-TAKASA`,
    description: `${ilan.baslik} ilanını arkadaşlarınla paylaş. ${Number(ilan.fiyat).toLocaleString("tr-TR")} ₺`,
    alternates: {
      canonical: `https://atakasa.com/varlik/${slug}/paylas`,
    },
    openGraph: {
      title: ilan.baslik,
      description: ilan.aciklama?.slice(0, 160) || "",
      url,
      images: resim ? [{ url: resim, width: 1200, height: 630 }] : [],
      type: "website",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: ilan.baslik,
      description: ilan.aciklama?.slice(0, 160) || "",
      images: resim ? [resim] : [],
    },
  };
}

export default async function PaylasPage({ params }: Props) {
  const { slug } = await params;
  await connectMongoDB();
  const ilan = await Varlik.findOne({ slug }).lean() as any;

  const url = `https://atakasa.com/varlik/${slug}`;
  const baslik = encodeURIComponent(ilan?.baslik || "");
  const fiyat = Number(ilan?.fiyat || 0).toLocaleString("tr-TR");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#faf8f4", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 480, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
        {ilan?.resimler?.[0] && (
          <img src={ilan.resimler[0]} alt={ilan.baslik}
            style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />
        )}
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f2540", marginBottom: 8 }}>{ilan?.baslik}</h1>
        <p style={{ fontSize: 24, fontWeight: 900, color: "#0f2540", marginBottom: 24 }}>{fiyat} ₺</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={`https://api.whatsapp.com/send?text=${baslik}%20${url}`} target="_blank"
            style={{ background: "#25D366", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            📱 WhatsApp ile Paylaş
          </a>
          <a href={`https://t.me/share/url?url=${url}&text=${baslik}`} target="_blank"
            style={{ background: "#0088cc", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            ✈️ Telegram ile Paylaş
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${baslik}&url=${url}`} target="_blank"
            style={{ background: "#000", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            𝕏 Twitter ile Paylaş
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            style={{ background: "#f3f4f6", color: "#0f2540", padding: "12px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 }}>
            🔗 Linki Kopyala
          </button>
          <a href={`/varlik/${slug}`}
            style={{ background: "#0f2540", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            👁️ İlanı İncele
          </a>
        </div>
      </div>
    </div>
  );
}
