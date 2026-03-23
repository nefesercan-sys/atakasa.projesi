import { authOptions } from "@/lib/authOptions";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import BottomNav from "@/components/BottomNav";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { getServerSession } from "next-auth";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const dSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

// ─── VIEWPORT — metadata'dan ayrı tanımlanmalı (Next.js 14+) ─────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0f2540",
};

const BASE = "https://www.atakasa.com";

// ─── METADATA ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE),

  title: {
    default: "A-Takasa — Ücretsiz İlan Ver, Takas Yap, Hemen Kazan",
    template: "%s | A-Takasa",
  },

  description:
    "A-Takasa: Türkiye'nin en güvenli takas ve ikinci el satış platformu. Ücretsiz ilan ver, ürününü takas et ya da sat. Elektronik, araç, emlak, mobilya ve 15+ kategoride binlerce ilan. %100 alıcı & satıcı koruması.",

  keywords: [
    "takas sitesi", "ücretsiz ilan ver", "ikinci el satış",
    "takas platformu Türkiye", "güvenli takas", "ikinci el takas",
    "ücretsiz üye ol", "ürün takas et", "satılık ikinci el",
    "takas yap Türkiye", "atakasa", "elektronik takas",
    "araç takas", "emlak ilanı", "mobilya satış",
    "telefon takas", "laptop satılık", "ikinci el elektronik",
    "İstanbul takas", "Ankara ikinci el", "İzmir satılık",
    "MacBook takas", "iPhone satılık", "güvenli ödeme",
  ],

  authors: [{ name: "A-Takasa", url: BASE }],
  creator: "A-Takasa",
  publisher: "A-Takasa",
  category: "shopping",

  // ✅ Canonical + hreflang
  alternates: {
    canonical: BASE,
    languages: {
      "tr":        BASE,
      "tr-DE":     "https://atakasa.de",
      "tr-NL":     "https://atakasa.nl",
      "x-default": BASE,
    },
  },

  openGraph: {
    title: "A-Takasa — Ücretsiz İlan Ver, Takas Yap, Hemen Kazan",
    description:
      "Türkiye'nin en güvenli takas & satış platformu. Ücretsiz ilan ver, istediğini al ya da sat. %100 alıcı & satıcı koruması.",
    url: BASE,
    siteName: "A-Takasa",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: `${BASE}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "A-Takasa — Türkiye'nin En Güvenli Takas & Satış Platformu",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "A-Takasa — Ücretsiz İlan Ver, Takas Yap",
    description:
      "Türkiye'nin en güvenli takas & satış platformu. Ücretsiz ilan ver, hemen kazan.",
    site: "@atakasa",
    creator: "@atakasa",
    images: [`${BASE}/og-default.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  manifest: "/manifest.json",

  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-icon.png" }],
  },

  // ✅ Google Search Console kodunu .env'e ekle:
  // NEXT_PUBLIC_GOOGLE_VERIFICATION=buraya_kod
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
    },
  },
};

// ─── SCHEMA.ORG JSON-LD ───────────────────────────────────────────────────────

// ✅ Düzeltildi: "@type": "Organizasyon" → "Organization"
// ✅ Düzeltildi: Gereksiz "Şiryet" alanı kaldırıldı
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "A-Takasa",
  alternateName: ["Atakasa", "A-TAKASA"],
  url: BASE,
  logo: {
    "@type": "ImageObject",
    url: `${BASE}/og-default.jpg`,
    width: 1200,
    height: 630,
  },
  description:
    "Türkiye'nin en güvenli takas ve ikinci el satış platformu. Ücretsiz ilan ver, ürününü takas et ya da sat.",
  areaServed: "TR",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Turkish",
    areaServed: "TR",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "TR",
  },
  sameAs: [
    "https://twitter.com/atakasa",
    "https://instagram.com/atakasa",
    "https://facebook.com/atakasa",
  ],
};

// ✅ SearchAction URL düzeltildi: /ara → /kesfet (mevcut route)
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  name: "A-Takasa",
  url: BASE,
  description:
    "Türkiye'nin en güvenli takas ve ikinci el satış platformu. Ücretsiz ilan ver, takas et, hemen kazan.",
  inLanguage: "tr-TR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      // ✅ /ara yerine gerçek route: /kesfet?q=
      urlTemplate: `${BASE}/kesfet?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ✅ marketplaceSchema düzeltildi — ItemList yerine daha uygun tip
const marketplaceSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BASE}/#webpage`,
  url: BASE,
  name: "A-Takasa Borsa Vitrini",
  description:
    "Türkiye genelinde satılık ve takaslık ürünler. Elektronik, araç, emlak ve daha fazlası.",
  isPartOf: { "@id": `${BASE}/#website` },
  about: { "@id": `${BASE}/#organization` },
  inLanguage: "tr-TR",
};

// ✅ FAQ Schema — Google'da "Sıkça Sorulan Sorular" kutucuğu çıkarır
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${BASE}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "A-Takasa'da ilan vermek ücretsiz mi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, A-Takasa'da ilan vermek tamamen ücretsizdir. Ücretsiz üye olun, istediğiniz kadar ilan verin.",
      },
    },
    {
      "@type": "Question",
      name: "Takas nasıl yapılır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "İstediğiniz ilana 'Takas Teklifi Ver' butonuna tıklayın, kendi ürününüzü seçin ve teklifi gönderin. Satıcı kabul ederse takas gerçekleşir.",
      },
    },
    {
      "@type": "Question",
      name: "Güvenli ödeme nasıl çalışır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A-Takasa güvenli ödeme havuzu sistemiyle çalışır. Ödemeniz teslimat tamamlanana kadar havuzda bekler, sonra satıcıya aktarılır.",
      },
    },
    {
      "@type": "Question",
      name: "Hangi kategorilerde ilan verebilirim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Elektronik, araç, emlak, mobilya, tekstil, antika, kitap, kozmetik, petshop, oyun konsolu ve daha birçok kategoride ilan verebilirsiniz.",
      },
    },
    {
      "@type": "Question",
      name: "Satıcı dolandırıcılığından nasıl korunurum?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A-Takasa güvenli ödeme havuzu sistemi sayesinde ödemeniz ürünü teslim alana kadar korunur. Tüm satıcılar onay sürecinden geçer.",
      },
    },
  ],
};

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr" className={`${dSans.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* Preconnect & DNS Prefetch — LCP için kritik */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Hreflang — çok dilli SEO */}
        <link rel="alternate" hrefLang="tr"        href={BASE} />
        <link rel="alternate" hrefLang="tr-DE"     href="https://atakasa.de" />
        <link rel="alternate" hrefLang="tr-NL"     href="https://atakasa.nl" />
        <link rel="alternate" hrefLang="x-default" href={BASE} />

        {/* Apple PWA */}
        <meta name="apple-mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style"  content="default" />
        <meta name="apple-mobile-web-app-title"             content="A-Takasa" />
        <meta name="mobile-web-app-capable"                 content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
