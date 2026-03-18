import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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
  metadataBase: new URL("https://atakasa.com"),
  title: {
    default: "A-TAKASA — İster Sat, İster Takas Et | Güvenli İkinci El Platform",
    template: "%s | A-TAKASA",
  },
  description:
    "Türkiye'nin en güvenli takas ve ikinci el satış platformu. Sıfır ve ikinci el her ürün — elektronik, araç, emlak, mobilya. Hemen ilan ver, hemen kazan.",
  keywords: [
    "takas", "ikinci el", "satış", "barter", "güvenli takas",
    "ikinci el telefon", "araç takas", "emlak takas", "iPhone takas",
    "MacBook satış", "sıfır ürün sat", "takas platformu Türkiye",
    "atakasa", "ilan ver", "hızlı satış",
  ],
  authors: [{ name: "A-TAKASA", url: "https://atakasa.com" }],
  creator: "A-TAKASA",
  publisher: "A-TAKASA",
  openGraph: {
    title: "A-TAKASA — İster Sat, İster Takas Et",
    description: "Türkiye'nin en güvenli takas ve ikinci el satış platformu. Hemen ilan ver, hemen kazan.",
    url: "https://atakasa.com",
    siteName: "A-TAKASA",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://atakasa.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "A-TAKASA — İster Sat, İster Takas Et",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A-TAKASA — İster Sat, İster Takas Et",
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
      "tr":        "https://atakasa.com",
      "tr-DE":     "https://atakasa.de",
      "en":        "https://atakasa.com/en",
      "x-default": "https://atakasa.com",
    },
  },
  verification: {
    google: "BURAYA_GOOGLE_SEARCH_CONSOLE_KODUNUZU_YAZIN",
    other: {
      "msvalidate.01": "EE22134B7D1B55A44BA700154371D5C3",
    },
  },
  manifest: "/manifest.json",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "A-TAKASA",
  url: "https://atakasa.com",
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
  description: "İster sat, ister takas et — hemen ilan ver, hemen kazan.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://atakasa.com/kesfet?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
      <head>
        <meta name="msvalidate.01" content="EE22134B7D1B55A44BA700154371D5C3" />

        <link rel="alternate" hrefLang="tr"        href="https://atakasa.com" />
        <link rel="alternate" hrefLang="tr-DE"     href="https://atakasa.de" />
        <link rel="alternate" hrefLang="en"        href="https://atakasa.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://atakasa.com" />

        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f2540" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
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
