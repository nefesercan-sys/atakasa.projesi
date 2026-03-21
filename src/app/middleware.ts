import { NextRequest, NextResponse } from "next/server";

const IS_OBJECTID = /^[0-9a-f]{24}$/i;
const BASE = "https://atakasa.com";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /varlik/:id (UUID) → /varlik/:slug
  if (pathname.startsWith("/varlik/")) {
    const segment = pathname.split("/")[2];

    if (segment && IS_OBJECTID.test(segment)) {
      try {
        const res = await fetch(`${BASE}/api/varliklar/slug/${segment}`);
        if (res.ok) {
          const { slug } = await res.json();
          if (slug) {
            return NextResponse.redirect(
              new URL(`/varlik/${slug}`, request.url),
              { status: 301 }
            );
          }
        }
      } catch {}
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/varlik/:path*"],
};
