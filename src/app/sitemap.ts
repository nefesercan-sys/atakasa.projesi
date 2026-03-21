import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE = "https://atakasa.com";

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
  "kutahya", "mus", "osmaniye", "siirt", "sirnak", "tunceli", "yalova"
];

const KATEGORILER = [
  "elektronik", "emlak", "arac", "mobilya",
  "giyim", "spor", "antika", "oyuncak", "kitap", "diger"
];

const STATIK_SAYFALAR: MetadataRoute.Sitemap = [
  { url: BASE,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/kesfet`,   lastModified: new Date(), changeFrequency: "hourly",  priority: 0.95 },
  { url: `${BASE}/ilan-ver`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/sss`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },

  { url: `${BASE}/kategori/takas`,      lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/kategori/ikinci-el`,  lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/kategori/elektronik`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: `${BASE}/kategori/moda`,       lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/kategori/hizmet`,     lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/kategori/kiralama`,   lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/kategori/antika`,     lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/sanat`,      lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/petshop`,    lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/kitap`,      lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/egitim`,     lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/oyuncak`,    lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/kategori/dogal`,      lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/kategori/bakim`,      lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/kategori/bagis`,      lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${BASE}/kategori/rezervasyon`,lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ✅ Şehir × Kategori sayfaları — 74 şehir × 10 kategori = 740 sayfa
  const sehirKategoriSayfalar: MetadataRoute.Sitemap = [];
  for (const sehir of SEHIRLER) {
    for (const kat of KATEGORILER) {
      sehirKategoriSayfalar.push({
        url: `${BASE}/sehir/${sehir}/${kat}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.75,
      });
    }
  }

  // ✅ Slug bazlı ilan sayfaları
  let varlikPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE}/api/varliklar/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const varliklar = await res.json();
      const liste = Array.isArray(varliklar) ? varliklar : [];
      varlikPages = liste
        .filter((v: any) => v.slug)
        .map((v: any) => ({
          url: `${BASE}/varlik/${v.slug}`,
          lastModified: new Date(v.updatedAt || v.createdAt),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch {}

  return [
    ...STATIK_SAYFALAR,
    ...sehirKategoriSayfalar,
    ...varlikPages,
  ];
}
