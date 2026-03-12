"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { LogOut, Edit, Trash2, Power, Package } from "lucide-react";

// 🌍 TÜRKİYE'NİN 81 İLİ
const sehirler = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", 
  "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", 
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", 
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", 
  "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", 
  "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", 
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", 
  "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

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
  
  // 📝 DÜZENLEME MODALI STATE'LERİ
  const [duzenleModal, setDuzenleModal] = useState<any>(null);
  const [islemLoading, setIslemLoading] = useState(false);

  // 🤖 AI TAKAS MOTORU DEĞİŞKENLERİ
  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('İstanbul');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  // 📡 SWR CANLI RADAR BAĞLANTILARI
  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: listingsData, mutate: mutateListings } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: takasData, mutate: mutateTakas } = useSWR(aktifEmail ? `/api/takas?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: ordersData, mutate: mutateOrders } = useSWR(aktifEmail ? `/api/orders?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });

  // 🛡️ SİBER GÜVENLİ DİZİ KONTROLÜ
  const safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || ordersData?.data || []);
  const safeTakas = Array.isArray(takasData) ? takasData : (takasData?.takaslar || takasData?.data || []);
  const safeListings = Array.isArray(listingsData) ? listingsData : (listingsData?.ilanlar || listingsData?.data || []);

  // 🔄 VERİLERİ SWR'DAN AYRIŞTIRMA
  const bakiye = walletData?.balance || 0;
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || "").toLowerCase() === aktifEmail);
  
  const gelenTakaslar = safeTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);
  const gidenTakaslar = safeTakas.filter((t: any) => String(t?.gonderenEmail || "").toLowerCase() === aktifEmail);
  
  const gelenSiparisler = safeOrders.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gidenSiparisler = safeOrders.filter((o: any) => String(o?.buyerEmail || o?.aliciEmail || "").toLowerCase() === aktifEmail);

  // 🛡️ GİRİŞ KONTROL ZIRHI
  const loading = status === "loading" || (aktifEmail && (!walletData && !listingsData && !takasData && !ordersData));
  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse italic">KONTROL MERKEZİNE BAĞLANILIYOR... ⏳</div>;
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  // ── SİPARİŞ & TAKAS GÜNCELLEME MOTORLARI ──
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

  // 🚀 İLAN (VARLIK) YÖNETİM MOTORLARI
  const handleIlanSil = async (id: string) => {
    if (!confirm("⚠️ SİBER UYARI: Bu varlığı tamamen silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("🗑️ Varlık siber ağdan silindi.");
        mutateListings(); 
      } else { alert("Silme işlemi başarısız."); }
    } catch (err) { alert("Bağlantı hatası."); }
  };

  const handleIlanDurumDegistir = async (ilan: any) => {
    const yeniDurum = ilan.durum === "pasif" ? "aktif" : "pasif";
    const mesaj = yeniDurum === "pasif" 
      ? "Varlık yayından kaldırılacak. Emin misiniz?" 
      : "Varlık tekrar vitrine çıkacak. Emin misiniz?";
    if (!confirm(mesaj)) return;

    try {
      const res = await fetch(`/api/varliklar/${ilan._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durum: yeniDurum }),
      });
      if (res.ok) mutateListings();
      else alert("Durum güncellenemedi.");
    } catch (err) { alert("Bağlantı hatası."); }
  };

  const handleDuzenleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIslemLoading(true);
    try {
      const res = await fetch(`/api/varliklar/${duzenleModal._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik: duzenleModal.baslik,
          fiyat: Number(duzenleModal.fiyat),
          aciklama: duzenleModal.aciklama,
          kategori: duzenleModal.kategori,
          sehir: duzenleModal.sehir, 
          ilce: duzenleModal.ilce, 
          mahalle: duzenleModal.mahalle 
        }),
      });
      if (res.ok) {
        alert("✅ Varlık başarıyla güncellendi!");
        setDuzenleModal(null);
        mutateListings(); 
      } else { 
        const err = await res.json();
        alert(`Güncelleme başarısız: ${err.message || err.error || "Bilinmeyen hata"}`); 
      }
    } catch (err) { alert("Bağlantı hatası."); } 
    finally { setIslemLoading(false); }
  };

  // 🤖 AI TAKAS MOTORU TETİKLEYİCİSİ
  const aiIlanOlustur = async () => {
    setAiYukleniyor(true);
    setAiSonuc('');
    try {
      const res = await fetch('/api/ai-ilan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kategoriId: aiKategori, // Atakasa'ya özel kategori ID'si
          sehir: aiSehir,
          adet: aiAdet,
          adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSonuc(`✅ ${data.uretilen} takas ilanı başarıyla oluşturuldu!`);
        mutateListings(); // SWR ile listeyi canlı olarak yeniler
      } else {
        setAiSonuc('❌ Hata: ' + data.error);
      }
    } catch (e: any) {
      setAiSonuc('❌ Sistem Hatası: ' + e.message);
    }
    setAiYukleniyor(false);
  };

  // ROZET FONKSİYONU
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
      
      {/* 🧭 SOL PANEL (MENÜ) */}
      <div className="w-full md:w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 flex flex-col pt-24 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] md:h-screen md:sticky md:top-0">
        
        {/* LOGO BÖLÜMÜ */}
        <div className="px-8 mb-10 text-center md:text-left shrink-0">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2 cursor-pointer hover:text-[#00f260] transition-colors" onClick={() => router.push('/')}>A-TAKASA<span className="text-[#00f260]">.</span></h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase truncate">{aktifEmail}</p>
        </div>

        {/* KAYDIRILABİLİR MENÜ LİSTESİ */}
        <nav className="flex flex-row md:flex-col gap-2 px-6 overflow-x-auto md:overflow-y-auto no-scrollbar flex-1 pb-6 md:pb-0">
          {[
            { id: "ozet_radar", icon: "📟", ad: "Siber Radar" },
            { id: "ilanlarim", icon: "💎", ad: "Varlıklarım", bildirim: ilanlarim.length },
            { id: "gelen_siparisler", icon: "📦", ad: "Satışlarım", bildirim: bekleyenSatis },
            { id: "giden_siparisler", icon: "🛒", ad: "Aldıklarım", bildirim: aktifAldiklarim },
            { id: "gelen_teklifler", icon: "🔄", ad: "Gelen Takaslar", bildirim: bekleyenTakas },
            { id: "giden_teklifler", icon: "🚀", ad: "Yaptığım Takaslar" },
            { id: "guvenlik", icon: "🛡️", ad: "Kalkan (Güvenlik)" },
            { id: "ai_ilan", icon: "🤖", ad: "AI Takas İlanı" }, // 🚨 YENİ AI MENÜSÜ EKLENDİ!
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setAltFiltre("hepsi");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)] scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3"><span className="text-base">{menu.icon}</span> {menu.ad}</div>
              {menu.bildirim !== undefined && menu.bildirim > 0 ? <span className={`px-2 py-0.5 rounded-md text-[8px] ${aktifSekme === menu.id ? 'bg-black text-[#00f260]' : 'bg-[#00f260]/20 text-[#00f260]'}`}>{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>

        {/* 🚀 MASAÜSTÜ İÇİN SABİTLENMİŞ ÇIKIŞ BUTONU */}
        <div className="hidden md:block px-6 py-8 border-t border-white/5 bg-[#0a0a0a]/90 shrink-0 mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-start gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)] group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            SİSTEMDEN ÇIKIŞ YAP
          </button>
        </div>
      </div>

      {/* 🚀 MOBİL İÇİN ÇIKIŞ BUTONU */}
      <div className="block md:hidden px-4 mt-6 mb-24 w-full">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
        >
          <LogOut size={16} />
          SİSTEMDEN ÇIKIŞ YAP
        </button>
      </div>

      {/* 📡 SAĞ PANEL (İÇERİK) */}
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
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer" onClick={() => setAktifSekme("ilanlarim")}>
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

        {/* 💎 SEKME: SİBER VARLIKLARIM (İlan Yönetimi) */}
        {aktifSekme === "ilanlarim" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Varlık <span className="text-[#00f260]">Yönetimi.</span></h2>
              <button onClick={() => router.push('/ilan-ver')} className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all">
                + SİBER AĞA VARLIK EKLE
              </button>
            </div>

            {ilanlarim.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-[#0a0a0a]">
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Siber Ağda Henüz Bir Varlığın Yok.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ilanlarim.map((ilan: any) => (
                  <div key={ilan._id} className={`flex flex-col bg-[#0a0a0a] border rounded-[2rem] p-5 transition-all shadow-xl ${ilan.durum === 'pasif' ? 'border-red-500/30 opacity-70 grayscale-[50%]' : 'border-white/5 hover:border-[#00f260]/50'}`}>
                    
                    <div className="flex gap-4 mb-6">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                        {ilan.resimler?.[0]?.includes(".mp4") ? (
                          <video src={ilan.resimler[0]} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={ilan.resimler?.[0] || "https://placehold.co/150"} alt="varlik" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-white font-bold truncate pr-2" title={ilan.baslik}>{ilan.baslik}</h3>
                          {ilan.durum === 'pasif' ? (
                            <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[8px] font-black uppercase shrink-0">PASİF</span>
                          ) : (
                            <span className="bg-[#00f260]/20 text-[#00f260] px-2 py-1 rounded text-[8px] font-black uppercase shrink-0">AKTİF</span>
                          )}
                        </div>
                        <p className="text-[#00f260] font-black text-xl">{Number(ilan.fiyat || ilan.tahminiDeger || 0).toLocaleString()} ₺</p>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1 truncate">{ilan.kategori}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-auto">
                      <button onClick={() => setDuzenleModal(ilan)} className="flex items-center justify-center gap-1 bg-white/5 hover:bg-cyan-500 hover:text-black text-cyan-400 py-3 rounded-xl text-[9px] font-black uppercase transition-colors">
                        <Edit size={12} /> Düzenle
                      </button>
                      <button onClick={() => handleIlanDurumDegistir(ilan)} className={`flex items-center justify-center gap-1 py-3 rounded-xl text-[9px] font-black uppercase transition-colors ${ilan.durum === 'pasif' ? 'bg-[#00f260]/10 text-[#00f260] hover:bg-[#00f260] hover:text-black' : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black'}`}>
                        <Power size={12} /> {ilan.durum === 'pasif' ? 'Yayınla' : 'Durdur'}
                      </button>
                      <button onClick={() => handleIlanSil(ilan._id)} className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 py-3 rounded-xl text-[9px] font-black uppercase transition-colors">
                        <Trash2 size={12} /> Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🤖 YENİ SEKME: AI TAKAS KOKPİTİ */}
        {aktifSekme === "ai_ilan" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">AI Takas <span className="text-[#00f260]">Motoru.</span></h2>
            <p className="text-[12px] text-slate-400 mb-10 font-bold tracking-wider max-w-2xl">
              Claude AI ile otomatik takas ilanları oluştur. Bu ilanlar sitede gerçek kullanıcı ilanı gibi görünür ve platform dolgunluğunu anında artırır.
            </p>
            
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,242,96,0.05)] relative overflow-hidden mb-6 max-w-2xl">
              <div className="mb-6">
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2 mb-2 block">Kategori / Sektör</label>
                <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] appearance-none transition-colors">
                  <option value="vasita">🚗 Vasıta & Araç</option>
                  <option value="elektronik">📱 Elektronik</option>
                  <option value="emlak">🏠 Emlak</option>
                  <option value="giyim">⌚ Saat & Giyim</option>
                  <option value="mobilya">🛋️ Mobilya</option>
                  <option value="hobi">🎸 Hobi & Müzik</option>
                  <option value="diger">📦 Diğer Her Şey</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2 mb-2 block">Hedef Şehir</label>
                <select value={aiSehir} onChange={e => setAiSehir(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] appearance-none transition-colors">
                  {sehirler.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-10">
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2 mb-2 block flex justify-between">
                  <span>Kaç İlan Üretilsin?</span>
                  <span className="text-white text-base">{aiAdet} Adet</span>
                </label>
                <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-[#00f260] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-500 font-black mt-2">
                  <span>1 Min</span><span>20 Max</span>
                </div>
              </div>
              
              <button 
                onClick={aiIlanOlustur} 
                disabled={aiYukleniyor} 
                className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${aiYukleniyor ? 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5' : 'bg-[#00f260] text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(0,242,96,0.4)]'}`}>
                {aiYukleniyor ? '⏳ CLAUDE AI ÇALIŞIYOR...' : '🤖 AI İLE TAKAS İLANI OLUŞTUR VE YAYINLA'}
              </button>
            </div>

            {aiSonuc && (
              <div className={`max-w-2xl p-6 rounded-2xl border text-xs font-black tracking-widest uppercase shadow-xl ${aiSonuc.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[#00f260]/10 border-[#00f260]/30 text-[#00f260]'}`}>
                {aiSonuc}
              </div>
            )}
          </div>
        )}

        {/* 📟 İŞLEM TAHTASI (Siparişler ve Takaslar) */}
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
                  if (!islem) return null;
                  
                  const isTakas = aktifSekme.includes("teklifler");
                  const isSiparis = aktifSekme.includes("siparisler");
                  const guvenliID = String(islem._id || index); 

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
                  
                  return null;
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🚀 SİBER DÜZENLEME MODALI */}
      {duzenleModal && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(0,242,96,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 border-b border-white/10 pb-4">Varlığı Düzenle</h3>
            
            <form onSubmit={handleDuzenleKaydet} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Başlık</label>
                  <input type="text" value={duzenleModal.baslik || ""} onChange={e => setDuzenleModal({...duzenleModal, baslik: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260]" required />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fiyat (₺)</label>
                  <input type="number" value={duzenleModal.fiyat || ""} onChange={e => setDuzenleModal({...duzenleModal, fiyat: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-[#00f260] font-black outline-none focus:border-[#00f260]" required />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategori</label>
                <select className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] appearance-none" value={duzenleModal.kategori || ""} onChange={e => setDuzenleModal({...duzenleModal, kategori: e.target.value})} required>
                  <option value="" disabled>SEKTÖR SEÇİNİZ...</option>
                  <optgroup label="🏢 EMLAK & GAYRİMENKUL">
                    <option value="Emlak - Konut">Konut / Ev</option><option value="Emlak - İşyeri & Mağaza">İşyeri / Dükkan / Mağaza / Fabrika</option><option value="Emlak - Arsa & Tarla">Arsa / Tarla</option>
                  </optgroup>
                  <optgroup label="🚗 VASITA & MOBİLİTE">
                    <option value="Vasıta - Otomobil">Otomobil (Araç)</option><option value="Vasıta - Motosiklet & Bisiklet">Motosiklet / Bisiklet / Scooter</option><option value="Vasıta - Deniz & Diğer">Deniz Araçları / Akülü Araçlar</option><option value="Vasıta - Yedek Parça">Yedek Parça & Donanım</option>
                  </optgroup>
                  <optgroup label="💻 ELEKTRONİK & TEKNOLOJİ">
                    <option value="Elektronik - Telefon">Cep Telefonu</option><option value="Elektronik - Bilgisayar">Bilgisayar / Donanım</option><option value="Elektronik - TV & Görüntü">Televizyon / Ses / Görüntü</option><option value="Elektronik - Oyun Konsolu">PlayStation / Oyun Konsolu</option>
                  </optgroup>
                  <optgroup label="🛋️ EV, YAŞAM & BEYAZ EŞYA">
                    <option value="Ev - Mobilya & Tekstil">Mobilya / Halı / Ev Tekstili</option><option value="Ev - Beyaz Eşya & Isıtıcı">Beyaz Eşya / Isıtıcı</option><option value="Ev - Dekorasyon & Banyo">Duş Eşyaları / Dekorasyon</option>
                  </optgroup>
                  <optgroup label="⌚ MODA, SAAT & KOZMETİK">
                    <option value="Moda - Giyim & Ayakkabı">Elbise / Giyim</option><option value="Moda - Saat & Takı">Saat / Takı / Özel Eşya</option><option value="Kozmetik & Kişisel Bakım">Kozmetik / Kişisel Bakım</option>
                  </optgroup>
                  <optgroup label="🎨 ANTİKA, SANAT & HOBİ">
                    <option value="Sanat - Antika & El Sanatı">Antika Eserler / El Sanatları</option><option value="Sanat - Özel Tasarım">Özel Tasarımlar</option><option value="Hobi - Oyuncak & Kitap">Oyuncak / Kitap / Kırtasiye</option>
                  </optgroup>
                  <optgroup label="⚙️ SANAYİ & DİĞER">
                    <option value="Sanayi - Makine & Nalbur">Makine / Nalbur Ürünleri</option><option value="Evcil Hayvan & Petshop">Canlı Hayvan / Petshop</option><option value="Gıda & İçecek">Gıda / Yiyecek / İçecek</option><option value="Diğer">Diğer İlanlar</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Şehir</label>
                  <select className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] appearance-none" value={duzenleModal.sehir || ""} onChange={e => setDuzenleModal({...duzenleModal, sehir: e.target.value})} required>
                    <option value="" disabled>Seçiniz...</option>
                    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">İlçe</label>
                  <input type="text" value={duzenleModal.ilce || ""} onChange={e => setDuzenleModal({...duzenleModal, ilce: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260]" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mahalle</label>
                  <input type="text" value={duzenleModal.mahalle || ""} onChange={e => setDuzenleModal({...duzenleModal, mahalle: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2">Açıklama / Şartlar</label>
                <textarea value={duzenleModal.aciklama || ""} onChange={e => setDuzenleModal({...duzenleModal, aciklama: e.target.value})} rows={3} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[#00f260] resize-none" required></textarea>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setDuzenleModal(null)} className="flex-1 py-4 bg-white/5 text-white font-black text-[10px] uppercase rounded-xl hover:bg-white/10">İptal</button>
                <button type="submit" disabled={islemLoading} className="flex-1 py-4 bg-[#00f260] text-black font-black text-[10px] uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,242,96,0.4)]">
                  {islemLoading ? "KAYDEDİLİYOR..." : "GÜNCELLE"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      
    </div>
  );
}
