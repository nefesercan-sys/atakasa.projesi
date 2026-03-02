"use client";
import React, { useState } from "react";

const kategoriler = {
  "Elektronik": ["Cep Telefonu", "Televizyon", "Laptop"],
  "Mobilya": ["Koltuk", "Yatak", "Masa"],
  "Vasıta": ["Otomobil", "Motosiklet"]
};

export default function IlanVer() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ category: "", price: 0, type: "takas_satis" });

  return (
    <div className="min-h-screen bg-[#030712] p-6 pt-24 text-white">
      <h2 className="text-3xl font-black italic border-l-4 border-[#38bdf8] pl-4 mb-10">TAKAS BAŞLAT</h2>
      
      {/* 📸 SİBER KAMERA ÜNİTESİ */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <label className="bg-[#0b0f19] border-2 border-dashed border-[#38bdf8]/30 p-10 rounded-[2rem] text-center cursor-pointer hover:border-[#38bdf8]">
          <input type="file" accept="image/*" capture="environment" className="hidden" />
          <span className="text-3xl block">📸</span> <span className="text-[10px] font-bold uppercase mt-2 block">RESİM ÇEK</span>
        </label>
        <label className="bg-[#0b0f19] border-2 border-dashed border-[#38bdf8]/30 p-10 rounded-[2rem] text-center cursor-pointer hover:border-[#38bdf8]">
          <input type="file" accept="video/*" capture="environment" className="hidden" />
          <span className="text-3xl block">🎥</span> <span className="text-[10px] font-bold uppercase mt-2 block">VİDEO KAYDET</span>
        </label>
      </div>

      {/* 📋 AKILLI FORM TERMİNALİ */}
      <div className="bg-[#0b0f19] p-8 rounded-[3rem] border border-white/5 space-y-6">
        <select className="w-full bg-[#030712] p-5 rounded-2xl border border-white/10 outline-none focus:border-[#38bdf8]" onChange={(e) => setData({...data, category: e.target.value})}>
          <option>Kategori Seçin</option>
          {Object.keys(kategoriler).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        
        <input type="number" placeholder="Ortalama Takas Fiyatı (₺)" className="w-full bg-[#030712] p-5 rounded-2xl border border-white/10 text-[#38bdf8] font-bold" />
        
        <div className="flex gap-2">
          {['takas', 'satis', 'ikisi'].map(t => (
            <button key={t} className={`flex-1 py-4 rounded-xl border text-[10px] font-black uppercase ${data.type === t ? 'bg-[#38bdf8] text-black' : 'border-white/10'}`} onClick={() => setData({...data, type: t})}>{t}</button>
          ))}
        </div>

        <button className="w-full bg-[#38bdf8] text-black py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-[#38bdf8]/20">İLANINIZI MÜHÜRLEYİN</button>
      </div>
    </div>
  );
}
