"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Activity, ArrowLeftRight, BarChart2, Search } from "lucide-react";

export default function SiberBorsa() {
  const [arama, setArama] = useState("");

  // 🧠 Borsa Simülasyon Verileri (İleride MongoDB'den gelecek)
  const borsaVerileri = [
    { id: 1, kod: "APP-IPH13", isim: "Apple iPhone 13 Pro Max", kategori: "Elektronik", deger: "35.000 ₺", trend: "up", yuzde: "+5.2%", talep: "Çok Yüksek" },
    { id: 2, kod: "ASU-RTX3080", isim: "Asus ROG RTX 3080", kategori: "Bilgisayar", deger: "18.500 ₺", trend: "down", yuzde: "-1.4%", talep: "Orta" },
    { id: 3, kod: "AUD-A3", isim: "Audi A3 2016 S-Line", kategori: "Vasıta", deger: "1.250.000 ₺", trend: "up", yuzde: "+2.1%", talep: "Yüksek" },
    { id: 4, kod: "SON-PS5", isim: "Sony PlayStation 5", kategori: "Elektronik", deger: "19.000 ₺", trend: "up", yuzde: "+8.7%", talep: "Aşırı Yoğun" },
    { id: 5, kod: "IKE-KLT", isim: "IKEA 3'lü Koltuk", kategori: "Mobilya", deger: "4.500 ₺", trend: "down", yuzde: "-0.5%", talep: "Düşük" },
    { id: 6, kod: "MAC-M2", isim: "MacBook Air M2 16GB", kategori: "Bilgisayar", deger: "42.000 ₺", trend: "up", yuzde: "+3.4%", talep: "Yüksek" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white p-4 md:p-8">
      
      {/* 🚀 ÜST PANEL: Borsa Özeti */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 border-l-4 border-[#00f260] pl-4">
          TAKAS <span className="text-[#00f260]">TAHTASI</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-8">Canlı Varlık Piyasası ve Talep Endeksi</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0b0f19] border border-white/5 p-6 rounded-2xl">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14} className="text-[#00f260]"/> Toplam Hacim</div>
            <div className="text-3xl font-black text-white">4.8M ₺</div>
          </div>
          <div className="bg-[#0b0f19] border border-white/5 p-6 rounded-2xl">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><BarChart2 size={14} className="text-amber-400"/> Aktif İşlem Tahtası</div>
            <div className="text-3xl font-black text-white">1,248 <span className="text-sm text-slate-500 font-normal">Varlık</span></div>
          </div>
          <div className="bg-[#0b0f19] border border-white/5 p-6 rounded-2xl">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-[#00f260]"/> En Çok Aranan</div>
            <div className="text-xl font-black text-[#00f260] mt-2">Elektronik & Vasıta</div>
          </div>
        </div>

        {/* 🚀 ARAMA / FİLTRE ÇUBUĞU */}
        <div className="flex bg-[#0b0f19] border border-white/10 rounded-xl overflow-hidden mb-6 focus-within:border-[#00f260] transition-colors">
          <div className="p-4 flex items-center justify-center text-slate-500"><Search size={20} /></div>
          <input 
            type="text" 
            placeholder="Varlık Kodu veya İsim Ara... (Örn: APP-IPH13)" 
            className="w-full bg-transparent border-none text-white p-4 outline-none text-sm font-bold tracking-wider placeholder:text-slate-600"
            onChange={(e) => setArama(e.target.value)}
          />
        </div>

        {/* 🚀 BORSA TABLOSU (Takas Tahtası) */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <th className="p-5">Sembol / Kod</th>
                <th className="p-5">Varlık Adı</th>
                <th className="p-5">Kategori</th>
                <th className="p-5">Piyasa Değeri</th>
                <th className="p-5">Talep Trendi</th>
                <th className="p-5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {borsaVerileri.filter(item => item.isim.toLowerCase().includes(arama.toLowerCase()) || item.kod.toLowerCase().includes(arama.toLowerCase())).map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-5 text-[#00f260] tracking-widest text-xs">{item.kod}</td>
                  <td className="p-5 text-white group-hover:text-[#00f260] transition-colors">{item.isim}</td>
                  <td className="p-5 text-slate-400 text-xs uppercase tracking-wider">{item.kategori}</td>
                  <td className="p-5 text-white italic tracking-wider">{item.deger}</td>
                  <td className="p-5">
                    <div className={`flex items-center gap-2 text-xs font-black tracking-wider ${item.trend === 'up' ? 'text-[#00f260]' : 'text-red-500'}`}>
                      {item.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {item.yuzde}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase mt-1">{item.talep}</div>
                  </td>
                  <td className="p-5 text-right">
                    <Link href={`/takas-teklif?urun=${item.kod}`} className="inline-flex items-center gap-2 bg-[#00f260]/10 border border-[#00f260]/30 text-[#00f260] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all">
                      <ArrowLeftRight size={14} /> Tahtaya Gir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
