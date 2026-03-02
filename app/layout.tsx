import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Stabil ve Siber Temaya Uygun Font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATAKASA | Güvenli Teminatlı Takas Sistemi",
  description: "Siber güvenlikli varlık takas ve ticaret terminali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[#030712] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
