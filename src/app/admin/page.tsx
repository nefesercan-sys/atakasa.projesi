"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, Trash2, Power, ShieldAlert, Activity, Users, Database, Eye, Cpu } from "lucide-react";

// 📡 SWR VERİ ÇEKME MOTORU
const fetcher = (url: string) => fetch(url).then(res => res.json());

// 👑 MASTER ADMİN MAİLİ
const ADMIN_EMAILS = ["ercannefes@gmail.com"];

const sehirler = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"];

const getSafeText = (val: any, fallback: string) => {
  if (!val) return fallback;
  return String(val);
};

export default function SiberAdminTerminali() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const aktifEmail = String(session?.user?.email || "").toLowerCase();
  const isMasterAdmin = ADMIN_EMAILS.includes(aktifEmail);

  // 🎛️ ADMİN KONTROLLERİ
  const [aktifSekme, setAktifSekme] = useState("ozet");
  const [arama, setArama] = useState("");

  // 🤖 AI MOTORU STATE'LERİ
  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('İstanbul');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  // 📡 SİBER AĞDAN TÜM VERİLERİ ÇEK
  const { data: allListingsData, mutate: mutateListings } = useSWR(isMasterAdmin ? `/api/varliklar` : null, fetcher, { refreshInterval: 5000 });
  const { data: allUsersData, mutate: mutateUsers } = useSWR(isMasterAdmin ? `/api/admin/users` : null, fetcher, { refreshInterval: 5000 });
  
  // 🛡️ DİZİ (ARRAY) ZIRHI
  let rawListings: any[] = [];
  if (Array.isArray(allListingsData)) rawListings = allListingsData;
  else if (allListingsData?.data) rawListings = allListingsData.data;
  else if (allListingsData?.ilanlar) rawListings = allListingsData.ilanlar;

  const safeListings = rawListings.filter((item: any) => item !== null);
  const safeUsers = Array.isArray(allUsersData) ? allUsersData : (allUsersData?.data || []);

  // 📊 İSTATİSTİKLER (SATIRLAR BURADA ARTIYOR!)
  const toplamIlan = safeListings.length;
  const aktifIlan = safeListings.filter((i: any) => i.durum !== 'pasif' && i.aktif !== false).length;
  const pasifIlan = toplamIlan - aktifIlan;
  const toplamHacim = safeListings.reduce((acc: number, ilan: any) => acc + (Number(ilan.fiyat || 0) || 0), 0);

  // 🔍 FİLTRELEME MOTORU
  const filtrelenmisIlanlar = safeListings.filter((ilan: any) => {
    const searchStr = (getSafeText(ilan.baslik, "") + " " + (ilan.sellerEmail || ilan.satici || "")).toLowerCase();
    return searchStr.includes(arama.toLowerCase());
  });

  const filtrelenmisKullanicilar = safeUsers.filter((k: any) => {
    const email = getSafeText(k?.email, "").toLowerCase();
    return email.includes(arama.toLowerCase());
  });

  // 🚀 AI MOTORU TETİKLEYİCİSİ
  const aiIlanOlustur = async () => {
    setAiYukleniyor(true);
    setAiSonuc('');
    try {
      const res = await fetch('/api/ai-ilan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kategoriId: aiKategori,
          sehir: aiSehir,
          adet: aiAdet,
          adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSonuc(`✅ ${data.uretilen} takas ilanı başarıyla sisteme enjekte edildi!`);
        mutateListings();
      } else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e: any) { setAiSonuc('❌ Sistem Hatası: ' + e.message); }
    setAiYukleniyor(false);
  };

  const handleGlobalIlanSil = async (id: string, baslik: string) => {
    if (!confirm(`⚠️ MASTER UYARI: "${baslik}" silinsin mi?`)) return;
    const res = await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
    if (res.ok) mutateListings();
  };

  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black italic text-2xl animate-pulse">SİBER KİLİT KONTROL EDİLİYOR...</div>;
  if (!isMasterAdmin) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4"><ShieldAlert className="w-32 h-32 text-red-500 mb-6" /><h1 className="text-white font-black uppercase tracking-tighter">YETKİ REDDEDİLDİ</h1></div>;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans italic flex flex-col md:flex-row">
      
      {/* 🧭 ADMİN SOL PANEL */}
      <div className="w-full md:w-72 bg-[#050505] border-r border-red-500/20 flex flex-col pt-24 z-20 md:h-screen md:sticky md:top-0 shadow-[20px_0_50px_rgba(239,68,68,0.1)]">
        <div className="px-8 mb-10 shrink-0">
          <h1 className="text-4xl font-black italic text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GOD<span className="text-white">MODE.</span></h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest truncate">{aktifEmail}</p>
        </div>

        <nav className="flex flex-col gap-2 px-6 flex-1">
          {[
            { id: "ozet", icon: <Activity size={18}/>, ad: "Sistem Özeti" },
            { id: "ilanlar", icon: <Database size={18}/>, ad: "Varlık Denetimi", bildirim: toplamIlan },
            { id: "kullanicilar", icon: <Users size={18}/>, ad: "Ajan Veritabanı", bildirim: safeUsers.length },
            { id: "ai_motoru", icon: <Cpu size={18}/>, ad: "AI İlan Motoru" }, // 🛠️ Robot yerine Cpu (daha güvenli) kullanıldı
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setArama("");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === menu.id ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105' : 'text-slate-400 hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">{menu.icon} {menu.ad}</div>
              {menu.bildirim !== undefined && <span className="bg-black/30 px-2 py-0.5 rounded text-[8px]">{menu.bildirim}</span>}
            </button>
          ))}
        </nav>

        <div className="px-6 py-8 border-t border-white/5 mt-auto">
          <button onClick={() => router.push('/')} className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white/5 text-slate-300 rounded-2xl font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all mb-3">
             <Eye size={16} /> VİTRİNE GİT
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} /> ÇIKIŞ YAP
          </button>
        </div>
      </div>

      {/* 📡 SAĞ PANEL */}
      <div className="flex-1 p-4 md:p-12 md:pt-24 relative overflow-x-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-red-500 opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

        {/* 📟 SEKME: ÖZET */}
        {aktifSekme === "ozet" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-10 tracking-tighter">Sistem <span className="text-red-500">Özeti.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Tüm Varlıklar</p>
                <p className="text-5xl font-black text-white">{toplamIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#00f260]/20 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-[#00f260] text-[10px] font-black uppercase mb-1 tracking-widest">Aktif Yayın</p>
                <p className="text-5xl font-black text-white">{aktifIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-red-500/20 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-red-500 text-[10px] font-black uppercase mb-1 tracking-widest">Pasif/Engelli</p>
                <p className="text-5xl font-black text-white">{pasifIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-cyan-500/20 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-cyan-400 text-[10px] font-black uppercase mb-1 tracking-widest">Ağ Hacmi</p>
                <p className="text-3xl font-black truncate text-white">{toplamHacim.toLocaleString()} ₺</p>
              </div>
            </div>
          </div>
        )}

        {/* 🤖 SEKME: AI MOTORU */}
        {aktifSekme === "ai_motoru" && (
          <div className="animate-in fade-in duration-500 max-w-2xl">
            <h2 className="text-4xl font-black uppercase mb-6 text-red-500 tracking-tighter">AI İlan <span className="text-white">Motoru.</span></h2>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="mb-6">
                <label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block tracking-widest">Kategori Seçimi</label>
                <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-red-500 appearance-none">
                  <option value="vasita">🚗 Vasıta & Araç Takası</option>
                  <option value="elektronik">📱 Elektronik Takası</option>
                  <option value="emlak">🏠 Emlak & Konut Takası</option>
                  <option value="giyim">⌚ Saat & Moda Takası</option>
                  <option value="mobilya">🛋️ Mobilya Takası</option>
                  <option value="hobi">🎸 Hobi & Sanat Takası</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block flex justify-between tracking-widest">
                  <span>Enjekte Edilecek Adet</span>
                  <span className="text-white text-base font-black">{aiAdet} Adet</span>
                </label>
                <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-red-500 cursor-pointer" />
              </div>
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${aiYukleniyor ? 'bg-white/10 text-slate-500 cursor-wait' : 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-[1.02]'}`}>
                {aiYukleniyor ? '⏳ CLAUDE AI VERİ ÜRETİYOR...' : '🤖 YAPAY İLANLARI SİSTEME GÖNDER'}
              </button>
            </div>
            {aiSonuc && <div className="mt-6 p-6 rounded-2xl border text-xs font-black bg-red-500/10 border-red-500/30 text-red-500 uppercase tracking-widest text-center shadow-lg">{aiSonuc}</div>}
          </div>
        )}

        {/* 🗄️ SEKME: TÜM VARLIKLAR */}
        {aktifSekme === "ilanlar" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Ağ <span className="text-red-500">Denetimi.</span></h2>
              <input type="text" placeholder="Varlık veya E-posta Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="bg-[#0a0a0a] border border-white/10 rounded-xl px-6 py-3 text-xs outline-none focus:border-red-500 w-full md:w-64 shadow-inner" />
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <tr><th className="p-6">Görsel</th><th className="p-6">Varlık Bilgisi</th><th className="p-6">Fiyat</th><th className="p-6 text-right">Master İşlem</th></tr>
                  </thead>
                  <tbody>
                    {filtrelenmisIlanlar.map((ilan: any) => (
                      <tr key={ilan._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="p-6">
                          <div className="w-14 h-14 rounded-xl bg-black border border-white/10 overflow-hidden shadow-lg">
                            <img src={ilan.resimler?.[0] || "https://placehold.co/100?text=YOK"} className="w-full h-full object-cover" alt="" />
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="font-bold text-white text-sm truncate max-w-[250px]">{ilan.baslik}</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">{ilan.kategori} | {getSafeText(ilan.sellerEmail || ilan.satici, "Sistem")}</p>
                        </td>
                        <td className="p-6 font-black text-[#00f260] text-base">{Number(ilan.fiyat || 0).toLocaleString()} ₺</td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleGlobalIlanSil(ilan._id, ilan.baslik)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-md"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 👥 SEKME: AJANLAR (KULLANICILAR) */}
        {aktifSekme === "kullanicilar" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Ajan <span className="text-red-500">Veritabanı.</span></h2>
              <input type="text" placeholder="E-posta ile Ajan Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="bg-[#0a0a0a] border border-white/10 rounded-xl px-6 py-3 text-xs outline-none focus:border-red-500 w-full md:w-64" />
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="p-6">AJAN MAİL</th><th className="p-6">STATÜ</th><th className="p-6 text-right">SİBER KALKAN</th></tr>
                </thead>
                <tbody className="text-xs font-bold">
                  {filtrelenmisKullanicilar.map((k: any) => (
                    <tr key={k._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-6 text-white">{k.email}</td>
                      <td className="p-6">
                        {ADMIN_EMAILS.includes(k.email.toLowerCase()) ? 
                          <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-[8px] font-black uppercase">MASTER ADMİN</span> : 
                          <span className="bg-[#00f260]/10 text-[#00f260] px-3 py-1 rounded text-[8px] font-black uppercase">AKTİF AJAN</span>
                        }
                      </td>
                      <td className="p-6 text-right">
                        {k.email !== ADMIN_EMAILS[0] && <button className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-30 cursor-not-allowed"><Trash2 size={14} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
