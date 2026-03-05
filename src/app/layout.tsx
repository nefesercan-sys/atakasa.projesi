import './globals.css';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider'; 
import SignOutButton from '@/components/UserPanel/SignOutButton'; 
import LiveStatusBar from '@/components/LiveStatusBar';
import MobileNav from '@/components/MobileNav';
import { getServerSession } from "next-auth"; // Sunucu tarafında oturum kontrolü için

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nexus Global | Siber Ekosistem',
  description: 'Sınırları kaldıran küresel ticaret ağı.',
};

export default async function RootLayout({ children }) {
  // Sunucu tarafında aktif oturumu kontrol ediyoruz
  const session = await getServerSession();

  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-[#030712] text-white min-h-screen overflow-x-hidden flex flex-col`}>
        <AuthProvider>
          
          <LiveStatusBar />

          <header className="sticky top-0 z-[100] w-full bg-[#0b0f19]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
            <div className="max-w-[1500px] mx-auto px-4 py-3 flex justify-between items-center">
              
              <a href="/" className="flex items-center gap-2 group">
                <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                  NEXUS <span className="text-[#00f260] drop-shadow-[0_0_10px_rgba(0,242,96,0.5)]">GLOBAL.</span>
                </div>
              </a>

              <div className="flex items-center gap-4">
                
                {/* 🛡️ AKILLI MENÜ KONTROLÜ: Oturum varsa profili, yoksa Giriş Yap butonunu göster */}
                {!session ? (
                  <div className="flex items-center gap-2">
                    <a href="/login" className="bg-[#0b0f19] border border-[#00f260] text-[#00f260] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all">
                      GİRİŞ YAP
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 relative group cursor-pointer">
                    <div className="hidden sm:block text-right">
                      <div className="text-white text-xs font-black uppercase tracking-widest">
                        {session.user?.name || "PROFİL"}
                      </div>
                      <div className="text-[#00f260] text-[9px] font-black uppercase tracking-widest italic animate-pulse">AĞA BAĞLI</div>
                    </div>
                    
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00f260] overflow-hidden flex items-center justify-center bg-[#00f260]/10 relative shadow-[0_0_15px_rgba(0,242,96,0.3)]">
                      <span className="text-xl">👤</span>
                    </div>

                    {/* AÇILIR MENÜ (DROPDOWN) */}
                    <div className="absolute top-full right-0 mt-3 w-56 bg-[#0b0f19] border border-[#00f260]/30 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="p-2 flex flex-col gap-1">
                        <a href="/panel" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-yellow-500 text-xs font-black tracking-widest uppercase transition-colors">
                          👑 SİBER KARARGAH
                        </a>
                        <div className="h-px w-full bg-white/5 my-1"></div>
                        <a href="/panel" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-white hover:text-[#00f260] text-[10px] font-bold tracking-widest uppercase transition-colors">
                          🛒 SEPETİMİ GÖR
                        </a>
                        <a href="/ilan-ekle" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-white hover:text-[#00f260] text-[10px] font-bold tracking-widest uppercase transition-colors">
                          ➕ YENİ İLAN KAYIT
                        </a>
                        <a href="/kategori" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-white hover:text-[#00f260] text-[10px] font-bold tracking-widest uppercase transition-colors">
                          🏢 SEKTÖR SEÇ
                        </a>
                        <div className="h-px w-full bg-white/5 my-1"></div>
                        
                        {/* ÇIKIŞ BUTONU */}
                        <SignOutButton className="flex items-center w-full text-left gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl text-red-500 text-[10px] font-black tracking-widest uppercase transition-colors" />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </header>

          <main className="flex-grow relative z-10">
            {children}
          </main>

          <MobileNav />
          
        </AuthProvider>
      </body>
    </html>
  );
}
