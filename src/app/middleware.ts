import { NextRequest, NextResponse } from "next/server";

// ─── RATE LİMİT AYARLARI ─────────────────────────────────────────────────────
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  "/api/varlik-ekle":   { limit: 10,  window: 60 * 60 * 1000 },  // saatte 10 ilan
  "/api/auth/":         { limit: 5,   window: 60 * 1000 },        // dakikada 5 giriş
  "/api/takas":         { limit: 20,  window: 60 * 60 * 1000 },   // saatte 20 teklif
  "/api/orders":        { limit: 10,  window: 60 * 60 * 1000 },   // saatte 10 sipariş
  "/api/":              { limit: 60,  window: 60 * 1000 },         // dakikada 60 genel
};

// ─── ZARARLILI BOT LİSTESİ ───────────────────────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nessus/i, /masscan/i, /nmap/i,
  /zgrab/i, /scrapy/i, /semrushbot/i, /ahrefsbot/i,
  /majestic/i, /dotbot/i, /petalbot/i,
  /python-requests\/[01]\./i,
  /go-http-client\/1\.0/i,
];

// ─── BLOKLANMIŞ IP LİSTESİ ───────────────────────────────────────────────────
const BLOCKED_IPS: Set<string> = new Set([
  // Zararlı IP'leri buraya ekle: "1.2.3.4",
]);

// ─── IN-MEMORY RATE LİMİTER ──────────────────────────────────────────────────
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, window: number): boolean {
  const now = Date.now();
  const entry = requestCounts.get(key);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);
  const ua = req.headers.get("user-agent") || "";

  // 1. BLOKLANMIŞ IP
  if (BLOCKED_IPS.has(ip)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. ZARARLILI BOT
  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (pattern.test(ua)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // 3. API RATE LİMİT
  if (pathname.startsWith("/api/")) {
    let matchedRoute = "/api/";
    let matchedConfig = RATE_LIMITS["/api/"];

    for (const route of Object.keys(RATE_LIMITS)) {
      if (pathname.startsWith(route) && route.length > matchedRoute.length) {
        matchedRoute = route;
        matchedConfig = RATE_LIMITS[route];
      }
    }

    const key = `${ip}:${matchedRoute}`;
    if (!checkRateLimit(key, matchedConfig.limit, matchedConfig.window)) {
      return new NextResponse(
        JSON.stringify({ error: "Çok fazla istek. Lütfen bekleyin." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(matchedConfig.window / 1000)),
          },
        }
      );
    }
  }

  // 4. PANEL KORUMASI
  if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) {
    const token =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/giris", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. HTTP → HTTPS
  if (
    process.env.NODE_ENV === "production" &&
    req.headers.get("x-forwarded-proto") === "http"
  ) {
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${pathname}`,
      { status: 301 }
    );
  }

  const response = NextResponse.next();
  response.headers.set(
    "X-Request-ID",
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/panel/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
