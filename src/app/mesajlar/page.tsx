"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function MesajlarIcerik() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🛡️ Sinyal Bilgileri (İlan sayfasındaki "Satıcıya Mesaj Gönder" butonundan gelecek veriler)
  const saticiEmail = searchParams.get("satici");
  const ilanId = searchParams.get("ilan");

  const [mesaj, setMesaj] = useState("");
  const [mesajGecmisi, setMesajGecmisi] = useState<any[]>([]);
  const [sohbetKanallari, setSohbetKanallari] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifKanal, setAktifKanal] = useState<string | null>(saticiEmail);

  // 🛡️ GÜVENLİK DUVARI (SİBER YAMA UYGULANDI: /login yerine /giris)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  // 📡 VERİ ÇEKME MOTORU 
  useEffect(() => {
    const mesajlariGetir = async () => {
      try {
        const res = await fetch("/api/mesajlar");
        if (res.ok) {
          const data = await res.json();
          // 1. Tüm Mesaj Geçmişini Set Et
          setMesajGecmisi(data);
          
          // 2. Benzersiz Sohbet Kanallarını Oluştur
          const kanallar = data.reduce((acc: any[], m: any) => {
            const partner = m.gonderenEmail === session?.user?.email ? m.aliciEmail : m.gonderenEmail;
            if (partner && !acc.find((k: any) => k.email === partner)) acc.push({ email: partner });
            return acc;
          }, []);
          setSohbetKanallari(kanallar);
        }
      } catch (err) {
        console.error("Sinyal kesildi.");
      } finally {
        setYukleniyor(false);
      }
    };

    if (session?.user?.email) mesajlariGetir();
  }, [session]);

  // 🚀 MESAJ MÜHÜRLEME (POST)
  const handleMesajGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaj.trim() || !aktifKanal) return;

    try {
      const res = await fetch("/api/mesajlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: aktifKanal,  
          ilanId: ilanId || null,
          icerik: mesaj            
        }),
      });

      if (res.ok) {
        const result = await res.json();
        // Yeni mesajı ekranda anında göster
        setMesajGecmisi([...mesajGecmisi, result.mesaj]);
        setMesaj("");
      } else {
        const err = await res.json();
        alert(`Sinyal Hatası: ${err.error}`);
      }
    } catch (err) {
      alert("Sinyal iletilemedi! Ağ bağlantısını kontrol edin.");
    }
  };

  // Aktif kanal ile olan mesajları filtrele 
  const gosterilecekMesajlar = mesajGecmisi.filter(m => 
    (m.gonderenEmail === session?.user?.email && m.aliciEmail === aktifKanal) ||
    (m.gonderenEmail === aktifKanal && m.aliciEmail === session?.user?.email)
  );

  if (status === "loading" || yukleniyor) return <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black italic tracking-widest">SİBER AĞ TARANIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-24">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 h-[calc(100vh-10rem)]">
        
        <div className="mb-6 flex justify-between items-end">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic">Siber <span className="text-[#00f260]">Haberleşme.</span></h1>
          <div className="bg-white/[0.03] border border-white/5 px-5 py-2.5 rounded-2xl text-[#00f260] text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f260] animate-pulse"></span> Terminal Çevrimiçi
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] flex flex-col md:flex-row h-full overflow-hidden shadow-2xl relative">
          
          {/* 📂 SOL: SOHBET KANALLARI */}
          <div className={`w-full md:w-80 border-r border-white/[0.05] flex flex-col ${aktifKanal && (sohbetKanallari.length > 0 || aktifKanal === saticiEmail) ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              
              {/* URL'den gelen (İlan sayfasından yönlendirilen) yeni sohbet sinyali */}
              {saticiEmail && !sohbetKanallari.find(k => k.email === saticiEmail) && (
                <button onClick={() => setAktifKanal(saticiEmail)} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all border ${aktifKanal === saticiEmail ? 'bg-[#00f260]/10 border-[#00f260]/30 shadow-lg' : 'bg-white/[0.02] border-transparent'}`}>
                  <div className="w-12 h-12 bg-[#00f260] text-black rounded-2xl flex items-center justify-center text-xl font-black">⚡</div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-white font-black text-[10px] uppercase truncate">YENİ BAĞLANTI</h4>
                    <p className="text-[#00f260] text-[9px] font-bold truncate">{saticiEmail}</p>
                  </div>
                </button>
              )}

              {sohbetKanallari.map((kanal) => (
                <button key={kanal.email} onClick={() => setAktifKanal(kanal.email)} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all border ${aktifKanal === kanal.email ? 'bg-white/[0.05] border-white/10 shadow-lg' : 'bg-transparent border-transparent opacity-40 hover:opacity-100'}`}>
                  <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center text-xl border border-white/5 text-slate-500">👤</div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs truncate uppercase tracking-tighter">{kanal.email.split('@')[0]}</h4>
                    <p className="text-slate-500 text-[8px] truncate uppercase">{kanal.email}</p>
                  </div>
                </button>
              ))}

              {sohbetKanallari.length === 0 && !saticiEmail && (
                 <div className="p-5 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest mt-10">
                   Kayıtlı Sinyal Yok
                 </div>
              )}
            </div>
          </div>

          {/* 📟 SAĞ: SİBER MESAJ AKIŞI */}
          <div className={`flex-1 flex flex-col bg-[#050505]/50 ${aktifKanal ? 'flex' : 'hidden md:flex'}`}>
            {aktifKanal ? (
              <>
                <div className="p-6 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setAktifKanal(null)} className="md:hidden text-[#00f260] font-black text-xl px-2">←</button>
                    <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tighter italic">BAĞLANTI: <span className="text-[#00f260]">{aktifKanal}</span></h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar flex flex-col">
                   {gosterilecekMesajlar.length > 0 ? gosterilecekMesajlar.map((m, idx) => (
                      <div key={idx} className={`flex flex-col ${m.gonderenEmail === session?.user?.email ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-[2rem] text-sm md:text-base ${m.gonderenEmail === session?.user?.email ? 'bg-[#00f260] text-black font-medium rounded-tr-none shadow-[0_10px_30px_rgba(0,242,96,0.15)]' : 'bg-white/[0.03] border border-white/5 text-slate-300 rounded-tl-none shadow-xl'}`}>
                          {m.icerik}
                        </div>
                        <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest mt-2 px-2">
                          {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                   )) : (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                        <span className="text-5xl mb-4">🛰️</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sohbeti Başlatın.</p>
                     </div>
                   )}
                </div>

                <div className="p-4 md:p-8 bg-[#0a0a0a]/50 border-t border-white/[0.05]">
                  <form onSubmit={handleMesajGonder} className="flex items-center gap-2 md:gap-4 bg-[#050505] border border-white/[0.08] rounded-[2rem] p-2 pr-2 shadow-inner focus-within:border-[#00f260]/40 transition-all">
                    <input 
                      value={mesaj}
                      onChange={(e) => setMesaj(e.target.value)}
                      type="text" 
                      placeholder="Sinyali mühürle..." 
                      className="flex-1 bg-transparent border-none text-white text-xs md:text-sm outline-none px-4" 
                    />
                    <button type="submit" disabled={!mesaj.trim()} className="px-6 md:px-8 py-3 bg-[#00f260] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] disabled:opacity-50 disabled:hover:scale-100">
                      İLET
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                <span className="text-8xl mb-8 grayscale">💬</span>
                <p className="text-xl font-black uppercase tracking-[0.4em]">Sinyal Bekleniyor</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SiberMesajlar() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black animate-pulse tracking-widest">SİNYAL TAŞINIYOR...</div>}>
      <MesajlarIcerik />
    </Suspense>
  );
}
