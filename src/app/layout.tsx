import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

// 🔍 SİBER İZOLASYON: Hatanın kaynağını bulmak için bu ikisini geçici olarak kapattık!
// import CyberNav from "../components/CyberNav";
// import AuthProvider from "../components/AuthProvider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ATAKASA | Küresel Takas Borsası",
  description: "Satamıyor musun? At takasa! Yeni nesil siber takas ve ticaret ağı.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-[#02040a] text-white antialiased min-h-screen overflow-x-hidden pb-24 md:pb-0`}>
        
        {/* <AuthProvider> ŞİMDİLİK KAPALI */}
          
          <header className="fixed top-0 left-0 w-full z-[100] bg-[#02040a]/80 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8">
            <div className="max-w-[1500px] mx-auto flex justify-between items-center">
              
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">
                  A-<span className="text-[#00f260] drop-shadow-[0_0_15px_rgba(0,242,96,0.6)]">TAKASA.</span>
                </span>
              </Link>

              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 focus-within:border-[#00f260]/50 transition-all">
                  <span className="text-slate-500 text-sm">🔍</span>
                  <input type="text" placeholder="BORSADA VARLIK ARA..." className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none w-full placeholder:text-slate-700" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <Link href="/panel" className="w-10 h-10 bg-[#0b0f19] border border-[#00f260]/30 rounded-full flex items-center justify-center text-[#00f260] hover:bg-[#00f260] hover:text-black transition-all shadow-[0_0_10px_rgba(0,242,96,0.2)]">
                    👤
                 </Link>
              </div>

            </div>
          </header>

          <main className="relative pt-20">
            {children}
          </main>

          {/* <CyberNav /> ŞİMDİLİK KAPALI */}
          
        {/* </AuthProvider> */}

      </body>
    </html>
  );
}
