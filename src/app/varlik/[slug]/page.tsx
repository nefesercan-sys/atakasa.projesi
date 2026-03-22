import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const BASE = "https://www.atakasa.com";

async function getBySlug(slug: string) {
  await connectMongoDB();
  const db = mongoose.connection.db;
  if (!db) return null;
  return db.collection("varliklar").findOne({ slug });
}

async function getById(id: string) {
  try {
    await connectMongoDB();
    const db = mongoose.connection.db;
    if (!db) return null;
    return db.collection("varliklar").findOne({ _id: new ObjectId(id) });
  } catch { return null; }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ilan = await getBySlug(slug);
  if (!ilan) return { title: "İlan Bulunamadı | Atakasa" };

  const sehir = ilan.sehir || "";
  const title = `${ilan.baslik} — ${sehir} | Atakasa`;
  const desc = `${sehir} ${ilan.kategori} ilanı. ${(ilan.aciklama || ilan.baslik).slice(0, 140)}`;
  const url = `${BASE}/varlik/${ilan.slug}`;
  const resim = ilan.resimler?.[0] || "";

  return {
    title,
    description: desc,
    keywords: [ilan.baslik, sehir, ilan.kategori, "atakasa", "ilan"],
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url,
      type: "website", locale: "tr_TR", siteName: "Atakasa",
      images: resim ? [{ url: resim, width: 800, height: 600, alt: ilan.baslik }] : [],
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function VarlikSayfasi({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // _id ile geliyorsa slug'a yönlendir
  const isObjectId = /^[0-9a-f]{24}$/i.test(slug);
  if (isObjectId) {
    const ilan = await getById(slug);
    if (ilan?.slug) redirect(`/varlik/${ilan.slug}`);
    notFound();
  }

  const ilan = await getBySlug(slug);
  if (!ilan) notFound();

  const sehir = ilan.sehir || "";
  const resim = ilan.resimler?.[0] || "";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: ilan.baslik,
          description: ilan.aciklama || ilan.baslik,
          image: resim ? [resim] : [],
          offers: {
            "@type": "Offer",
            price: ilan.fiyat || 0,
            priceCurrency: "TRY",
            availability: "https://schema.org/InStock",
          },
          areaServed: { "@type": "City", name: sehir },
        }),
      }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
        <a href="/" style={{ color: "#888", textDecoration: "none" }}>Anasayfa</a>
        {" → "}
        <a href="/kesfet" style={{ color: "#888", textDecoration: "none" }}>Keşfet</a>
        {" → "}
        <span>{ilan.baslik}</span>
      </nav>

      {/* Görsel */}
      {resim && (
        <img
          src={resim}
          alt={ilan.baslik}
          style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 16, marginBottom: 24 }}
        />
      )}

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{ilan.baslik}</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {sehir && (
          <span style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: 100, fontSize: 13 }}>
            📍 {sehir}
          </span>
        )}
        {ilan.kategori && (
          <span style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: 100, fontSize: 13 }}>
            🏷️ {ilan.kategori}
          </span>
        )}
        {ilan.takasIstegi && (
          <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "4px 12px", borderRadius: 100, fontSize: 13, color: "#166534" }}>
            🔄 Takas İsteniyor
          </span>
        )}
      </div>

      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f2540", marginBottom: 24 }}>
        {Number(ilan.fiyat || 0).toLocaleString("tr-TR")} ₺
      </div>

      {ilan.aciklama && (
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Açıklama</h2>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {ilan.aciklama}
          </p>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href={`/varlik/${ilan.slug || ilan._id}/takas`}
          style={{ background: "#6c63ff", color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>
          🔄 Takas Teklifi Ver
        </a>
        <a href={`/varlik/${ilan.slug || ilan._id}/satin-al`}
          style={{ background: "#0f2540", color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>
          🛒 Satın Al
        </a>
      </div>

    </main>
  );
}
