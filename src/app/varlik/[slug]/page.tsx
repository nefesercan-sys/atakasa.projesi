import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

const BASE = "https://www.atakasa.com";

async function getBySlug(slug: string) {
  try {
    const res = await fetch(`${BASE}/api/varliklar?slug=${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] || null : data;
  } catch { return null; }
}

async function getById(id: string) {
  try {
    const res = await fetch(`${BASE}/api/varliklar?id=${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] || null : data;
  } catch { return null; }
}

async function getBenzerIlanlar(kategori: string, excludeSlug: string) {
  try {
    const res = await fetch(
      `${BASE}/api/varliklar?kategori=${encodeURIComponent(kategori)}&limit=6`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const liste = Array.isArray(data) ? data : [];
    return liste
      .filter((i: any) => (i.slug || i._id?.toString()) !== excludeSlug)
      .slice(0, 5);
  } catch { return []; }
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ilan = await getBySlug(slug);
  if (!ilan) return { title: "İlan Bulunamadı | A-Takasa" };

  const sehir = ilan.sehir || "Türkiye";
  const kategori = ilan.kategori || "";
  const baslik = ilan.baslik || "";
  const fiyat = Number(ilan.fiyat || 0).toLocaleString("tr-TR");
  const title = `${baslik} — ${fiyat} ₺ | ${sehir} ${kategori} İlanı | A-Takasa`;
  const desc = `${sehir} ${kategori} ilanı: ${baslik}. Fiyat: ${fiyat} ₺. ${ilan.takasIstegi ? "Takas kabul edilir. " : ""}${(ilan.aciklama || baslik).slice(0, 120)} — A-Takasa'da güvenli al-sat ve takas.`;
  const url = `${BASE}/varlik/${ilan.slug || ilan._id}`;
  const resim = ilan.resimler?.[0] || "";

  const keywords = [
    baslik, sehir, kategori,
    `${sehir} ${kategori}`, `${baslik} fiyat`, `${baslik} takas`,
    `${sehir} ikinci el`, "atakasa", "takas", "ikinci el",
    "satılık", "ücretsiz ilan", "takas sitesi",
  ].filter(Boolean);

  return {
    title,
    description: desc,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url,
      type: "website", locale: "tr_TR",
      siteName: "A-Takasa — Ücretsiz İlan, Takas & Satış Platformu",
      images: resim ? [{ url: resim, width: 800, height: 600, alt: baslik }] : [],
    },
    twitter: {
      card: "summary_large_image", title, description: desc,
      images: resim ? [resim] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function VarlikSayfasi({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const isObjectId = /^[0-9a-f]{24}$/i.test(slug);
  if (isObjectId) {
    const ilan = await getById(slug);
    if (!ilan) notFound();
    if (ilan?.slug) redirect(`/varlik/${ilan.slug}`);
    return renderIlan(ilan, []);
  }

  const ilan = await getBySlug(slug);
  if (!ilan) notFound();

  const benzerIlanlar = await getBenzerIlanlar(ilan.kategori || "", slug);
  return renderIlan(ilan, benzerIlanlar);
}

function renderIlan(ilan: any, benzerIlanlar: any[]) {
  const sehir = ilan.sehir || "Türkiye";
  const resimler: string[] = Array.isArray(ilan.resimler)
    ? ilan.resimler
    : ilan.resimler ? [ilan.resimler] : [];
  const anaResim = resimler[0] || "";
  const ilanUrl = `/varlik/${ilan.slug || ilan._id}`;
  const fiyat = Number(ilan.fiyat || 0).toLocaleString("tr-TR");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ilan.baslik,
    description: ilan.aciklama || ilan.baslik,
    image: resimler,
    url: `${BASE}${ilanUrl}`,
    offers: {
      "@type": "Offer",
      price: ilan.fiyat || 0,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      url: `${BASE}${ilanUrl}`,
      seller: { "@type": "Person", name: ilan.satici?.ad || ilan.satici?.name || "Satıcı" },
    },
    areaServed: { "@type": "City", name: sehir },
    category: ilan.kategori || "",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: BASE },
      { "@type": "ListItem", position: 2, name: "Keşfet", item: `${BASE}/kesfet` },
      { "@type": "ListItem", position: 3, name: ilan.kategori || "İlan", item: `${BASE}/kategori/${encodeURIComponent(ilan.kategori || "")}` },
      { "@type": "ListItem", position: 4, name: ilan.baslik, item: `${BASE}${ilanUrl}` },
    ],
  };

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb" style={{ fontSize: 13, color: "#888", marginBottom: 20, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <a href="/" style={{ color: "#6c63ff", textDecoration: "none" }}>🏠 Anasayfa</a>
          <span style={{ color: "#ccc" }}>›</span>
          <a href="/kesfet" style={{ color: "#6c63ff", textDecoration: "none" }}>Keşfet</a>
          {ilan.kategori && (
            <>
              <span style={{ color: "#ccc" }}>›</span>
              <a href={`/kategori/${encodeURIComponent(ilan.kategori)}`} style={{ color: "#6c63ff", textDecoration: "none" }}>{ilan.kategori}</a>
            </>
          )}
          <span style={{ color: "#ccc" }}>›</span>
          <span style={{ color: "#555", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ilan.baslik}</span>
        </nav>

        {/* ANA KART */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.07)", marginBottom: 20 }}>

          {/* RESİM */}
          {anaResim && (
            <div style={{ position: "relative", background: "#f1f2f4" }}>
              <img
                src={anaResim}
                alt={ilan.baslik}
                style={{ width: "100%", maxHeight: 460, objectFit: "cover", display: "block" }}
                loading="eager"
              />
              {ilan.takasIstegi && (
                <div style={{
                  position: "absolute", top: 16, left: 16,
                  background: "linear-gradient(135deg,#6c63ff,#5a52d5)",
                  color: "#fff", padding: "6px 14px", borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                }}>
                  🔄 TAKAS KABULEDİLİR
                </div>
              )}
              {resimler.length > 1 && (
                <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: "#fff", overflowX: "auto" }}>
                  {resimler.map((r: string, i: number) => (
                    <img key={i} src={r} alt={`${ilan.baslik} - ${i + 1}`}
                      style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: i === 0 ? "2px solid #6c63ff" : "2px solid #eee" }}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BİLGİLER */}
          <div style={{ padding: "24px 24px" }}>

            {/* Etiketler */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {ilan.kategori && (
                <a href={`/kategori/${encodeURIComponent(ilan.kategori)}`}
                  style={{ background: "#f0efff", color: "#6c63ff", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                  🏷️ {ilan.kategori}
                </a>
              )}
              {sehir && (
                <span style={{ background: "#f3f4f6", color: "#555", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  📍 {sehir}
                </span>
              )}
              {ilan.takasIstegi && (
                <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  🔄 Takas İsteniyor
                </span>
              )}
              <span style={{ background: "#fafafa", color: "#999", padding: "4px 12px", borderRadius: 20, fontSize: 11 }}>
                📅 {new Date(ilan.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#0f2540", marginBottom: 16, lineHeight: 1.3 }}>
              {ilan.baslik}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(28px,5vw,38px)", fontWeight: 900, color: "#0f2540" }}>
                {fiyat} ₺
              </span>
              {ilan.eskiFiyat > 0 && ilan.eskiFiyat !== ilan.fiyat && (
                <span style={{ fontSize: 16, color: "#999", textDecoration: "line-through" }}>
                  {Number(ilan.eskiFiyat).toLocaleString("tr-TR")} ₺
                </span>
              )}
            </div>

            {/* BUTONLAR */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <a href={`${ilanUrl}/takas`} style={{
                flex: 1, minWidth: 140, background: "linear-gradient(135deg,#6c63ff,#5a52d5)",
                color: "#fff", padding: "14px 20px", borderRadius: 14, fontWeight: 800,
                textDecoration: "none", textAlign: "center", fontSize: 15,
                boxShadow: "0 4px 16px rgba(108,99,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                🔄 Takas Teklifi Ver
              </a>
              <a href={`${ilanUrl}/satin-al`} style={{
                flex: 1, minWidth: 140, background: "linear-gradient(135deg,#0f2540,#1e3a5f)",
                color: "#fff", padding: "14px 20px", borderRadius: 14, fontWeight: 800,
                textDecoration: "none", textAlign: "center", fontSize: 15,
                boxShadow: "0 4px 16px rgba(15,37,64,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                🛒 Hemen Satın Al
              </a>
            </div>

            <a href={`/mesajlar?ilan=${ilan._id}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "12px", borderRadius: 12,
              border: "2px solid #e5e7eb", color: "#555",
              fontWeight: 700, textDecoration: "none", fontSize: 14,
              marginBottom: 12, background: "#fafafa",
            }}>
              💬 Satıcıya Mesaj Gönder
            </a>

            {/* İLAN DÜZENLEME — sadece ilan sahibine gösterilmeli, panel üzerinden */}
            <a href={`/panel/ilanlarim/duzenle/${ilan.slug || ilan._id}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "11px", borderRadius: 12,
              border: "2px dashed #c9a84c", color: "#c9a84c",
              fontWeight: 700, textDecoration: "none", fontSize: 13,
              background: "rgba(201,168,76,0.04)",
            }}>
              ✏️ İlanı Düzenle / Güncelle
            </a>
          </div>
        </div>

        {/* AÇIKLAMA */}
        {ilan.aciklama && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 20px rgba(0,0,0,0.05)", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2540", marginBottom: 14, borderBottom: "2px solid #f0efff", paddingBottom: 10 }}>
              📋 İlan Açıklaması
            </h2>
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {ilan.aciklama}
            </p>
          </div>
        )}

        {/* İLAN DETAY TABLOSU */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 24px", boxShadow: "0 2px 20px rgba(0,0,0,0.05)", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f2540", marginBottom: 14 }}>📊 İlan Detayları</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[
                ["Kategori", ilan.kategori || "—"],
                ["Şehir", sehir],
                ["Fiyat", `${fiyat} ₺`],
                ["Takas", ilan.takasIstegi ? "✅ Kabul Edilir" : "❌ Kabul Edilmez"],
                ["İlan Tarihi", new Date(ilan.createdAt).toLocaleDateString("tr-TR")],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 0", color: "#888", fontWeight: 600, width: "40%" }}>{label}</td>
                  <td style={{ padding: "10px 0", color: "#0f2540", fontWeight: 700 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GÜVENLİ ALIŞVERİŞ */}
        <div style={{
          background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
          border: "1px solid #bbf7d0", borderRadius: 20, padding: "20px 24px", marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#166534", marginBottom: 12 }}>🛡️ Güvenli Alışveriş Garantisi</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["✅ %100 Alıcı & Satıcı Koruması", "🔒 Güvenli Ödeme Havuzu", "🔄 Kolay Takas İmkânı", "📞 7/24 Destek Hattı"].map(item => (
              <div key={item} style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>{item}</div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* BENZER İLANLAR */}
        {/* ═══════════════════════════════════════ */}
        {benzerIlanlar.length > 0 && (
          <section style={{ marginTop: 36 }} aria-label="Benzer İlanlar">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f2540", margin: 0 }}>
                🔍 Benzer İlanlar
                <span style={{ fontSize: 13, fontWeight: 600, color: "#888", marginLeft: 8 }}>
                  — {ilan.kategori} kategorisinden
                </span>
              </h2>
              <a href={`/kategori/${encodeURIComponent(ilan.kategori || "")}`}
                style={{ color: "#6c63ff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                Tümünü Gör →
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
              {benzerIlanlar.map((b: any) => {
                const bResim = Array.isArray(b.resimler) ? b.resimler[0] : b.resimler || "";
                const bUrl = `/varlik/${b.slug || b._id}`;
                const bFiyat = Number(b.fiyat || 0).toLocaleString("tr-TR");
                return (
                  <a key={b._id} href={bUrl} style={{ textDecoration: "none", color: "inherit" }} title={b.baslik}>
                    <article style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                      <div style={{ height: 130, background: "#f1f2f4", overflow: "hidden", position: "relative" }}>
                        {bResim ? (
                          <img src={bResim} alt={b.baslik}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 32 }}>📦</div>
                        )}
                        {b.takasIstegi && (
                          <div style={{
                            position: "absolute", top: 8, left: 8,
                            background: "#6c63ff", color: "#fff",
                            padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                          }}>🔄 TAKAS</div>
                        )}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: 11, color: "#999", marginBottom: 4, fontWeight: 600 }}>📍 {b.sehir || "Türkiye"}</p>
                        <h3 style={{
                          fontSize: 13, fontWeight: 700, color: "#0f2540", marginBottom: 6, lineHeight: 1.4,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {b.baslik}
                        </h3>
                        <div style={{ fontSize: 15, fontWeight: 900, color: "#0f2540" }}>{bFiyat} ₺</div>
                      </div>
                    </article>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ALT CTA — SEO + Dönüşüm */}
        <section style={{
          marginTop: 40,
          background: "linear-gradient(135deg,#0f2347,#1e3a5f)",
          borderRadius: 24, padding: "32px 24px", textAlign: "center", color: "#fff",
        }}>
          <h2 style={{ fontSize: "clamp(18px,4vw,26px)", fontWeight: 900, marginBottom: 10 }}>
            🚀 Sen de Ücretsiz İlan Ver!
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 14, marginBottom: 20, maxWidth: 500, margin: "0 auto 20px" }}>
            Türkiye&apos;nin en güvenli takas &amp; satış platformu.
            Ücretsiz üye ol, ücretsiz ilan ver, hemen kazan!
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/kayit" style={{
              background: "linear-gradient(135deg,#c9a84c,#d4a017)", color: "#0f2347",
              padding: "13px 28px", borderRadius: 40, fontWeight: 900, fontSize: 14,
              textDecoration: "none", boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
            }}>
              ⚡ Ücretsiz Üye Ol
            </a>
            <a href="/ilan-ver" style={{
              background: "rgba(255,255,255,.1)", color: "#fff",
              border: "1.5px solid rgba(255,255,255,.25)",
              padding: "13px 28px", borderRadius: 40, fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              📢 İlan Ver
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
