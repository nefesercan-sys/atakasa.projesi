"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Mesajlar() {
  const [aktifSohbet, setAktifSohbet] = useState<number | null>(null);

  // Demo Mesaj Verileri
  const sohbetler = [
    { id: 1, isim: "Kaan Y.", konu: "MacBook Pro M3 Max", sonMesaj: "Üzerine ne kadar nakit düşünüyorsun?", saat: "10:42", okunmadi: 2, avatar: "👨‍💻" },
    { id: 2, isim: "Selin A.", konu: "Rolex Submariner", sonMesaj: "Fotoğrafları inceledim, takasa uygunum.", saat: "Dün", okunmadi: 0, avatar: "👩‍💼" },
    { id: 3, isim: "Burak T.", konu: "Sony A7 IV + Lens", sonMesaj: "Lensin garantisi devam ediyor mu?", saat: "Pzt", okunmadi: 0, avatar: "📸" },
  ];

  const aktifMesajGecmisi = [
    { gonderen: "Kaan Y.", mesaj: "Selam Ercan, cihazın çok temiz duruyor.", saat: "10:30", benMi: false },
    { gonderen: "Ben", mesaj: "Selam Kaan, teşekkürler. Sadece ofiste kullanıldı.", saat: "10:35", benMi: true },
    { gonderen: "Kaan Y.", mesaj: "Benim iPhone 15 Pro Max 1TB ile takas düşünür müsün? Üzerine ne kadar nakit düşünüyorsun?", saat: "10:42", benMi: false },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 h-[calc(100vh-8rem)]">
        
        {/* ÜST BAŞLIK */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
              Siber <span className="text-[#00f260]">Ağ.</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Güvenli ve Şifrelenmiş İletişim</p>
          </div>
          <span className="bg-white/[0.05] border border-white/10 px-4 py-2 rounded-2xl text-[#00f260] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f260] animate-pulse"></span> Çevrimiçi
          </span>
        </div>

        {/* 💬 SİBER SOHBET MERKEZİ (İkiye Bölünmüş Tasarım) */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2rem] flex flex-col md:flex-row h-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* SOL: SOHBET LİSTESİ */}
          <div className={`w-full md:w-1/3 border-r border-white/[0.05] flex flex-col ${aktifSohbet ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/[0.05]">
              <div className="relative">
                <input type="text" placeholder="Sinyallerde Ara..." className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-3 px-4 pl-10 text-xs font-bold text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600" />
                <span className="absolute left-4 top-3 text-slate-500">🔍</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {sohbetler.map((sohbet) => (
                <button 
                  key={sohbet.id} 
                  onClick={() => setAktifSohbet(sohbet.id)}
                  className={`w-full p-4 border-b border-white/[0.02] flex items-start gap-4 transition-all hover:bg-white/[0.02] text-left ${aktifSohbet === sohbet.id ? 'bg-[#00f260]/5 border-l-4 border-l-[#00f260]' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="w-12 h-12 bg-white/[0.05] rounded-2xl flex items-center justify-center text-2xl relative border border-white/10">
                    {sohbet.avatar}
                    {sohbet.okunmadi > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#00f260] text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                        {sohbet.okunmadi}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-white font-bold text-sm truncate">{sohbet.isim}</h4>
                      <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{sohbet.saat}</span>
                    </div>
                    <p className="text-[#00f260] text-[10px] font-bold uppercase tracking-widest mb-1 truncate">{sohbet.konu}</p>
                    <p className={`text-xs truncate ${sohbet.okunmadi > 0 ? 'text-white font-semibold' : 'text-slate-500'}`}>{sohbet.sonMesaj}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: AKTİF SOHBET PENCERESİ */}
          <div className={`w-full md:w-2/3 flex-col bg-[#050505]/50 ${aktifSohbet ? 'flex' : 'hidden md:flex'}`}>
            {aktifSohbet ? (
              <>
                {/* Sohbet Header */}
                <div className="p-4 border-b border-white/[0.05] bg-[#0a0a0a] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setAktifSohbet(null)} className="md:hidden text-slate-400 hover:text-white">←</button>
                    <div className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center text-xl border border-white/10">👨‍💻</div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Kaan Y.</h3>
                      <p className="text-[#00f260] text-[9px] font-bold uppercase tracking-widest">Takas Pazarlığı: MacBook Pro M3 Max</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-[#00f260] transition-colors text-xl">⚙️</button>
                </div>

                {/* Mesaj Alanı */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                  {aktifMesajGecmisi.map((m, idx) => (
                    <div key={idx} className={`flex flex-col ${m.benMi ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-3xl ${m.benMi ? 'bg-[#00f260] text-black rounded-tr-sm' : 'bg-white/[0.05] border border-white/[0.05] text-white rounded-tl-sm'}`}>
                        <p className={`text-sm ${m.benMi ? 'font-semibold' : ''}`}>{m.mesaj}</p>
                      </div>
                      <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-2 px-2">{m.saat}</span>
                    </div>
                  ))}
                </div>

                {/* Mesaj Gönderme Çubuğu */}
                <div className="p-4 border-t border-white/[0.05] bg-[#0a0a0a]">
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-full p-2 pr-2 shadow-inner focus-within:border-[#00f260]/30 transition-colors">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xl">📎</button>
                    <input type="text" placeholder="Şifreli mesajını yaz..." className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder:text-slate-600 px-2" />
                    <button className="w-10 h-10 flex items-center justify-center bg-[#00f260] text-black rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,242,96,0.3)]">
                      ➤
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Boş Durum (Sohbet Seçilmediğinde) */
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <span className="text-6xl mb-6 grayscale">💬</span>
                <p className="text-white font-black uppercase tracking-widest">Sinyal Seçilmedi</p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Görüntülemek için soldan bir pazarlık seçin.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
