"use client";

import React, { useEffect, useState } from 'react';
import { Search, Home, Compass, Plus, MessageCircle, User, Loader2 } from 'lucide-react';

export default function AtakasaHome() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde veritabanından ürünleri çeken fonksiyon
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/assets');
        const result = await response.json();
        if (result.success) {
          setAssets(result.data);
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Eğer veritabanı boşsa gösterilecek örnek (mock) ürünler
  const displayAssets = assets.length > 0 ? assets : [
    { title: "Apple iPhone 13 Pro Max 256GB", price: "35.000 ₺", image: "V1" },
    { title: "MacBook Pro M2 16GB RAM", price: "42.500 ₺", image: "V2" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-24 selection:bg-emerald-500/30">
      
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3 shadow-inner">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ne arıyorsun? (Örn: iPhone 13 Pro)" 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </header>

      <main className="px-4 space-y-8 mt-4">
        
        <section className="relative p-6 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-emerald-900/30 to-slate-900/50 shadow-2xl">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="inline-block px-3 py-1.5 mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider">🛡️ SİBER GÜVENLİ TİCARET</span>
          </div>
          
          <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent leading-tight">
            Geleceğin Takas<br/>Ağına Hoş Geldin.
          </h1>
          
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Eski eşyalarını çöpe atma. Premium siber borsada değerinde takasla veya anında nakde çevir.
          </p>
          
          <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
            Hemen Varlık Ekle <Plus className="w-5 h-5" />
          </button>
        </section>

        <section>
          <div className="flex overflow-x-auto gap-3 pb-2" style={{ scrollbarWidth: 'none' }}>
            {['Tümü', '📱 Elektronik', '🚗 Vasıta', '💻 Bilgisayar', '🛋️ Mobilya'].map((cat, i) => (
              <button 
                key={i} 
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-medium border transition-all 
                ${i === 0 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                  : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 text-slate-100 tracking-wide flex items-center justify-between">
            Sizin İçin Seçilenler
            <span className="text-xs font-medium text-emerald-500 cursor-pointer">Tümünü Gör</span>
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {displayAssets.map((item, idx) => (
                <div key={idx} className="flex flex-col bg-gradient-to-b from-slate-800/40 to-slate-900/80 rounded-2xl p-3 border border-slate-700/50 shadow-lg backdrop-blur-sm transition-transform active:scale-95">
                  
                  <div className="w-full aspect-square rounded-xl bg-[#0a0f1c] mb-3 flex items-center justify-center border border-white/5 shadow-inner overflow-hidden relative">
                     <div className="absolute inset-0 bg-emerald-500/5 opacity-50"></div>
                     <span className="text-emerald-500/30 font-bold text-2xl relative z-10">{item.image || "FOTO"}</span>
                  </div>
                  
                  <h3 className="text-xs font-medium text-slate-200 line-clamp-2 mb-2 leading-snug">{item.title}</h3>
                  
                  <div className="mt-auto pt-2 border-t border-slate-700/30 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Değer</span>
                      <span className="text-emerald-400 font-bold text-sm">{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <nav className="fixed bottom-0 w-full bg-[#0f172a]/85 backdrop-blur-xl border-t border-slate-800 px-6 py-3 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-emerald-500">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Ana Sayfa</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300">
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-medium">Keşfet</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 relative -top-5">
          <div className="bg-gradient-to-tr from-emerald-500 to-emerald-400 p-3.5 rounded-full shadow-lg shadow-emerald-500/30 text-white border-4 border-[#0f172a]">
            <Plus className="w-6 h-6" />
          </div>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Mesajlar</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </nav>
      
    </div>
  );
}
