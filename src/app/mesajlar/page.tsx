"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function MesajlarIcerik() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🛡️ Sinyal Bilgileri
  const saticiEmail = searchParams.get("satici");
  const ilanId = searchParams.get("ilan");

  const [mesaj, setMesaj] = useState("");
  const [mesajGecmisi, setMesajGecmisi] = useState<any[]>([]);
  const [sohbetKanallari, setSohbetKanallari] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifKanal, setAktifKanal] = useState<string | null>(saticiEmail);

  // 🛡️ GÜVENLİK DUVARI
  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  // 📡 VERİ ÇEKME MOTORU (Mesajları Getir)
  useEffect(() => {
    const mesajlariGetir = async () => {
      try {
        const res = await fetch("/api/mesajlar");
        const data = await res.json();
        
        if (res.ok) {
          // 1. Tüm Mesaj Geçmişini Set Et
          setMesajGecmisi(data);
          
          // 2. Benzersiz Sohbet Kanallarını Oluştur (Kiminle konuşuyorum?)
          const kanallar = data.reduce((acc: any[], m: any) => {
            const partner = m.gonderen === session?.user?.email ? m.alici : m.gonderen;
            if (!acc.find(k => k.email === partner)) acc.push({ email: partner });
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

    if (session) mesajlariGetir();
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
          alici: aktifKanal,
          ilanId: ilanId || "65e000000000000000000000", // Varsayılan ID (Hata önleyici)
          metin: mesaj
        }),
      });

      if (res.ok) {
        const yeniMesaj = await res.json();
        setMesajGecmisi([...mesajGecmisi, yeniMesaj]);
        setMesaj("");
      }
    } catch (err) {
      alert("Sinyal iletilemedi!");
    }
  };

  // Aktif kanal ile olan mesajları filtrele
  const gosterilecekMesajlar = mesajGecmisi.filter(m => 
    (m.gonderen === session?.user?.email && m.alici === aktifKanal) ||
    (m.gonderen === aktifKanal && m.alici === session?.user?.email)
  );

  if (status === "loading") return <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black italic">AĞ TARANIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 h-[calc(100vh-10rem)]">
        
        <div className="mb-6 flex justify-between items-end">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white italic">Siber <span className="text-[#00f260]">Ağ.</span></h1>
          <div className="bg-white/[0.03] border border-white/5 px-5 py-2.5 rounded-2xl text-[#00f260] text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f260] animate-pulse"></span> Terminal Çevrimiçi
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] flex flex-col md:flex-row h-full overflow-hidden shadow-2xl relative">
          
          {/* 📂 SOL: SOHBET KANALLARI */}
          <div className={`w-full md:w-80 border-r border-white/[0.05] flex flex-col ${aktifKanal && aktifKanal !== saticiEmail ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              {/* URL'den gelen yeni teklif sinyali */}
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
                  <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center text-xl border border-white/5">👤</div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs truncate uppercase tracking-tighter">{kanal.email.split('@')[0]}</h4>
                    <p className="text-slate-500 text-[8px] truncate uppercase">{kanal.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 📟 SAĞ: SİBER MESAJ AKIŞI */}
          <div className={`flex-1 flex flex-col bg-[#050505]/50 ${aktifKanal ? 'flex' : 'hidden md:flex'}`}>
            {aktifKanal ? (
              <>
                <div className="p-6 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setAktifKanal(null)} className="md:hidden text-slate-400 text-xl">←</button>
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter italic">BAĞLANTI: <span className="text-[#00f260]">{aktifKanal}</span></h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar flex flex-col">
                   {gosterilecekMesajlar.length > 0 ? gosterilecekMesajlar.map((m, idx) => (
                      <div key={idx} className={`flex flex-col ${m.gonderen === session?.user?.email ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-5 rounded-[2rem] ${m.gonderen === session?.user?.email ? 'bg-[#00f260] text-black font-medium rounded-tr-none shadow-[0_10px_30px_rgba(0,242,96,0.15)]' : 'bg-white/[0.03] border border-white/5 text-slate-300 rounded-tl-none shadow-xl'}`}>
                          {m.metin}
                        </div>
                        <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest mt-3 px-2">
                          {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                   )) : (
                     <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                        <span className="text-5xl mb-4">🛰️</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">İlk Sinyali Gönderin.</p>
                     </div>
                   )}
                </div>

                <div className="p-8 bg-[#0a0a0a]/50 border-t border-white/[0.05]">
                  <form onSubmit={handleMesajGonder} className="flex items-center gap-4 bg-[#050505] border border-white/[0.08] rounded-[2rem] p-2 pr-2 shadow-inner focus-within:border-[#00f260]/40 transition-all">
                    <input 
                      value={mesaj}
                      onChange={(e) => setMesaj(e.target.value)}
                      type="text" 
                      placeholder="Mesaj sinyalini mühürle..." 
                      className="flex-1 bg-transparent border-none text-white text-sm outline-none px-4" 
                    />
                    <button className="px-8 py-3.5 bg-[#00f260] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                      GÖNDER
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

// 🛡️ SUSPENSE KALKANI: Vercel build hatasını önler
export default function SiberMesajlar() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black animate-pulse">SİNYAL TAŞINIYOR...</div>}>
      <MesajlarIcerik />
    </Suspense>
  );
}
