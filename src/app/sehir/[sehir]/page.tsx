import { Metadata } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

const BASE = "https://www.atakasa.com";

function sehirAd(slug: string) {
  const map: Record<string, string> = {
    istanbul: "İstanbul", ankara: "Ankara", izmir: "İzmir",
    bursa: "Bursa", antalya: "Antalya", adana: "Adana",
    konya: "Konya", gaziantep: "Gaziantep", kayseri: "Kayseri",
    eskisehir: "Eskişehir", mersin: "Mersin", diyarbakir: "Diyarbakır",
  };
  return map[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export async function generateMetadata({
  params,
}: { params: Promise<{ sehir: string }> }): Promise<Metadata> {
  const { sehir } = await params;
  const ad = sehirAd(decodeURIComponent(sehir));
  const title = `${ad} İlanları — Satılık, Takas & İkinci El | A-Takasa`;
  const desc = `${ad} ücretsiz ilan, takas ve ikinci el satış platformu. ${ad}'da satılık ürünler, takas ilanları ve fırsatlar A-Takasa'da. Ücretsiz üye ol, ücretsiz ilan ver!`;

  return {
    title,
    description: desc,
    keywords: [
      `${ad} ilanları`, `${ad} ikinci el`, `${ad} takas`,
      `${ad} satılık`, `${ad} ücretsiz ilan`,
      `${ad} elektronik`, `${ad} araç`, `${ad} emlak`,
      "atakasa", "takas", "ikinci el",
    ],
    alternates: { canonical: `${BASE}/sehir/${sehir}` },
    openGraph: {
      title, description: desc,
      url: `${BASE}/sehir/${sehir}`,
      type: "website", locale: "tr_TR",
      siteName: "A-Takasa",
    },
    robots: { index: true, follow: true },
  };
}

export default async function SehirSayfasi({
  params,
}: { params: Promise<{ sehir: string }> }) {
  const { sehir } = await params;
  const ad = sehirAd(decodeURIComponent(sehir));

  let ilanlar: any[] = [];
  let toplamIlan = 0;
  let kategoriler: { _id: string; sayi: number }[] = [];

  try {
    await connectMongoDB();
    const query = { sehir: { $regex: new RegExp(ad, "i") } };
    toplamIlan = await Varlik.countDocuments(query);

    const raw = await Varlik.find(query)
      .sort({ createdAt: -1 })
      .limit(24)
      .select("baslik fiyat sehir resimler takasIstegi slug _id kategori createdAt")
      .lean();

    ilanlar = raw.map((i: any) => ({ ...i, _id: i._id.toString() }));

    // Kategori dağılımı
    const aggr = await Varlik.aggregate([
      { $match: query },
      { $group: { _id: "$kategori", sayi: { $sum: 1 } } },
      { $sort: { sayi: -1 } },
      { $limit: 8 },
    ]);
    kategoriler = aggr;
  } catch (err) {
    console.error("Şehir sayfası hata:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${ad} İlanları`,
    url: `${BASE}/sehir/${sehir}`,
    numberOfItems: toplamIlan,
    itemListElement: ilanlar.slice(0, 10).map((ilan, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/varlik/${ilan.slug || ilan._id}`,
      name: ilan.baslik,
    })),
  };

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#0f2347,#1e3a5f)", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <nav style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 16, display: "flex", gap: 6 }}>
            <a href="/" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Anasayfa</a>
            <span>›</span>
            <span style={{ color: "#c9a84c" }}>{ad}</span>
          </nav>
          <h1 style={{ color: "#fff", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginBottom: 10 }}>
            📍 {ad} İlanları
          </h1>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, marginBottom: 20 }}>
            {ad}&apos;da satılık, takaslık ve ikinci el ürünler —{" "}
            <strong style={{ color: "#c9a84c" }}>{toplamIlan}</strong> ilan
          </p>

          {/* Kategori filtreleri */}
          {kategoriler.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {kategoriler.map(k => (
                <a key={k._id} href={`/sehir/${sehir}?kategori=${encodeURIComponent(k._id)}`}
                  style={{
                    background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)",
                    border: "1px solid rgba(255,255,255,.2)",
                    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    textDecoration: "none",
                  }}>
                  {k._id} ({k.sayi})
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {ilanlar.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f2540", marginBottom: 8 }}>
              {ad}&apos;da henüz ilan yok
            </h2>
            <a href="/ilan-ver" style={{ background: "#6c63ff", color: "#fff", padding: "12px 28px", borderRadius: 12, fontWeight: 800, textDecoration: "none" }}>
              ⚡ İlk İlanı Sen Ver
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {ilanlar.map((ilan) => {
              const resim = Array.isArray(ilan.resimler) ? ilan.resimler[0] : ilan.resimler || "";
              const ilanUrl = `/varlik/${ilan.slug || ilan._id}`;
              const fiyat = Number(ilan.fiyat || 0).toLocaleString("tr-TR");
              return (
                <a key={ilan._id} href={ilanUrl} style={{ textDecoration: "none", color: "inherit" }} title={ilan.baslik}>
                  <article style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                    <div style={{ height: 150, background: "#f1f2f4", overflow: "hidden", position: "relative" }}>
                      {resim ? (
                        <img src={resim} alt={ilan.baslik} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>📦</div>
                      )}
                      {ilan.takasIstegi && (
                        <div style={{ position: "absolute", top: 8, left: 8, background: "#6c63ff", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                          🔄 TAKAS
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{ fontSize: 11, color: "#6c63ff", marginBottom: 4, fontWeight: 600 }}>🏷️ {ilan.kategori || "Genel"}</p>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f2540", marginBottom: 8, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {ilan.baslik}
                      </h2>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#0f2540" }}>{fiyat} ₺</div>
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        )}

        {/* SEO Metin */}
        <section style={{ marginTop: 40, background: "#fff", borderRadius: 20, padding: "28px 24px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2540", marginBottom: 14 }}>
            📍 {ad}&apos;da Takas & Satış — A-Takasa
          </h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>
            <strong>{ad}</strong> bölgesindeki ikinci el, sıfır ve takaslık ürünlerin tamamı
            A-Takasa&apos;da. Elektronikten araca, mobilyadan emlaka kadar her kategoride
            ilan bulabilir, <strong>ücretsiz ilan verebilir</strong> ve güvenle takas yapabilirsiniz.
            A-Takasa güvencesiyle {ad}&apos;da alın, satın, takas edin.
          </p>
        </section>
      </main>
    </div>
  );
}
