import { Inter } from "next/font/google";
import "./globals.css";
// ⚡ KRİTİK BAĞLANTI: "@" işareti yerine doğrudan "../" kullanarak adresi garantiledik
import CyberNav from "../components/CyberNav"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ATAKASA | Siber Ticaret Ağı",
  description: "Yeni nesil güvenli siber pazar yeri ve takas platformu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[#030712] text-white antialiased pb-24 md:pb-0`}>
        {children}
        <CyberNav />
      </body>
    </html>
  );
}
