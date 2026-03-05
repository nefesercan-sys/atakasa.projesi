"use client";

import React, { useState, useEffect, Suspense } from "react"; // 🛡️ Suspense eklendi
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// 🚀 ASIL TERMİNAL İÇERİĞİ (Ayrı bir fonksiyon olarak tanımlandı)
function MesajlarIcerik() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const saticiEmail = searchParams.get("satici");
  const [aktifSohbet, setAktifSohbet] = useState<string | null>(saticiEmail ? "yeni-teklif" : null);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  const sohbetler = [
    { id: "1", isim: "Kaan Y.", konu: "MacBook Pro M3 Max", sonMesaj: "Üzerine ne kadar nakit düşünüyorsun?", saat: "10:42", avatar: "👨‍💻" },
    { id: "2", isim: "Selin A.", konu: "Rolex Submariner", sonMesaj: "Fotoğrafları inceledim...", saat: "Dün", avatar: "👩‍💼" },
  ];

  const handleMesajGonder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesaj.trim()) return;
    setMesaj("");
    alert("TEKLİF SİNYALİ İLETİLDİ!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 h-[calc(100vh-10rem)]">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white italic">Siber <span className="text-[#00f260]">Ağ.</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Güvenli Takas Hattı</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] flex flex-col md:flex-row h-full overflow-hidden shadow-2xl relative">
          {/* SOL: KANALLAR */}
          <div className={`w-full md:w-80 border-r border-white/[0.05] flex flex-col ${aktifSohbet && aktifSohbet !== "yeni-teklif" ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {saticiEmail && (
                <button onClick={() => setAktifSohbet("yeni-teklif")} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all border ${aktifSohbet === "yeni-teklif" ? 'bg-[#00f260]/10 border-[#00f260]/30 shadow-lg' : 'bg-white/[0.02] border-transparent opacity-60'}`}>
                  <div className="w-12 h-12 bg-[#00f260] text-black rounded-2xl flex items-center justify-center text-xl font-black">⚡</div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest truncate">YENİ TEKLİF SİNYALİ</h4>
                    <p className="text-[#00f260] text-[9px] font-bold truncate mt-1">{saticiEmail}</p>
                  </div>
                </button>
              )}
              {sohbetler.map((s) => (
                <button key={s.id} onClick={() => setAktifSohbet(s.id)} className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all border ${aktifSohbet === s.id ? 'bg-white/[0.05] border-white/10 shadow-lg' : 'bg-transparent border-transparent opacity-40'}`}>
                  <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center text-2xl border border-white/5">{s.avatar}</div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs truncate">{s.isim}</h4>
                    <p className="text-slate-400 text-[10px] truncate">{s.sonMesaj}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ: MESAJ AKIŞI */}
          <div className={`flex-1 flex flex-col bg-[#050505]/50 ${aktifSohbet ? 'flex' : 'hidden md:flex'}`}>
            {aktifSohbet ? (
              <>
                <div className="p-6 border-b border-white/[0.05] bg-[#0a0a0a]/80 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setAktifSohbet(null)} className="md:hidden text-slate-400 text-xl">←</button>
                    <h3 className="text-white font-black text-sm uppercase tracking-tighter">{aktifSohbet === "yeni-teklif" ? "SİNYAL BAĞLANTISI" : "ARŞİV KANALI"}</h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col justify-center items-center opacity-30 text-center">
                   <span className="text-5xl mb-4">🛰️</span>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">Güvenli Kanal Hazır.</p>
                </div>
                <div className="p-8 bg-[#0a0a0a]/50 border-t border-white/[0.05]">
                  <form onSubmit={handleMesajGonder} className="flex items-center gap-4 bg-[#050505] border border-white/[0.08] rounded-[2rem] p-2 pr-2">
                    <input value={mesaj} onChange={(e) => setMesaj(e.target.value)} type="text" placeholder="Mesajını mühürle..." className="flex-1 bg-transparent border-none text-white text-sm outline-none px-4" />
                    <button className="px-8 py-3.5 bg-[#00f260] text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,242,96,0.3)]">GÖNDER</button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                <span className="text-8xl mb-8 grayscale">💬</span>
                <p className="text-xl font-black uppercase tracking-[0.4em]">Sinyal Seçilmedi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🛡️ ANA SAYFA BİLEŞENİ: Suspense Kalkanı ile Korunuyor
export default function SiberMesajlar() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black italic tracking-[0.3em] animate-pulse">
        SİNYAL TAŞINIYOR...
      </div>
    }>
      <MesajlarIcerik />
    </Suspense>
  );
}
