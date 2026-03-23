import { Metadata } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

const BASE = "https://www.atakasa.com";

const KATEGORI_META: Record<string, { emoji: string; aciklama: string }> = {
  "Elektronik": { emoji: "💻", aciklama: "Telefon, bilgisayar, tablet ve tüm elektronik ürünler" },
  "Arac": { emoji: "🚗", aciklama: "Sıfır ve ikinci el araç ilanları, takas fırsatları" },
  "Emlak": { emoji: "🏠", aciklama: "Satılık ve kiralık konut, arsa, iş yeri ilanları" },
  "Mobilya": { emoji: "🪑", aciklama: "Ev ve ofis mobilyaları, dekorasyon ürünleri" },
  "Oyun-Konsol": { emoji: "🎮", aciklama: "PlayStation, Xbox, Nintendo ve oyun ilanları" },
  "Antika-Eserler": { emoji: "🏺", aciklama: "Antika, koleksiyon ve sanat eserleri" },
  "Tekstil": { emoji: "👕", aciklama: "Giyim, ayakkabı, çanta ve aksesuar ilanları" },
  "Kitap": { emoji: "📚", aciklama: "İkinci el kitap, dergi ve eğitim materyali ilanları" },
  "Kozmetik": { emoji: "💄", aciklama: "Kozmetik, parfüm ve kişisel bakım ürünleri" },
  "Petshop": { emoji: "🐾", aciklama: "Evcil hayvan ve malzemeleri ilanları" },
};

function kategoriAd(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export async function generateMetadata({
  params,
}: { params: Promise<{ kategori: string }> }): Promise<Metadata> {
  const { kategori } = await params;
  const ad = kategoriAd(decodeURIComponent(kategori));
  const meta = KATEGORI_META[kategori] || { emoji: "🏷️", aciklama: `${ad} kategori ilanları` };

  const title = `${meta.emoji} ${ad} İlanları — Ücretsiz Takas & Satış | A-Takasa`;
  const desc = `${ad} ilanları: ${meta.aciklama}. Türkiye genelinde binlerce ilan, takas ve satış fırsatı. Ücretsiz ilan ver, hemen kazan — A-Takasa.`;

  return {
    title,
    description: desc,
    keywords: [
      ad, `${ad} ilanları`, `${ad} satılık`, `${ad} takas`,
      `ikinci el ${ad}`, `ucuz ${ad}`, `${ad} fiyatları`,
      "atakasa", "ücretsiz ilan", "takas sitesi",
    ],
    alternates: { canonical: `${BASE}/kategori/${kategori}` },
    openGraph: { title, description: desc, url: `${BASE}/kategori/${kategori}`, type: "website", locale: "tr_TR", siteName: "A-Takasa" },
    robots: { index: true, follow: true },
  };
}

export default async function KategoriSayfasi({
  params,
}: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  const ad = kategoriAd(decodeURIComponent(kategori));
  const meta = KATEGORI_META[kategori] || { emoji: "🏷️", aciklama: "" };

  let ilanlar: any[] = [];
  let toplamIlan = 0;

  try {
    await connectMongoDB();
    const query = { kategori: { $regex: new RegExp(ad.replace("-", "/"), "i") } };
    toplamIlan = await Varlik.countDocuments(query);
    const raw = await Varlik.find(query)
      .sort({ createdAt: -1 })
      .limit(24)
      .select("baslik fiyat eskiFiyat sehir resimler aciklama takasIstegi slug _id createdAt")
      .lean();

    ilanlar = raw.map((i: any) => ({
      ...i,
      _id: i._id.toString(),
    }));
  } catch (err) {
    console.error("Kategori sayfası hata:", err);
  }

  // Schema.org ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${ad} İlanları`,
    description: meta.aciklama,
    url: `${BASE}/kategori/${kategori}`,
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
      <section style={{
        background: "linear-gradient(135deg,#0f2347,#1e3a5f)",
        padding: "40px 24px 32px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 16, display: "flex", gap: 6 }}>
            <a href="/" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Anasayfa</a>
            <span>›</span>
            <span style={{ color: "#c9a84c" }}>{ad}</span>
          </nav>

          <h1 style={{ color: "#fff", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginBottom: 10 }}>
            {meta.emoji} {ad} İlanları
          </h1>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, marginBottom: 20 }}>
            {meta.aciklama} — <strong style={{ color: "#c9a84c" }}>{toplamIlan}</strong> ilan bulundu
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/ilan-ver" style={{
              background: "linear-gradient(135deg,#c9a84c,#d4a017)", color: "#0f2347",
              padding: "10px 22px", borderRadius: 30, fontWeight: 800, fontSize: 13,
              textDecoration: "none",
            }}>
              ⚡ {ad} İlanı Ver
            </a>
            <a href="/takas" style={{
              background: "rgba(255,255,255,.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,.2)",
              padding: "10px 22px", borderRadius: 30, fontWeight: 700, fontSize: 13,
              textDecoration: "none",
            }}>
              🔄 Takas Yap
            </a>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {ilanlar.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f2540", marginBottom: 8 }}>
              Bu kategoride henüz ilan yok
            </h2>
            <p style={{ color: "#888", marginBottom: 24 }}>İlk ilanı sen ver, hemen kazan!</p>
            <a href="/ilan-ver" style={{
              background: "#6c63ff", color: "#fff", padding: "12px 28px",
              borderRadius: 12, fontWeight: 800, textDecoration: "none",
            }}>
              ⚡ İlan Ver
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
                  <article style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
                    itemScope itemType="https://schema.org/Product">
                    <meta itemProp="name" content={ilan.baslik} />
                    <div style={{ height: 150, background: "#f1f2f4", overflow: "hidden", position: "relative" }}>
                      {resim ? (
                        <img src={resim} alt={ilan.baslik} itemProp="image"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>{meta.emoji}</div>
                      )}
                      {ilan.takasIstegi && (
                        <div style={{ position: "absolute", top: 8, left: 8, background: "#6c63ff", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                          🔄 TAKAS
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{ fontSize: 11, color: "#999", marginBottom: 4, fontWeight: 600 }}>📍 {ilan.sehir || "Türkiye"}</p>
                      <h2 style={{
                        fontSize: 13, fontWeight: 700, color: "#0f2540", marginBottom: 8, lineHeight: 1.4,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {ilan.baslik}
                      </h2>
                      <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <meta itemProp="priceCurrency" content="TRY" />
                        <meta itemProp="price" content={String(ilan.fiyat)} />
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#0f2540" }}>{fiyat} ₺</div>
                      </div>
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        )}

        {/* SEO: Bu kategoride neden A-Takasa */}
        <section style={{ marginTop: 40, background: "#fff", borderRadius: 20, padding: "28px 24px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2540", marginBottom: 16 }}>
            {meta.emoji} {ad} İlanlarında A-Takasa Farkı
          </h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 12 }}>
            A-Takasa&apos;da <strong>{ad}</strong> kategorisinde binlerce ilan bulunuyor. Türkiye genelinde
            satıcılar ve alıcılar A-Takasa güvencesiyle buluşuyor. <strong>Ücretsiz ilan ver</strong>,
            istediğin ürünü <strong>takas et</strong> ya da hemen sat.
          </p>
          <ul style={{ fontSize: 14, color: "#555", lineHeight: 2, paddingLeft: 20 }}>
            <li>✅ %100 güvenli ödeme havuzu</li>
            <li>🔄 Kolay takas imkânı</li>
            <li>📢 Ücretsiz ilan verme</li>
            <li>🛡️ Alıcı & satıcı koruması</li>
            <li>📞 7/24 destek</li>
          </ul>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <a href="/kayit" style={{ background: "#6c63ff", color: "#fff", padding: "11px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>
              Ücretsiz Üye Ol
            </a>
            <a href="/ilan-ver" style={{ background: "#f0efff", color: "#6c63ff", padding: "11px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>
              {ad} İlanı Ver
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
