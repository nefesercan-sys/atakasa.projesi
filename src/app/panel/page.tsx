"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { LogOut, Edit, Trash2, Power, Package, Robot } from "lucide-react";

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

  // 🤖 AI TAKAS MOTORU STATE'LERİ
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
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || i?.satici || "").toLowerCase() === aktifEmail);
  
  const gelenTakaslar = safeTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);
  const gidenTakaslar = safeTakas.filter((t: any) => String(t?.gonderenEmail || "").toLowerCase() === aktifEmail);
  
  const gelenSiparisler = safeOrders.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gidenSiparisler = safeOrders.filter((o: any) => String(o?.buyerEmail || o?.aliciEmail || "").toLowerCase() === aktifEmail);

  // 🛡️ GİRİŞ KONTROL ZIRHI
  const loading = status === "loading" || (aktifEmail && (!walletData && !listingsData && !takasData && !ordersData));
  if (status === "loading") return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse italic text-2xl">KONTROL MERKEZİNE BAĞLANILIYOR... ⏳</div>;
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  // 🤖 AI TAKAS MOTORU TETİKLEYİCİSİ
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
        mutateListings(); // SWR ile listeyi canlı olarak yeniler
      } else {
        setAiSonuc('❌ Hata: ' + data.error);
      }
    } catch (e: any) {
      setAiSonuc('❌ Sistem Hatası: ' + e.message);
    }
    setAiYukleniyor(false);
  };

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
    if (!confirm("Varlık durumunu değiştirmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/varliklar/${ilan._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durum: yeniDurum }),
      });
      if (res.ok) mutateListings();
    } catch (err) { alert("Bağlantı hatası."); }
  };

  const handleDuzenleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIslemLoading(true);
    try {
      const res = await fetch(`/api/varliklar/${duzenleModal._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duzenleModal),
      });
      if (res.ok) {
        alert("✅ Varlık başarıyla güncellendi!");
        setDuzenleModal(null);
        mutateListings(); 
      } else { alert("Hata oluştu."); }
    } catch (err) { alert("Bağlantı hatası."); } 
    finally { setIslemLoading(false); }
  };

  // ROZET FONKSİYONU
  const getDurumRozeti = (durum: string) => {
    const d = String(durum || "").toLowerCase();
    if (d === "bekliyor" || d === "isleme_alindi") return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black animate-pulse shadow-lg">⏳ Onay Bekliyor</span>;
    if (d === "onaylandi" || d === "kabul") return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">📦 Hazırlanıyor</span>;
    if (d === "kargoda" || d === "kargolandi") return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">🚚 Yolda</span>;
    if (d === "teslim_edildi" || d === "tamamlandi") return <span className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black shadow-[0_0_15px_rgba(0,242,96,0.3)]">✅ Tamamlandı</span>;
    if (d === "iptal" || d === "reddedildi") return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-[9px] uppercase font-black">❌ İptal Edildi</span>;
    return <span className="bg-gray-500/10 text-gray-400 px-3 py-1 rounded-lg text-[9px] uppercase font-black">{d}</span>;
  };

  const gosterilenVeri = () => {
    let veri: any[] = [];
    if (aktifSekme === "gelen_teklifler") veri = gelenTakaslar;
    if (aktifSekme === "giden_teklifler") veri = gidenTakaslar;
    if (aktifSekme === "gelen_siparisler") veri = gelenSiparisler;
    if (aktifSekme === "giden_siparisler") veri = gidenSiparisler;
    if (altFiltre !== "hepsi") {
      veri = veri.filter((t: any) => String(t?.durum || t?.status || "").toLowerCase() === altFiltre);
    }
    return veri;
  };

  const bekleyenSatis = gelenSiparisler.filter((s: any) => { const d = String(s?.durum || s?.status || "").toLowerCase(); return d === 'bekliyor' || d === 'isleme_alindi'; }).length;
  const bekleyenTakas = gelenTakaslar.filter((t: any) => String(t?.durum || "").toLowerCase() === 'bekliyor').length;
  const aktifAldiklarim = gidenSiparisler.filter((s: any) => {
    const d = String(s?.durum || s?.status || "").toLowerCase();
    return !["teslim_edildi", "tamamlandi", "iptal"].includes(d);
  }).length;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic flex flex-col md:flex-row">
      
      {/* 🧭 SOL PANEL (MENÜ) */}
      <div className="w-full md:w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 flex flex-col pt-24 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10 text-center md:text-left shrink-0">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2 cursor-pointer hover:text-[#00f260] transition-colors" onClick={() => router.push('/')}>A-TAKASA<span className="text-[#00f260]">.</span></h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase truncate">{aktifEmail}</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 px-6 overflow-x-auto md:overflow-y-auto no-scrollbar flex-1 pb-6 md:pb-0">
          {[
            { id: "ozet_radar", icon: "📟", ad: "Siber Radar" },
            { id: "ilanlarim", icon: "💎", ad: "Varlıklarım", bildirim: ilanlarim.length },
            { id: "gelen_siparisler", icon: "📦", ad: "Satışlarım", bildirim: bekleyenSatis },
            { id: "giden_siparisler", icon: "🛒", ad: "Aldıklarım", bildirim: aktifAldiklarim },
            { id: "gelen_teklifler", icon: "🔄", ad: "Gelen Takaslar", bildirim: bekleyenTakas },
            { id: "giden_teklifler", icon: "🚀", ad: "Yaptığım Takaslar" },
            { id: "guvenlik", icon: "🛡️", ad: "Kalkan (Güvenlik)" },
            { id: "ai_ilan", icon: "🤖", ad: "AI Takas İlanı" }, // 🚨 YENİ AI SEKME EKLENDİ!
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setAltFiltre("hepsi");}} 
              className={`flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)] scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3"><span className="text-base">{menu.icon}</span> {menu.ad}</div>
              {menu.bildirim !== undefined && menu.bildirim > 0 ? <span className={`px-2 py-0.5 rounded-md text-[8px] ${aktifSekme === menu.id ? 'bg-black text-[#00f260]' : 'bg-[#00f260]/20 text-[#00f260]'}`}>{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>

        <div className="hidden md:block px-6 py-8 border-t border-white/5 bg-[#0a0a0a]/90 shrink-0 mt-auto">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-start gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all group">
            <LogOut size={16} /> SİSTEMDEN ÇIKIŞ YAP
          </button>
        </div>
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
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-2">Havuz Bakiyesi</p>
                <p className="text-5xl font-black text-white">{bakiye.toLocaleString()} <span className="text-2xl text-[#00f260]">₺</span></p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer" onClick={() => setAktifSekme("ilanlarim")}>
                <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:scale-110 transition-transform">💎</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Varlıklarım</p>
                <p className="text-5xl font-black text-white">{ilanlarim.length} <span className="text-xl text-slate-500">Adet</span></p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-[#00f260]/40 transition-colors">
                <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:scale-110 transition-transform">📦</div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Bekleyen İşlemler</p>
                <p className="text-5xl font-black text-white">{bekleyenSatis + bekleyenTakas}</p>
              </div>
            </div>
          </div>
        )}

        {/* 💎 SEKME: SİBER VARLIKLARIM */}
        {aktifSekme === "ilanlarim" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Varlık <span className="text-[#00f260]">Yönetimi.</span></h2>
              <button onClick={() => router.push('/ilan-ver')} className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all">+ YENİ VARLIK EKLE</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ilanlarim.map((ilan: any) => (
                <div key={ilan._id} className={`flex flex-col bg-[#0a0a0a] border rounded-[2rem] p-5 transition-all shadow-xl ${ilan.durum === 'pasif' ? 'border-red-500/30 opacity-70' : 'border-white/5 hover:border-[#00f260]/50'}`}>
                  <div className="flex gap-4 mb-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                      {/* 📸 SİBER DÜZELTME: Resim URL'si kontrolü eklendi */}
                      <img src={ilan.resimler?.[0] || ilan.images?.[0] || "https://placehold.co/150?text=YOK"} className="w-full h-full object-cover" alt="varlik" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate pr-2">{ilan.baslik}</h3>
                      <p className="text-[#00f260] font-black text-xl">{Number(ilan.fiyat || 0).toLocaleString()} ₺</p>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">{ilan.kategori}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <button onClick={() => setDuzenleModal(ilan)} className="flex items-center justify-center gap-1 bg-white/5 hover:bg-cyan-500 hover:text-black text-cyan-400 py-3 rounded-xl text-[9px] font-black uppercase transition-colors"><Edit size={12} /> Düzenle</button>
                    <button onClick={() => handleIlanDurumDegistir(ilan)} className="flex items-center justify-center gap-1 py-3 rounded-xl text-[9px] font-black uppercase transition-colors bg-white/5 hover:bg-white/20"><Power size={12} /> Durum</button>
                    <button onClick={() => handleIlanSil(ilan._id)} className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 py-3 rounded-xl text-[9px] font-black uppercase transition-colors"><Trash2 size={12} /> Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🤖 YENİ SEKME: AI TAKAS KOKPİTİ */}
        {aktifSekme === "ai_ilan" && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6">AI Takas <span className="text-[#00f260]">Motoru.</span></h2>
            <p className="text-[12px] text-slate-400 mb-10 font-bold tracking-wider max-w-2xl">Claude AI ile otomatik takas ilanları oluştur. Bu ilanlar sitede gerçek kullanıcı ilanı gibi görünür.</p>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,242,96,0.05)] relative overflow-hidden mb-6 max-w-2xl">
              <div className="mb-6">
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2 mb-2 block">Sektör Seçimi</label>
                <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] appearance-none">
                  <option value="vasita">🚗 Vasıta & Araç</option>
                  <option value="elektronik">📱 Elektronik</option>
                  <option value="emlak">🏠 Emlak</option>
                  <option value="giyim">⌚ Saat & Giyim</option>
                  <option value="mobilya">🛋️ Mobilya</option>
                  <option value="hobi">🎸 Hobi & Müzik</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2 mb-2 block">Şehir</label>
                <select value={aiSehir} onChange={e => setAiSehir(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#00f260] appearance-none">
                  {sehirler.slice(0, 15).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mb-10">
                <label className="text-[10px] font-black text-[#00f260] uppercase tracking-widest ml-2 mb-2 block flex justify-between"><span>Kaç Adet?</span> <span className="text-white text-base">{aiAdet}</span></label>
                <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-[#00f260] cursor-pointer" />
              </div>
              <button onClick={aiIlanOlustur} disabled={aiYukleniyor} className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${aiYukleniyor ? 'bg-white/10 text-slate-500 cursor-not-allowed' : 'bg-[#00f260] text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(0,242,96,0.4)]'}`}>
                {aiYukleniyor ? '⏳ CLAUDE AI ÇALIŞIYOR...' : '🤖 AI İLE TAKAS İLANI OLUŞTUR'}
              </button>
            </div>
            {aiSonuc && <div className={`max-w-2xl p-6 rounded-2xl border text-xs font-black tracking-widest uppercase ${aiSonuc.includes('❌') ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[#00f260]/10 border-[#00f260]/30 text-[#00f260]'}`}>{aiSonuc}</div>}
          </div>
        )}

        {/* 📟 İŞLEM TAHTASI */}
        {["gelen_teklifler", "giden_teklifler", "gelen_siparisler", "giden_siparisler"].includes(aktifSekme) && (
          <div className="animate-in fade-in duration-500">
            <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
              {["hepsi", "bekliyor", "onaylandi", "kargoda", "teslim_edildi", "iptal"].map((durum: string) => (
                <button key={durum} onClick={() => setAltFiltre(durum)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${altFiltre === durum ? 'bg-white text-black' : 'bg-[#0a0a0a] text-slate-500 border border-white/5 hover:text-white'}`}>{durum}</button>
              ))}
            </div>
            <div className="space-y-6">
              {gosterilenVeri().map((islem: any) => (
                <div key={islem._id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col hover:border-white/20 transition-all shadow-xl">
                   <div className="flex items-center gap-3 mb-6">
                     <span className="text-cyan-500 font-black text-[10px] uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-lg">📟 İŞLEM KAYDI</span>
                     {getDurumRozeti(islem.durum)}
                   </div>
                   <p className="text-white font-bold text-sm uppercase mb-1">HEDEF: {islem.baslik || islem.heTargetIlanBaslik || "Ürün İncelemede"}</p>
                   <p className="text-[#00f260] font-black text-2xl">{Number(islem.fiyat || 0).toLocaleString()} ₺</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 🚀 SİBER DÜZENLEME MODALI */}
      {duzenleModal && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(0,242,96,0.2)]">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 border-b border-white/10 pb-4">Varlığı Düzenle</h3>
            <form onSubmit={handleDuzenleKaydet} className="space-y-4">
              <input type="text" value={duzenleModal.baslik} onChange={e => setDuzenleModal({...duzenleModal, baslik: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-bold outline-none" placeholder="Başlık" />
              <input type="number" value={duzenleModal.fiyat} onChange={e => setDuzenleModal({...duzenleModal, fiyat: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-[#00f260] font-black outline-none" placeholder="Fiyat" />
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setDuzenleModal(null)} className="flex-1 py-4 bg-white/5 text-white font-black text-[10px] uppercase rounded-xl">İptal</button>
                <button type="submit" disabled={islemLoading} className="flex-1 py-4 bg-[#00f260] text-black font-black text-[10px] uppercase rounded-xl shadow-[0_0_15px_rgba(0,242,96,0.4)]">{islemLoading ? "YÜKLENİYOR..." : "KAYDET"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
