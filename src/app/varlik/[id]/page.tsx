"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // 🛡️ useRouter eklendi

export default function VarlikDetay() {
  const { id } = useParams();
  const router = useRouter(); // 🛡️ Router başlatıldı
  const [ilan, setIlan] = useState<any>(null);

  useEffect(() => {
    const veriGetir = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        const bulundu = data.find((i: any) => i._id === id);
        setIlan(bulundu);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };
    veriGetir();
  }, [id]);

  // 🚀 TEKLİF GÖNDERME FONKSİYONU
  const teklifGonder = () => {
    if (!ilan) return;
    // Satıcı bilgisiyle birlikte mesajlar sayfasına ışınla
    router.push(`/mesajlar?satici=${ilan.satici}`);
  };

  if (!ilan) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse">
      SİNYAL İŞLENİYOR...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* 🖼️ VARLIK GÖRSELİ */}
        <div className="aspect-video bg-white/5 rounded-[3rem] overflow-hidden mb-8 border border-white/10 shadow-2xl">
          <img 
            src={ilan.resimler?.[0] || "https://via.placeholder.com/800x450?text=Gorsel+Yok"} 
            className="w-full h-full object-cover" 
            alt={ilan.baslik}
          />
        </div>

        {/* 🏷️ BİLGİ ALANI */}
        <span className="text-[#00f260] text-xs font-black uppercase tracking-[0.3em]">{ilan.kategori}</span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-2 mb-6 italic">{ilan.baslik}</h1>
        
        <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 mb-8 shadow-inner">
          <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-widest">Tahmini Değer</p>
          <p className="text-5xl font-black text-[#00f260] drop-shadow-[0_0_10px_rgba(0,242,96,0.3)]">
            {Number(ilan.fiyat).toLocaleString()} ₺
          </p>
        </div>

        <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/[0.05] mb-10">
          <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Varlık Açıklaması</p>
          <p className="text-slate-300 leading-relaxed text-lg">{ilan.aciklama}</p>
        </div>
        
        {/* ⚡ CANLI TAKAS BUTONU */}
        <button 
          onClick={teklifGonder} 
          className="w-full py-7 bg-gradient-to-r from-[#00f260] to-emerald-400 text-black font-black uppercase tracking-[0.2em] rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-[0_15px_40px_rgba(0,242,96,0.3)] active:scale-95"
        >
          TEKLİF GÖNDER & TAKAS ET
        </button>

      </div>
    </div>
  );
}
