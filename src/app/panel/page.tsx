"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SiberPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("varliklar");
  
  // 📡 CANLI VERİ STATE'LERİ
  const [benimIlanlar, setBenimIlanlar] = useState<any[]>([]);
  const [gelenTeklifler, setGelenTeklifler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🛡️ SİBER GÜVENLİK DUVARI
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    }
  }, [status, router]);

  // 📡 GERÇEK ZAMANLI VERİ SENTEZLEME MOTORU (GÜNCELLENDİ)
  useEffect(() => {
    const veriSentezle = async () => {
      if (!session?.user?.email) return;
      
      try {
        setLoading(true);
        
        // 🚀 cache: "no-store" eklendi! Anlık veri çeker. (BUZUL KIRICI)
        const resIlan = await fetch("/api/varliklar", { cache: "no-store" });
        const ilanlar = await resIlan.json();
        
        const filtreIlan = ilanlar.filter((i: any) => 
          i.satici === session.user?.email || i.satici?.email === session.user?.email
        );
        setBenimIlanlar(filtreIlan);

        // 🚀 cache: "no-store" eklendi! Anlık teklif sinyallerini çeker.
        const resMesaj = await fetch("/api/mesajlar", { cache: "no-store" });
        if (resMesaj.ok) {
          const mesajlar = await resMesaj.json();
          const filtreTeklif = mesajlar.filter((m: any) => m.alici === session.user?.email);
          setGelenTeklifler(filtreTeklif);
        }

      } catch (err) {
        console.error("Siber veri akışı hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) veriSentezle();
  }, [session]); // Sadece session değiştiğinde çalışır

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black italic tracking-[0.3em] animate-pulse">
        SİNYAL DOĞRULANIYOR...
      </div>
    );
  }

  const handleCikis = () => {
    signOut({ callbackUrl: "/" });
  };

  // 🗑️ VARLIK KALDIRMA FONKSİYONU (Opsiyonel)
  const varlikKaldir = async (id: string) => {
    if (confirm("Bu varlığı piyasadan çekmek istediğine emin misin?")) {
      alert("Varlık kaldırma özelliği bir sonraki siber operasyonda eklenecektir.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN DERİNLİĞİ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* 👤 PROFİL HEADER */}
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
                {session?.user?.name || "KULLANICI"}
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f260] animate-pulse"></span> {session?.user?.email}
              </p>
            </div>
          </div>

          <button 
            onClick={handleCikis}
            className="px-8 py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            SİSTEMDEN GÜVENLİ ÇIKIŞ ✕
          </button>
        </div>

        {/* 📊 İSTATİSTİKLER */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 text-center shadow-inner">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Mühürlü Varlıklar</p>
              <p className="text-2xl font-black text-[#00f260]">{benimIlanlar.length}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 text-center shadow-inner">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Gelen Sinyaller</p>
              <p className="text-2xl font-black text-white">{gelenTeklifler.length}</p>
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
            TAKAS SİNYALLERİ ({gelenTeklifler.length})
          </button>
        </div>

        {/* 💠 CANLI İÇERİK ALANI */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="text-center py-20 animate-pulse text-slate-600 font-bold uppercase tracking-widest text-[10px]">
              VERİTABANI TARANIYOR...
            </div>
          ) : activeTab === "varliklar" ? (
            benimIlanlar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benimIlanlar.map((ilan) => (
                  <div key={ilan._id} className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2rem] p-4 flex gap-6 items-center shadow-xl hover:border-[#00f260]/30 transition-all group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 relative">
                      <img 
                        src={ilan.resimler?.[0] || "https://via.placeholder.com/150"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        alt="Varlık Resmi" 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg uppercase tracking-tighter truncate">{ilan.baslik}</h3>
                      <p className="text-[#00f260] font-black text-sm">{Number(ilan.fiyat).toLocaleString()} ₺</p>
                      <div className="flex gap-4 mt-4">
                        <Link href={`/varlik/${ilan._id}`} className="text-[9px] font-black text-white bg-white/5 px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-white/10 transition-colors">İncele</Link>
                        <button onClick={() => varlikKaldir(ilan._id)} className="text-[9px] font-black text-red-500/50 uppercase tracking-widest hover:text-red-500 transition-colors">Kaldır</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30 text-center p-10">
                <span className="text-5xl mb-6 grayscale">📡</span>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Henüz Canlı Varlık Akışı Yok</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {gelenTeklifler.length > 0 ? gelenTeklifler.map((teklif) => (
                <div key={teklif._id} className="bg-[#0a0a0a] border border-white/[0.05] p-6 rounded-[2rem] flex justify-between items-center border-l-4 border-l-[#00f260] shadow-xl">
                  <div>
                    <p className="text-[9px] text-[#00f260] font-black uppercase tracking-widest">GELEN SİNYAL</p>
                    <h4 className="text-white font-bold text-sm mt-1">{teklif.gonderen} tarafından</h4>
                    <p className="text-slate-400 text-xs mt-2 italic">"{teklif.metin}"</p>
                  </div>
                  <Link href={`/mesajlar?satici=${teklif.gonderen}`} className="bg-[#00f260] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Cevapla</Link>
                </div>
              )) : (
                <div className="text-center py-20 text-slate-600 uppercase font-black text-xs tracking-widest opacity-20">
                  Henüz bir takas teklifi almadın.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}            </div>
          )}
        </div>

      </div>
    </div>
  );
}
