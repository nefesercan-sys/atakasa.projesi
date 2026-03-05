import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

// ⚡ SİBER BİLEŞENLER (KİLİTLER AÇILDI!)
import CyberNav from "../components/CyberNav";
// import AuthProvider from "../components/AuthProvider"; // Bu şimdilik kapalı kalabilir, sorun yok

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ATAKASA | Küresel Takas Borsası",
  description: "Satamıyor musun? At takasa! Yeni nesil siber takas ve ticaret ağı.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-[#050505] text-white antialiased min-h-screen overflow-x-hidden pb-24`}>
          
          {/* 🌌 ATAKASA SİBER HEADER */}
          <header className="fixed top-0 left-0 w-full z-[100] bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-4 py-4 md:px-8 shadow-sm">
            <div className="max-w-[1500px] mx-auto flex justify-between items-center">
              
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase drop-shadow-md">
                  A-<span className="text-[#00f260] drop-shadow-[0_0_15px_rgba(0,242,96,0.5)]">TAKASA.</span>
                </span>
              </Link>

              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-2.5 flex items-center gap-3 focus-within:border-[#00f260]/50 transition-all shadow-inner">
                  <span className="text-slate-500 text-sm">✨</span>
                  <input type="text" placeholder="BORSADA VARLIK ARA..." className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none w-full placeholder:text-slate-600 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <Link href="/panel" className="w-11 h-11 bg-white/[0.03] border border-white/[0.05] rounded-full flex items-center justify-center text-slate-300 hover:bg-[#00f260] hover:text-black hover:border-transparent transition-all shadow-lg">
                    👤
                 </Link>
              </div>

            </div>
          </header>

          <main className="relative pt-24 min-h-screen">
            {children}
          </main>

          {/* 🚀 İŞTE MENÜYÜ EKRANA BASAN ANA ŞALTER (TAMAMEN AÇIK) */}
          <CyberNav />

      </body>
    </html>
  );
}
