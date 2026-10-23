export const KATEGORILER = [
  { slug: "elektronik", ad: "Elektronik", emoji: "📱" },
  { slug: "ev-yasam", ad: "Ev & Yaşam", emoji: "🏠" },
  { slug: "mobilya", ad: "Mobilya", emoji: "🛋️" },
  { slug: "giyim", ad: "Giyim & Aksesuar", emoji: "👕" },
  { slug: "bebek-cocuk", ad: "Bebek & Çocuk", emoji: "🧸" },
  { slug: "spor-outdoor", ad: "Spor & Outdoor", emoji: "🚴" },
  { slug: "kitap-hobi", ad: "Kitap & Hobi", emoji: "📚" },
  { slug: "arac-yedek-parca", ad: "Araç & Yedek Parça", emoji: "🚗" },
  { slug: "bahce-yapi", ad: "Bahçe & Yapı Market", emoji: "🌿" },
  { slug: "oyun-konsol", ad: "Oyun & Konsol", emoji: "🎮" },
  { slug: "diger", ad: "Diğer", emoji: "📦" },
] as const;

export type KategoriSlug = (typeof KATEGORILER)[number]["slug"];
export const kategoriBul = (slug?: string) => KATEGORILER.find((k) => k.slug === slug);
export const KATEGORI_SLUGLARI: string[] = KATEGORILER.map((k) => k.slug);
