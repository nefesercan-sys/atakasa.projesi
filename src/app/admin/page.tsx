"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SiberAdminTerminali() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🛡️ MASTER YETKİ KONTROLÜ
  const MASTER_ADMIN_EMAIL = "nefesercan@gmail.com"; 

  const [aktifSekme, setAktifSekme] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // 📡 VERİ MERKEZİ
  const [istatistikler, setIstatistikler] = useState({
    toplamKullanici: 0, toplamVarlik: 0, aktifTakas: 0, toplamHacim: "0 ₺"
  });
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [ilanlar, setIlanlar] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    } else if (status === "authenticated") {
      if (session?.user?.email?.toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase()) {
        alert("🚨 SİBER İHLAL: Yetkisiz Erişim!");
        router.push("/");
      } else {
        siberAgiTara();
      }
    }
  }, [status, router]);

  // 📡 SİSTEM TARAMA MOTORU
  const siberAgiTara = async () => {
    setLoading(true);
    try {
      // 1. İlanları (Varlıkları) Çek
      const resIlan = await fetch("/api/varliklar");
      const dataIlan = await resIlan.json();
      const cekilenIlanlar = Array.isArray(dataIlan) ? dataIlan : dataIlan.ilanlar || [];
      setIlanlar(cekilenIlanlar);
      
      // 2. Kullanıcıları (Ajanları) Çek
      const resUsers = await fetch("/api/admin/users");
      const cekilenKullanicilar = await resUsers.json();
      setKullanicilar(cekilenKullanicilar);

      // İstatistik Hesaplama
      let toplamHacimVal = 0;
      cekilenIlanlar.forEach((i: any) => toplamHacimVal += Number(i.price || i.fiyat || 0));

      setIstatistikler({
        toplamKullanici: cekilenKullanicilar.length,
        toplamVarlik: cekilenIlanlar.length,
        aktifTakas: 0, // Geliştirilebilir
        toplamHacim: `${toplamHacimVal.toLocaleString()} ₺`
      });

    } catch (error) { console.error("Tarama hatası:", error); }
    setLoading(false);
  };

  // 🔥 OPERASYON: İLANI AĞDAN SİL
  const handleIlanSil = async (id: string, baslik: string) => {
    if(!confirm(`🚨 DİKKAT: "${baslik}" ilanını kalıcı olarak silmek istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/varliklar/${id}`, { method: 'DELETE' });
      if(res.ok) {
        alert("💥 İMHA BAŞARILI: Varlık ağdan silindi!");
        setIlanlar(prev => prev.filter(i => i._id !== id));
      }
    } catch (e) { alert("Sinyal koptu!"); }
  };

  // 🛡️ OPERASYON: KULLANICIYI AĞDAN TEMİZLE
  const handleKullaniciSil = async (email: string) => {
    if(email === MASTER_ADMIN_EMAIL) return alert("Kendinizi silemezsiniz Komutan!");
    if(!confirm(`🚨 KRİTİK: ${email} kullanıcısını sistemden tamamen yok etmek istiyor musunuz?`)) return;
    
    try {
      const res = await fetch(`/api/admin/users?email=${email}&adminEmail=${session?.user?.email}`, {
        method: "DELETE",
      });
      
      if(res.ok) {
        alert("⚡ AJAN TEMİZLENDİ: Üye veritabanından silindi!");
        setKullanicilar(prev => prev.filter(k => k.email !== email));
      }
    } catch (e) { alert("Bağlantı hatası!"); }
  };

  if (loading || status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black animate-pulse tracking-widest">SİNYAL ÇÖZÜMLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row italic">
      
      {/* 🧭 SOL PANEL: NAVİGASYON */}
      <div className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col pt-8 z-20">
        <div className="px-6 mb-10">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">A-TAKASA</h1>
          <div className="h-1 w-12 bg-[#00f260] mt-1"></div>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          <button onClick={() => setAktifSekme("dashboard")} className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "dashboard" ? 'bg-[#00f260]/10 text-[#00f260]' : 'text-slate-500 hover:bg-white/5'}`}>📟 Radar</button>
          <button onClick={() => setAktifSekme("varliklar")} className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "varliklar" ? 'bg-[#00f260]/10 text-[#00f260]' : 'text-slate-500 hover:bg-white/5'}`}>📦 Varlıklar ({ilanlar.length})</button>
          <button onClick={() => setAktifSekme("kullanicilar")} className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "kullanicilar" ? 'bg-[#00f260]/10 text-[#00f260]' : 'text-slate-500 hover:bg-white/5'}`}>👥 Ajanlar ({kullanicilar.length})</button>
        </nav>
      </div>

      {/* 📟 ANA EKRAN */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        
        {aktifSekme === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
             <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem]">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Piyasa Hacmi</p>
                <p className="text-4xl font-black text-[#00f260]">{istatistikler.toplamHacim}</p>
             </div>
             <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem]">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Aktif Ajan</p>
                <p className="text-4xl font-black text-white">{istatistikler.toplamKullanici}</p>
             </div>
             <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem]">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Toplam İlan</p>
                <p className="text-4xl font-black text-white">{istatistikler.toplamVarlik}</p>
             </div>
          </div>
        )}

        {aktifSekme === "varliklar" && (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden animate-in slide-in-from-right duration-500">
             <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                   <tr><th className="p-5">İLAN BAŞLIĞI</th><th className="p-5">DEĞER</th><th className="p-5">SATICI</th><th className="p-5 text-right">MÜDAHALE</th></tr>
                </thead>
                <tbody className="text-[11px] font-bold uppercase">
                   {ilanlar.map((i) => (
                      <tr key={i._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                         <td className="p-5 text-white">{i.title || i.baslik}</td>
                         <td className="p-5 text-[#00f260]">{Number(i.price || i.fiyat).toLocaleString()} ₺</td>
                         <td className="p-5 text-slate-400">{i.sellerEmail || i.satici}</td>
                         <td className="p-5 text-right">
                            <button onClick={() => handleIlanSil(i._id, i.title || i.baslik)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all shadow-lg">AĞDAN SİL</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {aktifSekme === "kullanicilar" && (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden animate-in slide-in-from-right duration-500">
             <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                   <tr><th className="p-5">AJAN E-POSTA</th><th className="p-5">STATÜ</th><th className="p-5 text-right">SİBER KALKAN</th></tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                   {kullanicilar.map((k) => (
                      <tr key={k._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                         <td className="p-5 text-white">{k.email}</td>
                         <td className="p-5"><span className="bg-[#00f260]/10 text-[#00f260] px-3 py-1 rounded uppercase text-[9px]">AKTİF</span></td>
                         <td className="p-5 text-right">
                            {k.email !== MASTER_ADMIN_EMAIL && (
                               <button onClick={() => handleKullaniciSil(k.email)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all shadow-lg">TAMAMEN SİL</button>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

      </div>
    </div>
  );
}
