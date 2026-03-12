"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, Trash2, Power, ShieldAlert, Activity, Users, Database, Eye, Cpu } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const ADMIN_EMAILS = ["ercannefes@gmail.com"];
const sehirler = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"];

export default function SiberAdminTerminali() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const aktifEmail = String(session?.user?.email || "").toLowerCase();
  const isMasterAdmin = ADMIN_EMAILS.includes(aktifEmail);

  const [aktifSekme, setAktifSekme] = useState("ozet");
  const [arama, setArama] = useState("");
  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('İstanbul');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  const { data: allListingsData, mutate: mutateListings } = useSWR(isMasterAdmin ? `/api/varliklar` : null, fetcher, { refreshInterval: 5000 });
  const { data: allUsersData } = useSWR(isMasterAdmin ? `/api/admin/users` : null, fetcher, { refreshInterval: 5000 });
  
  let rawListings: any[] = Array.isArray(allListingsData) ? allListingsData : (allListingsData?.data || allListingsData?.ilanlar || []);
  const safeListings = rawListings.filter((item: any) => item !== null);
  const safeUsers = Array.isArray(allUsersData) ? allUsersData : (allUsersData?.data || []);

  const toplamIlan = safeListings.length;
  const aktifIlan = safeListings.filter((i: any) => i.durum !== 'pasif').length;
  const toplamHacim = safeListings.reduce((acc: number, ilan: any) => acc + (Number(ilan.fiyat || 0) || 0), 0);

  const aiIlanOlustur = async () => {
    setAiYukleniyor(true);
    setAiSonuc('');
    try {
      const res = await fetch('/api/ai-ilan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategoriId: aiKategori, sehir: aiSehir, adet: aiAdet, adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY }),
      });
      const data = await res.json();
      if (data.success) { setAiSonuc(`✅ ${data.uretilen} takas ilanı enjekte edildi!`); mutateListings(); }
      else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e: any) { setAiSonuc('❌ Sistem Hatası'); }
    setAiYukleniyor(false);
  };

  const handleGlobalIlanSil = async (id: string) => {
    if (!confirm(`Varlık silinsin mi?`)) return;
    await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
    mutateListings();
  };

  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black italic text-2xl animate-pulse">SİBER KİLİT KONTROL EDİLİYOR...</div>;
  if (!isMasterAdmin) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white italic">YETKİ REDDEDİLDİ.</div>;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans italic flex flex-col md:flex-row">
      <div className="w-full md:w-72 bg-[#050505] border-r border-red-500/20 flex flex-col pt-24 z-20 md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10 shrink-0"><h1 className="text-4xl font-black text-red-500"> GODMODE. </h1></div>
        <nav className="flex flex-col gap-2 px-6 flex-1">
          {[
            { id: "ozet", icon: <Activity size={18}/>, ad: "Radar" },
            { id: "ilanlar", icon: <Database size={18}/>, ad: "Varlıklar" },
            { id: "ai_motoru", icon: <Cpu size={18}/>, ad: "AI Motoru" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => setAktifSekme(menu.id)} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === menu.id ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-slate-400 hover:bg-white/5'}`}>
              {menu.icon} {menu.ad}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-4 md:p-12 relative">
        {aktifSekme === "ozet" && <h2 className="text-6xl font-black uppercase mb-10">Sistem <span className="text-red-500">Özeti.</span></h2>}
        {aktifSekme === "ai_motoru" && (
          <div className="animate-in fade-in duration-500 max-w-2xl">
            <h2 className="text-4xl font-black uppercase mb-6 text-red-500">AI Motoru.</h2>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem]">
              <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-red-500 mb-6">
                <option value="vasita">🚗 Vasıta</option><option value="elektronik">📱 Elektronik</option><option value="emlak">🏠 Emlak</option>
              </select>
              <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-red-500 mb-10" />
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className="w-full py-5 rounded-2xl bg-red-500 text-white font-black">{aiYukleniyor ? '⏳ ÇALIŞIYOR...' : '🤖 İLANLARI ENJEKTE ET'}</button>
            </div>
            {aiSonuc && <div className="mt-6 p-6 rounded-2xl border bg-red-500/10 border-red-500/30 text-red-500 text-xs font-black">{aiSonuc}</div>}
          </div>
        )}
        {aktifSekme === "ilanlar" && (
          <div className="bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black text-slate-400"><tr><th className="p-5">Görsel</th><th className="p-5">Varlık</th><th className="p-5">Fiyat</th><th className="p-5 text-right">İşlem</th></tr></thead>
              <tbody>
                {safeListings.map((ilan: any) => (
                  <tr key={ilan._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="p-5"><div className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden"><img src={ilan.resimler?.[0] || "https://placehold.co/50?text=YOK"} className="w-full h-full object-cover" /></div></td>
                    <td className="p-5"><p className="font-bold text-white text-sm">{ilan.baslik}</p></td>
                    <td className="p-5 font-black text-[#00f260]">{ilan.fiyat?.toLocaleString()} ₺</td>
                    <td className="p-5 text-right"><button onClick={() => handleGlobalIlanSil(ilan._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button></td>
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
