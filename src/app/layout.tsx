import './globals.css';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Atakasa | Premium Takas Ekosistemi',
  description: 'Geleceğin siber güvenli takas ve ticaret ağı.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      {/* 🚀 ARKA PLAN BURADA 'bg-black' OLARAK EŞİTLENDİ */}
      <body className={`${inter.className} bg-black text-zinc-100 min-h-screen overflow-x-hidden antialiased selection:bg-emerald-500 selection:text-black`}>
        <AuthProvider>
          
          {/* 🚀 DİKKAT: Eski "NEXUS GLOBAL" header'ı ve MobileNav'ı buradan SİLDİK. 
            Çünkü artık her sayfanın (page.tsx, borsa vs.) kendi içinde çok daha lüks, 
            Binance/Apple tarzı özel menüleri var. Çakışmayı engelledik! 
          */}
          <main className="flex-grow relative z-10">
            {children}
          </main>

        </AuthProvider>
      </body>
    </html>
  );
}
