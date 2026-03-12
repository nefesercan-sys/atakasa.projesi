"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { LogOut, Edit, Trash2, Power, Package, Cpu } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const sehirler = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"];

export default function SiberBorsaPaneli() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const aktifEmail = session?.user?.email?.toLowerCase() || "";

  const [aktifSekme, setAktifSekme] = useState("ozet_radar");
  const [altFiltre, setAltFiltre] = useState("hepsi");
  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('İstanbul');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: listingsData, mutate: mutateListings } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });

  const safeListings = Array.isArray(listingsData) ? listingsData : (listingsData?.ilanlar || listingsData?.data || []);
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || i?.satici || "").toLowerCase() === aktifEmail);

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
      if (data.success) { setAiSonuc(`✅ ${data.uretilen} takas ilanı sisteme eklendi!`); mutateListings(); }
      else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e: any) { setAiSonuc('❌ Sistem Hatası'); }
    setAiYukleniyor(false);
  };

  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black italic text-2xl animate-pulse">BAĞLANILIYOR...</div>;
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic flex flex-col md:flex-row">
      <div className="w-full md:w-72 bg-[#0a0a0a]/90 border-r border-white/5 flex flex-col pt-24 z-20 md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10"><h1 className="text-4xl font-black text-[#00f260]">A-TAKASA.</h1></div>
        <nav className="flex flex-col gap-2 px-6 flex-1">
          {[
            { id: "ozet_radar", icon: "📟", ad: "Siber Radar" },
            { id: "ilanlarim", icon: "💎", ad: "Varlıklarım" },
            { id: "ai_ilan", icon: <Cpu size={18}/>, ad: "AI Takas İlanı" }, // 🛠️ Cpu ikonu kullanıldı
          ].map((menu) => (
            <button key={menu.id} onClick={() => setAktifSekme(menu.id)} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]' : 'text-slate-400 hover:bg-white/5'}`}>
              <span className="text-base">{typeof menu.icon === 'string' ? menu.icon : menu.icon}</span> {menu.ad}
            </button>
          ))}
        </nav>
        <div className="px-6 py-8 border-t border-white/5"><button onClick={() => signOut({ callbackUrl: "/" })} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px]">ÇIKIŞ YAP</button></div>
      </div>
      <div className="flex-1 p-4 md:p-12 md:pt-24 relative">
        {aktifSekme === "ilanlarim" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ilanlarim.map((ilan: any) => (
              <div key={ilan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-5">
                <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img src={ilan.resimler?.[0] || "https://placehold.co/150?text=YOK"} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-bold truncate mb-2">{ilan.baslik}</h3>
                <p className="text-[#00f260] font-black text-xl">{Number(ilan.fiyat || 0).toLocaleString()} ₺</p>
              </div>
            ))}
          </div>
        )}
        {aktifSekme === "ai_ilan" && (
          <div className="max-w-2xl animate-in fade-in">
            <h2 className="text-4xl font-black uppercase text-[#00f260] mb-6">AI Motoru.</h2>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem]">
              <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] mb-6">
                <option value="vasita">🚗 Vasıta</option><option value="elektronik">📱 Elektronik</option>
              </select>
              <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-[#00f260] mb-10" />
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className="w-full py-5 rounded-2xl bg-[#00f260] text-black font-black uppercase">{aiYukleniyor ? '⏳ CLAUDE ÇALIŞIYOR...' : '🤖 AI İLE İLAN OLUŞTUR'}</button>
            </div>
            {aiSonuc && <div className="mt-6 p-6 rounded-2xl border bg-[#00f260]/10 border-[#00f260]/30 text-[#00f260] text-xs font-black text-center">{aiSonuc}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
