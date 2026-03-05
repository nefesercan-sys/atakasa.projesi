"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SiberPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 🎛️ DEV SEKMELER
  const [activeTab, setActiveTab] = useState("varliklar");
  
  // 📡 CANLI VERİ STATE'LERİ
  const [benimIlanlar, setBenimIlanlar] = useState<any[]>([]);
  const [gelenTeklifler, setGelenTeklifler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🛡️ SİBER GÜVENLİK DUVARI
  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  // 📡 GERÇEK ZAMANLI VERİ SENTEZLEME (Mevcut Çalışan Motorlar)
  useEffect(() => {
    const veriSentezle = async () => {
      if (!session?.user?.email) return;
      try {
        setLoading(true);
        const resIlan = await fetch("/api/varliklar", { cache: "no-store" });
        const ilanlar = await resIlan.json();
        
        const filtreIlan = ilanlar.filter((i: any) => 
          i.satici === session.user?.email || i.satici?.email === session.user?.email
        );
        setBenimIlanlar(filtreIlan);

        const resMesaj = await fetch("/api/mesajlar", { cache: "no-store" });
        if (resMesaj.ok) {
          const mesajlar = await resMesaj.json();
          const filtreTeklif = mesajlar.filter((m: any) => m.alici === session.user?.email);
          setGelenTeklifler(filtreTeklif);
        }
      } catch (err) {
        console.error("Veri akışı hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    if (session) veriSentezle();
  }, [session]);

  if (status === "loading") return <div className="min-h-screen bg-black flex items-center justify-center text-[#00f260] font-black italic tracking-[0.3em] animate-pulse">SİNYAL DOĞRULANIYOR...</div>;

  const handleCikis = () => signOut({ callbackUrl: "/" });

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pb-32 pt-6">
      
      {/* 🌌 ARKA PLAN */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 animate-in fade-in duration-1000">
        
        {/* 👤 PROFİL & CÜZDAN HEADER */}
        <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-[2.5rem] p-6 md:p-10 mb-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#00f260]/10 border border-[#00f260]/30 rounded-full flex items-center justify-center text-3xl md:text-4xl relative">
              👤
              <div className="absolute -bottom-2 -right-2 bg-[#00f260] text-black text-[9px] font-black px-2 py-1 rounded-full uppercase border-2 border-[#0a0a0a]">PRO</div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">{session?.user?.name || "KULLANICI"}</h1>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f260] animate-pulse"></span> {session?.user?.email}
              </p>
            </div>
          </div>

          {/* 💰 SİBER CÜZDAN (YENİ) */}
          <div className="bg-white/[0.02] border border-[#00f260]/20 p-5 rounded-3xl w-full md:w-auto flex items-center justify-between gap-8">
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Kullanılabilir Bakiye</p>
              <p className="text-2xl font-black text-[#00f260]">0.00 <span className="text-sm text-white">₺</span></p>
            </div>
            <button className="bg-[#00f260] text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,242,96,0.3)]">+</button>
          </div>

          <button onClick={handleCikis} className="w-full md:w-auto px-8 py-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            ÇIKIŞ
          </button>
        </div>

        {/* 🎛️ DEV SEKME MENÜSÜ (KAYDIRILABİLİR) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
          {[
            { id: "varliklar", label: `Mühürlü Varlıklar (${benimIlanlar.length})`, icon: "💎" },
            { id: "teklifler", label: `Gelen Sinyaller (${gelenTeklifler.length})`, icon: "📥" },
            { id: "giden_teklifler", label: "Verdiğim Teklifler (0)", icon: "📤" },
            { id: "takas_sureci", label: "Aktif Takas Süreci", icon: "🔄" },
            { id: "favoriler", label: "İzleme Listesi", icon: "⭐" },
            { id: "gecmis", label: "İşlem Geçmişi (Alınan/Satılan)", icon: "📜" },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === tab.id ? "bg-[#00f260] text-black border-[#00f260] shadow-[0_0_20px_rgba(0,242,96,0.2)]" : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5"}`}
            >
              <span className="text-sm">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* 💠 CANLI İÇERİK ALANI */}
        <div className="min-h-[500px] bg-[#0a0a0a] border border-white/[0.02] rounded-[2.5rem] p-6 md:p-10 shadow-xl">
          
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-50 text-center">
              <span className="text-4xl mb-4 animate-spin">⚙️</span>
              <p className="text-[10px] text-[#00f260] font-bold uppercase tracking-widest animate-pulse">Veritabanı Senkronize Ediliyor...</p>
            </div>
          ) : activeTab === "varliklar" ? (
            /* 💎 VARLIKLARIM (ÇALIŞIYOR) */
            benimIlanlar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benimIlanlar.map((ilan) => (
                  <div key={ilan._id} className="bg-black/50 border border-white/[0.05] rounded-3xl p-4 shadow-xl hover:border-[#00f260]/30 transition-all group">
                    <img src={ilan.resimler?.[0] || "https://via.placeholder.com/150"} className="w-full h-48 object-cover rounded-2xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-white font-bold text-sm uppercase truncate mb-1">{ilan.baslik}</h3>
                    <p className="text-[#00f260] font-black text-lg mb-4">{Number(ilan.fiyat).toLocaleString()} ₺</p>
                    <div className="flex gap-2">
                      <Link href={`/varlik/${ilan._id}`} className="flex-1 text-center py-3 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase hover:bg-white/10">İncele</Link>
                      <button className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-colors">Kaldır</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="💎" text="Mühürlü varlığın bulunmuyor." sub="At Takasa menüsünden piyasaya yeni bir varlık sür." />
            )
          ) : activeTab === "teklifler" ? (
            /* 📥 GELEN TEKLİFLER (ÇALIŞIYOR) */
            gelenTeklifler.length > 0 ? (
               <div className="space-y-4">
                 {gelenTeklifler.map((t) => (
                   <div key={t._id} className="bg-black/50 border border-l-4 border-l-[#00f260] border-y-white/5 border-r-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                       <p className="text-[9px] text-[#00f260] font-black uppercase tracking-widest mb-1">YENİ SİNYAL</p>
                       <p className="text-white font-medium text-sm">"{t.metin}"</p>
                       <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase">{t.gonderen} tarafından</p>
                     </div>
                     <Link href={`/mesajlar?satici=${t.gonderen}`} className="w-full md:w-auto text-center px-8 py-3 bg-[#00f260] text-black rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-transform">Cevapla</Link>
                   </div>
                 ))}
               </div>
            ) : (
              <EmptyState icon="📥" text="Henüz gelen bir takas sinyali yok." sub="Varlıkların keşfedilmeyi bekliyor." />
            )
          ) : activeTab === "takas_sureci" ? (
            /* 🔄 TAKAS SÜRECİ (GÖRSEL TASLAK) */
            <div className="space-y-6">
              <div className="bg-black/50 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center text-xl">📦</div>
                   <div>
                     <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">KARGODA</p>
                     <p className="text-white font-bold text-sm mt-1">MacBook Pro M3 Max Takası</p>
                     <p className="text-slate-400 text-xs mt-1">Takip No: Bekleniyor</p>
                   </div>
                 </div>
                 <button className="px-6 py-2 bg-white/5 text-slate-300 rounded-lg text-[10px] font-black uppercase">Detay</button>
              </div>
              
              <div className="bg-black/50 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center text-xl">⏳</div>
                   <div>
                     <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">ONAY BEKLİYOR</p>
                     <p className="text-white font-bold text-sm mt-1">Rolex Submariner</p>
                     <p className="text-slate-400 text-xs mt-1">Karşı tarafın onayı bekleniyor.</p>
                   </div>
                 </div>
                 <button className="px-6 py-2 bg-white/5 text-slate-300 rounded-lg text-[10px] font-black uppercase">Detay</button>
              </div>
              <p className="text-center text-[10px] text-slate-600 font-bold uppercase mt-8 tracking-widest">Bu veriler modül aktif edildiğinde canlanacaktır.</p>
            </div>
          ) : (
            /* DİĞER BOŞ SEKMELER İÇİN ORTAK GÖRÜNÜM */
            <EmptyState icon="🚧" text="Siber İnşaat Devam Ediyor" sub="Bu modül bir sonraki veritabanı güncellemesinde aktif edilecek." />
          )}

        </div>
      </div>
    </div>
  );
}

// 🎨 YARDIMCI BİLEŞEN: Boş Durum Tasarımı
function EmptyState({ icon, text, sub }: { icon: string, text: string, sub: string }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center opacity-30 text-center px-4">
      <span className="text-6xl mb-6 grayscale">{icon}</span>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{text}</p>
      <p className="text-[10px] mt-3 text-slate-400 font-bold tracking-widest leading-relaxed max-w-sm">{sub}</p>
    </div>
  );
}
