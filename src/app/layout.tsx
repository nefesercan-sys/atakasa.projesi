import React from "react";
// 1. Performans ve premium görünüm için fontları optimize ederek import ediyoruz
import { Plus_Jakarta_Sans, Unbounded } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import CyberNav from "../components/CyberNav";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";
import JsonLd from "../components/JsonLd";
import HeaderSearch from "../components/HeaderSearch";

export const dynamic = "force-dynamic";

// 2. Font ayarları: 'display: swap' LCP süresini düşürmek için kritiktir
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-jakarta',
});

const unbounded = Unbounded({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-unbounded',
});

// 3. Viewport: Google'ın sevmediği 'userScalable: false' yerine erişilebilir ayarlar
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export const metadata = {
  title: {
    default: "Atakasa.com | Türkiye'nin Siber Takas ve İkinci El Terminali",
    template: "%s | Atakasa.com",
  },
  description: "Zararına satmak yerine değerinde takas yapın. Elektronik, araç, emlak ve binlerce varlığı güvenle değiştirin.",
  metadataBase: new URL("https://atakasa.com"),
  // Diğer metadata ayarlarını olduğu gibi koruyabilirsin...
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 4. Font değişkenlerini buraya tanımlıyoruz
    <html lang="tr" className={`scroll-smooth ${jakarta.variable} ${unbounded.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body className={`${jakarta.className} bg-[#050505] text-white antialiased min-h-screen overflow-x-hidden pb-24 selection:bg-[#00f260] selection:text-black`}>

        <AuthProvider>
          <header className="fixed top-0 left-0 w-full z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 py-4 md:px-8 shadow-sm">
            <div className="max-w-[1500px] mx-auto flex justify-between items-center">

              {/* LOGO - Font-unbounded kullanımı ile daha siber bir hava */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00f260] to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,242,96,0.3)] relative overflow-hidden shrink-0">
                  <span className="text-lg font-black text-black relative z-10 italic">At<span className="text-white">⇄</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none font-unbounded">
                    Atakasa<span className="text-[#00f260]">.com</span>
                  </span>
                </div>
              </Link>

              <div className="hidden md:block flex-1 max-w-xl mx-8">
                <HeaderSearch />
              </div>

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
