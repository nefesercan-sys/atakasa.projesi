// NOT: Next.js'te middleware dosyası src/middleware.ts olmalıdır (eski sürüm src/app/ içindeydi ve hiç çalışmıyordu).
// Serverless ortamda bellek içi sayaç her örnekte ayrıdır: bu koruma "kaba" bir frenidir, kesin sınır değildir.
import { NextRequest, NextResponse } from "next/server";

const SALDIRGAN_UA = [/sqlmap/i, /nikto/i, /nessus/i, /masscan/i, /nmap/i, /zgrab/i];
const sayac = new Map<string, { n: number; bitis: number }>();

function izin(anahtar: string, limit: number, pencereMs: number): boolean {
  const simdi = Date.now();
  if (sayac.size > 5000) for (const [k, v] of sayac) if (v.bitis < simdi) sayac.delete(k);
  const e = sayac.get(anahtar);
  if (!e || e.bitis < simdi) { sayac.set(anahtar, { n: 1, bitis: simdi + pencereMs }); return true; }
  e.n += 1;
  return e.n <= limit;
}

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (SALDIRGAN_UA.some((r) => r.test(ua))) return new NextResponse("Forbidden", { status: 403 });

  const yol = req.nextUrl.pathname;
  if (yol.startsWith("/api/") && req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "bilinmiyor";
    const kimlikIslemi = yol.startsWith("/api/auth") || yol === "/api/kayit";
    const [limit, pencere] = kimlikIslemi ? [10, 60_000] : [60, 60_000];
    if (!izin(`${ip}:${kimlikIslemi ? "k" : "g"}`, limit, pencere)) {
      return NextResponse.json({ error: "Çok fazla istek. Biraz bekleyin." }, { status: 429 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
