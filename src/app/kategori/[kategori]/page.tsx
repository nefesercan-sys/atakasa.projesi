import { Metadata } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

const BASE = "https://www.atakasa.com";

// ✅ Slug → DB'deki gerçek kategori adı eşleme tablosu
const KATEGORI_MAP: Record<string, { ad: string; emoji: string; aciklama: string; dbQuery: string | string[] }> = {
  "Elektronik":           { ad: "Elektronik",          emoji: "💻", aciklama: "Telefon, bilgisayar, tablet ve tüm elektronik ürünler", dbQuery: "Elektronik" },
  "Elektronik-Telefon":   { ad: "Telefon",             emoji: "📱", aciklama: "İkinci el ve sıfır telefon ilanları, takas fırsatları", dbQuery: ["Elektronik - Telefon", "Elektronik-Telefon", "Telefon"] },
  "Elektronik-Bilgisayar":{ ad: "Bilgisayar",          emoji: "💻", aciklama: "Laptop, masaüstü ve bilgisayar ilanları",              dbQuery: ["Elektronik - Bilgisayar", "Bilgisayar"] },
  "Elektronik-Tablet":    { ad: "Tablet",              emoji: "📟", aciklama: "iPad, Samsung Tab ve tüm tablet ilanları",             dbQuery: ["Elektronik - Tablet", "Tablet"] },
  "Elektronik-TV-Monitor":{ ad: "TV & Monitör",        emoji: "📺", aciklama: "Televizyon ve monitör ilanları",                       dbQuery: ["Elektronik - TV & Monitör", "TV", "Monitör"] },
  "Elektronik-Konsol":    { ad: "Oyun Konsolu",        emoji: "🎮", aciklama: "PlayStation, Xbox, Nintendo ilanları",                 dbQuery: ["Elektronik - Oyun Konsolu", "Oyun Konsolu"] },
  "Elektronik-Kamera":    { ad: "Kamera",              emoji: "📷", aciklama: "Fotoğraf makinesi ve kamera ilanları",                 dbQuery: ["Elektronik - Kamera", "Kamera"] },
  "Arac":                 { ad: "Araç",                emoji: "🚗", aciklama: "Sıfır ve ikinci el araç ilanları, takas fırsatları",   dbQuery: "Araç" },
  "Arac-Otomobil":        { ad: "Otomobil",            emoji: "🚗", aciklama: "Satılık ve takaslık otomobil ilanları",               dbQuery: ["Araç - Otomobil", "Otomobil"] },
  "Arac-Motosiklet":      { ad: "Motosiklet",          emoji: "🏍️", aciklama: "Motosiklet ve scooter ilanları",                      dbQuery: ["Araç - Motosiklet", "Motosiklet"] },
  "Arac-SUV":             { ad: "SUV & Crossover",     emoji: "🚙", aciklama: "SUV ve crossover araç ilanları",                      dbQuery: ["Araç - SUV & Crossover", "SUV"] },
  "Arac-Ticari":          { ad: "Ticari Araç",         emoji: "🚐", aciklama: "Kamyonet, minibüs ve ticari araç ilanları",           dbQuery: ["Araç - Ticari Araç", "Ticari Araç"] },
  "Emlak":                { ad: "Emlak",               emoji: "🏠", aciklama: "Satılık ve kiralık konut, arsa, iş yeri ilanları",    dbQuery: "Emlak" },
  "Emlak-Satilik-Konut":  { ad: "Satılık Konut",       emoji: "🏠", aciklama: "Satılık daire, villa ve ev ilanları",                 dbQuery: ["Emlak - Satılık Konut", "Satılık Konut"] },
  "Emlak-Kiralik-Konut":  { ad: "Kiralık Konut",       emoji: "🔑", aciklama: "Kiralık daire ve ev ilanları",                        dbQuery: ["Emlak - Kiralık Konut", "Kiralık Konut"] },
  "Emlak-Isyeri":         { ad: "İşyeri",              emoji: "🏢", aciklama: "Satılık ve kiralık işyeri ilanları",                  dbQuery: ["Emlak - Satılık İşyeri", "İşyeri"] },
  "Emlak-Arsa":           { ad: "Arsa & Tarla",        emoji: "🌍", aciklama: "Satılık arsa ve tarla ilanları",                      dbQuery: ["Emlak - Arsa & Tarla", "Arsa"] },
  "Emlak-Villa":          { ad: "Villa",               emoji: "🏡", aciklama: "Satılık villa ilanları",                              dbQuery: ["Emlak - Villa", "Villa"] },
  "Mobilya":              { ad: "Mobilya",             emoji: "🪑", aciklama: "Ev ve ofis mobilyaları, dekorasyon ürünleri",         dbQuery: "Mobilya" },
  "Oyun-Konsol":          { ad: "Oyun/Konsol",         emoji: "🎮", aciklama: "PlayStation, Xbox, Nintendo ve oyun ilanları",        dbQuery: ["Oyun/Konsol", "Oyun - Konsol", "Konsol"] },
  "Antika":               { ad: "Antika Eserler",      emoji: "🏺", aciklama: "Antika, koleksiyon ve sanat eserleri",                dbQuery: ["Antika Eserler", "Antika"] },
  "Tekstil":              { ad: "Tekstil",             emoji: "👕", aciklama: "Giyim, ayakkabı, çanta ve aksesuar ilanları",        dbQuery: "Tekstil" },
  "Kitap":                { ad: "Kitap",               emoji: "📚", aciklama: "İkinci el kitap, dergi ve eğitim materyali ilanları", dbQuery: "Kitap" },
  "Kozmetik":             { ad: "Kozmetik",            emoji: "💄", aciklama: "Kozmetik, parfüm ve kişisel bakım ürünleri",          dbQuery: "Kozmetik" },
  "Petshop":              { ad: "Petshop",             emoji: "🐾", aciklama: "Evcil hayvan ve malzemeleri ilanları",                dbQuery: "Petshop" },
  "Makine":               { ad: "Makine",              emoji: "⚙️", aciklama: "Tarım, inşaat ve endüstriyel makine ilanları",        dbQuery: "Makine" },
  "El-Sanatlari":         { ad: "El Sanatları",        emoji: "🎨", aciklama: "El yapımı ürün ve sanat eseri ilanları",              dbQuery: ["El Sanatları", "El Sanatı"] },
  "Dogal-Urunler":        { ad: "Doğal Ürünler",       emoji: "🌿", aciklama: "Bal, zeytinyağı ve organik ürün ilanları",            dbQuery: ["Doğal Ürünler", "Doğal"] },
  "Oyuncak":              { ad: "Oyuncak",             emoji: "🧸", aciklama: "Çocuk oyuncak ve oyun seti ilanları",                 dbQuery: "Oyuncak" },
  "Kirtasiye":            { ad: "Kırtasiye",           emoji: "📎", aciklama: "Okul ve ofis kırtasiye malzemeleri",                 dbQuery: ["Kırtasiye", "Kirtasiye"] },
  "Ikinci-El":            { ad: "2. El",               emoji: "♻️", aciklama: "Her kategoride ikinci el ürün ilanları",              dbQuery: ["2. El", "İkinci El"] },
  "Sifir-Urunler":        { ad: "Sıfır Ürünler",       emoji: "✨", aciklama: "Sıfır ve açılmamış ürün ilanları",                   dbQuery: ["Sıfır Ürünler", "Sıfır"] },
};

export async function generateMetadata({
  params,
}: { params: Promise<{ kategori: string }> }): Promise<Metadata> {
  const { kategori } = await params;
  const meta = KATEGORI_MAP[kategori];

  if (!meta) {
    return { title: "Kategori Bulunamadı | A-Takasa" };
  }

  const title = `${meta.emoji} ${meta.ad} İlanları — Ücretsiz Takas & Satış | A-Takasa`;
  const desc = `${meta.ad} ilanları: ${meta.aciklama}. Türkiye genelinde binlerce ilan, takas ve satış fırsatı. Ücretsiz ilan ver, hemen kazan — A-Takasa.`;

  return {
    title,
    description: desc,
    keywords: [
      meta.ad, `${meta.ad} ilanları`, `${meta.ad} satılık`,
      `${meta.ad} takas`, `ikinci el ${meta.ad}`, `ucuz ${meta.ad}`,
      "atakasa", "ücretsiz ilan", "takas sitesi",
    ],
    alternates: { canonical: `${BASE}/kategori/${kategori}` },
    openGraph: {
      title, description: desc,
      url: `${BASE}/kategori/${kategori}`,
      type: "website", locale: "tr_TR", siteName: "A-Takasa",
    },
    robots: { index: true, follow: true },
  };
}

export default async function KategoriSayfasi({
  params,
}: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params;
  const meta = KATEGORI_MAP[kategori];

  // Bilinmeyen kategori
  if (!meta) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f2540" }}>Kategori Bulunamadı</h1>
        <a href="/" style={{ color: "#6c63ff", fontWeight: 700 }}>Ana Sayfaya Dön</a>
      </div>
    );
  }

  let ilanlar: any[] = [];
  let toplamIlan = 0;

  try {
    await connectMongoDB();

    // ✅ dbQuery string veya string[] olabilir
    const dbQuery = Array.isArray(meta.dbQuery)
      ? { kategori: { $in: meta.dbQuery } }
      : { kategori: { $regex: new RegExp(`^${meta.dbQuery}`, "i") } };

    toplamIlan = await Varlik.countDocuments(dbQuery);

    const raw = await Varlik.find(dbQuery)
      .sort({ createdAt: -1 })
      .limit(24)
      .select("baslik fiyat sehir resimler takasIstegi slug _id createdAt")
      .lean();

    ilanlar = raw.map((i: any) => ({ ...i, _id: i._id.toString() }));
  } catch (err) {
    console.error("Kategori sayfası hata:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${meta.ad} İlanları`,
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
      <section style={{ background: "linear-gradient(135deg,#0f2347,#1e3a5f)", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <nav style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 16, display: "flex", gap: 6 }}>
            <a href="/" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Anasayfa</a>
            <span>›</span>
            <span style={{ color: "#c9a84c" }}>{meta.ad}</span>
          </nav>
          <h1 style={{ color: "#fff", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginBottom: 10 }}>
            {meta.emoji} {meta.ad} İlanları
          </h1>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, marginBottom: 20 }}>
            {meta.aciklama} — <strong style={{ color: "#c9a84c" }}>{toplamIlan}</strong> ilan bulundu
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/ilan-ver" style={{
              background: "linear-gradient(135deg,#c9a84c,#d4a017)", color: "#0f2347",
              padding: "10px 22px", borderRadius: 30, fontWeight: 800, fontSize: 13, textDecoration: "none",
            }}>
              ⚡ {meta.ad} İlanı Ver
            </a>
            <a href="/takas" style={{
              background: "rgba(255,255,255,.1)", color: "#fff",
              border: "1px solid rgba(255,255,255,.2)",
              padding: "10px 22px", borderRadius: 30, fontWeight: 700, fontSize: 13, textDecoration: "none",
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
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>
                          {meta.emoji}
                        </div>
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

        {/* SEO Metin */}
        <section style={{ marginTop: 40, background: "#fff", borderRadius: 20, padding: "28px 24px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2540", marginBottom: 16 }}>
            {meta.emoji} {meta.ad} İlanlarında A-Takasa Farkı
          </h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 12 }}>
            A-Takasa&apos;da <strong>{meta.ad}</strong> kategorisinde binlerce ilan bulunuyor.
            Türkiye genelinde satıcılar ve alıcılar A-Takasa güvencesiyle buluşuyor.
            <strong> Ücretsiz ilan ver</strong>, istediğin ürünü <strong>takas et</strong> ya da hemen sat.
          </p>
          <ul style={{ fontSize: 14, color: "#555", lineHeight: 2, paddingLeft: 20 }}>
            <li>✅ %100 güvenli ödeme havuzu</li>
            <li>🔄 Kolay takas imkânı</li>
            <li>📢 Ücretsiz ilan verme</li>
            <li>🛡️ Alıcı &amp; satıcı koruması</li>
            <li>📞 7/24 destek</li>
          </ul>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <a href="/kayit" style={{ background: "#6c63ff", color: "#fff", padding: "11px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>
              Ücretsiz Üye Ol
            </a>
            <a href="/ilan-ver" style={{ background: "#f0efff", color: "#6c63ff", padding: "11px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 14 }}>
              {meta.ad} İlanı Ver
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
