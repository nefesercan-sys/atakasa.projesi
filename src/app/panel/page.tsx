"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function SiberPanel() {
  const [activeTab, setActiveTab] = useState("varliklar");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Demo Kullanıcı Verileri
  const user = {
    isim: "Ercan N.",
    seviye: "Pro Broker",
    toplamHacim: "570.000 ₺",
    basariliIslem: 42,
    bekleyenTeklif: 3
  };

  // Demo Aktif Varlıklar
  const varliklarim = [
    { id: 1, baslik: "MacBook Pro M3 Max", deger: "120.000 ₺", izlenme: 342, teklifSayisi: 2, resim: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=300" },
    { id: 2, baslik: "Rolex Submariner", deger: "450.000 ₺", izlenme: 856, teklifSayisi: 1, resim: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=300" }
  ];

  // Demo Gelen Teklifler
  const gelenTeklifler = [
    { id: 101, varlik: "MacBook Pro M3 Max", teklifEden: "Kaan Y.", teklifVarlik: "iPhone 15 Pro Max 1TB", nakitEk: "+ 15.000 ₺", zaman: "10 dk önce" },
    { id: 102, varlik: "MacBook Pro M3 Max", teklifEden: "Selin A.", teklifVarlik: "Sony A7 IV + Lens", nakitEk: "Kafa Kafaya", zaman: "2 saat önce" },
    { id: 103, varlik: "Rolex Submariner", teklifEden: "Burak T.", teklifVarlik: "2015 Vespa GTS 300", nakitEk: "+ 50.000 ₺", zaman: "1 gün önce" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className={`relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* 👤 PROFİL HEADER (Cüzdan/Portföy Özeti) */}
        <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-[2.5rem] p-8 md:p-10 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f260] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-6 z-10">
            <div className="w-24 h-24 bg-white/[0.05] border border-white/10 rounded-full flex items-center justify-center text-4xl shadow-inner relative">
              👤
              <div className="absolute -bottom-2 -right-2 bg-[#00f260] text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest border-2 border-[#0a0a0a]">
                {user.seviye}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{user.isim}</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f260] animate-pulse"></span> Sistemde Aktif
              </p>
            </div>
          </div>

          <div className="flex gap-6 z-10 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 text-center shadow-inner">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Portföy Hacmi</p>
              <p className="text-2xl font-black text-[#00f260]">{user.toplamHacim}</p>
            </div>
            <div className="flex-1 md:flex-none bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 text-center shadow-inner">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">İşlemler</p>
              <p className="text-2xl font-black text-white">{user.basariliIslem}</p>
            </div>
          </div>
        </div>

        {/* 🎛️ SEKMELER (TABS) */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8 pb-2">
          <button onClick={() => setActiveTab("varliklar")} className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === "varliklar" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "bg-white/[0.03] text-slate-400 border border-white/[0.05] hover:text-white hover:bg-white/[0.05]"}`}>
            Aktif Varlıklarım
          </button>
          <button onClick={() => setActiveTab("teklifler")} className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${activeTab === "teklifler" ? "bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]" : "bg-white/[0.03] text-slate-400 border border-white/[0.05] hover:text-[#00f260]"}`}>
            Takas Sinyalleri 
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "teklifler" ? "bg-black text-[#00f260]" : "bg-[#00f260]/20 text-[#00f260]"}`}>{user.bekleyenTeklif}</span>
          </button>
        </div>

        {/* 🔄 İÇERİK ALANI */}
        <div className="min-h-[400px]">
          
          {/* SEKTÖR 1: AKTİF VARLIKLARIM */}
          {activeTab === "varliklar" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {varliklarim.map((v) => (
                <div key={v.id} className="bg-[#0a0a0a] border border-white/[0.04] rounded-[2rem] p-4 flex items-center gap-6 hover:border-white/[0.1] transition-all group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#111] flex-shrink-0">
                    <img src={v.resim} alt={v.baslik} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">{v.baslik}</h3>
                    <p className="text-[#00f260] font-black text-lg mb-3">{v.deger}</p>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-1">👁️ {v.izlenme} Gösterim</span>
                      <span className="flex items-center gap-1 text-[#00f260]">⚡ {v.teklifSayisi} Açık Teklif</span>
                    </div>
                  </div>
                  <button className="w-12 h-12 bg-white/[0.05] rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-colors mr-2">
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
              ))}
              
              {/* Yeni Varlık Ekle Butonu */}
              <Link href="/ilan-ver" className="border-2 border-dashed border-white/[0.1] rounded-[2rem] p-4 flex flex-col items-center justify-center gap-3 hover:border-[#00f260]/50 hover:bg-[#00f260]/[0.02] transition-all min-h-[160px] group">
                <div className="w-14 h-14 bg-white/[0.05] rounded-full flex items-center justify-center text-[#00f260] group-hover:scale-110 transition-transform text-2xl">
                  ＋
                </div>
                <span className="text-slate-400 group-hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Piyasaya Yeni Varlık Sür</span>
              </Link>
            </div>
          )}

          {/* SEKTÖR 2: TAKAS SİNYALLERİ (TEKLİFLER) */}
          {activeTab === "teklifler" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {gelenTeklifler.map((t) => (
                <div key={t.id} className="bg-[#0a0a0a] border border-[#00f260]/20 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,242,96,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00f260]"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[#00f260] text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-[#00f260]/10 rounded-md mb-2 inline-block">Sinyal: {t.zaman}</span>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <strong className="text-white">{t.teklifEden}</strong>, senin <strong className="text-white">{t.varlik}</strong> varlığına teklif yaptı:
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 bg-[#050505] border border-white/[0.05] p-6 rounded-3xl mb-6">
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Önerilen Varlık</p>
                      <p className="text-lg font-black text-white">{t.teklifVarlik}</p>
                    </div>
                    <div className="text-3xl text-slate-600 hidden md:block">🔄</div>
                    <div className="flex-1 text-center md:text-right">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Nakit Tamamlama</p>
                      <p className={`text-lg font-black ${t.nakitEk === "Kafa Kafaya" ? "text-slate-300" : "text-[#00f260]"}`}>{t.nakitEk}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-[#00f260] text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,96,0.3)] transition-all">
                      Teklifi Onayla
                    </button>
                    <button className="flex-1 py-4 bg-white/[0.05] text-white border border-white/10 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 hover:text-red-400 transition-all">
                      Reddet
                    </button>
                    <button className="w-16 flex items-center justify-center bg-white/[0.05] text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xl">
                      💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
