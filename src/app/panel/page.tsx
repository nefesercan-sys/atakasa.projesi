"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { LogOut, Edit, Trash2, Power, Package, Cpu, ArrowLeftRight, ShoppingCart, Truck } from "lucide-react";

// 📡 SWR VERİ ÇEKME MOTORU
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SiberBorsaPaneli() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const aktifEmail = session?.user?.email?.toLowerCase() || "";

  // 🎛️ PANEL KONTROLLERİ
  const [aktifSekme, setAktifSekme] = useState("ozet_radar");
  const [kargoKoduForm, setKargoKoduForm] = useState("");

  // 🤖 AI MOTORU STATE'LERİ
  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('Antalya');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  // 📡 SİBER AĞ BAĞLANTILARI
  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: listingsData, mutate: mutateListings } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: takasData, mutate: mutateTakas } = useSWR(aktifEmail ? `/api/takas?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: ordersData, mutate: mutateOrders } = useSWR(aktifEmail ? `/api/orders?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });

  // 🛡️ VERİ AYRIŞTIRMA
  const safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || ordersData?.data || []);
  const safeTakas = Array.isArray(takasData) ? takasData : (takasData?.takaslar || takasData?.data || []);
  const safeListings = Array.isArray(listingsData) ? listingsData : (listingsData?.ilanlar || listingsData?.data || []);

  const bakiye = walletData?.balance || 0;
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || i?.satici || "").toLowerCase() === aktifEmail);
  const gelenSiparisler = safeOrders.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gelenTakaslar = safeTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);

  // 📸 RESİM GÖRÜNÜR KILMA MOTORU (FİNAL)
  const getImageUrl = (ilan: any) => {
    if (!ilan) return "https://placehold.co/150?text=YOK";
    const img = (ilan.resimler?.[0]) || (ilan.medyalar?.[0]) || (ilan.images?.[0]);
    if (img && typeof img === 'string') return img;
    return "https://placehold.co/150?text=GÖRSEL+BEKLENİYOR";
  };

  // 🛠️ AKSİYON MOTORLARI
  const handleIlanSil = async (id: string) => {
    if (!confirm("⚠️ SİBER UYARI: Bu varlık silinsin mi?")) return;
    try {
      await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
      mutateListings();
    } catch (e) { alert("Sinyal kesildi."); }
  };

  const handleSiparisGuncelle = async (orderId: string, yeniDurum: string, kargoVarMi: boolean = false) => {
    if (kargoVarMi && !kargoKoduForm) return alert("Lütfen kargo takip kodunu giriniz!");
    await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, yeniDurum, kargoKodu: kargoKoduForm }) });
    setKargoKoduForm(""); mutateOrders();
  };

  const aiIlanOlustur = async () => {
    setAiYukleniyor(true); setAiSonuc('');
    try {
      const res = await fetch('/api/ai-ilan', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ kategoriId: aiKategori, sehir: aiSehir, adet: aiAdet, adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY }) 
      });
      const data = await res.json();
      if (data.success) { setAiSonuc(`✅ ${data.uretilen} Yapay Varlık Ağa Katıldı!`); mutateListings(); }
      else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e) { setAiSonuc('❌ Sistem Hatası'); }
    setAiYukleniyor(false);
  };

  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black italic">BAĞLANILIYOR...</div>;
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic flex flex-col md:flex-row">
      {/* 🧭 SOL PANEL */}
      <div className="w-full md:w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col pt-24 z-20 md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10"><h1 className="text-4xl font-black text-[#00f260]">A-TAKASA.</h1></div>
        <nav className="flex flex-col gap-2 px-6 flex-1">
          {[
            { id: "ozet_radar", icon: <Package size={18}/>, ad: "Radar" },
            { id: "ilanlarim", icon: <Cpu size={18}/>, ad: "Varlıklarım", bildirim: ilanlarim.length },
            { id: "gelen_siparisler", icon: <ShoppingCart size={18}/>, ad: "Satışlarım" },
            { id: "gelen_teklifler", icon: <ArrowLeftRight size={18}/>, ad: "Gelen Takaslar" },
            { id: "ai_ilan", icon: <Cpu size={18} className="text-[#00f260]"/>, ad: "AI Motoru" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => setAktifSekme(menu.id)} className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]' : 'text-slate-400 hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">{menu.icon} {menu.ad}</div>
              {menu.bildirim ? <span className="bg-black/20 px-2 py-0.5 rounded text-[8px]">{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5"><button onClick={() => signOut({ callbackUrl: "/" })} className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px]">ÇIKIŞ</button></div>
      </div>

      {/* 📡 SAĞ PANEL */}
      <div className="flex-1 p-4 md:p-12 md:pt-24 relative overflow-x-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

        {aktifSekme === "ozet_radar" && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a0a0a] border border-[#00f260]/30 p-8 rounded-[2.5rem]"><p className="text-[#00f260] text-[10px] font-black uppercase mb-2">Bakiye</p><p className="text-4xl font-black">{bakiye.toLocaleString()} ₺</p></div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem]"><p className="text-slate-400 text-[10px] font-black uppercase mb-2">Varlıklar</p><p className="text-4xl font-black">{ilanlarim.length}</p></div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem]"><p className="text-slate-400 text-[10px] font-black uppercase mb-2">Bekleyen</p><p className="text-4xl font-black">{gelenSiparisler.length + gelenTakaslar.length}</p></div>
           </div>
        )}

        {aktifSekme === "ilanlarim" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {ilanlarim.map((ilan: any) => (
              <div key={ilan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-5 shadow-2xl group">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-4 border border-white/10">
                  <img src={getImageUrl(ilan)} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="resim" />
                </div>
                <h3 className="text-white font-bold truncate mb-1 px-2 uppercase text-sm">{ilan.baslik}</h3>
                <p className="text-[#00f260] font-black text-xl mb-4 px-2">{Number(ilan.fiyat || 0).toLocaleString()} ₺</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase">DÜZENLE</button>
                  <button onClick={() => handleIlanSil(ilan._id)} className="py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">SİL</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {aktifSekme === "gelen_siparisler" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase text-amber-500 mb-6">Gelen Siparişler</h2>
            {gelenSiparisler.map((o: any) => (
              <div key={o._id} className="bg-[#0a0a0a] border-l-4 border-amber-500 p-6 rounded-2xl">
                <p className="text-white font-bold uppercase">{o.adSoyad || o.buyerEmail}</p>
                <p className="text-[#00f260] font-black mb-4">{o.fiyat.toLocaleString()} ₺</p>
                {o.durum === "bekliyor" && <button onClick={() => handleSiparisGuncelle(o._id, "onaylandi")} className="w-full py-3 bg-amber-500 text-black font-black rounded-xl text-[10px]">SİPARİŞİ ONAYLA</button>}
              </div>
            ))}
          </div>
        )}

        {aktifSekme === "ai_ilan" && (
          <div className="max-w-2xl animate-in fade-in">
            <h2 className="text-4xl font-black uppercase text-[#00f260] mb-8 tracking-tighter">AI Varlık <span className="text-white">Merkezi.</span></h2>
            <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] shadow-2xl">
              <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-2xl p-5 text-white font-bold outline-none focus:border-[#00f260] mb-6 appearance-none">
                <option value="vasita">🚗 Vasıta Takası</option><option value="elektronik">📱 Elektronik Takası</option><option value="emlak">🏠 Emlak Takası</option>
              </select>
              <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-[#00f260] mb-10" />
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest transition-all ${aiYukleniyor ? 'bg-white/5 text-slate-500' : 'bg-[#00f260] text-black shadow-[0_0_30px_rgba(0,242,96,0.4)]'}`}>
                {aiYukleniyor ? '⏳ CLAUDE ÇALIŞIYOR...' : '🤖 YAPAY VARLIKLARI AĞA BAS'}
              </button>
            </div>
            {aiSonuc && <div className="mt-8 p-6 rounded-2xl border border-[#00f260]/30 text-[#00f260] text-xs font-black text-center uppercase tracking-widest animate-pulse">{aiSonuc}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
