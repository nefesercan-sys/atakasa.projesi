import React from "react";

// Projenin Google'da görünecek SEO kimliği
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
      {/* Arka planı koyu, yazıları beyaz yapan siber zırh */}
      <body className="bg-[#030712] text-white antialiased min-h-screen">
        {/* Tüm sayfaların içine yükleneceği ana kapsayıcı */}
        {children}
      </body>
    </html>
  );
}
