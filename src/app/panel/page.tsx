"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { LogOut, Edit, Trash2, Power, Package, Cpu } from "lucide-react";

// 📡 SWR VERİ ÇEKME MOTORU
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SiberBorsaPaneli() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const aktifEmail = session?.user?.email?.toLowerCase() || "";

  // 🎛️ PANEL KONTROLLERİ
  const [aktifSekme, setAktifSekme] = useState("ozet_radar");
  const [altFiltre, setAltFiltre] = useState("hepsi");
  const [kargoKoduForm, setKargoKoduForm] = useState("");
  const [islemLoading, setIslemLoading] = useState(false);
  const [duzenleModal, setDuzenleModal] = useState<any>(null);

  // 🤖 AI MOTORU STATE'LERİ
  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('İstanbul');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  // 📡 SİBER AĞ BAĞLANTILARI
  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: listingsData, mutate: mutateListings } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: takasData, mutate: mutateTakas } = useSWR(aktifEmail ? `/api/takas?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: ordersData, mutate: mutateOrders } = useSWR(aktifEmail ? `/api/orders?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });

  // 🛡️ VERİ AYRIŞTIRMA ZIRHI
  const safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || ordersData?.data || []);
  const safeTakas = Array.isArray(takasData) ? takasData : (takasData?.takaslar || takasData?.data || []);
  const safeListings = Array.isArray(listingsData) ? listingsData : (listingsData?.ilanlar || listingsData?.data || []);

  const bakiye = walletData?.balance || 0;
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || i?.satici || "").toLowerCase() === aktifEmail);
  const gelenTakaslar = safeTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);
  const gidenTakaslar = safeTakas.filter((t: any) => String(t?.gonderenEmail || "").toLowerCase() === aktifEmail);
  const gelenSiparisler = safeOrders.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gidenSiparisler = safeOrders.filter((o: any) => String(o?.buyerEmail || o?.aliciEmail || "").toLowerCase() === aktifEmail);

  // 🛠️ SİPARİŞ & TAKAS YÖNETİM MOTORLARI (GERİ GELDİ!)
  const handleDurumGuncelle = async (takasId: string, yeniDurum: string) => {
    if (!confirm(`Teklifi '${yeniDurum}' olarak güncelliyorsunuz. Emin misiniz?`)) return;
    try {
      await fetch("/api/takas", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ takasId, yeniDurum }) });
      mutateTakas();
    } catch (e) { alert("Bağlantı hatası."); }
  };

  const handleSiparisGuncelle = async (orderId: string, yeniDurum: string, kargoVarMi: boolean = false) => {
    if (kargoVarMi && !kargoKoduForm) return alert("Lütfen kargo takip kodunu giriniz!");
    try {
      await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, yeniDurum, kargoKodu: kargoKoduForm }) });
      setKargoKoduForm(""); mutateOrders();
    } catch (e) { alert("Sipariş güncellenemedi."); }
  };

  const aiIlanOlustur = async () => {
    setAiYukleniyor(true); setAiSonuc('');
    try {
      const res = await fetch('/api/ai-ilan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kategoriId: aiKategori, sehir: aiSehir, adet: aiAdet, adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY }) });
      const data = await res.json();
      if (data.success) { setAiSonuc(`✅ ${data.uretilen} İlan Eklendi!`); mutateListings(); }
      else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e) { setAiSonuc('❌ Sistem Hatası'); }
    setAiYukleniyor(false);
  };

  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black italic animate-pulse">SİBER AĞA BAĞLANILIYOR...</div>;
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  // 📸 RESİM GÖRÜNÜR KILMA ZIRHI
  const getImageUrl = (ilan: any) => {
    if (ilan?.resimler && ilan.resimler.length > 0) return ilan.resimler[0];
    if (ilan?.medyalar && ilan.medyalar.length > 0) return ilan.medyalar[0];
    return "https://placehold.co/150?text=FOTO+YOK";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic flex flex-col md:flex-row">
      <div className="w-full md:w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col pt-24 z-20 md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10"><h1 className="text-4xl font-black text-[#00f260]">A-TAKASA.</h1></div>
        <nav className="flex flex-col gap-2 px-6 flex-1">
          {[
            { id: "ozet_radar", icon: "📟", ad: "Siber Radar" },
            { id: "ilanlarim", icon: "💎", ad: "Varlıklarım", bildirim: ilanlarim.length },
            { id: "gelen_siparisler", icon: "📦", ad: "Satışlarım" },
            { id: "giden_siparisler", icon: "🛒", ad: "Aldıklarım" },
            { id: "gelen_teklifler", icon: "🔄", ad: "Gelen Takaslar" },
            { id: "ai_ilan", icon: <Cpu size={16}/>, ad: "AI Motoru" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => setAktifSekme(menu.id)} className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]' : 'text-slate-400 hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">{menu.icon} {menu.ad}</div>
              {menu.bildirim ? <span className="bg-black/20 px-2 py-0.5 rounded text-[8px]">{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5"><button onClick={() => signOut({ callbackUrl: "/" })} className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px]">ÇIKIŞ YAP</button></div>
      </div>

      <div className="flex-1 p-4 md:p-12 md:pt-24">
        {aktifSekme === "ozet_radar" && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a0a0a] border border-[#00f260]/30 p-8 rounded-[2rem]"><p className="text-[#00f260] text-[10px] font-black uppercase mb-2">Bakiyen</p><p className="text-4xl font-black">{bakiye.toLocaleString()} ₺</p></div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem]"><p className="text-slate-400 text-[10px] font-black uppercase mb-2">Varlıkların</p><p className="text-4xl font-black">{ilanlarim.length}</p></div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem]"><p className="text-slate-400 text-[10px] font-black uppercase mb-2">Bekleyen Aksiyon</p><p className="text-4xl font-black">{gelenSiparisler.length + gelenTakaslar.length}</p></div>
           </div>
        )}

        {aktifSekme === "ilanlarim" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ilanlarim.map((ilan: any) => (
              <div key={ilan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-5 shadow-xl">
                <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-inner">
                  <img src={getImageUrl(ilan)} className="w-full h-full object-cover" alt="resim" />
                </div>
                <h3 className="text-white font-bold truncate mb-1">{ilan.baslik}</h3>
                <p className="text-[#00f260] font-black text-xl mb-4">{Number(ilan.fiyat || 0).toLocaleString()} ₺</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase hover:bg-white/10">DÜZENLE</button>
                  <button onClick={() => handleIlanSil(ilan._id)} className="py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white">SİL</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {aktifSekme === "gelen_siparisler" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black mb-6 uppercase text-amber-500">Gelen Siparişler (Satışlarım)</h2>
            {gelenSiparisler.map((o: any) => (
              <div key={o._id} className="bg-[#0a0a0a] border-l-4 border-amber-500 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                   <div><p className="text-white font-bold">{o.adSoyad || o.buyerEmail}</p><p className="text-slate-400 text-xs">{o.adres}</p></div>
                   <p className="text-[#00f260] font-black text-xl">{o.fiyat} ₺</p>
                </div>
                {o.durum === "bekliyor" && <button onClick={() => handleSiparisGuncelle(o._id, "onaylandi")} className="w-full py-3 bg-amber-500 text-black font-black rounded-xl text-xs uppercase">SİPARİŞİ ONAYLA</button>}
                {o.durum === "onaylandi" && <div className="flex gap-2"><input value={kargoKoduForm} onChange={e => setKargoKoduForm(e.target.value)} placeholder="Kargo Kodu" className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-xs"/><button onClick={() => handleSiparisGuncelle(o._id, "kargoda", true)} className="bg-purple-500 px-6 py-3 rounded-xl font-black text-xs">GÖNDER</button></div>}
                <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Durum: {o.durum}</p>
              </div>
            ))}
          </div>
        )}

        {aktifSekme === "ai_ilan" && (
          <div className="max-w-2xl animate-in fade-in">
            <h2 className="text-4xl font-black uppercase text-[#00f260] mb-6">AI Motoru.</h2>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem]">
              <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] mb-6">
                <option value="vasita">🚗 Vasıta & Araç</option><option value="elektronik">📱 Elektronik</option><option value="emlak">🏠 Emlak</option>
              </select>
              <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-[#00f260] mb-10" />
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className="w-full py-5 rounded-2xl bg-[#00f260] text-black font-black uppercase">{aiYukleniyor ? '⏳ ÇALIŞIYOR...' : '🤖 YAPAY İLANLARI OLUŞTUR'}</button>
            </div>
            {aiSonuc && <div className="mt-6 p-6 rounded-2xl border bg-[#00f260]/10 text-[#00f260] text-xs font-black text-center">{aiSonuc}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
