import { Inter } from "next/font/google";
// ⚡ KRİTİK BAĞLANTI: Stil motorunu sisteme enjekte ediyoruz
import "./globals.css"; 

const inter = Inter({ subsets: ["latin"] });

// 🚀 SİBER KİMLİK: Sitenin tarayıcı sekmesinde görünecek adı ve açıklaması
export const metadata = {
  title: "Nexus Global | Siber Ticaret Ağı",
  description: "Yeni nesil güvenli siber pazar yeri ve takas platformu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[#030712] text-white antialiased`}>
        {/* Tüm sayfalar bu siber iskeletin içinde render edilir */}
        {children}
      </body>
    </html>
  );
}
