import { authOptions } from "@/lib/authOptions";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import BottomNav from "@/components/BottomNav";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import "./globals.css";

const dSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",   // ← FOIT önler, LCP'yi hızlandırır
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atakasa.com"),
  title: {
    default: "A-TAKASA – İlan Ver, İster Et | Güvenli İkinci El Platformu",
    template: "%s | A-TAKASA",
  },
  description:
    "Türkiye'nin en güvenli takas ve ikinci el satış platformu. İster ve ikinci el her ürün – elektronik, araç, emlak, mobilya. 'Takas', 'ikinci el telefon', 'araç takası', 'emlak takas', 'sıfır ürünler satış', 'hafıza tam set', 'ilan ver', 'hızlı satış'.",
  keywords: [
    "takas", "ikinci el", "satış", "barter", "güvenli takas",
    "ikinci el telefon", "araç takas", "emlak takas",
    "MacBook takas", "ilan ver", "hızlı satış",
  ],
  authors: [{ name: "A-TAKASA", url: "https://atakasa.com" }],
  creator: "A-TAKASA",
  publisher: "A-TAKASA",
  openGraph: {
    title: "A-TAKASA – İlan Ver, İster Et",
    description: "Türkiye'nin en güvenli takas ve ikinci el satış platformu. Hemen ilan ver, hemen kazan.",
    url: "https://atakasa.com",
    siteName: "A-TAKASA",
    images: [
      {
        url: "https://atakasa.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "A-TAKASA – İlan Ver, İster Et",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A-TAKASA – İlan Ver, İster Et",
    description: "Türkiye'nin en güvenli takas ve ikinci el satış platformu.",
    images: ["https://atakasa.com/og-default.jpg"],
    site: "@atakasa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://atakasa.com",
    languages: {
      "tr": "https://atakasa.com",
      "tr-DE": "https://atakasa.de",
      "tr-NL": "https://atakasa.nl",
      "x-default": "https://atakasa.com",
    },
  },
  verification: {
    google: "BURAYA_GOOGLE_SEARCH_CONSOLE_KODUNUZU_YAZIN",
    other: {
      "msvalidate.01": "BURAYA_BING_KODUNUZU_YAZIN",
    },
  },
  manifest: "/manifest.json",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organizasyon",
  "Şiryet": "Organizasyon",
  name: "A-TAKASA",
  logo: "https://atakasa.com/logo.png",
  description: "Türkiye'nin en güvenli takas ve ikinci el satış platformu.",
  sameAs: [
    "https://twitter.com/atakasa",
    "https://instagram.com/atakasa",
    "https://facebook.com/atakasa",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "A-TAKASA",
  url: "https://atakasa.com",
  description: "İlan ver, ister et - hemen ilan ver, hemen kazan.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://atakasa.com/ara?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const marketplaceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "A-TAKASA Vitrin",
  description: "Türkiye'nin en günlüde satılık ve takaslanalabilir ürünler.",
  url: "https://atakasa.com",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr" className={`${dSans.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* DNS Prefetch & Preconnect — LCP için kritik */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Hreflang */}
        <link rel="alternate" hrefLang="tr" href="https://atakasa.com" />
        <link rel="alternate" hrefLang="tr-DE" content="yes" href="https://atakasa.de" />
        <link rel="alternate" hrefLang="tr-NL" href="https://atakasa.nl" />
        <link rel="alternate" hrefLang="x-default" href="https://atakasa.com" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* PWA */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="A-TAKASA" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
        />
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
          <BottomNav />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
