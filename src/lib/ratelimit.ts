// Basit bellek içi hız sınırı. Sunucusuz ortamda her örnek kendi sayacını tutar;
// yine de tek istemcinin art arda kötüye kullanımını ciddi biçimde yavaşlatır.
const sayac = new Map<string, { n: number; son: number }>();

export function hizSiniri(anahtar: string, limit: number, pencereMs: number): boolean {
  const simdi = Date.now();
  if (sayac.size > 5000) for (const [k, v] of sayac) if (simdi > v.son) sayac.delete(k);
  const k = sayac.get(anahtar);
  if (!k || simdi > k.son) {
    sayac.set(anahtar, { n: 1, son: simdi + pencereMs });
    return true;
  }
  if (k.n >= limit) return false;
  k.n++;
  return true;
}

export function istemciIp(req: Request): string {
  const h = req.headers;
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "bilinmiyor";
}
