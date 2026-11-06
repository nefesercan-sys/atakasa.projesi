import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SP_LANGS, spPath } from "@/lib/sineklik-panjur";

// Site yalnızca Likya Home sineklik ve panjur sayfalarından oluşur (10 dil). "/" kalıcı olarak /sineklik-panjur/tr adresine yönlenir.
export default function sitemap(): MetadataRoute.Sitemap {
  return SP_LANGS.map((l: string) => ({
    url: `${SITE_URL}${spPath(l)}`,
    changeFrequency: "monthly" as const,
    priority: l === "tr" ? 1 : 0.8,
  }));
}
