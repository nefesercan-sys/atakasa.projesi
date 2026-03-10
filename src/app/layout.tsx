import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import CyberNav from "../components/CyberNav";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "A-TAKASA | Türkiye'nin Takas ve İkinci El Platformu",
  description: "A-TAKASA ile ikinci el eşyalarını ücretsiz ilanla sat, takas yap veya satın al. Güvenli ödeme, anında ilan, yasal zırh güvencesiyle Türkiye'nin en yenilikçi takas borsası.",
  keywords: "takas, ikinci el, ikinci el eşya, takas sitesi, ücretsiz ilan, eşya takas, takas platformu, ikinci el alım satım, takas borsası, atakasa, a-takasa, güvenli takas, online takas, takas yap, eşya sat, takas et",
  authors: [{ name: "A-TAKASA", url: "https://atakasa.com" }],
  creator: "A-TAKASA",
  publisher: "A-TAKASA",
  metadataBase: new URL("https://atakasa.com"),
  alternates: { canonical: "https://atakasa.com" },
  openGraph: {
    title: "A-TAKASA | Değiştir. Kazan. Özgürleş.",
    description: "Elindeki eşyayı takasa ver, ihtiyacın olanı al. Ücretsiz ilan, güvenli ödeme, anında takas. Türkiye'nin yeni nesil takas platformu.",
    url: "https://atakasa.com",
    siteName: "A-TAKASA",
    images: [{ url: "https://atakasa.com/og-image.jpg", width: 1200, height: 630, alt: "A-TAKASA Takas Platformu" }],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A-TAKASA | Değiştir. Kazan. Özgürleş.",
    description: "Elindeki eşyayı takasa ver, ihtiyacın olanı al. Türkiye'nin en güvenli takas platformu.",
    images: ["https://atakasa.com/og-image.jpg"],
    creator: "@atakasa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        {/* 🔍 JSON-LD: WebSite Schema — Google Arama Kutusu */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "A-TAKASA",
              "alternateName": ["ATAKASA", "A TAKASA", "Atakasa Takas"],
              "url": "https://atakasa.com",
              "description": "Türkiye'nin en yenilikçi takas ve ikinci el alım satım platformu. Güvenli ödeme, yasal zırh, anında ilan.",
              "inLanguage": "tr-TR",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://atakasa.com/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "A-TAKASA",
                "url": "https://atakasa.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://atakasa.com/logo.png",
                  "width": 200,
                  "height": 200
                },
                "sameAs": [
                  "https://twitter.com/atakasa",
                  "https://instagram.com/atakasa"
                ]
              }
            })
          }}
        />
        {/* 🏪 JSON-LD: Organization + Marketplace Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "A-TAKASA",
              "url": "https://atakasa.com",
              "description": "Ücretsiz ilan ver, güvenli takas yap, ikinci el eşya al sat. Türkiye genelinde hızlı ve güvenli takas platformu.",
              "foundingDate": "2024",
              "areaServed": {
                "@type": "Country",
                "name": "Turkey"
              },
              "serviceType": [
                "Takas Platformu",
                "İkinci El Alım Satım",
                "Online Pazar Yeri",
                "Güvenli Ödeme Sistemi"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "A-TAKASA Hizmetleri",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Ücretsiz İlan Ver",
                      "description": "Saniyeler içinde ücretsiz ilan oluştur"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Güvenli Takas Yap",
                      "description": "Eşyaları birbiriyle güvenle takas et"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Yasal Zırh ile Satın Al",
                      "description": "Para teslimata kadar güvende tutulur"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#050505] text-white antialiased min-h-screen overflow-x-hidden pb-24`}>

        {/* 🛡️ SİSTEM GÜVENLİK KALKANI DEVREDE */}
        <AuthProvider>

          {/* 🌌 ATAKASA SİBER HEADER — Sadece ana sayfa dışındaki sayfalarda görünür */}
          <header className="fixed top-0 left-0 w-full z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 py-4 md:px-8 shadow-sm">
            <div className="max-w-[1500px] mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase drop-shadow-md">
                  A-<span className="text-[#00f260] drop-shadow-[0_0_15px_rgba(0,242,96,0.5)]">TAKASA.</span>
                </span>
              </Link>
              {/* Masaüstü arama — sadece md ve üstünde */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-2.5 flex items-center gap-3 focus-within:border-[#00f260]/50 transition-all shadow-inner">
                  <span className="text-slate-500 text-sm">✨</span>
                  <input
                    type="text"
                    placeholder="BORSADA VARLIK ARA..."
                    className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none w-full placeholder:text-slate-600 text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) window.location.href = `/?q=${encodeURIComponent(val)}`;
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/panel"
                  className="w-11 h-11 bg-white/[0.03] border border-white/[0.05] rounded-full flex items-center justify-center text-slate-300 hover:bg-[#00f260] hover:text-black hover:border-transparent transition-all shadow-lg"
                >
                  👤
                </Link>
              </div>
            </div>
          </header>

          <main className="relative pt-24 min-h-screen">
            {children}
          </main>

          {/* 🚀 MENÜ AKTİF */}
          <CyberNav />

        </AuthProvider>

        {/* 📡 SİBER RADAR AKTİF */}
        <Analytics />

      </body>
    </html>
  );
}
