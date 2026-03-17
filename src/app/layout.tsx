// src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// ✅ display: "optional" — font flash yok, CLS 0 kalır
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "optional",
  preload: true,
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "optional",
  preload: true,
});

export const metadata: Metadata = {
  title: "A-TAKASA | Küresel B2B Barter ve Takas Platformu",
  description:
    "Türkiye'nin en güvenli takas ve barter platformu. Elektronik, emlak, araç ve daha fazlasını takas edin.",
  keywords: "takas, barter, ikinci el, borsa, güvenli alışveriş, atakasa",
  authors: [{ name: "Atakasa" }],
  openGraph: {
    title: "A-TAKASA | Küresel B2B Barter ve Takas Platformu",
    description: "Türkiye'nin en güvenli takas ve barter platformu.",
    url: "https://atakasa.com",
    siteName: "A-TAKASA",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A-TAKASA | Küresel B2B Barter ve Takas Platformu",
    description: "Türkiye'nin en güvenli takas ve barter platformu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://atakasa.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="tr"
      className={`${dmSans.variable} ${playfairDisplay.variable}`}
    >
      <head>
        {/* ✅ CDN preconnect — görsel istekleri önceden başlar */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* ✅ Viewport — mobil render için */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ✅ Theme color */}
        <meta name="theme-color" content="#0f2540" />

        {/* ✅ YENİ: LCP görselini önceden yükle (Cloudinary ana görsel) */}
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/atakasa/image/upload/f_auto,q_auto,w_828/hero.jpg"
          type="image/webp"
        />
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 📄 `.browserslistrc` — YENİ OLUŞTUR (kök dizinde)

Bu dosya eski JavaScript sorununu çözer — 12 KiB tasarruf:
```
# .browserslistrc
# Kök dizine oluştur (package.json ile aynı klasör)

last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not IE 11
not dead
