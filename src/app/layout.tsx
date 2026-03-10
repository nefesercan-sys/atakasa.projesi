import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import CyberNav from "../components/CyberNav";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "A-TAKASA | Değiştir. Kazan. Özgürleş.",
  description: "Elinde tutma, takasa gir. Türkiye'nin yeni nesil takas ve ticaret platformu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-[#050505] text-white antialiased min-h-screen overflow-x-hidden pb-24`}>
        
        {/* 🛡️ SİSTEM GÜVENLİK KALKANI DEVREDE */}
        <AuthProvider>

          {/* 
            ❌ HEADER KALDIRILDI
            Ana sayfa kendi header'ını yönetiyor.
            Diğer sayfalar için gerekirse kendi header'larını ekleyin.
          */}

          <main className="relative min-h-screen">
            {children}
          </main>

          {/* 🚀 MENÜ AKTİF */}
          <CyberNav />

        </AuthProvider>

        {/* 📡 SİBER RADAR AKTİF (Tüm sayfaları anlık izler) */}
        <Analytics />

      </body>
    </html>
  );
}
