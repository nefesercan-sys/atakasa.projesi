import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import CyberNav from "../components/CyberNav";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";
import JsonLd from "../components/JsonLd";
import HeaderSearch from "../components/HeaderSearch";

// 🚀 VERCEL 60 SANİYE ÇÖKME HATASINI BİTİREN SİBER KİLİT 
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

// 📱 MOBİL GÖRÜNÜMÜ KUSURSUZLAŞTIRAN SİBER VİTRİN AYARI (YENİ EKLENDİ)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
};

// 🚀 SİBER SEO ZIRHI: Google CEO'larının Aşık Olduğu Veri Yapısı
export const metadata = {
  title: {
    default: "At takasa.com | Türkiye'nin Siber Takas ve İkinci El Terminali",
    template: "%s | At takasa.com",
  },
  description: "Elinde tutma, At takasa! Zararına satmak yerine değerinde takas yapın. Elektronik, araç, emlak ve binlerce varlığı güvenle değiştirin. Nakitsiz ticaretin siber ağı.",
  keywords: [
    "takas yap", "ücretsiz ilan ver", "ikinci el takas", "eşya takas sitesi", 
    "at takasa", "güvenli ticaret", "barter", "online takas", "takas borsası", 
    "ikinci el alım satım", "araç takas", "telefon takas", "siber ticaret"
  ],
  authors: [{ name: "At takasa.com", url: "https://atakasa.com" }],
  creator: "At takasa",
  publisher: "At takasa",
  metadataBase: new URL("https://atakasa.com"),
  alternates: { canonical: "https://atakasa.com" },
  
  // 📸 SOSYAL MEDYA (WhatsApp, Facebook vb.) GÖRÜNÜMÜ
  openGraph: {
    title: "At takasa.com | Değiştir. Kazan. Özgürleş.",
    description: "Değersiz sanma ne varsa, At takasa! Siber ağda varlığını mühürle, ihtiyacın olanla güvenle takasla.",
    url: "https://atakasa.com",
    siteName: "At takasa",
    images: [
      { 
        url: "https://atakasa.com/og-image.jpg",
        width: 1200, 
        height: 630, 
        alt: "At takasa.com Siber Pazar Yeri" 
      }
    ],
    locale: "tr_TR",
    type: "website",
  },
  
  // 🐦 TWITTER (X) GÖRÜNÜMÜ
  twitter: {
    card: "summary_large_image",
    title: "At takasa.com | Siber Takas Terminali",
    description: "Zararına satma, At takasa! Türkiye'nin en güvenli takas platformu.",
    images: ["https://atakasa.com/og-image.jpg"],
    creator: "@attakasa",
  },
  
  // 🤖 ARAMA MOTORU BOTLARI KURALLARI
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // 📱 APPLE VE MOBİL UYGULAMA GÖRÜNÜMÜ
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className={`${inter.className} bg-[#050505] text-white antialiased min-h-screen overflow-x-hidden pb-24 selection:bg-[#00f260] selection:text-black`}>

        <AuthProvider>

          {/* 🌌 SİBER HEADER */}
          <header className="fixed top-0 left-0 w-full z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 py-4 md:px-8 shadow-sm">
            <div className="max-w-[1500px] mx-auto flex justify-between items-center">

              {/* LOGO */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00f260] to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,242,96,0.3)] relative overflow-hidden shrink-0">
                  <span className="text-lg font-black text-black relative z-10 italic">At<span className="text-white">⇄</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
                    At takasa<span className="text-[#00f260]">.com</span>
                  </span>
                </div>
              </Link>

              <div className="hidden md:block flex-1 max-w-xl mx-8">
                <HeaderSearch />
              </div>

              {/* PANEL GİRİŞİ */}
              <div className="flex items-center gap-4">
                <Link
                  href="/panel"
                  className="w-10 h-10 bg-white/[0.03] border border-white/[0.05] rounded-full flex items-center justify-center text-slate-300 hover:bg-[#00f260] hover:text-black hover:border-transparent transition-all shadow-[0_0_10px_rgba(0,242,96,0)] hover:shadow-[0_0_15px_rgba(0,242,96,0.4)]"
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
