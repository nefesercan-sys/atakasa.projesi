import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import CyberNav from "../components/CyberNav";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";
import JsonLd from "../components/JsonLd";
import HeaderSearch from "../components/HeaderSearch";

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
        {/* ✅ JSON-LD ayrı Server Component'te — hata yok */}
        <JsonLd />
      </head>
      <body className={`${inter.className} bg-[#050505] text-white antialiased min-h-screen overflow-x-hidden pb-24`}>

        <AuthProvider>

          {/* 🌌 HEADER */}
          <header className="fixed top-0 left-0 w-full z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 py-4 md:px-8 shadow-sm">
            <div className="max-w-[1500px] mx-auto flex justify-between items-center">

              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase drop-shadow-md">
                  A-<span className="text-[#00f260] drop-shadow-[0_0_15px_rgba(0,242,96,0.5)]">TAKASA.</span>
                </span>
              </Link>

              {/* ✅ onKeyDown Client Component'e taşındı */}
              <HeaderSearch />

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

          <CyberNav />

        </AuthProvider>

        <Analytics />

      </body>
    </html>
  );
}
