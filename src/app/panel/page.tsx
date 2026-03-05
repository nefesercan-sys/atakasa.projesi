"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SiberPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("varliklar");

  // 🛡️ SİBER GÜVENLİK DUVARI
  // Eğer kullanıcı giriş yapmamışsa (unauthenticated), onu kapıya (giris) fırlatır.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  // Yükleme ekranı (Sinyal aranıyor...)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black tracking-[0.3em] animate-pulse">
        SİNYAL DOĞRULANIYOR...
      </div>
    );
  }

  // 🛑 GÜVENLİ ÇIKIŞ FONKSİYONU
  const handleCikis = () => {
    signOut({ callbackUrl: "/" }); // Çıkış yapınca ana sayfaya atar
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* 👤 CANLI PROFİL HEADER */}
        <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-[2.5rem] p-8 md:p-10 mb-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-24 h-24 bg-[#00f260]/10 border border-[#00f260]/30 rounded-full flex items-center justify-center text-4xl shadow-inner relative">
              👤
              <div className="absolute -bottom-2 -right-2 bg-[#00f260] text-black text-[9px] font-black px-2 py-1 rounded-full uppercase border-2 border-[#0a0a0a]">
                PRO BROKER
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                {session?.user?.name || "BİLİNMEYEN"}
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f260] animate-pulse"></span> {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
             {/* 🛑 ÇIKIŞ BUTONU */}
             <button 
               onClick={handleCikis}
               className="px-8 py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
             >
               SİSTEMDEN GÜVENLİ ÇIKIŞ ✕
             </button>
          </div>
        </div>

        {/* 📊 İSTATİSTİK PANOLARI */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 text-center shadow-inner">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Portföy Hacmi</p>
              <p className="text-2xl font-black text-[#00f260]">570.000 ₺</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 text-center shadow-inner">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Başarılı İşlem</p>
              <p className="text-2xl font-black text-white">42</p>
            </div>
        </div>

        {/* 🎛️ SEKMELER */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8">
          <button 
            onClick={() => setActiveTab("varliklar")} 
            className={`px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "varliklar" ? "bg-white text-black shadow-lg" : "bg-white/[0.03] text-slate-500 border border-white/5"}`}
          >
            AKTİF VARLIKLARIM
          </button>
          <button 
            onClick={() => setActiveTab("teklifler")} 
            className={`px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "teklifler" ? "bg-[#00f260] text-black shadow-lg" : "bg-white/[0.03] text-slate-500 border border-white/5"}`}
          >
            TAKAS SİNYALLERİ (3)
          </button>
        </div>

        {/* İÇERİK ALANI */}
        <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 text-center p-10">
          <span className="text-5xl mb-6 grayscale">📡</span>
          <p className="text-xs font-black uppercase tracking-[0.2em]">Henüz Canlı Varlık Akışı Yok</p>
          <p className="text-[10px] mt-2 text-slate-500 uppercase font-bold tracking-widest">Piyasaya yeni varlık sürdüğünde burada görünecek.</p>
        </div>

      </div>
    </div>
  );
}
