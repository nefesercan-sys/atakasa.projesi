"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";

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
  const [sifreForm, setSifreForm] = useState({ eski: "", yeni: "", tekrar: "" });

  // 📡 SWR CANLI RADAR BAĞLANTILARI (E-posta sinyali hedefe kilitlendi 🎯)
  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: listingsData } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: takasData, mutate: mutateTakas } = useSWR(aktifEmail ? `/api/takas?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: ordersData, mutate: mutateOrders } = useSWR(aktifEmail ? `/api/orders?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });

  // 🛡️ SİBER GÜVENLİ DİZİ KONTROLÜ
  const safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || ordersData?.data || []);
  const safeTakas = Array.isArray(takasData) ? takasData : (takasData?.takaslar || takasData?.data || []);
  const safeListings = Array.isArray(listingsData) ? listingsData : (listingsData?.ilanlar || listingsData?.data || []);

  // 🔄 VERİLERİ SWR'DAN AYRIŞTIRMA (Çökme Korumalı)
  const bakiye = walletData?.balance || 0;
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || "").toLowerCase() === aktifEmail);
  
  const gelenTakaslar = safeTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);
  const gidenTakaslar = safeTakas.filter((t: any) => String(t?.gonderenEmail || "").toLowerCase() === aktifEmail);
  
  const gelenSiparisler = safeOrders.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gidenSiparisler = safeOrders.filter((o: any) => String(o?.buyerEmail || o?.aliciEmail || "").toLowerCase() === aktifEmail);

  const loading = status === "loading" || (aktifEmail && (!walletData && !listingsData && !takasData && !ordersData));

  if (status === "unauthenticated") {
    router.push("/giris");
    return null;
  }

  // 🔄 DURUM GÜNCELLEME MOTORLARI
  const handleDurumGuncelle = async (takasId: string, yeniDurum: string) => {
    if (!confirm(`İşlem durumunu '${yeniDurum}' olarak güncelliyorsunuz. Emin misiniz?`)) return;
    try {
      const res = await fetch("/api/takas", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ takasId, yeniDurum })
      });
      if (res.ok) mutateTakas();
    } catch (error) { alert("Sinyal koptu."); }
  };

  const handleSiparisGuncelle = async (orderId: string, yeniDurum: string, kargoVarMi: boolean = false) => {
    if (kargoVarMi && !kargoKoduForm) return alert("Lütfen kargo takip kodunu giriniz!");
    if (!confirm(`Sipariş durumunu '${yeniDurum}' yapıyorsunuz. Onaylıyor musunuz?`)) return;
    try {
      const res = await fetch("/api/orders", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, yeniDurum, kargoKodu: kargoKoduForm })
      });
      if (res.ok) {
        alert("⚡ SİPARİŞ DURUMU GÜNCELLENDİ!");
        setKargoKoduForm(""); 
        mutateOrders();
      } else { alert("Güncelleme reddedildi."); }
    } catch (error) { alert("Ağ arızası."); }
  };

  const getDurumRozeti = (durum: string) => {
    const d = String(durum || "").toLowerCase();
    if (d === "bekliyor" || d === "isleme_alindi") return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black animate-pulse shadow-lg">⏳ Onay Bekliyor</span>;
    if (d === "onaylandi" || d === "kabul") return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">📦 Hazırlanıyor</span>;
    if (d === "kargoda" || d === "kargolandi") return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">🚚 Yolda</span>;
    if (d === "teslim_edildi" || d === "tamamlandi") return <span className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black shadow-[0_0_15px_rgba(0,242,96,0.3)]">✅ Tamamlandı</span>;
    if (d === "iptal" || d === "iptal_edildi" || d === "red" || d === "reddedildi") return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">❌ İptal Edildi</span>;
    return <span className="bg-gray-500/10 text-gray-400 px-3 py-1 rounded-lg text-[9px] uppercase font-black">{d || "BİLİNMİYOR"}</span>;
  };

  const gosterilenVeri = () => {
    let veri: any[] = [];
    if (aktifSekme === "gelen_teklifler") veri = gelenTakaslar;
    if (aktifSekme === "giden_teklifler") veri = gidenTakaslar;
    if (aktifSekme === "gelen_siparisler") veri = gelenSiparisler;
    if (aktifSekme === "giden_siparisler") veri = gidenSiparisler;
    
    if (altFiltre !== "hepsi") {
      veri = veri.filter((t: any) => {
        const d = String(t?.durum || t?.status || "").toLowerCase();
        if (altFiltre === "bekliyor") return d === "bekliyor" || d === "isleme_alindi";
        if (altFiltre === "onaylandi") return d === "onaylandi" || d === "kabul";
        if (altFiltre === "kargoda") return d === "kargoda" || d === "kargolandi";
        if (altFiltre === "teslim_edildi") return d === "teslim_edildi" || d === "tamamlandi";
        if (altFiltre === "iptal") return d === "iptal" || d === "iptal_edildi" || d === "reddedildi";
        return d === altFiltre;
      });
    }
    return veri;
  };

  // AKILLI RADAR HESAPLAMALARI
  const bekleyenSatis = gelenSiparisler.filter((s: any) => { const d = String(s?.durum || s?.status || "").toLowerCase(); return d === 'bekliyor' || d === 'isleme_alindi'; }).length;
  const bekleyenTakas = gelenTakaslar.filter((t: any) => String(t?.durum || "").toLowerCase() === 'bekliyor').length;
  const toplamBekleyenAksiyon = bekleyenSatis + bekleyenTakas;
  
  const aktifAldiklarim = gidenSiparisler.filter((s: any) => {
    const d = String(s?.durum || s?.status || "").toLowerCase();
    return !["teslim_edildi", "tamamlandi", "iptal", "iptal_edildi"].includes(d);
  }).length;

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse italic">KONTROL MERKEZİNE BAĞLANILIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic flex flex-col md:flex-row">
      
      {/* 🧭 SOL PANEL */}
      <div className="w-full md:w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 flex flex-col pt-24 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">A-TAKASA<span className="text-[#00f260]">.</span></h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase">Ajan Kontrol Paneli</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 px-6 overflow-x-auto md:overflow-y-auto no-scrollbar pb-6 md:pb-0">
          {[
            { id: "ozet_radar", icon: "📟", ad: "Siber Radar" },
            { id: "gelen_siparisler", icon: "📦", ad: "Satışlarım", bildirim: bekleyenSatis },
            { id: "giden_siparisler", icon: "🛒", ad: "Aldıklarım", bildirim: aktifAldiklarim },
            { id: "gelen_teklifler", icon: "🔄", ad: "Gelen Takaslar", bildirim: bekleyenTakas },
            { id: "giden_teklifler", icon: "🚀", ad: "Yaptığım Takaslar" },
            { id: "ilanlarim", icon: "💎", ad: "Siber Varlıklarım" },
            { id: "guvenlik", icon: "🛡️", ad: "Kalkan (Güvenlik)" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setAltFiltre("hepsi");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)] scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3"><span className="text-base">{menu.icon}</span> {menu.ad}</div>
              {menu.bildirim && menu.bildirim > 0 ? <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[8px] animate-pulse">{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>
      </div>

      {/* 📡 SAĞ PANEL */}
      <div className="flex-1 bg-[#050505] p-4 md:p-12 md:pt-24 relative overflow-x-hidden min-h-screen">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

        {/* 📟 SEKME 1: SİBER RADAR */}
        {aktifSekme === "ozet_radar" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-10 tracking-tighter">Siber <span className="text-[#00f260]">Radar.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-[#0a0a0a] border border-[#00f260]/30 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,242,96,0.15)] relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:scale-110 transition-transform">💰</div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-2">Siber Havuz Bakiyesi</p>
                <p className="text-5xl font-black text-white">{bakiye.toLocaleString()} <span className="text-2xl text-[#00f260]">₺</span></p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:scale-110 transition-transform">💎</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Piyasadaki Varlıklarım</p>
                <p className="text-5xl font-black text-white">{ilanlarim.length} <span className="text-xl text-slate-500">Adet</span></p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-[#00f260]/40 transition-colors">
                <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:scale-110 transition-transform">📦</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Bekleyen İşlemler</p>
                <div className="flex items-center gap-4">
                  <p className="text-5xl font-black text-white">{toplamBekleyenAksiyon}</p>
                  {toplamBekleyenAksiyon > 0 && <span className="w-3 h-3 bg-[#00f260] rounded-full animate-ping shadow-[0_0_15px_rgba(0,242,96,1)]"></span>}
                </div>
                <button 
                  onClick={() => {
                    if (bekleyenSatis > 0) setAktifSekme("gelen_siparisler");
                    else setAktifSekme("gelen_teklifler");
                    setAltFiltre("bekliyor");
                  }} 
                  disabled={toplamBekleyenAksiyon === 0}
                  className="mt-6 w-full flex items-center justify-center bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all shadow-lg border border-white/10 hover:border-[#00f260] disabled:opacity-30"
                >
                  {bekleyenSatis > 0 ? "Satışları İncele →" : bekleyenTakas > 0 ? "Takasları İncele →" : "İşlem Yok"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📟 İŞLEM TAHTASI */}
        {["gelen_teklifler", "giden_teklifler", "gelen_siparisler", "giden_siparisler"].includes(aktifSekme) && (
          <div className="animate-in fade-in duration-500">
            <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {["hepsi", "bekliyor", "kabul", "onaylandi", "kargoda", "teslim_edildi", "iptal"].map((durum: string) => (
                <button key={durum} onClick={() => setAltFiltre(durum)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${altFiltre === durum ? 'bg-white text-black shadow-lg' : 'bg-[#0a0a0a] text-slate-500 border border-white/5 hover:text-white'}`}>
                  {durum.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {gosterilenVeri().length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] py-20 text-center shadow-2xl flex flex-col items-center justify-center">
                  <span className="text-6xl mb-6 block grayscale opacity-30">📡</span>
                  <p className="text-white font-black tracking-[0.3em] uppercase text-sm mb-2">Bu filtrede işlem bulunamadı</p>
                  <p className="text-slate-500 text-[10px] font-bold tracking-widest italic max-w-sm">Not: Sepette onay bekleyen ürünler buraya yansımaz. Sadece kesinleşmiş siparişler listelenir.</p>
                </div>
              ) : (
                gosterilenVeri().map((islem: any, index: number) => {
                  if (!islem) return null; // Çökme koruması
                  
                  const isTakas = aktifSekme.includes("teklifler");
                  const isSiparis = aktifSekme.includes("siparisler");
                  const guvenliID = String(islem._id || index); // Kesin koruma

                  // 🔄 TAKAS KARTI
                  if (isTakas) {
                    const benimRolum = String(islem.gonderenEmail || "").toLowerCase() === aktifEmail ? "gonderen" : "alici";
                    return (
                      <div key={`takas-${guvenliID}`} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-6 gap-4 pl-4">
                          <div className="flex items-center gap-3">
                            <span className="text-cyan-500 font-black text-[10px] uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-lg">🔄 TAKAS İŞLEMİ</span>
                            {getDurumRozeti(islem.durum)}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 bg-[#030712] p-6 rounded-[2rem] border border-white/5 mb-6 pl-4">
                          <div className="flex-1 text-center md:text-left">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Benim Varlığım</p>
                            <p className="text-white font-bold text-sm uppercase">{benimRolum === "alici" ? (islem.heTargetIlanBaslik || islem.hedefIlanBaslik || "Ürün İncelemede") : (islem.teklifEdilenIlanBaslik || "Ürün İncelemede")}</p>
                          </div>
                          <div className="text-cyan-400 text-3xl font-black rotate-90 md:rotate-0">⇄</div>
                          <div className="flex-1 text-center md:text-right">
                            <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-2">Karşı Tarafın Varlığı</p>
                            <p className="text-white font-bold text-sm uppercase">{benimRolum === "alici" ? (islem.teklifEdilenIlanBaslik || "Ürün İncelemede") : (islem.heTargetIlanBaslik || islem.hedefIlanBaslik || "Ürün İncelemede")}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto pl-4">
                          {islem.durum === "bekliyor" && benimRolum === "alici" && (
                            <>
                              <button onClick={()=>handleDurumGuncelle(islem._id, "kabul")} className="flex-1 bg-[#00f260] text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">✅ Teklifi Kabul Et</button>
                              <button onClick={()=>handleDurumGuncelle(islem._id, "red")} className="flex-1 bg-red-500/10 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">❌ Reddet</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // 📦 SİPARİŞ KARTI
                  if (isSiparis) {
                    const benimRolum = String(islem.sellerEmail || islem.saticiEmail || "").toLowerCase() === aktifEmail ? "satici" : "alici";
                    const islemDurumu = String(islem.durum || islem.status || "").toLowerCase();
                    const kisaId = guvenliID.length > 6 ? guvenliID.slice(-6) : guvenliID;

                    return (
                      <div key={`siparis-${guvenliID}`} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all shadow-xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${benimRolum === 'satici' ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-6 gap-4 pl-4">
                          <div className="flex items-center gap-3">
                            <span className={`${benimRolum === 'satici' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-400'} font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg`}>
                              {benimRolum === 'satici' ? '📦 SATIŞ İŞLEMİ' : '🛒 SATIN ALMA İŞLEMİ'}
                            </span>
                            {getDurumRozeti(islemDurumu)}
                          </div>
                          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">ID: {kisaId}</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 pl-4 mb-8 bg-[#030712] p-6 rounded-[2rem] border border-white/5">
                          <div className="flex-1">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Teslimat Bilgileri</p>
                            <p className="text-white font-bold text-sm uppercase mb-1">{islem.adSoyad || islem.buyerEmail || "Alıcı Bilgisi"}</p>
                            <p className="text-slate-400 text-xs">{islem.adres || islem.shippingAddress || "Adres detayları işleniyor..."}</p>
                          </div>
                          <div className="flex-1 md:border-l border-white/5 md:pl-8">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Ödeme Özeti</p>
                            <p className="text-[#00f260] font-black text-3xl mb-1">{Number(islem.fiyat || islem.price || islem.totalPrice || 0).toLocaleString()} ₺</p>
                            <p className="text-cyan-400 text-[10px] font-bold uppercase">Yöntem: {String(islem.odemeYontemi || islem.paymentStatus || "Sistem").replace("_", " ")}</p>
                            {(islem.kargoKodu || islem.trackingNumber) && <p className="text-purple-400 text-[11px] font-black uppercase mt-3 bg-purple-500/10 inline-block px-4 py-2 rounded-lg">🚚 Takip No: {islem.kargoKodu || islem.trackingNumber}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto pl-4">
                          {benimRolum === "satici" && (islemDurumu === "bekliyor" || islemDurumu === "isleme_alindi") && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "onaylandi")} className="flex-1 bg-amber-500 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]">✅ SİPARİŞİ ONAYLA (HAZIRLA)</button>
                          )}
                          {benimRolum === "satici" && (islemDurumu === "onaylandi") && (
                            <div className="flex-1 flex flex-col md:flex-row gap-3">
                              <input type="text" placeholder="Kargo Takip Kodu Girin" value={kargoKoduForm} onChange={(e)=>setKargoKoduForm(e.target.value)} className="flex-1 bg-[#030712] border border-white/10 text-white text-xs px-6 py-4 rounded-2xl outline-none focus:border-purple-500" />
                              <button onClick={()=>handleSiparisGuncelle(islem._id, "kargoda", true)} className="bg-purple-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)]">🚚 KARGOYA VER</button>
                            </div>
                          )}

                          {benimRolum === "alici" && (islemDurumu === "kargoda" || islemDurumu === "kargolandi") && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "teslim_edildi")} className="flex-1 bg-[#00f260] text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.5)] animate-pulse">📦 ÜRÜNÜ TESLİM ALDIM (ONAYLA)</button>
                          )}
                          {benimRolum === "alici" && (islemDurumu === "bekliyor" || islemDurumu === "isleme_alindi") && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "iptal")} className="px-8 bg-red-500/10 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">SİPARİŞİ İPTAL ET</button>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Hiçbir koşula uymuyorsa sessizce geç
                  return null;
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
