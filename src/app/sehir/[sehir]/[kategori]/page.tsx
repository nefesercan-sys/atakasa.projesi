import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const SEHIRLER = [
  "istanbul", "ankara", "izmir", "bursa", "antalya", "adana", "konya",
  "gaziantep", "mersin", "kayseri", "eskisehir", "trabzon", "samsun",
  "denizli", "balikesir", "malatya", "kahramanmaras", "erzurum", "van",
  "diyarbakir", "sanliurfa", "manisa", "aydin", "tekirdag", "sakarya",
  "kocaeli", "hatay", "mugla", "mardin", "afyonkarahisar",
  "isparta", "bolu", "canakkale", "edirne", "kirklareli", "kirikkale",
  "nevsehir", "nigde", "ordu", "rize", "sinop", "tokat", "usak", "yozgat",
  "zonguldak", "agri", "aksaray", "amasya", "ardahan", "artvin", "bartin",
  "batman", "bayburt", "bilecik", "bingol", "bitlis", "burdur", "corum",
  "duzce", "elazig", "erzincan", "giresun", "gumushane", "hakkari",
  "igdir", "karabuk", "karaman", "kars", "kastamonu", "kilis",
  "kutahya", "mugla", "mus", "osmaniye", "siirt", "sirnak",
  "tunceli", "yalova"
];

const KATEGORILER = [
  { slug: "elektronik", ad: "Elektronik", emoji: "💻" },
  { slug: "emlak", ad: "Emlak", emoji: "🏠" },
  { slug: "arac", ad: "Araç", emoji: "🚗" },
  { slug: "mobilya", ad: "Mobilya", emoji: "🪑" },
  { slug: "giyim", ad: "Giyim", emoji: "👕" },
  { slug: "spor", ad: "Spor", emoji: "⚽" },
  { slug: "antika", ad: "Antika", emoji: "🏺" },
  { slug: "oyuncak", ad: "Oyuncak", emoji: "🧸" },
  { slug: "kitap", ad: "Kitap", emoji: "📚" },
  { slug: "diger", ad: "Diğer", emoji: "📦" },
];

export async function generateStaticParams() {
  const params = [];
  for (const sehir of SEHIRLER) {
    for (const kat of KATEGORILER) {
      params.push({ sehir, kategori: kat.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { sehir: string; kategori: string };
}): Promise<Metadata> {
  const sehirAd = params.sehir.charAt(0).toUpperCase() + params.sehir.slice(1);
  const kat = KATEGORILER.find(k => k.slug === params.kategori);
  if (!kat) return {};
  return {
    title: `${sehirAd} ${kat.ad} İlanları — Sat, Takas Et | A-TAKASA`,
    description: `${sehirAd}'da ${kat.ad} kategorisinde satılık ve takaslanabilir ilanlar. Ücretsiz ilan ver, hemen takas et veya sat.`,
    alternates: {
      canonical: `https://atakasa.com/sehir/${params.sehir}/${params.kategori}`,
    },
    openGraph: {
      title: `${sehirAd} ${kat.ad} İlanları | A-TAKASA`,
      description: `${sehirAd}'da ${kat.ad} ilanları — sat veya takas et`,
      url: `https://atakasa.com/sehir/${params.sehir}/${params.kategori}`,
    },
  };
}

export default async function SehirKategoriPage({
  params,
}: {
  params: { sehir: string; kategori: string };
}) {
  const kat = KATEGORILER.find(k => k.slug === params.kategori);
  if (!kat || !SEHIRLER.includes(params.sehir)) notFound();

  const sehirAd = params.sehir.charAt(0).toUpperCase() + params.sehir.slice(1);

  await connectMongoDB();

  const [ilanlar, toplamIlan, takaslikSayisi] = await Promise.all([
    Varlik.find({
      $or: [
        { sehir: { $regex: params.sehir, $options: "i" } },
        { sehir: { $regex: sehirAd, $options: "i" } },
      ],
      kategori: { $regex: kat.ad, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(24)
      .select("baslik fiyat eskiFiyat kategori sehir resimler takasIstegi createdAt")
      .lean(),

    Varlik.countDocuments({
      $or: [{ sehir: { $regex: params.sehir, $options: "i" } }],
      kategori: { $regex: kat.ad, $options: "i" },
    }),

    Varlik.countDocuments({
      $or: [{ sehir: { $regex: params.sehir, $options: "i" } }],
      kategori: { $regex: kat.ad, $options: "i" },
      takasIstegi: true,
    }),
  ]);

  const ilanlarSerialized = JSON.parse(JSON.stringify(ilanlar));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${sehirAd} ${kat.ad} İlanları`,
    "description": `${sehirAd}'da ${kat.ad} satılık ve takaslanabilir ilanlar`,
    "url": `https://atakasa.com/sehir/${params.sehir}/${params.kategori}`,
    "numberOfItems": toplamIlan,
    "itemListElement": ilanlarSerialized.slice(0, 10).map((ilan: any, idx: number) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": ilan.baslik,
      "url": `https://atakasa.com/varlik/${ilan._id}`,
    })),
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n || 0);

  const getImg = (ilan: any) => {
    const url = Array.isArray(ilan.resimler) ? ilan.resimler[0] : ilan.resimler;
    if (!url) return null;
    if (url.includes("res.cloudinary.com"))
      return url.replace("/upload/", "/upload/f_auto,q_auto:eco,w_400,h_200,c_fill/");
    return url;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <style>{`
        .at-page { max-width: 1200px; margin: 0 auto; padding: 24px; padding-bottom: 100px; }
        .at-hero { background: linear-gradient(135deg, #0f2540, #1e3a8a); border-radius: 20px; padding: 40px; margin-bottom: 32px; color: #fff; }
        .at-badge { background: rgba(201,168,76,.2); border: 1px solid rgba(201,168,76,.4); color: #c9a84c; padding: 6px 14px; border-radius: 99px; font-size: .75rem; font-weight: 700; display: inline-block; margin-bottom: 16px; }
        .at-title { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 900; margin-bottom: 12px; line-height: 1.2; }
        .at-title span { color: #c9a84c; }
        .at-sub { color: rgba(255,255,255,.75); font-size: .95rem; line-height: 1.7; margin-bottom: 24px; }
        .at-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
        .at-stat { background: rgba(255,255,255,.1); border-radius: 12px; padding: 12px 20px; text-align: center; min-width: 100px; }
        .at-stat-v { font-size: 1.4rem; font-weight: 900; color: #c9a84c; }
        .at-stat-l { font-size: .65rem; color: rgba(255,255,255,.6); font-weight: 600; text-transform: uppercase; margin-top: 2px; }
        .at-cta { display: flex; gap: 10px; flex-wrap: wrap; }
        .at-btn { padding: 11px 22px; border-radius: 12px; border: none; font-weight: 700; font-size: .88rem; cursor: pointer; font-family: inherit; text-decoration: none; display: inline-block; }
        .at-btn-primary { background: #c9a84c; color: #0f2540; }
        .at-btn-outline { background: rgba(255,255,255,.1); color: #fff; border: 1px solid rgba(255,255,255,.2); }
        .at-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .at-kart { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; transition: .2s; text-decoration: none; display: block; }
        .at-kart:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.12); border-color: #c9a84c; }
        .at-kart-img { height: 180px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; overflow: hidden; position: relative; }
        .at-kart-img img { width: 100%; height: 100%; object-fit: cover; }
        .at-takas { position: absolute; top: 8px; right: 8px; background: #c9a84c; color: #0f2540; font-size: .6rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
        .at-kart-body { padding: 14px; }
        .at-kart-kat { font-size: .65rem; font-weight: 800; color: #c9a84c; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
        .at-kart-title { font-weight: 800; font-size: .92rem; color: #0f172a; margin-bottom: 8px; line-height: 1.3; }
        .at-kart-meta { font-size: .7rem; color: #94a3b8; font-weight: 600; margin-bottom: 10px; }
        .at-kart-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #e2e8f0; }
        .at-kart-price { font-weight: 900; color: #0f2540; font-size: .95rem; }
        .at-kart-btn { background: #0f2540; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-size: .7rem; font-weight: 700; cursor: pointer; }
        .at-seo { background: #f8fafc; border-radius: 16px; padding: 28px; margin-bottom: 32px; }
        .at-seo h2 { font-size: 1.2rem; font-weight: 800; color: #0f2540; margin-bottom: 14px; }
        .at-seo p { color: #475569; line-height: 1.8; margin-bottom: 10px; font-size: .92rem; }
        .at-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .at-link { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 7px 14px; font-size: .78rem; font-weight: 700; color: #475569; text-decoration: none; transition: .18s; }
        .at-link:hover { border-color: #c9a84c; color: #0f2540; }
        .at-empty { text-align: center; padding: 60px 20px; background: #fff; border-radius: 20px; border: 2px dashed #e2e8f0; }
        @media (max-width: 640px) {
          .at-page { padding: 16px 16px 100px; }
          .at-hero { padding: 20px; }
          .at-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
      `}</style>

      <div className="at-page">
        {/* HERO */}
        <div className="at-hero">
          <div className="at-badge">{kat.emoji} {sehirAd} · {kat.ad}</div>
          <h1 className="at-title">
            {sehirAd}'da <span>{kat.ad}</span> İlanları
          </h1>
          <p className="at-sub">
            {sehirAd}'da {kat.ad} kategorisinde satılık ve takaslanabilir ilanlar.
            Ücretsiz ilan ver, hemen takas et veya sat!
          </p>
          <div className="at-stats">
            <div className="at-stat">
              <div className="at-stat-v">{toplamIlan}</div>
              <div className="at-stat-l">Toplam İlan</div>
            </div>
            <div className="at-stat">
              <div className="at-stat-v">{takaslikSayisi}</div>
              <div className="at-stat-l">Takaslık</div>
            </div>
            <div className="at-stat">
              <div className="at-stat-v">{toplamIlan - takaslikSayisi}</div>
              <div className="at-stat-l">Satılık</div>
            </div>
          </div>
          <div className="at-cta">
            <a href="/ilan-ver" className="at-btn at-btn-primary">
              ⚡ İlan Ver
            </a>
            <a href={`/kategori/${params.kategori}`} className="at-btn at-btn-outline">
              🔍 Tüm {kat.ad} İlanları
            </a>
          </div>
        </div>

        {/* İLANLAR */}
        {ilanlarSerialized.length > 0 ? (
          <div className="at-grid">
            {ilanlarSerialized.map((ilan: any, idx: number) => {
              const img = getImg(ilan);
              return (
                <a key={ilan._id} href={`/varlik/${ilan._id}`} className="at-kart">
                  <div className="at-kart-img">
                    {img ? (
                      <img
                        src={img}
                        alt={ilan.baslik}
                        loading={idx < 6 ? "eager" : "lazy"}
                        width={400}
                        height={200}
                      />
                    ) : (
                      <span>{kat.emoji}</span>
                    )}
                    {ilan.takasIstegi && <div className="at-takas">🔄 TAKAS</div>}
                  </div>
                  <div className="at-kart-body">
                    <div className="at-kart-kat">{ilan.kategori || kat.ad}</div>
                    <div className="at-kart-title">{ilan.baslik}</div>
                    <div className="at-kart-meta">
                      📍 {ilan.sehir || sehirAd} · 📅 {new Date(ilan.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                    <div className="at-kart-foot">
                      <div className="at-kart-price">
                        {Number(ilan.fiyat) > 0 ? `${fmt(ilan.fiyat)} ₺` : "Fiyat Sor"}
                      </div>
                      <button className="at-kart-btn">İncele →</button>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="at-empty">
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>{kat.emoji}</div>
            <h2 style={{ fontWeight: 800, color: "#0f2540", marginBottom: 8 }}>
              Henüz ilan yok
            </h2>
            <p style={{ color: "#475569", marginBottom: 20 }}>
              {sehirAd}'da {kat.ad} kategorisinde ilk ilanı siz verin!
            </p>
            <a href="/ilan-ver"
              style={{ background: "#c9a84c", color: "#0f2540", padding: "12px 28px", borderRadius: 12, fontWeight: 800, textDecoration: "none" }}>
              ⚡ İlan Ver
            </a>
          </div>
        )}

        {/* SEO BLOĞU */}
        <div className="at-seo">
          <h2>{sehirAd} {kat.ad} Piyasası Hakkında</h2>
          <p>
            {sehirAd}, Türkiye'nin en aktif takas ve ikinci el pazarlarından birine sahiptir.
            {kat.ad} kategorisinde yüzlerce ilan A-TAKASA üzerinden alıcı ve satıcılarla buluşmaktadır.
          </p>
          <p>
            {sehirAd}'da {kat.ad} almak, satmak veya takas etmek istiyorsanız
            A-TAKASA'da ücretsiz ilan verebilir, anında teklif alabilirsiniz.
            Türkiye genelinde 81 ilde güvenli takas imkânı sunuyoruz.
          </p>

          <h2 style={{ marginTop: 24 }}>Diğer Şehirlerde {kat.ad} İlanları</h2>
          <div className="at-links">
            {SEHIRLER.filter(s => s !== params.sehir).slice(0, 12).map(s => (
              <a key={s} href={`/sehir/${s}/${params.kategori}`} className="at-link">
                📍 {s.charAt(0).toUpperCase() + s.slice(1)} {kat.ad}
              </a>
            ))}
          </div>

          <h2 style={{ marginTop: 24 }}>{sehirAd}'da Diğer Kategoriler</h2>
          <div className="at-links">
            {KATEGORILER.filter(k => k.slug !== params.kategori).map(k => (
              <a key={k.slug} href={`/sehir/${params.sehir}/${k.slug}`} className="at-link">
                {k.emoji} {k.ad}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
 
