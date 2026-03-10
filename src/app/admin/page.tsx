"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, Trash2, Power, ShieldAlert, Activity, Users, Database, Eye } from "lucide-react";

// 📡 SWR VERİ ÇEKME MOTORU
const fetcher = (url: string) => fetch(url).then(res => res.json());

// 👑 MASTER ADMİN MAİLİ (Sadece bu mail buraya girebilir!)
const ADMIN_EMAILS = ["ercannefes@gmail.com"];

export default function SiberAdminTerminali() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const aktifEmail = session?.user?.email?.toLowerCase() || "";
  const isMasterAdmin = ADMIN_EMAILS.includes(aktifEmail);

  // 🎛️ ADMİN KONTROLLERİ
  const [aktifSekme, setAktifSekme] = useState("ozet");
  const [arama, setArama] = useState("");

  // 📡 SİBER AĞDAN TÜM VERİLERİ ÇEK
  const { data: allListingsData, mutate: mutateListings } = useSWR(isMasterAdmin ? `/api/varliklar` : null, fetcher, { refreshInterval: 5000 });
  const { data: allUsersData, mutate: mutateUsers } = useSWR(isMasterAdmin ? `/api/admin/users` : null, fetcher, { refreshInterval: 5000 });
  
  // 🛡️ ÇÖKMEYİ ENGELLEYEN SİBER ZIRH
  const safeListings = Array.isArray(allListingsData) ? allListingsData : (allListingsData?.data || allListingsData?.ilanlar || []);
  const safeUsers = Array.isArray(allUsersData) ? allUsersData : (allUsersData?.data || []);

  // 📊 ADMİN İSTATİSTİKLERİ
  const toplamIlan = safeListings.length;
  const aktifIlan = safeListings.filter((i: any) => i.durum !== 'pasif').length;
  const pasifIlan = toplamIlan - aktifIlan;
  const toplamHacim = safeListings.reduce((acc: number, ilan: any) => acc + Number(ilan.price || ilan.fiyat || 0), 0);

  // 🔍 FİLTRELEME MOTORU
  const filtrelenmisIlanlar = safeListings.filter((ilan: any) => 
    (ilan.baslik?.toLowerCase().includes(arama.toLowerCase()) || ilan.title?.toLowerCase().includes(arama.toLowerCase())) || 
    (ilan.sellerEmail?.toLowerCase().includes(arama.toLowerCase()) || ilan.satici?.toLowerCase().includes(arama.toLowerCase()))
  );

  const filtrelenmisKullanicilar = safeUsers.filter((k: any) => 
    (k.email?.toLowerCase().includes(arama.toLowerCase()))
  );

  // ── YÜKLENİYOR VE GÜVENLİK DUVARI ──
  if (status === "loading") {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black animate-pulse italic text-2xl tracking-widest">SİBER KİLİT KONTROL EDİLİYOR...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/giris");
    return null;
  }

  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-32 h-32 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 text-center">YETKİ REDDEDİLDİ</h1>
        <p className="text-slate-400 text-center mb-8">Bu alana sadece Atakasa.com Kurucu (Master) yöneticileri girebilir.</p>
        <button onClick={() => router.push('/')} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.5)]">Sivil Ağa Dön</button>
      </div>
    );
  }

  // 🚀 ADMİN AKSİYON MOTORLARI
  const handleGlobalIlanSil = async (id: string, baslik: string) => {
    if (!confirm(`⚠️ MASTER UYARI: "${baslik}" ilanını platformdan KALICI olarak siliyorsunuz. Onaylıyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("🗑️ Varlık sistemden tamamen yok edildi.");
        mutateListings(); 
      } else { alert("Silme işlemi başarısız."); }
    } catch (err) { alert("Bağlantı koptu."); }
  };

  const handleGlobalDurumDegistir = async (ilan: any) => {
    const yeniDurum = ilan.durum === "pasif" ? "aktif" : "pasif";
    const mesaj = yeniDurum === "pasif" 
      ? "Bu ilanı zorla YAYINDAN KALDIRIYORSUNUZ (Ban). Emin misiniz?" 
      : "Bu ilanın engelini kaldırıyorsunuz. Emin misiniz?";
    if (!confirm(mesaj)) return;

    try {
      const res = await fetch(`/api/varliklar/${ilan._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durum: yeniDurum }),
      });
      if (res.ok) mutateListings();
      else alert("Müdahale başarısız.");
    } catch (err) { alert("Bağlantı hatası."); }
  };

  const handleKullaniciSil = async (email: string) => {
    if (email === ADMIN_EMAILS[0]) return alert("Kendinizi silemezsiniz Komutan!");
    if (!confirm(`🚨 KRİTİK: ${email} kullanıcısını sistemden tamamen yok etmek istiyor musunuz?`)) return;
    
    try {
      const res = await fetch(`/api/admin/users?email=${email}&adminEmail=${session?.user?.email}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("⚡ AJAN TEMİZLENDİ: Üye veritabanından silindi!");
        mutateUsers();
      } else {
        alert("Kullanıcı silinemedi.");
      }
    } catch (e) { alert("Bağlantı hatası!"); }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans italic flex flex-col md:flex-row selection:bg-red-500 selection:text-white">
      
      {/* 🧭 ADMİN SOL PANEL (Kırmızı/Karanlık Konsept) */}
      <div className="w-full md:w-72 bg-[#050505] border-r border-red-500/20 flex flex-col pt-24 z-20 shadow-[20px_0_50px_rgba(239,68,68,0.1)] md:h-screen md:sticky md:top-0">
        
        <div className="px-8 mb-10 text-center md:text-left shrink-0">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GOD<span className="text-white">MODE.</span></h1>
          <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase truncate">Kurucu: {aktifEmail}</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 px-6 overflow-x-auto md:overflow-y-auto no-scrollbar flex-1 pb-6 md:pb-0">
          {[
            { id: "ozet", icon: <Activity size={18}/>, ad: "Sistem Özeti" },
            { id: "ilanlar", icon: <Database size={18}/>, ad: "Tüm Varlıklar", bildirim: toplamIlan },
            { id: "kullanicilar", icon: <Users size={18}/>, ad: "Ajanlar (Kullanıcı)", bildirim: safeUsers.length },
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setArama("");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3">{menu.icon} {menu.ad}</div>
              {menu.bildirim !== undefined && <span className={`px-2 py-0.5 rounded-md text-[8px] ${aktifSekme === menu.id ? 'bg-black/30' : 'bg-red-500/20 text-red-500'}`}>{menu.bildirim}</span>}
            </button>
          ))}
        </nav>

        <div className="px-6 py-8 border-t border-white/5 shrink-0 mt-auto hidden md:block">
          <button onClick={() => router.push('/')} className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white/5 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all mb-3">
            <Eye size={16} /> VİTRİNE DÖN
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <LogOut size={16} /> ÇIKIŞ YAP
          </button>
        </div>
      </div>

      {/* 📡 SAĞ PANEL (İÇERİK) */}
      <div className="flex-1 p-4 md:p-12 md:pt-24 relative overflow-x-hidden min-h-screen">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-red-500 opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

        {/* 📟 SEKME 1: SİSTEM ÖZETİ */}
        {aktifSekme === "ozet" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-10 tracking-tighter">Sistem <span className="text-red-500">Özeti.</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer" onClick={() => setAktifSekme('ilanlar')}>
                <div className="absolute -right-5 -top-5 text-7xl opacity-5 group-hover:scale-110 transition-transform">🌍</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Toplam İlan</p>
                <p className="text-4xl font-black text-white">{toplamIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#00f260]/20 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(0,242,96,0.1)] relative overflow-hidden group">
                <div className="absolute -right-5 -top-5 text-7xl opacity-5 group-hover:scale-110 transition-transform">✅</div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-1">Aktif Yayında</p>
                <p className="text-4xl font-black text-white">{aktifIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-red-500/20 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden group">
                <div className="absolute -right-5 -top-5 text-7xl opacity-5 group-hover:scale-110 transition-transform">🛑</div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">Pasif / Engelli</p>
                <p className="text-4xl font-black text-white">{pasifIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-cyan-500/20 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden group">
                <div className="absolute -right-5 -top-5 text-7xl opacity-5 group-hover:scale-110 transition-transform">💰</div>
                <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">Sistem İlan Hacmi</p>
                <p className="text-3xl font-black text-white truncate" title={`${toplamHacim} ₺`}>
                  {toplamHacim >= 1000000 ? `${(toplamHacim / 1000000).toFixed(1)}M` : toplamHacim.toLocaleString()} ₺
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer" onClick={() => setAktifSekme('kullanicilar')}>
                <div className="absolute -right-5 -top-5 text-7xl opacity-5 group-hover:scale-110 transition-transform">👥</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Kayıtlı Ajanlar</p>
                <p className="text-4xl font-black text-white">{safeUsers.length}</p>
              </div>
            </div>

          </div>
        )}

        {/* 🗄️ SEKME 2: TÜM İLANLAR (MÜDAHALE ALANI) */}
        {aktifSekme === "ilanlar" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Ağ <span className="text-red-500">Denetimi.</span></h2>
                <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Platformdaki tüm ilanları zorla yönetebilirsiniz.</p>
              </div>
              <div className="relative w-full md:w-72">
                <input type="text" placeholder="İlan Başlığı veya Email Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-5 pr-10 py-3 text-xs outline-none focus:border-red-500 text-white shadow-inner" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <th className="p-5">Görsel</th>
                      <th className="p-5">İlan Bilgisi</th>
                      <th className="p-5">Sahibi</th>
                      <th className="p-5">Fiyat</th>
                      <th className="p-5">Durum</th>
                      <th className="p-5 text-right">Master İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrelenmisIlanlar.map((ilan: any) => (
                      <tr key={ilan._id} className={`border-b border-white/5 hover:bg-white/[0.01] transition-colors ${ilan.durum === 'pasif' ? 'opacity-60 grayscale' : ''}`}>
                        <td className="p-5">
                          <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-white/10">
                             {ilan.resimler?.[0]?.includes(".mp4") ? <video src={ilan.resimler[0]} className="w-full h-full object-cover" /> : <img src={ilan.resimler?.[0] || "https://placehold.co/50"} className="w-full h-full object-cover" />}
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="font-bold text-sm text-white truncate max-w-[200px]" title={ilan.baslik || ilan.title}>{ilan.baslik || ilan.title}</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{ilan.kategori} | {ilan.sehir}</p>
                        </td>
                        <td className="p-5">
                          <p className="text-xs text-cyan-400 truncate max-w-[150px]">{ilan.sellerEmail || ilan.satici || ilan.userId || "Bilinmiyor"}</p>
                        </td>
                        <td className="p-5 font-black text-[#00f260]">
                          {Number(ilan.fiyat || ilan.price || 0).toLocaleString()} ₺
                        </td>
                        <td className="p-5">
                          {ilan.durum === 'pasif' ? 
                            <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[8px] font-black uppercase">PASİF</span> : 
                            <span className="bg-[#00f260]/20 text-[#00f260] px-2 py-1 rounded text-[8px] font-black uppercase">AKTİF</span>}
                        </td>
                        <td className="p-5 text-right flex items-center justify-end gap-2 h-full pt-6">
                          <button onClick={() => window.open(`/varlik/${ilan._id}`, '_blank')} className="p-2 bg-white/5 hover:bg-white text-slate-300 hover:text-black rounded-lg transition-colors" title="İlanı Gör">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleGlobalDurumDegistir(ilan)} className={`p-2 rounded-lg transition-colors ${ilan.durum === 'pasif' ? 'bg-[#00f260]/10 text-[#00f260] hover:bg-[#00f260] hover:text-black' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black'}`} title={ilan.durum === 'pasif' ? 'Yayına Al' : 'Yayından Kaldır'}>
                            <Power size={14} />
                          </button>
                          <button onClick={() => handleGlobalIlanSil(ilan._id, ilan.baslik || ilan.title)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors" title="Kalıcı Olarak Sil">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtrelenmisIlanlar.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Sistemde varlık bulunamadı.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 👥 SEKME 3: KULLANICILAR (AJANLAR) */}
        {aktifSekme === "kullanicilar" && (
           <div className="animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Ajan <span className="text-red-500">Veritabanı.</span></h2>
                <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">Sisteme kayıtlı tüm kullanıcıları yönetin.</p>
              </div>
              <div className="relative w-full md:w-72">
                <input type="text" placeholder="E-posta Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-5 pr-10 py-3 text-xs outline-none focus:border-red-500 text-white shadow-inner" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                     <tr><th className="p-5">AJAN E-POSTA</th><th className="p-5">STATÜ</th><th className="p-5 text-right">SİBER KALKAN</th></tr>
                  </thead>
                  <tbody className="text-[11px] font-bold">
                     {filtrelenmisKullanicilar.map((k: any) => (
                        <tr key={k._id || k.email} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                           <td className="p-5 text-white text-sm">{k.email}</td>
                           <td className="p-5">
                             {ADMIN_EMAILS.includes(k.email.toLowerCase()) ? (
                               <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg uppercase text-[9px] font-black">MASTER ADMİN</span>
                             ) : (
                               <span className="bg-[#00f260]/10 text-[#00f260] px-3 py-1 rounded-lg uppercase text-[9px] font-black">AKTİF AJAN</span>
                             )}
                           </td>
                           <td className="p-5 text-right">
                              {k.email.toLowerCase() !== ADMIN_EMAILS[0] && (
                                 <button onClick={() => handleKullaniciSil(k.email)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg flex items-center gap-2 ml-auto">
                                   <Trash2 size={12} /> SİL
                                 </button>
                              )}
                           </td>
                        </tr>
                     ))}
                     {filtrelenmisKullanicilar.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Kullanıcı bulunamadı.</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
           </div>
        )}

      </div>
    </div>
  );
}
