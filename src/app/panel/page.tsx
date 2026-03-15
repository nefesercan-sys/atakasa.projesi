"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { LogOut, Edit, Trash2, Power, LayoutDashboard, Package, ArrowLeftRight, ShoppingCart, Truck, Sparkles, Image as ImageIcon, MessageCircle, Send } from "lucide-react";

// 📡 SWR VERİ ÇEKME MOTORU
const fetcher = (url: string) => fetch(url).then(res => res.json());

// 🌍 TÜRKİYE'NİN 81 İLİ
const SEHIRLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", 
  "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", 
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", 
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", 
  "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", 
  "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", 
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", 
  "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

// 📦 AI MOTORU İÇİN KATEGORİLER
const AI_KATEGORILER = [
  { id: "emlak", ad: "Emlak", icon: "🏠" }, 
  { id: "vasita", ad: "Vasıta", icon: "🚗" }, 
  { id: "elektronik", ad: "Elektronik", icon: "💻" },
  { id: "ev_yasam", ad: "Ev & Yaşam", icon: "🛋️" }, 
  { id: "moda", ad: "Moda & Giyim", icon: "👕" }, 
  { id: "anne_bebek", ad: "Anne & Bebek", icon: "🧸" },
  { id: "kozmetik", ad: "Kozmetik", icon: "💄" }, 
  { id: "spor", ad: "Spor & Outdoor", icon: "⚽" }, 
  { id: "hobi", ad: "Hobi & Oyuncak", icon: "🎨" },
  { id: "kitap", ad: "Kitap & Kırtasiye", icon: "📚" }, 
  { id: "antika", ad: "Antika & Sanat", icon: "🏺" }, 
  { id: "petshop", ad: "Petshop", icon: "🐾" },
  { id: "oyun", ad: "Oyun & Konsol", icon: "🎮" }, 
  { id: "temizlik", ad: "Temizlik Hizmetleri", icon: "🧹" }, 
  { id: "ikinci_el", ad: "2. El Eşya", icon: "♻️" },         
  { id: "diger", ad: "Diğer", icon: "📦" }                
];

export default function ProfesyonelKullaniciPaneli() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const aktifEmail = session?.user?.email?.toLowerCase() || "";

  const [aktifSekme, setAktifSekme] = useState("ai_ilan"); 
  const [altFiltre, setAltFiltre] = useState("hepsi");
  const [kargoKoduForm, setKargoKoduForm] = useState("");
  const [duzenleModal, setDuzenleModal] = useState<any>(null);
  const [islemLoading, setIslemLoading] = useState(false);
  const [topluSilLoading, setTopluSilLoading] = useState(false);

  const [aiKategori, setAiKategori] = useState('vasita');
  const [aiSehir, setAiSehir] = useState('İstanbul');
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState('');

  // 💬 MESAJLAŞMA KONTROLLERİ
  const [konusmalar, setKonusmalar] = useState<any[]>([]);
  const [aktifKonusma, setAktifKonusma] = useState<any>(null);
  const [sohbetGecmisi, setSohbetGecmisi] = useState<any[]>([]);
  const [yeniMesaj, setYeniMesaj] = useState("");
  const mesajSonuRef = useRef<HTMLDivElement>(null);

  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: listingsData, mutate: mutateListings } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: takasData, mutate: mutateTakas } = useSWR(aktifEmail ? `/api/takas?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: ordersData, mutate: mutateOrders } = useSWR(aktifEmail ? `/api/orders?email=${aktifEmail}` : null, fetcher, { refreshInterval: 3000 });
  const { data: mesajlarListData, mutate: mutateMesajlarList } = useSWR(aktifEmail ? `/api/mesajlar` : null, fetcher, { refreshInterval: 5000 });

  const safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || ordersData?.data || []);
  const safeTakas = Array.isArray(takasData) ? takasData : (takasData?.takaslar || takasData?.data || []);
  const safeListings = Array.isArray(listingsData) ? listingsData : (listingsData?.ilanlar || listingsData?.data || []);

  const bakiye = walletData?.balance || 0;
  const ilanlarim = safeListings.filter((i: any) => String(i?.sellerEmail || i?.userId || i?.satici || "").toLowerCase() === aktifEmail);
  const gelenTakaslar = safeTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);
  const gidenTakaslar = safeTakas.filter((t: any) => String(t?.gonderenEmail || "").toLowerCase() === aktifEmail);
  const gelenSiparisler = safeOrders.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gidenSiparisler = safeOrders.filter((o: any) => String(o?.buyerEmail || o?.aliciEmail || "").toLowerCase() === aktifEmail);

  const getImageUrl = (ilan: any) => {
    try {
      if (!ilan) return "https://placehold.co/400x300/f3f4f6/4f46e5?text=Görsel+Yok";
      if (Array.isArray(ilan.resimler) && ilan.resimler.length > 0 && typeof ilan.resimler[0] === 'string') return ilan.resimler[0];
      if (Array.isArray(ilan.medyalar) && ilan.medyalar.length > 0 && typeof ilan.medyalar[0] === 'string') return ilan.medyalar[0];
      if (Array.isArray(ilan.images) && ilan.images.length > 0 && typeof ilan.images[0] === 'string') return ilan.images[0];
      if (typeof ilan.image === 'string' && ilan.image.length > 5) return ilan.image;
      if (typeof ilan.imageUrl === 'string' && ilan.imageUrl.length > 5) return ilan.imageUrl;
      if (typeof ilan.resimler === 'string' && ilan.resimler.length > 5) return ilan.resimler;
      return "https://placehold.co/400x300/f3f4f6/4f46e5?text=Görsel+Yok";
    } catch (e) { return "https://placehold.co/400x300/f3f4f6/ef4444?text=Hata"; }
  };

  // 🚨 SİBER ÇÖZÜM: YENİ SOHBET KİLİDİ AÇILIYOR
  const yeniSohbetId = searchParams?.get("yeniSohbet");

  // API'den gelen mesaj odaları listesi ile anlık açılan gecici odaları birleştir
  useEffect(() => {
    if (mesajlarListData && Array.isArray(mesajlarListData)) {
       setKonusmalar(eski => {
          const gercekOdalar = [...mesajlarListData];
          const geciciOdalar = eski.filter(k => String(k._id).startsWith("gecici_") && !gercekOdalar.find(g => g.ilanId === k.ilanId));
          return [...geciciOdalar, ...gercekOdalar].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
       });
    }
  }, [mesajlarListData]);

  // Yeni bir sohbete tıklandıysa anında sanal odayı kur
  useEffect(() => {
    if (yeniSohbetId) {
      if (aktifSekme !== "mesajlar") setAktifSekme("mesajlar");
      
      setKonusmalar(prev => {
         const mevcutOda = prev.find(k => k.ilanId === yeniSohbetId);
         if (mevcutOda) {
            if (aktifKonusma?._id !== mevcutOda._id) setAktifKonusma(mevcutOda);
            return prev;
         }

         fetch(`/api/varliklar?id=${yeniSohbetId}`)
           .then(res => res.json())
           .then(data => {
             const ilan = Array.isArray(data) ? data[0] : data;
             if (ilan) {
                const satici = ilan.satici?.email || ilan.sellerEmail || ilan.satici || "sistem@atakasa.com";
                if (satici.toLowerCase() === aktifEmail) return; 
                
                const yeniOda = {
                   _id: `gecici_${yeniSohbetId}`,
                   karsiTaraf: satici,
                   ilanId: yeniSohbetId,
                   ilanBaslik: ilan.baslik || "İlan",
                   sonMesaj: "Sohbeti başlatmak için yazın...",
                   okunmamis: 0,
                   createdAt: new Date().toISOString()
                };
                
                setKonusmalar(eski => {
                   if (eski.find(k => k.ilanId === yeniSohbetId)) return eski;
                   setAktifKonusma(yeniOda);
                   return [yeniOda, ...eski];
                });
             }
           });
         return prev;
      });
    }
  }, [yeniSohbetId]);

  const sohbetGetir = async (karsiTaraf: string, ilanId: string) => {
    try {
      const res = await fetch(`/api/mesajlar?with=${karsiTaraf}&ilanId=${ilanId}`);
      if (res.ok) {
        const data = await res.json();
        setSohbetGecmisi(Array.isArray(data) ? data : []);
        setTimeout(() => mesajSonuRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        mutateMesajlarList(); 
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (aktifKonusma && !String(aktifKonusma._id).startsWith("gecici_")) {
      sohbetGetir(aktifKonusma.karsiTaraf, aktifKonusma.ilanId);
      const interval = setInterval(() => sohbetGetir(aktifKonusma.karsiTaraf, aktifKonusma.ilanId), 3000);
      return () => clearInterval(interval);
    } else if (String(aktifKonusma?._id).startsWith("gecici_")) {
      setSohbetGecmisi([]); // Geçici odada geçmiş yotur
    }
  }, [aktifKonusma]);

  const handleMesajGonder = async () => {
    if (!yeniMesaj.trim() || !aktifKonusma) return;
    const msg = yeniMesaj;
    setYeniMesaj("");
    try {
      await fetch("/api/mesajlar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          alici: aktifKonusma.karsiTaraf, 
          mesaj: msg, 
          ilanId: aktifKonusma.ilanId,
          ilanBaslik: aktifKonusma.ilanBaslik 
        })
      });
      // Mesaj gidince geçici odayı gerçek odaya çevirmek için listeyi tazele
      mutateMesajlarList();
      sohbetGetir(aktifKonusma.karsiTaraf, aktifKonusma.ilanId);
    } catch(e) {}
  };

  // DİĞER FONKSİYONLAR...
  const handleDurumGuncelle = async (takasId: string, yeniDurum: string) => {
    if (!confirm(`İşlem durumunu '${yeniDurum}' olarak güncelliyorsunuz. Emin misiniz?`)) return;
    try {
      const res = await fetch("/api/takas", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ takasId, yeniDurum }) });
      if (res.ok) mutateTakas();
    } catch (error) { alert("Bağlantı hatası."); }
  };

  const handleSiparisGuncelle = async (orderId: string, yeniDurum: string, kargoVarMi: boolean = false) => {
    if (kargoVarMi && !kargoKoduForm) return alert("Lütfen kargo takip kodunu giriniz!");
    if (!confirm(`Sipariş durumunu '${yeniDurum}' yapıyorsunuz. Onaylıyor musunuz?`)) return;
    try {
      const res = await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, yeniDurum, kargoKodu: kargoKoduForm }) });
      if (res.ok) { alert("✅ SİPARİŞ DURUMU GÜNCELLENDİ!"); setKargoKoduForm(""); mutateOrders(); } 
      else { alert("Güncelleme reddedildi."); }
    } catch (error) { alert("Ağ arızası."); }
  };

  const handleIlanSil = async (id: string) => {
    if (!confirm("⚠️ Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
      if (res.ok) { mutateListings(); } else { alert("Silme işlemi başarısız."); }
    } catch (err) { alert("Bağlantı hatası."); }
  };

  const handleTopluSil = async () => {
    if (ilanlarim.length === 0) return alert("Silinecek ilan bulunamadı.");
    if (!confirm(`⚠️ DİKKAT: Yayındaki TÜM (${ilanlarim.length} adet) ilanınız kalıcı olarak silinecektir. Bu işlem geri alınamaz. Onaylıyor musunuz?`)) return;
    setTopluSilLoading(true);
    try {
      await Promise.all(ilanlarim.map((ilan: any) => fetch(`/api/varliklar/${ilan._id}`, { method: "DELETE" })));
      alert("✅ Bütün ilanlar başarıyla temizlendi!");
      setAiSonuc("✅ Sistemdeki tüm ilanlar başarıyla silindi.");
      mutateListings();
    } catch (err) { alert("❌ Toplu silme sırasında bir sorun oluştu."); } 
    finally { setTopluSilLoading(false); }
  };

  const handleIlanDurumDegistir = async (ilan: any) => {
    const yeniDurum = ilan.durum === "pasif" ? "aktif" : "pasif";
    const mesaj = yeniDurum === "pasif" ? "İlan yayından kaldırılacak. Emin misiniz?" : "İlan tekrar vitrine çıkacak. Emin misiniz?";
    if (!confirm(mesaj)) return;
    try {
      const res = await fetch(`/api/varliklar/${ilan._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: yeniDurum }) });
      if (res.ok) mutateListings();
    } catch (err) { alert("Bağlantı hatası."); }
  };

  const handleDuzenleKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIslemLoading(true);
    try {
      const res = await fetch(`/api/varliklar/${duzenleModal._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik: duzenleModal.baslik, fiyat: Number(duzenleModal.fiyat), aciklama: duzenleModal.aciklama, kategori: duzenleModal.kategori, sehir: duzenleModal.sehir, ilce: duzenleModal.ilce, mahalle: duzenleModal.mahalle })
      });
      if (res.ok) { alert("✅ Varlık başarıyla güncellendi!"); setDuzenleModal(null); mutateListings(); } 
      else { const err = await res.json(); alert(`Güncelleme başarısız: ${err.message || err.error}`); }
    } catch (err) { alert("Bağlantı hatası."); } 
    finally { setIslemLoading(false); }
  };

  const aiIlanOlustur = async () => {
    setAiYukleniyor(true); setAiSonuc('');
    try {
      const res = await fetch('/api/ai-ilan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kategoriId: aiKategori, sehir: aiSehir, adet: aiAdet, adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY }) });
      const data = await res.json();
      if (data.success) { setAiSonuc(`✅ ${data.uretilen} adet "${aiKategori}" ilanı başarıyla oluşturuldu!`); mutateListings(); } 
      else { setAiSonuc('❌ Hata: ' + data.error); }
    } catch (e: any) { setAiSonuc('❌ Sistem Hatası: ' + e.message); }
    setAiYukleniyor(false);
  };

  const getDurumRozeti = (durum: string) => {
    const d = String(durum || "").toLowerCase();
    if (d === "bekliyor" || d === "isleme_alindi") return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-md text-[10px] uppercase font-bold">⏳ Onay Bekliyor</span>;
    if (d === "onaylandi" || d === "kabul") return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-md text-[10px] uppercase font-bold">📦 Hazırlanıyor</span>;
    if (d === "kargoda" || d === "kargolandi") return <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2 py-1 rounded-md text-[10px] uppercase font-bold">🚚 Yolda</span>;
    if (d === "teslim_edildi" || d === "tamamlandi") return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-[10px] uppercase font-bold">✅ Tamamlandı</span>;
    if (d === "iptal" || d === "iptal_edildi" || d === "red" || d === "reddedildi") return <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-md text-[10px] uppercase font-bold">❌ İptal Edildi</span>;
    return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-[10px] uppercase font-bold">{d || "BİLİNMİYOR"}</span>;
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

  const bekleyenSatis = gelenSiparisler.filter((s: any) => { const d = String(s?.durum || s?.status || "").toLowerCase(); return d === 'bekliyor' || d === 'isleme_alindi'; }).length;
  const bekleyenTakas = gelenTakaslar.filter((t: any) => String(t?.durum || "").toLowerCase() === 'bekliyor').length;
  const aktifAldiklarim = gidenSiparisler.filter((s: any) => { const d = String(s?.durum || s?.status || "").toLowerCase(); return !["teslim_edildi", "tamamlandi", "iptal", "iptal_edildi"].includes(d); }).length;

  if (status === "loading") return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-indigo-600 font-bold animate-pulse">SİSTEME BAĞLANILIYOR... ⏳</div>;
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col md:flex-row">
      <div className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col pt-12 z-20 shadow-sm md:h-screen md:sticky md:top-0">
        <div className="px-8 mb-10 text-center md:text-left shrink-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-600 cursor-pointer" onClick={() => router.push('/')}>ATAKASA<span className="text-gray-900">.</span></h1>
          <p className="text-gray-500 text-[11px] font-semibold mt-1 truncate">{aktifEmail}</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 px-4 overflow-x-auto md:overflow-y-auto no-scrollbar flex-1 pb-6 md:pb-0">
          {[
            { id: "panelim", icon: <LayoutDashboard size={18}/>, ad: "Panelim" },
            { id: "ilanlarim", icon: <ImageIcon size={18}/>, ad: "Varlıklarım", bildirim: ilanlarim.length },
            { id: "gelen_siparisler", icon: <ShoppingCart size={18}/>, ad: "Satışlarım", bildirim: bekleyenSatis },
            { id: "giden_siparisler", icon: <Truck size={18}/>, ad: "Aldıklarım", bildirim: aktifAldiklarim },
            { id: "gelen_teklifler", icon: <ArrowLeftRight size={18}/>, ad: "Gelen Takaslar", bildirim: bekleyenTakas },
            { id: "giden_teklifler", icon: <ArrowLeftRight size={18}/>, ad: "Yaptığım Takaslar" },
            { id: "mesajlar", icon: <MessageCircle size={18}/>, ad: "Mesajlarım", bildirim: konusmalar.reduce((acc, k) => acc + (k.okunmamis || 0), 0) }, 
            { id: "ai_ilan", icon: <Sparkles size={18} className="text-indigo-600"/>, ad: "Akıllı İlan Motoru" }, 
          ].map((menu) => (
            <button key={menu.id} onClick={() => {setAktifSekme(menu.id); setAltFiltre("hepsi");}} className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-[13px] transition-all whitespace-nowrap ${aktifSekme === menu.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <div className="flex items-center gap-3">{menu.icon} {menu.ad}</div>
              {menu.bildirim !== undefined && menu.bildirim > 0 ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${aktifSekme === menu.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{menu.bildirim}</span> : null}
            </button>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-gray-100 shrink-0 mt-auto">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-[13px] hover:bg-gray-50 transition-all shadow-sm">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 relative overflow-x-hidden min-h-screen">
        {aktifSekme === "panelim" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Hoş Geldiniz 👋</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wide mb-2">Kasa Bakiyeniz</p>
                <p className="text-4xl font-extrabold text-gray-900">{bakiye.toLocaleString()} <span className="text-2xl text-gray-400">₺</span></p>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm relative overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setAktifSekme("ilanlarim")}>
                <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wide mb-2">Yayındaki İlanlar</p>
                <p className="text-4xl font-extrabold text-gray-900">{ilanlarim.length} <span className="text-xl text-gray-400">Adet</span></p>
              </div>
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wide mb-2">Bekleyen Aksiyonlar</p>
                <div className="flex items-center gap-4"><p className="text-4xl font-extrabold text-indigo-600">{bekleyenSatis + bekleyenTakas}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* 💬 SİBER ÇÖZÜM: MESAJLARIM SEKME ARAYÜZÜ */}
        {aktifSekme === "mesajlar" && (
          <div className="animate-in fade-in duration-300 h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
            {/* Sol: Konuşma Listesi */}
            <div className="w-full md:w-1/3 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
               <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-900">Sohbetler</h3></div>
               <div className="flex-1 overflow-y-auto">
                 {konusmalar.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-xs">Henüz mesajınız yok.</div>
                 ) : konusmalar.map(k => (
                    <div key={k._id} onClick={() => setAktifKonusma(k)} className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${aktifKonusma?._id === k._id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-gray-900 truncate">{k.karsiTaraf.split('@')[0]}</span>
                          {k.okunmamis > 0 && <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{k.okunmamis}</span>}
                       </div>
                       <p className="text-[11px] text-indigo-600 font-semibold truncate mb-1">📋 {k.ilanBaslik}</p>
                       <p className="text-xs text-gray-500 truncate">{k.sonMesaj}</p>
                    </div>
                 ))}
               </div>
            </div>
            
            {/* Sağ: Mesaj Penceresi */}
            <div className="w-full md:w-2/3 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
              {!aktifKonusma ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageCircle size={48} className="mb-4 opacity-20" />
                    <p>Sohbeti görüntülemek için soldan bir kişi seçin.</p>
                 </div>
              ) : (
                 <>
                   <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                     <div>
                       <h3 className="font-bold text-gray-900">{aktifKonusma.karsiTaraf.split('@')[0]}</h3>
                       <p className="text-[11px] text-gray-500">{aktifKonusma.ilanBaslik}</p>
                     </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                      {sohbetGecmisi.length === 0 ? (
                         <div className="text-center text-gray-400 text-xs mt-10">Sohbeti başlatmak için ilk mesajı gönderin.</div>
                      ) : sohbetGecmisi.map(msg => {
                         const benimMi = msg.gonderen.toLowerCase() === aktifEmail;
                         return (
                            <div key={msg._id} className={`flex ${benimMi ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[75%] p-3 rounded-2xl text-[13px] ${benimMi ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                                  {msg.mesaj}
                                  <div className={`text-[9px] mt-1 text-right ${benimMi ? 'text-indigo-200' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                               </div>
                            </div>
                         )
                      })}
                      <div ref={mesajSonuRef} />
                   </div>
                   <div className="p-4 border-t border-gray-100 bg-white flex gap-2">
                     <input type="text" value={yeniMesaj} onChange={e=>setYeniMesaj(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleMesajGonder()} placeholder="Mesajınızı yazın..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                     <button onClick={handleMesajGonder} disabled={!yeniMesaj.trim()} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send size={20} /></button>
                   </div>
                 </>
              )}
            </div>
          </div>
        )}

        {/* 💎 VARLIKLARIM EKRANI */}
        {aktifSekme === "ilanlarim" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Varlıklarım</h2>
              <div className="flex items-center gap-3">
                {ilanlarim.length > 0 && (
                  <button onClick={handleTopluSil} disabled={topluSilLoading} className={`px-5 py-3 rounded-xl text-[13px] font-bold transition-all shadow-sm border flex items-center justify-center gap-2 ${topluSilLoading ? 'bg-red-50 text-red-400 border-red-100 cursor-wait' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'}`}>
                    <Trash2 size={16} />
                    {topluSilLoading ? "SİLİNİYOR..." : "TÜMÜNÜ SİL"}
                  </button>
                )}
                <button onClick={() => router.push('/ilan-ver')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-sm">
                  + Yeni İlan
                </button>
              </div>
            </div>

            {ilanlarim.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold text-sm">Sistemde henüz bir ilanınız bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ilanlarim.map((ilan: any) => (
                  <div key={ilan._id} className={`flex flex-col bg-white border rounded-2xl p-4 shadow-sm transition-all ${ilan.durum === 'pasif' ? 'border-red-200 opacity-80 grayscale-[20%]' : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'}`}>
                    <div className="w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 relative group">
                      {ilan.resimler?.[0]?.includes(".mp4") ? (
                        <video src={ilan.resimler[0]} className="w-full h-full object-cover" muted />
                      ) : (
                        <img 
                          src={getImageUrl(ilan)} 
                          alt={ilan.baslik} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300/f3f4f6/4f46e5?text=Görsel+Yok"; }} 
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 mb-4">
                      <h3 className="text-gray-900 font-bold text-base line-clamp-2 pr-2">{ilan.baslik}</h3>
                      <p className="text-indigo-600 font-extrabold text-xl">{Number(ilan.fiyat).toLocaleString()} ₺</p>
                      <p className="text-gray-500 text-[11px] font-semibold uppercase mt-1 truncate">{ilan.kategori}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-gray-100">
                      <button onClick={() => setDuzenleModal(ilan)} className="flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-lg text-[11px] font-bold transition-colors"><Edit size={14} /> Düzenle</button>
                      <button onClick={() => handleIlanDurumDegistir(ilan)} className={`flex items-center justify-center gap-1 py-2.5 rounded-lg text-[11px] font-bold transition-colors ${ilan.durum === 'pasif' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}><Power size={14} /> {ilan.durum === 'pasif' ? 'Yayınla' : 'Durdur'}</button>
                      <button onClick={() => handleIlanSil(ilan._id)} className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 py-2.5 rounded-lg text-[11px] font-bold transition-colors"><Trash2 size={14} /> Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* İŞLEM TAHTASI */}
        {["gelen_teklifler", "giden_teklifler", "gelen_siparisler", "giden_siparisler"].includes(aktifSekme) && (
          <div className="animate-in fade-in duration-300">
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
              {["hepsi", "bekliyor", "kabul", "onaylandi", "kargoda", "teslim_edildi", "iptal"].map((durum: string) => (
                <button key={durum} onClick={() => setAltFiltre(durum)} className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase transition-all whitespace-nowrap ${altFiltre === durum ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                  {durum.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {gosterilenVeri().length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-3xl py-16 text-center shadow-sm">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-bold text-sm mb-1">Bu filtrede işlem bulunamadı</p>
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
                      <div key={`takas-${guvenliID}`} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-indigo-700 font-bold text-[10px] uppercase bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">🔄 TAKAS İŞLEMİ</span>
                            {getDurumRozeti(islem.durum)}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                          <div className="flex-1 text-center md:text-left">
                            <p className="text-gray-500 text-[11px] font-bold uppercase mb-1">Benim Varlığım</p>
                            <p className="text-gray-900 font-bold text-sm">{benimRolum === "alici" ? (islem.heTargetIlanBaslik || islem.hedefIlanBaslik || "Ürün İncelemede") : (islem.teklifEdilenIlanBaslik || "Ürün İncelemede")}</p>
                          </div>
                          <div className="text-gray-400 text-2xl font-black rotate-90 md:rotate-0">⇄</div>
                          <div className="flex-1 text-center md:text-right">
                            <p className="text-gray-500 text-[11px] font-bold uppercase mb-1">Karşı Tarafın Varlığı</p>
                            <p className="text-gray-900 font-bold text-sm">{benimRolum === "alici" ? (islem.teklifEdilenIlanBaslik || "Ürün İncelemede") : (islem.heTargetIlanBaslik || islem.hedefIlanBaslik || "Ürün İncelemede")}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto">
                          {islem.durum === "bekliyor" && benimRolum === "alici" && (
                            <>
                              <button onClick={()=>handleDurumGuncelle(islem._id, "kabul")} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition-all shadow-sm">Teklifi Kabul Et</button>
                              <button onClick={()=>handleDurumGuncelle(islem._id, "red")} className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-xl text-[12px] font-bold hover:bg-red-50 transition-all">Reddet</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (isSiparis) {
                    const benimRolum = String(islem.sellerEmail || islem.saticiEmail || "").toLowerCase() === aktifEmail ? "satici" : "alici";
                    const islemDurumu = String(islem.durum || islem.status || "").toLowerCase();

                    return (
                      <div key={`siparis-${guvenliID}`} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`${benimRolum === 'satici' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-200'} font-bold text-[10px] uppercase border px-2.5 py-1 rounded-md`}>
                              {benimRolum === 'satici' ? '📦 SATIŞ İŞLEMİ' : '🛒 SATIN ALMA İŞLEMİ'}
                            </span>
                            {getDurumRozeti(islemDurumu)}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 mb-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <div className="flex-1">
                            <p className="text-gray-500 text-[11px] font-bold uppercase mb-1">Teslimat Bilgileri</p>
                            <p className="text-gray-900 font-bold text-sm mb-1">{islem.adSoyad || islem.buyerEmail || "Alıcı Bilgisi"}</p>
                            <p className="text-gray-600 text-xs leading-relaxed">{islem.adres || islem.shippingAddress || "Adres detayları işleniyor..."}</p>
                          </div>
                          <div className="flex-1 md:border-l border-gray-200 md:pl-6">
                            <p className="text-gray-500 text-[11px] font-bold uppercase mb-1">Ödeme Özeti</p>
                            <p className="text-indigo-600 font-extrabold text-2xl mb-1">{Number(islem.fiyat || islem.price || islem.totalPrice || 0).toLocaleString()} ₺</p>
                            <p className="text-gray-500 text-[11px] font-semibold">Yöntem: {String(islem.odemeYontemi || islem.paymentStatus || "Sistem").replace("_", " ")}</p>
                            {(islem.kargoKodu || islem.trackingNumber) && <p className="text-purple-700 text-[11px] font-bold mt-3 bg-purple-50 inline-block px-3 py-1.5 rounded-lg border border-purple-100">🚚 Takip No: {islem.kargoKodu || islem.trackingNumber}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto">
                          {benimRolum === "satici" && (islemDurumu === "bekliyor" || islemDurumu === "isleme_alindi") && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "onaylandi")} className="flex-1 bg-amber-500 text-white py-3 rounded-xl text-[12px] font-bold hover:bg-amber-600 transition-all shadow-sm">Siparişi Onayla (Hazırla)</button>
                          )}
                          {benimRolum === "satici" && (islemDurumu === "onaylandi") && (
                            <div className="flex-1 flex flex-col md:flex-row gap-3">
                              <input type="text" placeholder="Kargo Takip Kodu Girin" value={kargoKoduForm} onChange={(e)=>setKargoKoduForm(e.target.value)} className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm px-4 py-3 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                              <button onClick={()=>handleSiparisGuncelle(islem._id, "kargoda", true)} className="bg-purple-600 text-white px-6 py-3 rounded-xl text-[12px] font-bold hover:bg-purple-700 transition-all shadow-sm">Kargoya Ver</button>
                            </div>
                          )}

                          {benimRolum === "alici" && (islemDurumu === "kargoda" || islemDurumu === "kargolandi") && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "teslim_edildi")} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition-all shadow-sm">Ürünü Teslim Aldım</button>
                          )}
                          {benimRolum === "alici" && (islemDurumu === "bekliyor" || islemDurumu === "isleme_alindi") && (
                            <button onClick={()=>handleSiparisGuncelle(islem._id, "iptal")} className="px-6 bg-white border border-red-200 text-red-600 py-3 rounded-xl text-[12px] font-bold hover:bg-red-50 transition-all">Siparişi İptal Et</button>
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

        {/* 🤖 AKILLI AI İLAN MOTORU EKRANI */}
        {aktifSekme === "ai_ilan" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Akıllı İlan Motoru</h2>
            <p className="text-[13px] text-gray-500 mb-8 font-medium max-w-2xl">
              Claude AI ile otomatik takas ilanları oluşturun. Tüm Türkiye şehirleri ve 16 farklı sektör emrinizde!
            </p>
            
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm max-w-2xl">
              
              <div className="mb-6">
                <label className="text-[12px] font-bold text-gray-700 uppercase mb-2 block">Kategori / Sektör Seçimi</label>
                <select value={aiKategori} onChange={e => setAiKategori(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-medium outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer">
                  {AI_KATEGORILER.map(kat => (
                    <option key={kat.id} value={kat.id}>{kat.icon} {kat.ad}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="text-[12px] font-bold text-gray-700 uppercase mb-2 block">Hedef Şehir</label>
                <select value={aiSehir} onChange={e => setAiSehir(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-medium outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer">
                  <option value="Rastgele">🎲 Bütün Türkiye (Rastgele Dağıt)</option>
                  {SEHIRLER.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-10">
                <label className="text-[12px] font-bold text-gray-700 uppercase mb-3 block flex justify-between items-center">
                  <span>Üretilecek İlan Sayısı</span>
                  <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded-md">{aiAdet} Adet</span>
                </label>
                <input type="range" min={1} max={20} value={aiAdet} onChange={e => setAiAdet(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
                <div className="flex justify-between text-[11px] text-gray-400 font-semibold mt-2">
                  <span>1</span><span>20</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={aiIlanOlustur} 
                  disabled={aiYukleniyor} 
                  className={`w-full py-4 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${aiYukleniyor ? 'bg-indigo-100 text-indigo-400 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}>
                  {aiYukleniyor ? <><Sparkles size={18} className="animate-spin"/> AI İlanları Hazırlıyor...</> : <><Sparkles size={18}/> Yapay İlanları Yayına Al</>}
                </button>

                {ilanlarim.length > 0 && (
                  <button onClick={handleTopluSil} disabled={topluSilLoading} className={`w-full py-4 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 border ${topluSilLoading ? 'bg-red-50 text-red-400 border-red-200 cursor-wait' : 'bg-white text-red-600 border-red-200 hover:bg-red-600 hover:text-white shadow-sm'}`}>
                    <Trash2 size={18} />
                    {topluSilLoading ? "SİSTEM TEMİZLENİYOR..." : `🗑️ SİSTEMDEKİ TÜM İLANLARI SİL (${ilanlarim.length} İLAN)`}
                  </button>
                )}
              </div>
            </div>

            {aiSonuc && (
              <div className={`max-w-2xl mt-6 p-5 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${aiSonuc.includes('❌') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                {aiSonuc}
              </div>
            )}
          </div>
        )}

      </div>

      {/* DÜZENLEME MODALI */}
      {duzenleModal && (
        <div className="fixed inset-0 z-[999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-extrabold text-gray-900">Varlığı Düzenle</h3>
              <button onClick={() => setDuzenleModal(null)} className="text-gray-400 hover:text-gray-700"><Trash2 size={20}/></button>
            </div>
            
            <form onSubmit={handleDuzenleKaydet} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">Başlık</label>
                  <input type="text" value={duzenleModal.baslik || ""} onChange={e => setDuzenleModal({...duzenleModal, baslik: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-colors" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">Fiyat (₺)</label>
                  <input type="number" value={duzenleModal.fiyat || ""} onChange={e => setDuzenleModal({...duzenleModal, fiyat: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-indigo-700 font-black outline-none focus:border-indigo-500 focus:bg-white transition-colors" required />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">Kategori</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer" value={duzenleModal.kategori || ""} onChange={e => setDuzenleModal({...duzenleModal, kategori: e.target.value})} required>
                  <option value="" disabled>SEKTÖR SEÇİNİZ...</option>
                  {AI_KATEGORILER.map(kat => (
                    <option key={kat.id} value={kat.id}>{kat.icon} {kat.ad}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">Şehir</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer" value={duzenleModal.sehir || ""} onChange={e => setDuzenleModal({...duzenleModal, sehir: e.target.value})} required>
                    <option value="" disabled>Seçiniz...</option>
                    {SEHIRLER.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">İlçe</label>
                  <input type="text" value={duzenleModal.ilce || ""} onChange={e => setDuzenleModal({...duzenleModal, ilce: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-colors" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">Mahalle</label>
                  <input type="text" value={duzenleModal.mahalle || ""} onChange={e => setDuzenleModal({...duzenleModal, mahalle: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase mb-1.5 block ml-1">Açıklama / Şartlar</label>
                <textarea value={duzenleModal.aciklama || ""} onChange={e => setDuzenleModal({...duzenleModal, aciklama: e.target.value})} rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none" required></textarea>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setDuzenleModal(null)} className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-bold text-[12px] uppercase rounded-xl hover:bg-gray-50 transition-colors">İptal</button>
                <button type="submit" disabled={islemLoading} className="flex-1 py-4 bg-indigo-600 text-white font-bold text-[12px] uppercase rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                  {islemLoading ? "KAYDEDİLİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      
    </div>
  );
}
