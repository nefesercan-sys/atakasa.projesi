"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, Trash2, Power, ShieldAlert, Activity, Users, Database, Eye, Robot } from "lucide-react";

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

  // 📊 İSTATİSTİKLER
  const toplamIlan = safeListings.length;
  const aktifIlan = safeListings.filter((i: any) => i.durum !== 'pasif').length;
  const toplamHacim = safeListings.reduce((acc: number, ilan: any) => acc + (Number(ilan.fiyat || 0) || 0), 0);

  // 🔍 FİLTRELEME
  const filtrelenmisIlanlar = safeListings.filter((ilan: any) => {
    const searchStr = (ilan.baslik + " " + (ilan.sellerEmail || ilan.satici || "")).toLowerCase();
    return searchStr.includes(arama.toLowerCase());
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
        setAiSonuc(`✅ ${data.uretilen} takas ilanı siber ağa enjekte edildi!`);
        mutateListings();
      } else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e: any) { setAiSonuc('❌ Sistem Hatası: ' + e.message); }
    setAiYukleniyor(false);
  };

  const handleGlobalIlanSil = async (id: string, baslik: string) => {
    if (!confirm(`⚠️ MASTER UYARI: "${baslik}" silinsin mi?`)) return;
    await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
    mutateListings();
  };

  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black italic text-2xl animate-pulse">SİBER KİLİT KONTROL EDİLİYOR...</div>;
  if (!isMasterAdmin) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4"><ShieldAlert className="w-32 h-32 text-red-500 mb-6" /><h1 className="text-white font-black uppercase tracking-tighter">YETKİ REDDEDİLDİ</h1></div>;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans italic flex flex-col md:flex-row">
      
      {/* 🧭 ADMİN SOL PANEL */}
      <div className="w-full md:w-72 bg-[#050505] border-r border-red-500/20 flex flex-col pt-24 z-20 md:h-screen md:sticky md:top-0 shadow-[20px_0_50px_rgba(239,68,68,0.1)]">
        <div className="px-8 mb-10 shrink-0">
          <h1 className="text-4xl font-black italic text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">GOD<span className="text-white">MODE.</span></h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{aktifEmail}</p>
        </div>

        <nav className="flex flex-col gap-2 px-6 flex-1">
          {[
            { id: "ozet", icon: <Activity size={18}/>, ad: "Sistem Özeti" },
            { id: "ilanlar", icon: <Database size={18}/>, ad: "Tüm Varlıklar", bildirim: toplamIlan },
            { id: "kullanicilar", icon: <Users size={18}/>, ad: "Ajanlar (Üyeler)", bildirim: safeUsers.length },
            { id: "ai_motoru", icon: <Robot size={18}/>, ad: "AI İlan Motoru" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setArama("");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === menu.id ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-slate-400 hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">{menu.icon} {menu.ad}</div>
              {menu.bildirim && <span className="bg-black/30 px-2 py-0.5 rounded text-[8px]">{menu.bildirim}</span>}
            </button>
          ))}
        </nav>

        <div className="px-6 py-8 border-t border-white/5 mt-auto">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} /> ÇIKIŞ YAP
          </button>
        </div>
      </div>

      {/* 📡 SAĞ PANEL */}
      <div className="flex-1 p-4 md:p-12 md:pt-24 relative overflow-x-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-red-500 opacity-[0.02] blur-[150px] rounded-full"></div>

        {/* 📟 SEKME: ÖZET */}
        {aktifSekme === "ozet" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-10 tracking-tighter">Sistem <span className="text-red-500">Özeti.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Toplam Varlık</p>
                <p className="text-5xl font-black">{toplamIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#00f260]/20 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-[#00f260] text-[10px] font-black uppercase mb-1">Aktif İlan</p>
                <p className="text-5xl font-black text-white">{aktifIlan}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-cyan-500/20 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-cyan-400 text-[10px] font-black uppercase mb-1">Toplam Hacim</p>
                <p className="text-3xl font-black truncate text-white">{toplamHacim.toLocaleString()} ₺</p>
              </div>
              <div className="bg-[#0a0a0a] border border-red-500/20 p-8 rounded-[2.5rem] shadow-xl">
                <p className="text-red-500 text-[10px] font-black uppercase mb-1">Kayıtlı Ajanlar</p>
                <p className="text-5xl font-black text-white">{safeUsers.length}</p>
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
                <label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block flex justify-between">
                  <span>Enjekte Edilecek Adet</span>
                  <span className="text-white text-base">{aiAdet} Adet</span>
                </label>
                <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-red-500" />
              </div>
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase transition-all ${aiYukleniyor ? 'bg-white/10 text-slate-500' : 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-[1.02]'}`}>
                {aiYukleniyor ? '⏳ CLAUDE AI VERİ ÜRETİYOR...' : '🤖 YAPAY İLANLARI SİSTEME GÖNDER'}
              </button>
            </div>
            {aiSonuc && <div className="mt-6 p-6 rounded-2xl border text-xs font-black bg-red-500/10 border-red-500/30 text-red-500 uppercase tracking-widest">{aiSonuc}</div>}
          </div>
        )}

        {/* 🗄️ SEKME: TÜM VARLIKLAR */}
        {aktifSekme === "ilanlar" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Varlık <span className="text-red-500">Denetimi.</span></h2>
              <input type="text" placeholder="Varlık veya E-posta Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="bg-[#0a0a0a] border border-white/10 rounded-xl px-6 py-3 text-xs outline-none focus:border-red-500 w-64" />
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="p-5">Görsel</th><th className="p-5">Varlık Bilgisi</th><th className="p-5">Fiyat</th><th className="p-5 text-right">İşlem</th></tr>
                </thead>
                <tbody>
                  {filtrelenmisIlanlar.map((ilan: any) => (
                    <tr key={ilan._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-5">
                        <div className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden">
                          <img src={ilan.resimler?.[0] || "https://placehold.co/50?text=YOK"} className="w-full h-full object-cover" alt="" />
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-white text-sm truncate max-w-[250px]">{ilan.baslik}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{ilan.kategori} | {ilan.sehir}</p>
                      </td>
                      <td className="p-5 font-black text-[#00f260]">{Number(ilan.fiyat || 0).toLocaleString()} ₺</td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleGlobalIlanSil(ilan._id, ilan.baslik)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={16}/></button>
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
