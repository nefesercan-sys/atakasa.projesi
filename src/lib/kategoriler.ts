// Takas kategorileri (tek kaynak). Eski ilanlardaki farklı kategori adları da listelenebilir; yeni ilanlar bunlardan seçer.
export const KATEGORILER: { slug: string; ad: string; emoji: string }[] = [
  { slug: "elektronik", ad: "Elektronik", emoji: "💻" },
  { slug: "ev-yasam", ad: "Ev & Yaşam", emoji: "🏠" },
  { slug: "mobilya", ad: "Mobilya", emoji: "🪑" },
  { slug: "giyim", ad: "Giyim & Aksesuar", emoji: "👕" },
  { slug: "bebek-cocuk", ad: "Bebek & Çocuk", emoji: "🧸" },
  { slug: "kitap-hobi", ad: "Kitap & Hobi", emoji: "📚" },
  { slug: "spor-outdoor", ad: "Spor & Outdoor", emoji: "⚽" },
  { slug: "bahce-yapi", ad: "Bahçe & Yapı Market", emoji: "🌿" },
  { slug: "arac-gerec", ad: "Araç Gereç & Yedek Parça", emoji: "🔧" },
  { slug: "koleksiyon", ad: "Koleksiyon & Antika", emoji: "🏺" },
  { slug: "diger", ad: "Diğer", emoji: "📦" },
];
export const kategoriAdi = (slug?: string | null): string => KATEGORILER.find((k) => k.slug === slug)?.ad ?? (slug || "Diğer");
export const kategoriGecerli = (slug: unknown): slug is string => typeof slug === "string" && KATEGORILER.some((k) => k.slug === slug);
