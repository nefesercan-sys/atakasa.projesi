"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SiberBorsaPaneli() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 🎛️ PANEL KONTROLLERİ
  const [aktifSekme, setAktifSekme] = useState("ozet_radar");
  const [altFiltre, setAltFiltre] = useState("hepsi");

  // 📡 VERİ MERKEZİ
  const [bakiye, setBakiye] = useState(0);
  const [ilanlarim, setIlanlarim] = useState<any[]>([]);
  const [gelenTakaslar, setGelenTakaslar] = useState<any[]>([]);
  const [gidenTakaslar, setGidenTakaslar] = useState<any[]>([]);
  const [gelenSiparisler, setGelenSiparisler] = useState<any[]>([]);
  const [gidenSiparisler, setGidenSiparisler] = useState<any[]>([]);
  
  const [kargoKoduForm, setKargoKoduForm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🛡️ ŞİFRE DEĞİŞTİRME STATE'İ
  const [sifreForm, setSifreForm] = useState({ eski: "", yeni: "", tekrar: "" });

  useEffect(() => {
    if (status === "authenticated") fetchBorsaVerileri();
    else if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  const fetchBorsaVerileri = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const aktifEmail = session.user.email.toLowerCase();
    
    try {
      const resWallet = await fetch(`/api/wallet`, { cache: "no-store" });
      if (resWallet.ok) setBakiye((await resWallet.json()).balance || 0);

      const resListings = await fetch(`/api/listings`, { cache: "no-store" });
      if (resListings.ok) {
        const dataListings = await resListings.json();
        setIlanlarim(dataListings.filter((i: any) => (i.sellerEmail || i.userId || "").toLowerCase() === aktifEmail));
      }

      const resTakas = await fetch(`/api/takas`, { cache: "no-store" });
      if (resTakas.ok) {
        const dataTakas = await resTakas.json();
        setGelenTakaslar(dataTakas.filter((t: any) => t.aliciEmail === aktifEmail));
        setGidenTakaslar(dataTakas.filter((t: any) => t.gonderenEmail === aktifEmail));
      }

      const resOrders = await fetch(`/api/orders?email=${aktifEmail}`, { cache: "no-store" });
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setGelenSiparisler(dataOrders.filter((o: any) => o.sellerEmail === aktifEmail));
        setGidenSiparisler(dataOrders.filter((o: any) => o.buyerEmail === aktifEmail));
      }
    } catch (err) { console.error("Siber Ağ Hatası:", err); }
    setLoading(false);
  };

  // 🔄 DURUM GÜNCELLEME MOTORLARI
  const handleDurumGuncelle = async (takasId: string, yeniDurum: string) => {
    if (!confirm(`İşlem durumunu '${yeniDurum}' olarak güncelliyorsunuz. Emin misiniz?`)) return;
    try {
      const res = await fetch("/api/takas", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ takasId, yeniDurum })
      });
      if (res.ok) fetchBorsaVerileri();
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
        setKargoKoduForm(""); fetchBorsaVerileri();
      } else { alert("Güncelleme reddedildi."); }
    } catch (error) { alert("Ağ arızası."); }
  };

  const handleSifreDegistir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sifreForm.yeni !== sifreForm.tekrar) return alert("SİBER HATA: Yeni şifreler eşleşmiyor!");
    try {
      const res = await fetch("/api/guvenlik/sifre-degistir", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email, eskiSifre: sifreForm.eski, yeniSifre: sifreForm.yeni })
      });
      const data = await res.json();
      if (res.ok) { alert(data.message); setSifreForm({ eski: "", yeni: "", tekrar: "" }); } 
      else { alert(`❌ İhlal: ${data.error}`); }
    } catch (err) { alert("Sinyal koptu."); }
  };

  const getDurumRozeti = (durum: string) => {
    switch (durum) {
      case "bekliyor": return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black animate-pulse shadow-lg">⏳ Onay Bekliyor</span>;
      case "onaylandi": return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">📦 Hazırlanıyor</span>;
      case "kargoda": return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">🚚 Yolda</span>;
      case "teslim_edildi": return <span className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black shadow-[0_0_15px_rgba(0,242,96,0.3)]">✅ Tamamlandı</span>;
      case "iptal": return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">❌ İptal Edildi</span>;
      default: return null;
    }
  };

  const gosterilenVeri = () => {
    let veri: any[] = [];
    if (aktifSekme === "gelen_teklifler") veri = gelenTakaslar;
    if (aktifSekme === "giden_teklifler") veri = gidenTakaslar;
    if (aktifSekme === "gelen_siparisler") veri = gelenSiparisler;
    if (aktifSekme === "giden_siparisler") veri = gidenSiparisler;
    if (altFiltre !== "hepsi") veri = veri.filter(t => t.durum === altFiltre);
    return veri;
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse italic">KONTROL MERKEZİNE BAĞLANILIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic flex flex-col md:flex-row">
      
      {/* 🧭 SOL PANEL: KUMANDA MERKEZİ (SIDEBAR) */}
      <div className="w-full md:w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 flex flex-col pt-24 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">A-TAKASA<span className="text-[#00f260]">.</span></h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase">Ajan Kontrol Paneli</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 px-6 overflow-x-auto md:overflow-y-auto no-scrollbar pb-6 md:pb-0">
          {[
            { id: "ozet_radar", icon: "📟", ad: "Siber Radar" },
            { id: "gelen_siparisler", icon: "📦", ad: "Satışlarım", bildirim: gelenSiparisler.filter(s=>s.durum==='bekliyor').length },
            { id: "giden_siparisler", icon: "🛒", ad: "Aldıklarım", bildirim: gidenSiparisler.filter(s=>s.durum==='kargoda').length },
            { id: "gelen_teklifler", icon: "🔄", ad: "Gelen Takaslar", bildirim: gelenTakaslar.filter(t=>t.durum==='bekliyor').length },
            { id: "giden_teklifler", icon: "🚀", ad: "Yaptığım Takaslar" },
            { id: "ilanlarim", icon: "💎", ad: "Siber Varlıklarım" },
            { id: "guvenlik", icon: "🛡️", ad: "Kalkan (Güvenlik)" },
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setAltFiltre("hepsi");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)] scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3"><span className="text-base">{menu.icon}</span> {menu.ad}</div>
              {menu.bildirim ? <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[8px] animate-pulse">{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-8 border-t border-white/5">
          <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1 truncate">Bağlı: {session?.user?.email}</p>
          <button onClick={() => { if(confirm("Siber ağdan çıkış yapmak üzeresiniz. Onaylıyor musunuz?")) signOut({ callbackUrl: "/" }); }} 
            className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-3 mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            🔌 AĞDAN ÇIKIŞ YAP
          </button>
        </div>
      </div>

      {/* 📡 SAĞ PANEL: ANA EKRAN */}
      <div className="flex-1 bg-[#050505] p-4 md:p-12 md:pt-24 relative overflow-x-hidden min-h-screen">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

        {/* 📟 SEKME 1: SİBER RADAR (ÖZET) */}
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
                <p className="text-cyan-400 text-[10px] font-black mt-4 uppercase">Toplam: {ilanlarim.reduce((a, i) => a + Number(i.price || i.fiyat), 0).toLocaleString()} ₺</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:scale-110 transition-transform">📦</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Bekleyen İşlemler</p>
                <p className="text-5xl font-black text-white">{gelenSiparisler.filter(s=>s.durum==='bekliyor').length + gelenTakaslar.filter(t=>t.durum==='bekliyor').length} <span className="text-xl text-slate-500">Aksiyon</span></p>
                <button onClick={()=>setAktifSekme("gelen_siparisler")} className="mt-4 bg-white/5 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-[#00f260] hover:text-black transition-all">İncele →</button>
              </div>
            </div>
          </div>
        )}

        {/* 🛡️ SEKME: GÜVENLİK */}
        {aktifSekme === "guvenlik" && (
          <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] shadow-2xl max-w-2xl animate-in slide-in-from-bottom duration-500">
            <h2 className="text-4xl font-black italic uppercase mb-2 text-white">Siber <span className="text-red-500">Kalkan.</span></h2>
            <p className="text-slate-500 text-xs mb-10 uppercase font-bold tracking-widest">Ağ erişim şifrenizi buradan mühürleyin.</p>
            <form onSubmit={handleSifreDegistir} className="space-y-5">
              <input type="password" placeholder="Mevcut Şifreniz" value={sifreForm.eski} onChange={(e) => setSifreForm({...sifreForm, eski: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-sm p-6 rounded-2xl outline-none focus:border-red-500 transition-colors" required />
              <input type="password" placeholder="Yeni Şifreniz" value={sifreForm.yeni} onChange={(e) => setSifreForm({...sifreForm, yeni: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-sm p-6 rounded-2xl outline-none focus:border-cyan-500 transition-colors" required />
              <input type="password" placeholder="Yeni Şifreniz (Tekrar)" value={sifreForm.tekrar} onChange={(e) => setSifreForm({...sifreForm, tekrar: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-sm p-6 rounded-2xl outline-none focus:border-cyan-500 transition-colors" required />
              <button type="submit" className="w-full mt-4 bg-red-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)]">ŞİFREYİ GÜNCELLE VE MÜHÜRLE</button>
            </form>
          </div>
        )}

        {/* 💎 SEKME: İLANLARIM */}
        {aktifSekme === "ilanlarim" && (
           <div className="animate-in slide-in-from-right duration-500">
             <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-10 tracking-tighter">Siber <span className="text-white">Varlıklarım.</span></h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ilanlarim.length === 0 ? <p className="text-slate-600 font-black uppercase tracking-widest col-span-full">Ağda aktif varlığınız yok.</p> : 
                  ilanlarim.map(ilan => (
                    <div key={ilan._id} className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 shadow-xl hover:border-[#00f260]/40 transition-colors group">
                       <p className="text-[#00f260] text-[9px] font-black uppercase tracking-widest mb-1">{ilan.kategori}</p>
                       <h3 className="text-white font-bold text-xl mb-4 truncate">{ilan.title || ilan.baslik}</h3>
                       <div className="text-3xl font-black text-white mb-6">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</div>
                       <button onClick={() => router.push(`/varlik/${ilan._id}`)} className="w-full bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-[#00f260] group-hover:text-black transition-all">İncele</button>
                    </div>
                  ))
                }
             </div>
           </div>
        )}

        {/* 📟 İŞLEM TAHTASI (TAKASLAR VE SİPARİŞLER) */}
        {["gelen_teklifler", "giden_teklifler", "gelen_siparisler", "giden_siparisler"].includes(aktifSekme) && (
          <div className="animate-in fade-in duration-500">
            
            {/* Alt Filtre Menüsü */}
            <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {["hepsi", "bekliyor", "kabul", "onaylandi", "kargoda", "teslim_edildi", "iptal"].map(durum => (
                <button key={durum} onClick={() => setAltFiltre(durum)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${altFiltre === durum ? 'bg-white text-black shadow-lg' : 'bg-[#0a0a0a] text-slate-500 border border-white/5 hover:text-white'}`}>
                  {durum.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {gosterilenVeri().length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] py-32 text-center shadow-2xl">
                  <span className="text-6xl mb-6 block grayscale opacity-20">📡</span>
                  <p className="text-slate-600 font-black tracking-[0.4em] uppercase text-[10px]">Sinyal bulunamadı.</p>
                </div>
              ) : (
                gosterilenVeri().map((islem: any) => {
                  
                  // 🔄 TAKAS KARTI
                  if (islem.teklifEdilenIlanId) {
                    const benimRolum = islem.gonderenEmail === session?.user?.email?.toLowerCase() ? "gonderen" : "alici";
                    return (
                      <div key={islem._id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-6 gap-4 pl-4">
                          <div className="flex items-center gap-3">
                            <span className="text-cyan-500 font-black text-[10px] uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-lg">🔄 TAKAS İŞLEMİ</span>
                            {getDurumRozeti(islem.durum)}
                          </div>
                          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{new Date(islem.createdAt).toLocaleString("tr-TR")}</span>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 bg-[#030712] p-6 rounded-[2rem] border border-white/5 mb-6 pl-4">
                          <div className="flex-1 text-center md:text-left">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Benim Varlığım</p>
                            <p className="text-white font-bold text-sm uppercase">{benimRolum === "alici" ? islem.hedefIlanBaslik : islem.teklifEdilenIlanBaslik}</p>
                          </div>
                          <div className="text-cyan-400 text-3xl font-black rotate-90 md:rotate-0">⇄</div>
                          <div className="flex-1 text-center md:text-right">
                            <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-2">Karşı Tarafın Varlığı</p>
                            <p className="text-white font-bold text-sm uppercase">{benimRolum === "alici" ? islem.teklifEdilenIlanBaslik : islem.hedefIlanBaslik}</p>
                            {islem.eklenenNakit > 0 && <p className="text-[#00f260] text-[10px] font-black mt-2 bg-[#00f260]/10 inline-block px-3 py-1 rounded">+ {islem.eklenenNakit.toLocaleString()} ₺ Nakit</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto pl-4">
                          {islem.durum === "bekliyor" && benimRolum === "alici" && (
                            <>
                              <button onClick={()=>handleDurumGuncelle(islem._id, "kabul")} className="flex-1 bg-[#00f260] text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">✅ Teklifi Kabul Et</button>
                              <button onClick={()=>handleDurumGuncelle(islem._id, "red")} className="flex-1 bg-red-500/10 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">❌ Reddet</button>
                            </>
                          )}
                          {islem.durum === "kabul" && (
                            <button onClick={()=>handleDurumGuncelle(islem._id, "teslim_edildi")} className="w-full bg-blue-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse">🤝 İŞLEMİ TAMAMLA (ONAYLA)</button>
                          )}
                          <Link href={`/mesajlar?satici=${benimRolum === "alici" ? islem.gonderenEmail : islem.aliciEmail}`} className="px-8 bg-white/5 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-white/10 flex items-center justify-center">💬 MESAJ</Link>
                        </div>
                      </div>
                    );
                  }

                  // 📦 SİPARİŞ KARTI
                  if (islem.odemeYontemi) {
                    const benimRolum = islem.sellerEmail === session?.user?.email?.toLowerCase() ? "satici" : "alici";
                    return (
                      <div key={islem._id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all shadow-xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${benimRolum === 'satici' ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-6 gap-4 pl-4">
                          <div className="flex items-center gap-3">
                            <span className={`${benimRolum === 'satici' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-400'} font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg`}>
                              {benimRolum === 'satici' ? '📦 SATIŞ İŞLEMİ' : '🛒 SATIN ALMA İŞLEMİ'}
                            </span>
                            {getDurumRozeti(islem.durum)}
                          </div>
                          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">ID: {islem._id.slice(-6)} • {new Date(islem.createdAt).toLocaleDateString("tr-TR")}</span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 pl-4 mb-8 bg-[#030712] p-6 rounded-[2rem] border border-white/5">
                          <div className="flex-1">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Teslimat Bilgileri</p>
                            <p className="text-white font-bold text-sm uppercase mb-1">{islem.adSoyad}</p>
                            <p className="text-slate-400 text-xs">{islem.adres}</p>
                          </div>
                          <div className="flex-1 md:border-l border-white/5 md:pl-8">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Ödeme Özeti</p>
                            <p className="text-[#00f260] font-black text-3xl mb-1">{islem.fiyat.toLocaleString()} ₺</p>
                            <p className="text-cyan-400 text-[10px] font-bold uppercase">Yöntem: {islem.odemeYontemi.replace("_", " ")}</p>
                            {islem.kargoKodu && <p className="text-purple-400 text-[11px] font-black uppercase mt-3 bg-purple-500/10 inline-block px-4 py-2 rounded-lg">🚚 Takip No: {islem.kargoKodu}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto pl-4">
                          {benimRolum === "satici" && islem.durum === "bekliyor" && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "onaylandi")} className="flex-1 bg-amber-500 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]">✅ SİPARİŞİ ONAYLA (HAZIRLA)</button>
                          )}
                          {benimRolum === "satici" && islem.durum === "onaylandi" && (
                            <div className="flex-1 flex flex-col md:flex-row gap-3">
                              <input type="text" placeholder="Kargo Takip Kodu Girin" value={kargoKoduForm} onChange={(e)=>setKargoKoduForm(e.target.value)} className="flex-1 bg-[#030712] border border-white/10 text-white text-xs px-6 py-4 rounded-2xl outline-none focus:border-purple-500" />
                              <button onClick={()=>handleSiparisGuncelle(islem._id, "kargoda", true)} className="bg-purple-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)]">🚚 KARGOYA VER</button>
                            </div>
                          )}

                          {benimRolum === "alici" && islem.durum === "kargoda" && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "teslim_edildi")} className="flex-1 bg-[#00f260] text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.5)] animate-pulse">📦 ÜRÜNÜ TESLİM ALDIM (ONAYLA)</button>
                          )}
                          {benimRolum === "alici" && islem.durum === "bekliyor" && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "iptal")} className="px-8 bg-red-500/10 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">SİPARİŞİ İPTAL ET</button>
                          )}

                          <Link href={`/mesajlar?satici=${benimRolum === "alici" ? islem.sellerEmail : islem.buyerEmail}`} className="px-8 bg-white/5 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-white/10 flex items-center justify-center">💬 MESAJ AT</Link>
                        </div>
                      </div>
                    );
                  }
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
