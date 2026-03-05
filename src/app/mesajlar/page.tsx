"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SiberMesajlar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🛡️ URL'den Gelen Kritik Sinyaller
  const saticiEmail = searchParams.get("satici");
  const ilanId = searchParams.get("ilan");

  const [aktifSohbet, setAktifSohbet] = useState<string | null>(saticiEmail ? "yeni-teklif" : null);
  const [mesaj, setMesaj] = useState("");

  // 🛡️ SİBER GÜVENLİK DUVARI
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  // Demo Verileri (Gelecekte MongoDB'den gelecek)
  const sohbetler = [
    { id: "1", isim: "Kaan Y.", konu: "MacBook Pro M3 Max", sonMesaj: "Üzerine ne kadar nakit düşünüyorsun?", saat: "10:42", okunmadi: 2, avatar: "👨‍💻" },
    { id: "2", isim: "Selin A.", konu: "Rolex Submariner", sonMesaj: "Fotoğrafları inceledim, takasa uygunum.", saat: "Dün", okunmadi: 0, avatar: "👩‍💼" },
  ];

  const handleMesajGonder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaj.trim()) return;
    
    // Siber Simülasyon
    console.log(`Sinyal Gönderildi: ${mesaj} -> Hedef: ${saticiEmail || aktifSohbet}`);
    setMesaj("");
    alert("TEKLİF SİNYALİ İLETİLDİ! Broker onay bekliyor.");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black italic tracking-[0.3em] animate-pulse">
        AĞ TARANIYOR...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 h-[calc(100vh-10rem)]">
        
        {/* ÜST BAŞLIK */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white italic">
              Siber <span className="text-[#00f260]">Ağ.</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Güvenli ve Şifrelenmiş Takas Hattı</p>
          </div>
          <div className="hidden md:flex bg-white/[0.03] border border-white/5 px-5 py-2.5 rounded-2xl text-[#00f260] text-[9px] font-black uppercase tracking-widest items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f260] animate-pulse shadow-[0_0_10px_rgba(0,242,96,0.5)]"></span> 
            Terminal Çevrimiçi
          </div>
        </div>

        {/* 💬 ANA TERMİNAL */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] flex flex-col md:flex-row h-full overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative">
          
          {/* 📂 SOL: KANALLAR */}
          <div className={`w-full md:w-80 border-r border-white/[0.05] flex flex-col ${aktifSohbet && aktifSohbet !== "yeni-teklif" ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b border-white/[0.05]">
              <div className="relative group">
                <input type="text" placeholder="Sinyal Ara..." className="w-full bg-[#050505] border border-white/[0.05] rounded-2xl py-4 px-5 pl-12 text-[10px] font-bold text-white outline-none focus:border-[#00f260]/30 transition-all" />
                <span className="absolute left-5 top-4 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              {/* 🛡️ URL'den gelen yeni teklif kanalını en üste mühürle */}
              {saticiEmail && (
                <button 
                  onClick={() => setAktifSohbet("yeni-teklif")}
                  className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all border ${aktifSohbet === "yeni-teklif" ? 'bg-[#00f260]/10 border-[#00f260]/30 shadow-lg' : 'bg-white/[0.02] border-transparent opacity-60'}`}
                >
                  <div className="w-12 h-12 bg-[#00f260] text-black rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">⚡</div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest truncate">YENİ TEKLİF SİNYALİ</h4>
                    <p className="text-[#00f260] text-[9px] font-bold truncate mt-1">{saticiEmail}</p>
                  </div>
                </button>
              )}

              {sohbetler.map((s) => (
                <button key={s.id} onClick={() => setAktifSohbet(s.id)} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all border ${aktifSohbet === s.id ? 'bg-white/[0.05] border-white/10 shadow-lg' : 'bg-transparent border-transparent opacity-40 hover:opacity-100'}`}>
                  <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center text-2xl border border-white/5">{s.avatar}</div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-white font-bold text-xs truncate">{s.isim}</h4>
                      <span className="text-slate-500 text-[8px] font-black">{s.saat}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] truncate">{s.sonMesaj}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 📟 SAĞ: MESAJ AKIŞI */}
          <div className={`flex-1 flex flex-col bg-[#050505]/50 ${aktifSohbet ? 'flex' : 'hidden md:flex'}`}>
            {aktifSohbet ? (
              <>
                {/* Sohbet Header */}
                <div className="p-6 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setAktifSohbet(null)} className="md:hidden text-slate-400 text-xl">←</button>
                    <div className="w-12 h-12 bg-[#00f260]/10 rounded-2xl flex items-center justify-center text-2xl border border-[#00f260]/20 shadow-inner">
                      {aktifSohbet === "yeni-teklif" ? "⚡" : "👨‍💻"}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm uppercase tracking-tighter">
                        {aktifSohbet === "yeni-teklif" ? "SİNYAL BAĞLANTISI" : "KAAN Y."}
                      </h3>
                      <p className="text-[#00f260] text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">
                        {aktifSohbet === "yeni-teklif" ? `Hedef: ${saticiEmail}` : "Takas Pazarlığı: MacBook Pro"}
                      </p>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-slate-500 hover:text-white">⚙️</button>
                </div>

                {/* Mesaj Alanı */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                   {aktifSohbet === "yeni-teklif" ? (
                     <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-10">
                        <span className="text-5xl mb-6">🛰️</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Güvenli Kanal Açıldı.</p>
                        <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">İlan sahibiyle takas şartlarını konuşmak için ilk sinyali aşağıdan mühürle.</p>
                     </div>
                   ) : (
                    <>
                      <div className="flex flex-col items-start">
                        <div className="max-w-[80%] p-5 rounded-[2rem] rounded-tl-none bg-white/[0.03] border border-white/5 text-slate-300 text-sm leading-relaxed shadow-xl">
                          Selam Ercan, cihazın çok temiz duruyor. Benim iPhone 15 Pro Max 1TB ile takas düşünür müsün?
                        </div>
                        <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest mt-3 px-2">10:42</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="max-w-[80%] p-5 rounded-[2rem] rounded-tr-none bg-[#00f260] text-black font-medium text-sm leading-relaxed shadow-[0_10px_30px_rgba(0,242,96,0.2)]">
                          Selam Kaan, teklifini değerlendirebilirim ama üzerine bir miktar nakit sinyali bekliyorum.
                        </div>
                        <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest mt-3 px-2">10:50</span>
                      </div>
                    </>
                   )}
                </div>

                {/* Giriş Çubuğu */}
                <div className="p-8 bg-[#0a0a0a]/50 backdrop-blur-xl border-t border-white/[0.05]">
                  <form onSubmit={handleMesajGonder} className="flex items-center gap-4 bg-[#050505] border border-white/[0.08] rounded-[2rem] p-2 pr-2 shadow-inner focus-within:border-[#00f260]/40 transition-all">
                    <button type="button" className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors text-xl">📎</button>
                    <input 
                      value={mesaj}
                      onChange={(e) => setMesaj(e.target.value)}
                      type="text" 
                      placeholder="Pazarlık sinyalini mühürle..." 
                      className="flex-1 bg-transparent border-none text-white text-sm font-medium outline-none placeholder:text-slate-700 px-2" 
                    />
                    <button className="px-8 py-3.5 bg-[#00f260] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                      SİNYAL GÖNDER
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center">
                <span className="text-8xl mb-8 grayscale">💬</span>
                <p className="text-xl font-black uppercase tracking-[0.4em]">Sinyal Seçilmedi</p>
                <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">İletişime geçmek için soldan bir kanal seçin.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
