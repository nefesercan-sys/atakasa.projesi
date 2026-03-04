import React from "react";
import { Providers } from "./providers"; 
// 🚨 DİKKAT: Eğer Navbar kullanıyorsan import satırını buraya ekle
// import CyberNav from "@/components/CyberNav"; // Kendi Navbar yoluna göre düzelt

export const metadata = {
  title: "Atakasa | Güvenli Takas Platformu",
  description: "Yeni nesil siber güvenlikli ticaret ve takas ağı.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-[#030712] text-white antialiased min-h-screen">
        {/* 🚀 ZIRH BAŞLANGICI: Bütün dükkan bu etiketin İÇİNDE olmak ZORUNDA */}
        <Providers>
          
          {/* Eğer Navbar varsa KESİNLİKLE burada, Providers'ın İÇİNDE olmalı! */}
          {/* <CyberNav /> */} 

          {children}

        {/* 🚀 ZIRH BİTİŞİ */}
        </Providers>
      </body>
    </html>
  );
}
