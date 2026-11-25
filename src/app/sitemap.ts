import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SP_LANGS, spPath } from "@/lib/sineklik-panjur";
import { KONU_IDS } from "@/lib/likya-konular";
import { lastMod } from "@/lib/lastmod";

// Site yalnızca Likya Home sineklik ve panjur sayfalarından oluşur (10 dil ana sayfa + 8 ürün/bölge sayfası × 10 dil). "/" kalıcı olarak /sineklik-panjur/tr adresine yönlenir.
export default function sitemap(): MetadataRoute.Sitemap {
  // Her sayfa, 10 dildeki karşılıklarını hreflang olarak taşır.
  const alt = (yol: (l: string) => string) => ({ languages: Object.fromEntries(SP_LANGS.map((l: string) => [l, `${SITE_URL}${yol(l)}`])) });
  const ana = SP_LANGS.map((l: string) => ({
    url: `${SITE_URL}${spPath(l)}`,
    changeFrequency: "monthly" as const,
    priority: l === "tr" ? 1 : 0.8,
    alternates: alt(spPath),
  }));
  // Ürün ve bölge sayfaları: /sineklik-panjur/<dil>/<konu>
  const konular = KONU_IDS.flatMap((k: string) =>
    SP_LANGS.map((l: string) => ({
      url: `${SITE_URL}${spPath(l)}/${k}`,
      changeFrequency: "monthly" as const,
      priority: l === "tr" ? 0.9 : 0.7,
      alternates: alt((x: string) => `${spPath(x)}/${k}`),
    })),
  );
  // Gerçek içerik tarihi (src/lib/lastmod.json); kaydı olmayan sayfada lastmod verilmez
  return [...ana, ...konular].map((e) => { const d = lastMod(e.url); return d ? { ...e, lastModified: d } : e; });
}
