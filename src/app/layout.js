import { Inter } from "next/font/google";
import "./globals.css";
// ⚡ KRİTİK BAĞLANTI: Yeni yarattığımız Siber Navigasyon Motorunu çağırıyoruz
import CyberNav from "@/components/CyberNav"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ATAKASA | Siber Ticaret Ağı",
  description: "Yeni nesil güvenli siber pazar yeri ve takas platformu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      {/* pb-24 sınıfı, mobilde alt menünün sayfanın altındaki yazıları kapatmaması için mühürlendi */}
      <body className={`${inter.className} bg-[#030712] text-white antialiased pb-24 md:pb-0`}>
        
        {/* Tüm sayfalar bu siber iskeletin içinde render edilir */}
        {children}

        {/* 🛡️ SİBER NAVİGASYON AĞI (Sitenin neresine gidersen git bu menü peşinden gelecek) */}
        <CyberNav />
        
      </body>
    </html>
  );
}
