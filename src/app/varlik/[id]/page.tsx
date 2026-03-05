"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VarlikDetay() {
  const { id } = useParams();
  const [ilan, setIlan] = useState<any>(null);

  useEffect(() => {
    const veriGetir = async () => {
      const res = await fetch("/api/varliklar");
      const data = await res.json();
      const bulundu = data.find((i: any) => i._id === id);
      setIlan(bulundu);
    };
    veriGetir();
  }, [id]);

  if (!ilan) return <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260]">SİNYAL İŞLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="aspect-video bg-white/5 rounded-[3rem] overflow-hidden mb-8 border border-white/10">
          <img src={ilan.resimler?.[0]} className="w-full h-full object-cover" />
        </div>
        <span className="text-[#00f260] text-xs font-black uppercase tracking-[0.3em]">{ilan.kategori}</span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-2 mb-6">{ilan.baslik}</h1>
        <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 mb-8">
          <p className="text-slate-400 text-sm mb-2 uppercase font-bold">Varlık Değeri</p>
          <p className="text-4xl font-black text-[#00f260]">{Number(ilan.fiyat).toLocaleString()} ₺</p>
        </div>
        <p className="text-slate-300 leading-relaxed text-lg">{ilan.aciklama}</p>
        
        {/* TAKAS BUTONU */}
        <button className="w-full mt-12 py-6 bg-[#00f260] text-black font-black uppercase rounded-[2rem] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,242,96,0.3)]">
          TEKLİF GÖNDER & TAKAS ET
        </button>
      </div>
    </div>
  );
}
