"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SiberAdminTerminali() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🛡️ SİBER MASTER GÜVENLİK DUVARI
  const MASTER_ADMIN_EMAIL = "nefesercan@gmail.com"; 

  const [aktifSekme, setAktifSekme] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // 📡 VERİ MERKEZİ
  const [istatistikler, setIstatistikler] = useState({
    toplamKullanici: 0, toplamVarlik: 0, aktifTakas: 0, toplamHacim: "0 ₺"
  });
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [takaslar, setTakaslar] = useState<any[]>([]);

  useEffect(() => {
    // 🛡️ Yetki Kontrolü
    if (status === "unauthenticated") {
      router.push("/giris");
    } else if (status === "authenticated") {
      if (session?.user?.email?.toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase()) {
        alert("🚨 SİBER İHLAL: Bu bölgeye erişim yetkiniz yok!");
        router.push("/");
      } else {
        siberAgiTara();
      }
    }
  }, [status, router]);

  // 📡 GERÇEK VERİLERİ ÇEKME MOTORU
  const siberAgiTara = async () => {
    setLoading(true);
    try {
      // 1. İlanları Çek
      let cekilenIlanlar = [];
      const resIlan = await fetch("/api/varliklar");
      if (resIlan.ok) {
        const dataIlan = await resIlan.json();
        cekilenIlanlar = Array.isArray(dataIlan) ? dataIlan : dataIlan.ilanlar || [];
        setIlanlar(cekilenIlanlar);
      }
      
      // 2. Takasları Çek 
      let cekilenTakaslar = [];
      const resTakas = await fetch("/api/takas");
      if (resTakas.ok) {
        const dataTakas = await resTakas.json();
        cekilenTakaslar = dataTakas || [];
        setTakaslar(cekilenTakaslar);
      }

      // 3. Kullanıcıları Çek
      let cekilenKullanicilar = [];
      const resUsers = await fetch("/api/admin/users");
      if (resUsers.ok) {
        cekilenKullanicilar = await resUsers.json();
        setKullanicilar(cekilenKullanicilar);
      }

      // İstatistikleri Hesapla
      let toplamPara = 0;
      cekilenIlanlar.forEach((i: any) => toplamPara += Number(i.price || i.fiyat || 0));

      setIstatistikler({
        toplamKullanici: cekilenKullanicilar.length,
        toplamVarlik: cekilenIlanlar.length,
        aktifTakas: cekilenTakaslar.length,
        toplamHacim: `${toplamPara.toLocaleString()} ₺`
      });

    } catch (error) {
      console.error("Ağ Taraması Başarısız:", error);
    }
    setLoading(false);
  };

  // 🔥 SİBER YÖNETİCİ AKSİYONU: İLAN SİL
  const handleIlanSil = async (id: string) => {
    if(!confirm("Bu varlığı siber ağdan tamamen SİLMEK üzeresiniz. Onaylıyor musunuz?")) return;
    try {
      const res = await fetch(`/api/varliklar/${id}`, { method: 'DELETE' });
      if(res.ok) {
        alert("💥 Varlık başarıyla imha edildi!");
        siberAgiTara(); // Paneli yenile
      } else {
        const err = await res.json();
        alert(`Silme reddedildi: ${err.error || "Bilinmeyen hata"}`);
      }
    } catch (e) { alert("Sinyal koptu!"); }
  };

  // 🛡️ SİBER YÖNETİCİ AKSİYONU: KULLANICI BANLA / BAN KALDIR
  const handleKullaniciBanla = async (email: string, mevcutDurum: string) => {
    if(email === MASTER_ADMIN_EMAIL) return alert("Kendini banlayamazsın Komutan!");
    
    const yeniDurum = mevcutDurum === "banli" ? "aktif" : "banli";
    const mesaj = yeniDurum === "banli" ? "MEN ETMEK (BANLAMAK)" : "AĞA GERİ ALMAK";

    if(!confirm(`${email} ajanını sistemden ${mesaj} istiyor musun?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, durum: yeniDurum, adminEmail: session?.user?.email })
      });
      
      if(res.ok) {
        alert(`⚡ İşlem Başarılı: Kullanıcı ${yeniDurum} yapıldı!`);
        siberAgiTara(); // Paneli yenile
      } else {
        const err = await res.json();
        alert(`İşlem reddedildi: ${err.error}`);
      }
    } catch (e) { alert("Sinyal gönderilemedi."); }
  };

  if (loading || status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black animate-pulse tracking-[0.2em]">KUMANDA MERKEZİ BAŞLATILIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row">
      
      {/* 🛡️ SOL PANEL: KONTROL MENÜSÜ */}
      <div className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col pt-8 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="px-6 mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">A-TAKASA</h1>
          <p className="text-[#00f260] text-[10px] font-black tracking-widest uppercase mt-1 animate-pulse">Ana Kumanda</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 px-4 overflow-x-auto md:overflow-hidden no-scrollbar pb-4 md:pb-0">
          {[
            { id: "dashboard", icon: "📟", ad: "Radar (Özet)" },
            { id: "varliklar", icon: "📦", ad: "Varlık Terminali" },
            { id: "kullanicilar", icon: "👥", ad: "Ajanlar (Üyeler)" },
            { id: "takaslar", icon: "🔄", ad: "Borsa Emirleri" },
            { id: "ayarlar", icon: "⚙️", ad: "Sistem Ayarları" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => setAktifSekme(menu.id)} className={`flex items-center gap-3 px-5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20 shadow-[0_0_15px_rgba(0,242,96,0.1)]' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-lg">{menu.icon}</span> {menu.ad}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-white/5 hidden md:block">
          <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Bağlı Yetkili:</p>
          <p className="text-cyan-400 text-xs font-black truncate">{session?.user?.email}</p>
        </div>
      </div>

      {/* 📡 SAĞ PANEL: MERKEZİ EKRAN */}
      <div className="flex-1 bg-[#050505] p-4 md:p-10 h-screen overflow-y-auto relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

        {/* 📟 SEKME 1: RADAR (DASHBOARD) */}
        {aktifSekme === "dashboard" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-black italic uppercase mb-8">Siber <span className="text-[#00f260]">Rapor.</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">👥</div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Toplam Ajan</p>
                <p className="text-4xl font-black text-white">{istatistikler.toplamKullanici}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">📦</div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Piyasadaki Varlık</p>
                <p className="text-4xl font-black text-white">{istatistikler.toplamVarlik}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#00f260]/20 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(0,242,96,0.05)] relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform text-[#00f260]">💰</div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-2">Borsa Hacmi</p>
                <p className="text-3xl font-black text-[#00f260]">{istatistikler.toplamHacim}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-cyan-500/20 p-6 rounded-[2rem] shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform text-cyan-500">🔄</div>
                <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2">Aktif Borsa Emirleri</p>
                <p className="text-4xl font-black text-white">{istatistikler.aktifTakas}</p>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl">
               <h3 className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">🚨 Sistem Uyarıları</h3>
               <p className="text-slate-400 text-sm">Şu an ağda olağandışı bir durum tespit edilmedi. Bütün siber kalkanlar devrede.</p>
            </div>
          </div>
        )}

        {/* 📦 SEKME 2: VARLIK TERMİNALİ */}
        {aktifSekme === "varliklar" && (
          <div className="animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black italic uppercase mb-8">Varlık <span className="text-[#00f260]">Terminali.</span></h2>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-5">Varlık</th>
                      <th className="p-5">Değer</th>
                      <th className="p-5">Satıcı</th>
                      <th className="p-5">Tarih</th>
                      <th className="p-5 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {ilanlar.map((ilan) => (
                      <tr key={ilan._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 font-bold text-white uppercase">{ilan.title || ilan.baslik}</td>
                        <td className="p-5 text-[#00f260] font-black">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</td>
                        <td className="p-5 text-slate-400">{ilan.sellerEmail || ilan.satici}</td>
                        <td className="p-5 text-slate-500">{new Date(ilan.createdAt).toLocaleDateString()}</td>
                        <td className="p-5 text-right">
                          <button onClick={() => window.open(`/varlik/${ilan._id}`, '_blank')} className="bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase mr-2 hover:bg-cyan-500 hover:text-black transition-colors">İncele</button>
                          <button onClick={() => handleIlanSil(ilan._id)} className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-colors shadow-lg">SİL</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 👥 SEKME 3: AJANLAR (KULLANICILAR) */}
        {aktifSekme === "kullanicilar" && (
          <div className="animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black italic uppercase mb-8">Ajan <span className="text-cyan-400">Veritabanı.</span></h2>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-5">Ajan E-Posta</th>
                      <th className="p-5">Rol</th>
                      <th className="p-5">Kayıt Tarihi</th>
                      <th className="p-5">Ağ Durumu</th>
                      <th className="p-5 text-right">Siber Kalkan</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {kullanicilar.map((kul) => (
                      <tr key={kul._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 font-bold text-white">{kul.email}</td>
                        <td className="p-5 text-cyan-400 font-black text-[9px] tracking-widest uppercase">{kul.rol || 'kullanici'}</td>
                        <td className="p-5 text-slate-500">{new Date(kul.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${kul.durum === 'aktif' || !kul.durum ? 'bg-[#00f260]/10 text-[#00f260]' : 'bg-red-500/10 text-red-500'}`}>
                            {kul.durum || 'aktif'}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          {kul.email !== MASTER_ADMIN_EMAIL && (
                             <button 
                               onClick={() => handleKullaniciBanla(kul.email, kul.durum || 'aktif')} 
                               className={`${kul.durum === 'banli' ? 'bg-amber-500 border-amber-500 text-black' : 'bg-red-500 border-red-500 text-white'} px-4 py-1.5 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.4)]`}
                             >
                               {kul.durum === 'banli' ? 'BANI KALDIR' : 'AĞDAN AT (BAN)'}
                             </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ⚙️ SEKME 4: SİSTEM AYARLARI */}
        {aktifSekme === "ayarlar" && (
           <div className="animate-in zoom-in-95 duration-500">
              <h2 className="text-3xl font-black italic uppercase mb-8">Sistem <span className="text-white">Ayarları.</span></h2>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] max-w-2xl">
                 <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block mb-2">Borsa Komisyon Oranı (%)</label>
                 <input type="number" defaultValue={2.5} className="w-full bg-[#030712] border border-white/10 text-white text-sm p-4 rounded-xl mb-6 outline-none focus:border-cyan-500" />
                 
                 <label className="text-red-500 text-[10px] font-black uppercase tracking-widest block mb-2">Sistemi Bakıma Al (Tüm işlemleri durdurur)</label>
                 <select className="w-full bg-[#030712] border border-white/10 text-white text-sm p-4 rounded-xl mb-8 outline-none focus:border-red-500">
                    <option value="false">🟢 SİSTEM AÇIK VE STABİL</option>
                    <option value="true">🔴 SİSTEMİ BAKIMA AL (KAPAT)</option>
                 </select>

                 <button className="w-full bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,242,96,0.3)]">
                   AYARLARI MÜHÜRLE
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
