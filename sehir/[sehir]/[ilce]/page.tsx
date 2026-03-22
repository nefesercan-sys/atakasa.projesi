import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { SEHIR_ILCE, KATEGORILER } from "@/lib/sehirler";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ sehir: string; ilce: string; kategori: string }>;
};

export async function generateStaticParams() {
  const params = [];
  for (const [sehir, ilceler] of Object.entries(SEHIR_ILCE)) {
    for (const ilce of ilceler) {
      for (const kat of KATEGORILER) {
        params.push({ sehir, ilce, kategori: kat.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sehir, ilce, kategori } = await params;
  const kat = KATEGORILER.find(k => k.slug === kategori);
  const sehirAd = sehir.charAt(0).toUpperCase() + sehir.slice(1);
  const ilceAd = ilce.charAt(0).toUpperCase() + ilce.slice(1);
  if (!kat) return {};

  return {
    title: `${ilceAd} ${kat.ad} İlanları — ${sehirAd} | A-TAKASA`,
    description: `${sehirAd} ${ilceAd}'da ${kat.ad} satılık ve takas ilanları. Ücretsiz ilan ver, hemen takas et!`,
    alternates: {
      canonical: `https://atakasa.com/sehir/${sehir}/${ilce}/${kategori}`,
    },
    openGraph: {
      title: `${ilceAd} ${kat.ad} İlanları | A-TAKASA`,
      description: `${sehirAd} ${ilceAd}'da ${kat.ad} ilanları`,
      url: `https://atakasa.com/sehir/${sehir}/${ilce}/${kategori}`,
    },
  };
}

export default async function IlceKategoriPage({ params }: Props) {
  const { sehir, ilce, kategori } = await params;
  const kat = KATEGORILER.find(k => k.slug === kategori);
  const ilceler = SEHIR_ILCE[sehir];

  if (!kat || !ilceler || !ilceler.includes(ilce)) notFound();

  const sehirAd = sehir.charAt(0).toUpperCase() + sehir.slice(1);
  const ilceAd = ilce.charAt(0).toUpperCase() + ilce.slice(1);

  await connectMongoDB();

  const ilanlar = await Varlik.find({
    $or: [
      { ilce: { $regex: ilce, $options: "i" } },
      { sehir: { $regex: ilce, $options: "i" } },
    ],
    kategori: { $regex: kat.ad, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .limit(24)
    .select("baslik fiyat kategori sehir resimler slug takasIstegi createdAt")
    .lean();

  const toplam = await Varlik.countDocuments({
    $or: [{ ilce: { $regex: ilce, $options: "i" } }],
    kategori: { $regex: kat.ad, $options: "i" },
  });

  const ilanlarSerialized = JSON.parse(JSON.stringify(ilanlar));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px 80px" }}>

      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${ilceAd} ${kat.ad} İlanları`,
          description: `${sehirAd} ${ilceAd}'da ${kat.ad} ilanları`,
          url: `https://atakasa.com/sehir/${sehir}/${ilce}/${kategori}`,
          numberOfItems: toplam,
        }),
      }} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0f2540,#1e3a8a)", borderRadius: 20, padding: "32px 24px", marginBottom: 28, color: "#fff" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", marginBottom: 10 }}>
          {kat.emoji} {sehirAd} / {ilceAd} · {kat.ad}
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, marginBottom: 10 }}>
          {ilceAd}'da <span style={{ color: "#c9a84c" }}>{kat.ad}</span> İlanları
        </h1>
        <p style={{ color: "rgba(255,255,255,.75)", marginBottom: 20, lineHeight: 1.7 }}>
          {sehirAd} {ilceAd}'da {kat.ad} kategorisinde {toplam} ilan bulunuyor.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/ilan-ver" style={{ background: "#c9a84c", color: "#0f2540", padding: "10px 20px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>
            ⚡ İlan Ver
          </a>
          <a href={`/sehir/${sehir}/${kategori}`} style={{ background: "rgba(255,255,255,.1)", color: "#fff", padding: "10px 20px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 14, border: "1px solid rgba(255,255,255,.2)" }}>
            🏙️ Tüm {sehirAd}
          </a>
        </div>
      </div>

      {/* İlanlar */}
      {ilanlarSerialized.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, marginBottom: 40 }}>
          {ilanlarSerialized.map((ilan: any, idx: number) => (
            <a key={ilan._id} href={`/varlik/${ilan.slug || ilan._id}`}
              style={{ display: "block", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", textDecoration: "none", color: "inherit" }}>
              <div style={{ height: 160, background: "#f1f5f9", overflow: "hidden", position: "relative" }}>
                {ilan.resimler?.[0] ? (
                  <img src={ilan.resimler[0]} alt={ilan.baslik} loading={idx < 6 ? "eager" : "lazy"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                    {kat.emoji}
                  </div>
                )}
                {ilan.takasIstegi && (
                  <div style={{ position: "absolute", top: 8, right: 8, background: "#c9a84c", color: "#0f2540", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6 }}>
                    🔄 TAKAS
                  </div>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 6, lineHeight: 1.3 }}>{ilan.baslik}</p>
                <p style={{ fontWeight: 900, color: "#0f2540" }}>
                  {Number(ilan.fiyat) > 0 ? `${Number(ilan.fiyat).toLocaleString("tr-TR")} ₺` : "Fiyat Sor"}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "2px dashed #e2e8f0", marginBottom: 40 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>{kat.emoji}</div>
          <h2 style={{ fontWeight: 800, color: "#0f2540", marginBottom: 8 }}>Henüz ilan yok</h2>
          <p style={{ color: "#475569", marginBottom: 20 }}>{ilceAd}'da {kat.ad} kategorisinde ilk ilanı siz verin!</p>
          <a href="/ilan-ver" style={{ background: "#c9a84c", color: "#0f2540", padding: "12px 28px", borderRadius: 12, fontWeight: 800, textDecoration: "none" }}>
            ⚡ İlan Ver
          </a>
        </div>
      )}

      {/* İç Linkler */}
      <div style={{ background: "#f8fafc", borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f2540", marginBottom: 14 }}>
          {sehirAd}'da Diğer İlçeler — {kat.ad}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {(SEHIR_ILCE[sehir] || []).filter(i => i !== ilce).map(i => (
            <a key={i} href={`/sehir/${sehir}/${i}/${kategori}`}
              style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 700, color: "#475569", textDecoration: "none" }}>
              📍 {i.charAt(0).toUpperCase() + i.slice(1)}
            </a>
          ))}
        </div>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f2540", marginBottom: 14 }}>
          {ilceAd}'da Diğer Kategoriler
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {KATEGORILER.filter(k => k.slug !== kategori).map(k => (
            <a key={k.slug} href={`/sehir/${sehir}/${ilce}/${k.slug}`}
              style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", fontSize: 13, fontWeight: 700, color: "#475569", textDecoration: "none" }}>
              {k.emoji} {k.ad}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
