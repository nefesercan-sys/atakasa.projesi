import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE = "https://atakasa.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/sitemap-statik.xml`,   lastModified: new Date() },
    { url: `${BASE}/sitemap-sehir.xml`,    lastModified: new Date() },
    { url: `${BASE}/sitemap-ilce.xml`,     lastModified: new Date() },
    { url: `${BASE}/sitemap-ilanlar.xml`,  lastModified: new Date() },
  ];
}
