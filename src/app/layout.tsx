import React from "react";
import { Providers } from "./providers"; 
import "./globals.css"; // 🚀 TASARIM MOTORUNU BAĞLADIĞIMIZ SATIR (Bunu Kesinlikle Ekle)

export const metadata = {
  title: "Takas Sepeti | Güvenli Takas Platformu",
  description: "Fazlalık mı var? Yük etme, at takasa!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-[#030712] text-white antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
