import { Inter } from "next/font/google";
import "./globals.css";
// ⚡ KRİTİK BAĞLANTI: Yeni Siber Navigasyon Motoru Eklendi
import CyberNav from "@/components/CyberNav"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ATAKASA | Siber Ticaret Ağı",
  description: "Yeni nesil güvenli siber pazar yeri ve takas platformu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      {/* pb-24 sınıfı, mobilde alt menünün sayfanın en altındaki yazıları kapatmaması için eklendi */}
      <body className={`${inter.className} bg-[#030712] text-white antialiased pb-24 md:pb-0`}>
        
        {/* Tüm sayfalar bu siber iskeletin içinde render edilir */}
        {children}

        {/* 🛡️ SİBER NAVİGASYON AĞI (Her sayfada otomatik görünecek) */}
        <CyberNav />
        
      </body>
    </html>
  );
}
