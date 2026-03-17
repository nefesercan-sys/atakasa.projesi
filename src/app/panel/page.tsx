"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  LogOut, Edit, Trash2, Power, LayoutDashboard, Package,
  ArrowLeftRight, ShoppingCart, Truck, Sparkles,
  Image as ImageIcon, MessageCircle, Send, Bell,
  TrendingUp, Wallet, ChevronRight, X,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SEHIRLER = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın",
  "Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir",
  "Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş",
  "Karabük","Karaman","Kars","Kastamonu","Kayseri","Kırıkkale","Kırklareli","Kırşehir","Kilis","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye",
  "Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon",
  "Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

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
  { id: "diger", ad: "Diğer", icon: "📦" },
];

export default function Panel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const aktifEmail = session?.user?.email?.toLowerCase() || "";

  const [sekme, setSekme] = useState("panelim");
  const [altFiltre, setAltFiltre] = useState("hepsi");
  const [kargoKodu, setKargoKodu] = useState("");
  const [duzenle, setDuzenle] = useState<any>(null);
  const [islemYukleniyor, setIslemYukleniyor] = useState(false);
  const [topluSilYukleniyor, setTopluSilYukleniyor] = useState(false);
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);

  const [aiKategori, setAiKategori] = useState("vasita");
  const [aiSehir, setAiSehir] = useState("İstanbul");
  const [aiAdet, setAiAdet] = useState(5);
  const [aiYukleniyor, setAiYukleniyor] = useState(false);
  const [aiSonuc, setAiSonuc] = useState("");

  const [konusmalar, setKonusmalar] = useState<any[]>([]);
  const [aktifKonusma, setAktifKonusma] = useState<any>(null);
  const [sohbet, setSohbet] = useState<any[]>([]);
  const [yeniMesaj, setYeniMesaj] = useState("");
  const mesajSonuRef = useRef<HTMLDivElement>(null);

  const swrOpts = { refreshInterval: 3000 };
  const { data: walletData } = useSWR(aktifEmail ? `/api/wallet?email=${aktifEmail}` : null, fetcher, swrOpts);
  const { data: listingsData, mutate: mutateListings } = useSWR(aktifEmail ? `/api/listings?email=${aktifEmail}` : null, fetcher, swrOpts);
  const { data: takasData, mutate: mutateTakas } = useSWR(aktifEmail ? `/api/takas?email=${aktifEmail}` : null, fetcher, swrOpts);
  const { data: ordersData, mutate: mutateOrders } = useSWR(aktifEmail ? `/api/orders?email=${aktifEmail}` : null, fetcher, swrOpts);
  const { data: mesajlarData, mutate: mutateMesajlar } = useSWR(aktifEmail ? `/api/mesajlar` : null, fetcher, { refreshInterval: 5000 });

  const safeArr = (d: any, ...keys: string[]) => {
    if (Array.isArray(d)) return d;
    for (const k of keys) if (Array.isArray(d?.[k])) return d[k];
    return [];
  };

  const tumSiparisler = safeArr(ordersData, "orders", "data");
  const tumTakas = safeArr(takasData, "takaslar", "data");
  const tumIlanlar = safeArr(listingsData, "ilanlar", "data");
  const bakiye = walletData?.balance || 0;

  const ilanlarim = tumIlanlar.filter((i: any) =>
    String(i?.sellerEmail || i?.userId || i?.satici || "").toLowerCase() === aktifEmail
  );
  const gelenTakas = tumTakas.filter((t: any) => String(t?.aliciEmail || "").toLowerCase() === aktifEmail);
  const gidenTakas = tumTakas.filter((t: any) => String(t?.gonderenEmail || "").toLowerCase() === aktifEmail);
  const gelenSiparis = tumSiparisler.filter((o: any) => String(o?.sellerEmail || o?.saticiEmail || "").toLowerCase() === aktifEmail);
  const gidenSiparis = tumSiparisler.filter((o: any) => String(o?.buyerEmail || o?.aliciEmail || "").toLowerCase() === aktifEmail);

  const bekleyenSatis = gelenSiparis.filter((s: any) => ["bekliyor", "isleme_alindi"].includes(String(s?.durum || "").toLowerCase())).length;
  const bekleyenTakas = gelenTakas.filter((t: any) => String(t?.durum || "").toLowerCase() === "bekliyor").length;
  const aktifAlim = gidenSiparis.filter((s: any) => !["teslim_edildi", "tamamlandi", "iptal", "iptal_edildi"].includes(String(s?.durum || "").toLowerCase())).length;
  const okunmamis = konusmalar.reduce((a, k) => a + (k.okunmamis || 0), 0);

  const getImg = (ilan: any) => {
    if (!ilan) return "https://placehold.co/400x300/eef3f8/0f2540?text=Görsel";
    const check = (v: any) => Array.isArray(v) && v.length > 0 && typeof v[0] === "string" ? v[0] : null;
    return check(ilan.resimler) || check(ilan.medyalar) || check(ilan.images)
      || (typeof ilan.image === "string" && ilan.image.length > 5 ? ilan.image : null)
      || "https://placehold.co/400x300/eef3f8/0f2540?text=Görsel";
  };

  const durumStr = (d: any) => String(d || "").toLowerCase();

  const RozetBilesen = ({ durum }: { durum: string }) => {
    const d = durumStr(durum);
    if (["bekliyor", "isleme_alindi"].includes(d)) return <span className="rozet rozet-bekle">⏳ Bekliyor</span>;
    if (["onaylandi", "kabul"].includes(d)) return <span className="rozet rozet-onay">📦 Hazırlanıyor</span>;
    if (["kargoda", "kargolandi"].includes(d)) return <span className="rozet rozet-kargo">🚚 Yolda</span>;
    if (["teslim_edildi", "tamamlandi"].includes(d)) return <span className="rozet rozet-tamam">✅ Tamamlandı</span>;
    if (["iptal", "iptal_edildi", "red", "reddedildi"].includes(d)) return <span className="rozet rozet-iptal">❌ İptal</span>;
    return <span className="rozet rozet-diger">{d || "—"}</span>;
  };

  useEffect(() => {
    if (mesajlarData && Array.isArray(mesajlarData)) {
      setKonusmalar((eski) => {
        const gercek = [...mesajlarData];
        const gecici = eski.filter((k) => String(k._id).startsWith("gecici_") && !gercek.find((g) => g.ilanId === k.ilanId));
        return [...gecici, ...gercek].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      });
    }
  }, [mesajlarData]);

  const yeniSohbetId = searchParams?.get("yeniSohbet");
  useEffect(() => {
    if (!yeniSohbetId) return;
    setSekme("mesajlar");
    setKonusmalar((prev) => {
      const mevcut = prev.find((k) => k.ilanId === yeniSohbetId);
      if (mevcut) { setAktifKonusma(mevcut); return prev; }
      fetch(`/api/varliklar?id=${yeniSohbetId}`).then((r) => r.json()).then((data) => {
        const ilan = Array.isArray(data) ? data[0] : data;
        if (!ilan) return;
        const satici = ilan.satici?.email || ilan.sellerEmail || ilan.satici || "sistem@atakasa.com";
        if (satici.toLowerCase() === aktifEmail) return;
        const yeni = { _id: `gecici_${yeniSohbetId}`, karsiTaraf: satici, ilanId: yeniSohbetId, ilanBaslik: ilan.baslik || "İlan", sonMesaj: "Sohbeti başlatın...", okunmamis: 0, createdAt: new Date().toISOString() };
        setKonusmalar((e) => { if (e.find((k) => k.ilanId === yeniSohbetId)) return e; setAktifKonusma(yeni); return [yeni, ...e]; });
      });
      return prev;
    });
  }, [yeniSohbetId]);

  const sohbetGetir = async (karsi: string, ilanId: string) => {
    try {
      const r = await fetch(`/api/mesajlar?with=${karsi}&ilanId=${ilanId}`);
      if (r.ok) { const d = await r.json(); setSohbet(Array.isArray(d) ? d : []); setTimeout(() => mesajSonuRef.current?.scrollIntoView({ behavior: "smooth" }), 80); mutateMesajlar(); }
    } catch {}
  };

  useEffect(() => {
    if (!aktifKonusma) return;
    if (String(aktifKonusma._id).startsWith("gecici_")) { setSohbet([]); return; }
    sohbetGetir(aktifKonusma.karsiTaraf, aktifKonusma.ilanId);
    const t = setInterval(() => sohbetGetir(aktifKonusma.karsiTaraf, aktifKonusma.ilanId), 3000);
    return () => clearInterval(t);
  }, [aktifKonusma]);

  const mesajGonder = async () => {
    if (!yeniMesaj.trim() || !aktifKonusma) return;
    const msg = yeniMesaj; setYeniMesaj("");
    try {
      await fetch("/api/mesajlar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alici: aktifKonusma.karsiTaraf, mesaj: msg, ilanId: aktifKonusma.ilanId, ilanBaslik: aktifKonusma.ilanBaslik }) });
      mutateMesajlar(); sohbetGetir(aktifKonusma.karsiTaraf, aktifKonusma.ilanId);
    } catch {}
  };

  const takasGuncelle = async (id: string, durum: string) => {
    if (!confirm(`Durum: "${durum}" yapılacak. Onaylıyor musunuz?`)) return;
    const r = await fetch("/api/takas", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ takasId: id, yeniDurum: durum }) });
    if (r.ok) mutateTakas(); else alert("Hata.");
  };

  const siparisGuncelle = async (id: string, durum: string, kargoGerekli = false) => {
    if (kargoGerekli && !kargoKodu) return alert("Kargo takip kodu gerekli!");
    if (!confirm(`Sipariş "${durum}" yapılacak. Onaylıyor musunuz?`)) return;
    const r = await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: id, yeniDurum: durum, kargoKodu }) });
    if (r.ok) { setKargoKodu(""); mutateOrders(); } else alert("Güncelleme başarısız.");
  };

  const ilanSil = async (id: string) => {
    if (!confirm("Bu ilan kalıcı olarak silinecek. Emin misiniz?")) return;
    const r = await fetch(`/api/varliklar/${id}`, { method: "DELETE" });
    if (r.ok) mutateListings(); else alert("Silme başarısız.");
  };

  const topluSil = async () => {
    if (ilanlarim.length === 0) return alert("Silinecek ilan yok.");
    if (!confirm(`TÜM ${ilanlarim.length} ilan silinecek. Geri alınamaz. Emin misiniz?`)) return;
    setTopluSilYukleniyor(true);
    try { await Promise.all(ilanlarim.map((i: any) => fetch(`/api/varliklar/${i._id}`, { method: "DELETE" }))); mutateListings(); setAiSonuc("✅ Tüm ilanlar silindi."); }
    catch { alert("Toplu silme hatası."); } finally { setTopluSilYukleniyor(false); }
  };

  const durumDegistir = async (ilan: any) => {
    const yeni = ilan.durum === "pasif" ? "aktif" : "pasif";
    if (!confirm(yeni === "pasif" ? "İlan yayından kaldırılacak." : "İlan vitrine çıkacak.")) return;
    const r = await fetch(`/api/varliklar/${ilan._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durum: yeni }) });
    if (r.ok) mutateListings();
  };

  const duzenleKaydet = async (e: React.FormEvent) => {
    e.preventDefault(); setIslemYukleniyor(true);
    try {
      const r = await fetch(`/api/varliklar/${duzenle._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ baslik: duzenle.baslik, fiyat: Number(duzenle.fiyat), aciklama: duzenle.aciklama, kategori: duzenle.kategori, sehir: duzenle.sehir, ilce: duzenle.ilce, mahalle: duzenle.mahalle }) });
      if (r.ok) { alert("✅ Güncellendi!"); setDuzenle(null); mutateListings(); }
      else { const e2 = await r.json(); alert(`Hata: ${e2.message || e2.error}`); }
    } catch { alert("Bağlantı hatası."); } finally { setIslemYukleniyor(false); }
  };

  const aiOlustur = async () => {
    setAiYukleniyor(true); setAiSonuc("");
    try {
      const r = await fetch("/api/ai-ilan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kategoriId: aiKategori, sehir: aiSehir, adet: aiAdet, adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY }) });
      const d = await r.json();
      if (d.success) { setAiSonuc(`✅ ${d.uretilen} ilan oluşturuldu!`); mutateListings(); }
      else setAiSonuc("❌ " + d.error);
    } catch (err: any) { setAiSonuc("❌ " + err.message); } finally { setAiYukleniyor(false); }
  };

  const tabVeri = () => {
    let veri: any[] = sekme === "gelen_takas" ? gelenTakas : sekme === "giden_takas" ? gidenTakas : sekme === "gelen_siparis" ? gelenSiparis : gidenSiparis;
    if (altFiltre !== "hepsi") {
      veri = veri.filter((t: any) => {
        const d = durumStr(t?.durum || t?.status);
        if (altFiltre === "bekliyor") return ["bekliyor", "isleme_alindi"].includes(d);
        if (altFiltre === "onaylandi") return ["onaylandi", "kabul"].includes(d);
        if (altFiltre === "kargoda") return ["kargoda", "kargolandi"].includes(d);
        if (altFiltre === "teslim_edildi") return ["teslim_edildi", "tamamlandi"].includes(d);
        if (altFiltre === "iptal") return ["iptal", "iptal_edildi", "reddedildi"].includes(d);
        return d === altFiltre;
      });
    }
    return veri;
  };

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: "#0f2540", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, fontFamily: "sans-serif" }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>A-TAKASA<span style={{ color: "#c9a84c" }}>.</span></div>
      <div style={{ width: 32, height: 32, border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Sisteme bağlanılıyor...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (status === "unauthenticated") { router.push("/giris"); return null; }

  const menuler = [
    { id: "panelim", icon: <LayoutDashboard size={16} />, ad: "Panelim" },
    { id: "ilanlarim", icon: <ImageIcon size={16} />, ad: "Varlıklarım", sayi: ilanlarim.length },
    { id: "gelen_siparis", icon: <ShoppingCart size={16} />, ad: "Satışlarım", sayi: bekleyenSatis, uyari: true },
    { id: "giden_siparis", icon: <Truck size={16} />, ad: "Aldıklarım", sayi: aktifAlim },
    { id: "gelen_takas", icon: <ArrowLeftRight size={16} />, ad: "Gelen Takaslar", sayi: bekleyenTakas, uyari: true },
    { id: "giden_takas", icon: <ArrowLeftRight size={16} />, ad: "Yaptığım Takaslar" },
    { id: "mesajlar", icon: <MessageCircle size={16} />, ad: "Mesajlarım", sayi: okunmamis, uyari: true },
    { id: "ai_ilan", icon: <Sparkles size={16} />, ad: "AI İlan Motoru", ozel: true },
  ];

  const SidebarIcerik = () => (
    <>
      <div className="sb-ust">
        <div className="sb-logo" onClick={() => router.push("/")}>A-TAKASA<span>.</span></div>
        <div className="sb-email">{aktifEmail}</div>
        <div className="sb-bakiye">
          <Wallet size={12} />
          <span>{bakiye.toLocaleString()} ₺</span>
        </div>
      </div>
      <nav className="sb-nav">
        {menuler.map((m) => (
          <button key={m.id} onClick={() => { setSekme(m.id); setAltFiltre("hepsi"); setMobilMenuAcik(false); }}
            className={`sb-btn ${sekme === m.id ? "sb-btn-aktif" : ""} ${m.ozel ? "sb-btn-ozel" : ""}`}>
            <span className="sb-btn-sol">{m.icon}<span>{m.ad}</span></span>
            {m.sayi !== undefined && m.sayi > 0 && (
              <span className={`sb-sayi ${m.uyari ? "sb-sayi-uyari" : ""}`}>{m.sayi}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sb-alt">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="sb-cikis"><LogOut size={14} /> Çıkış Yap</button>
      </div>
    </>
  );

  return (
    <div className="panel-root">

      {/* MOBİL HEADER */}
      <header className="mobil-header">
        <div className="mobil-logo" onClick={() => router.push("/")}>A-TAKASA<span>.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {okunmamis > 0 && <span className="mobil-bildirim">{okunmamis}</span>}
          <button className="mobil-menu-btn" onClick={() => setMobilMenuAcik(!mobilMenuAcik)}>
            {mobilMenuAcik ? <X size={20} /> : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect y="3" width="20" height="2" rx="1" fill="currentColor"/>
                <rect y="9" width="14" height="2" rx="1" fill="currentColor"/>
                <rect y="15" width="20" height="2" rx="1" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* MOBİL MENÜ DRAWER */}
      {mobilMenuAcik && (
        <div className="mobil-overlay" onClick={() => setMobilMenuAcik(false)}>
          <div className="mobil-drawer" onClick={(e) => e.stopPropagation()}>
            <SidebarIcerik />
          </div>
        </div>
      )}

      {/* MASAÜSTÜ SIDEBAR */}
      <aside className="sidebar"><SidebarIcerik /></aside>

      {/* SAYFA İÇERİĞİ */}
      <main className="panel-icerik">

        {/* ── PANELİM ── */}
        {sekme === "panelim" && (
          <div className="fade-in">
            <div className="sayfa-baslik">
              <div>
                <h1>Hoş Geldiniz 👋</h1>
                <p>Hesabınızın genel durumuna bakın</p>
              </div>
            </div>

            <div className="istat-grid">
              {[
                { label: "Kasa Bakiyesi", deger: `${bakiye.toLocaleString()} ₺`, renk: "#c9a84c", icon: "💰", tikla: undefined },
                { label: "Yayındaki İlanlar", deger: `${ilanlarim.length} Adet`, renk: "#0f2540", icon: "📦", tikla: () => setSekme("ilanlarim") },
                { label: "Bekleyen Aksiyonlar", deger: String(bekleyenSatis + bekleyenTakas), renk: bekleyenSatis + bekleyenTakas > 0 ? "#e85d24" : "#1a7a4a", icon: "⚡", tikla: undefined },
                { label: "Aktif Satın Almalar", deger: `${aktifAlim} Adet`, renk: "#1a3a5c", icon: "🛒", tikla: () => setSekme("giden_siparis") },
              ].map((k) => (
                <div key={k.label} className={`istat-kart ${k.tikla ? "istat-kart-tikla" : ""}`} onClick={k.tikla}>
                  <div className="istat-ust">
                    <span className="istat-label">{k.label}</span>
                    <span className="istat-icon">{k.icon}</span>
                  </div>
                  <div className="istat-deger" style={{ color: k.renk }}>{k.deger}</div>
                  {k.tikla && <div className="istat-git"><ChevronRight size={14} /> Görüntüle</div>}
                </div>
              ))}
            </div>

            {(bekleyenSatis + bekleyenTakas) > 0 && (
              <div className="uyari-banner">
                <Bell size={16} />
                <span><strong>{bekleyenSatis + bekleyenTakas} bekleyen aksiyon</strong> var — hemen inceleyin.</span>
                <button onClick={() => setSekme(bekleyenSatis > 0 ? "gelen_siparis" : "gelen_takas")} className="uyari-git">
                  İncele <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="hizli-baslik">Hızlı Erişim</div>
            <div className="hizli-grid">
              {[
                { id: "ilanlarim", emoji: "📦", ad: "Varlıklarım", aciklama: `${ilanlarim.length} ilan aktif` },
                { id: "gelen_siparis", emoji: "💰", ad: "Satışlarım", aciklama: bekleyenSatis > 0 ? `${bekleyenSatis} bekleyen` : "Güncel" },
                { id: "ai_ilan", emoji: "✨", ad: "AI İlan Motoru", aciklama: "Otomatik oluştur" },
                { id: "mesajlar", emoji: "💬", ad: "Mesajlarım", aciklama: okunmamis > 0 ? `${okunmamis} okunmamış` : "Tüm mesajlar" },
              ].map((h) => (
                <button key={h.id} onClick={() => setSekme(h.id)} className="hizli-btn">
                  <span className="hizli-emoji">{h.emoji}</span>
                  <div>
                    <div className="hizli-ad">{h.ad}</div>
                    <div className="hizli-aciklama">{h.aciklama}</div>
                  </div>
                  <ChevronRight size={14} className="hizli-ok" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VARLIKLARIM ── */}
        {sekme === "ilanlarim" && (
          <div className="fade-in">
            <div className="sayfa-baslik">
              <div>
                <h1>Varlıklarım</h1>
                <p>{ilanlarim.length} ilan yayında</p>
              </div>
              <div className="btn-grup">
                {ilanlarim.length > 0 && (
                  <button onClick={topluSil} disabled={topluSilYukleniyor} className="btn btn-tehlike">
                    <Trash2 size={14} /> {topluSilYukleniyor ? "Siliniyor..." : "Tümünü Sil"}
                  </button>
                )}
                <button onClick={() => router.push("/ilan-ver")} className="btn btn-ana">+ Yeni İlan</button>
              </div>
            </div>

            {ilanlarim.length === 0 ? (
              <div className="bos-durum">
                <ImageIcon size={44} className="bos-icon" />
                <p className="bos-baslik">Henüz ilan yok</p>
                <p className="bos-alt">İlk ilanınızı oluşturmak için "Yeni İlan" butonuna tıklayın.</p>
                <button onClick={() => router.push("/ilan-ver")} className="btn btn-ana" style={{ marginTop: 16 }}>+ İlan Ver</button>
              </div>
            ) : (
              <div className="ilan-grid">
                {ilanlarim.map((ilan: any) => (
                  <div key={ilan._id} className={`ilan-kart ${ilan.durum === "pasif" ? "ilan-kart-pasif" : ""}`}>
                    <div className="ilan-gorsel-wrap">
                      {ilan.resimler?.[0]?.includes(".mp4") ? (
                        <video src={ilan.resimler[0]} className="ilan-gorsel" muted />
                      ) : (
                        <img src={getImg(ilan)} alt={ilan.baslik} className="ilan-gorsel"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300/eef3f8/0f2540?text=Görsel"; }} />
                      )}
                      <div className={`ilan-durum-rozet ${ilan.durum === "pasif" ? "ilan-durum-pasif" : "ilan-durum-aktif"}`}>
                        {ilan.durum === "pasif" ? "Yayında Değil" : "Aktif"}
                      </div>
                    </div>
                    <div className="ilan-bilgi">
                      <span className="ilan-kat">{ilan.kategori}</span>
                      <h3 className="ilan-baslik">{ilan.baslik}</h3>
                      <div className="ilan-fiyat-row">
                        <span className="ilan-fiyat">{Number(ilan.fiyat).toLocaleString()} ₺</span>
                        <span className="ilan-sehir">📍 {ilan.sehir || "TR"}</span>
                      </div>
                    </div>
                    <div className="ilan-butonlar">
                      <button onClick={() => setDuzenle(ilan)} className="ilan-btn ilan-btn-duzenle"><Edit size={12} /> Düzenle</button>
                      <button onClick={() => durumDegistir(ilan)} className={`ilan-btn ${ilan.durum === "pasif" ? "ilan-btn-yayinla" : "ilan-btn-durdur"}`}>
                        <Power size={12} /> {ilan.durum === "pasif" ? "Yayınla" : "Durdur"}
                      </button>
                      <button onClick={() => ilanSil(ilan._id)} className="ilan-btn ilan-btn-sil"><Trash2 size={12} /> Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAKAS / SİPARİŞ TABLOLARI ── */}
        {["gelen_takas", "giden_takas", "gelen_siparis", "giden_siparis"].includes(sekme) && (
          <div className="fade-in">
            <div className="sayfa-baslik">
              <div>
                <h1>
                  {sekme === "gelen_takas" && "Gelen Takas Teklifleri"}
                  {sekme === "giden_takas" && "Yaptığım Takaslar"}
                  {sekme === "gelen_siparis" && "Satışlarım"}
                  {sekme === "giden_siparis" && "Aldıklarım"}
                </h1>
              </div>
            </div>

            <div className="filtre-bar">
              {["hepsi", "bekliyor", "onaylandi", "kargoda", "teslim_edildi", "iptal"].map((f) => (
                <button key={f} onClick={() => setAltFiltre(f)} className={`filtre-btn ${altFiltre === f ? "filtre-btn-aktif" : ""}`}>
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="islem-liste">
              {tabVeri().length === 0 ? (
                <div className="bos-durum">
                  <Package size={40} className="bos-icon" />
                  <p className="bos-baslik">Bu filtrede işlem bulunamadı</p>
                </div>
              ) : tabVeri().map((islem: any, idx: number) => {
                if (!islem) return null;
                const isTakas = sekme.includes("takas");
                const gid = String(islem._id || idx);

                if (isTakas) {
                  const rol = durumStr(islem.gonderenEmail) === aktifEmail ? "gonderen" : "alici";
                  return (
                    <div key={`t-${gid}`} className="islem-kart">
                      <div className="islem-header">
                        <div className="islem-tip islem-tip-takas">🔄 TAKAS İŞLEMİ</div>
                        <RozetBilesen durum={islem.durum} />
                      </div>
                      <div className="takas-kutu">
                        <div className="takas-taraf">
                          <span className="takas-label">Benim Varlığım</span>
                          <span className="takas-deger">{rol === "alici" ? (islem.hedefIlanBaslik || "İncelemede") : (islem.teklifEdilenIlanBaslik || "İncelemede")}</span>
                        </div>
                        <div className="takas-ok">⇄</div>
                        <div className="takas-taraf takas-taraf-sag">
                          <span className="takas-label">Karşı Taraf</span>
                          <span className="takas-deger">{rol === "alici" ? (islem.teklifEdilenIlanBaslik || "İncelemede") : (islem.hedefIlanBaslik || "İncelemede")}</span>
                        </div>
                      </div>
                      {durumStr(islem.durum) === "bekliyor" && rol === "alici" && (
                        <div className="islem-aksiyonlar">
                          <button onClick={() => takasGuncelle(islem._id, "kabul")} className="btn btn-basari">✓ Kabul Et</button>
                          <button onClick={() => takasGuncelle(islem._id, "red")} className="btn btn-cizgi-tehlike">✕ Reddet</button>
                        </div>
                      )}
                    </div>
                  );
                }

                const rol = durumStr(islem.sellerEmail || islem.saticiEmail) === aktifEmail ? "satici" : "alici";
                const ist = durumStr(islem.durum || islem.status);
                return (
                  <div key={`s-${gid}`} className="islem-kart">
                    <div className="islem-header">
                      <div className={`islem-tip ${rol === "satici" ? "islem-tip-satis" : "islem-tip-alis"}`}>
                        {rol === "satici" ? "📦 SATIŞ" : "🛒 SATIN ALMA"}
                      </div>
                      <RozetBilesen durum={ist} />
                    </div>
                    <div className="siparis-detay">
                      <div className="siparis-teslimat">
                        <span className="takas-label">Teslimat</span>
                        <strong className="siparis-kisi">{islem.adSoyad || islem.buyerEmail || "—"}</strong>
                        <p className="siparis-adres">{islem.adres || "Adres işleniyor..."}</p>
                      </div>
                      <div className="siparis-odeme">
                        <span className="takas-label">Tutar</span>
                        <strong className="siparis-tutar">{Number(islem.fiyat || 0).toLocaleString()} ₺</strong>
                        <span className="siparis-yontem">{String(islem.odemeYontemi || "").replace("_", " ") || "—"}</span>
                        {(islem.kargoKodu || islem.trackingNumber) && (
                          <span className="kargo-rozet">🚚 {islem.kargoKodu || islem.trackingNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="islem-aksiyonlar">
                      {rol === "satici" && ["bekliyor", "isleme_alindi"].includes(ist) && (
                        <button onClick={() => siparisGuncelle(islem._id, "onaylandi")} className="btn btn-uyari">Onayla & Hazırla</button>
                      )}
                      {rol === "satici" && ist === "onaylandi" && (
                        <div className="kargo-form">
                          <input type="text" placeholder="Kargo takip kodu" value={kargoKodu} onChange={(e) => setKargoKodu(e.target.value)} className="kargo-input" />
                          <button onClick={() => siparisGuncelle(islem._id, "kargoda", true)} className="btn btn-mor">Kargoya Ver</button>
                        </div>
                      )}
                      {rol === "alici" && ["kargoda", "kargolandi"].includes(ist) && (
                        <button onClick={() => siparisGuncelle(islem._id, "teslim_edildi")} className="btn btn-basari">✓ Teslim Aldım</button>
                      )}
                      {rol === "alici" && ["bekliyor", "isleme_alindi"].includes(ist) && (
                        <button onClick={() => siparisGuncelle(islem._id, "iptal")} className="btn btn-cizgi-tehlike">İptal Et</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MESAJLAR ── */}
        {sekme === "mesajlar" && (
          <div className="fade-in mesaj-root">
            <div className="mesaj-sol">
              <div className="mesaj-sol-header">
                <MessageCircle size={16} /> Sohbetler
                {okunmamis > 0 && <span className="mesaj-badge">{okunmamis}</span>}
              </div>
              <div className="mesaj-liste">
                {konusmalar.length === 0 ? (
                  <div className="mesaj-bos">Henüz mesaj yok.</div>
                ) : konusmalar.map((k) => (
                  <div key={k._id} onClick={() => setAktifKonusma(k)}
                    className={`mesaj-satir ${aktifKonusma?._id === k._id ? "mesaj-satir-aktif" : ""}`}>
                    <div className="mesaj-satir-ust">
                      <span className="mesaj-kisi">{k.karsiTaraf.split("@")[0]}</span>
                      {k.okunmamis > 0 && <span className="mesaj-mini-badge">{k.okunmamis}</span>}
                    </div>
                    <p className="mesaj-ilan-adi">📋 {k.ilanBaslik}</p>
                    <p className="mesaj-onizleme">{k.sonMesaj}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mesaj-sag">
              {!aktifKonusma ? (
                <div className="mesaj-bos-ekran">
                  <MessageCircle size={48} style={{ opacity: 0.15, marginBottom: 12 }} />
                  <p>Bir sohbet seçin</p>
                </div>
              ) : (
                <>
                  <div className="mesaj-sag-header">
                    <div className="mesaj-avatar">{aktifKonusma.karsiTaraf[0].toUpperCase()}</div>
                    <div>
                      <strong>{aktifKonusma.karsiTaraf.split("@")[0]}</strong>
                      <span>{aktifKonusma.ilanBaslik}</span>
                    </div>
                  </div>
                  <div className="mesaj-gecmis">
                    {sohbet.length === 0 ? (
                      <div className="mesaj-bos" style={{ marginTop: 48 }}>İlk mesajı gönderin.</div>
                    ) : sohbet.map((msg) => {
                      const ben = msg.gonderen.toLowerCase() === aktifEmail;
                      return (
                        <div key={msg._id} className={`balon-wrap ${ben ? "balon-wrap-ben" : ""}`}>
                          <div className={`balon ${ben ? "balon-ben" : "balon-karsi"}`}>
                            {msg.mesaj}
                            <div className="balon-saat">
                              {new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={mesajSonuRef} />
                  </div>
                  <div className="mesaj-input-alan">
                    <input type="text" value={yeniMesaj} onChange={(e) => setYeniMesaj(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && mesajGonder()}
                      placeholder="Mesajınızı yazın..." className="mesaj-input" />
                    <button onClick={mesajGonder} disabled={!yeniMesaj.trim()} className="mesaj-gonder-btn">
                      <Send size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── AI İLAN MOTORU ── */}
        {sekme === "ai_ilan" && (
          <div className="fade-in">
            <div className="sayfa-baslik">
              <div>
                <h1>AI İlan Motoru ✨</h1>
                <p>Claude AI ile saniyeler içinde gerçekçi ilanlar oluşturun</p>
              </div>
            </div>

            <div className="ai-kart">
              <div className="ai-form-grid">
                <div className="form-alan">
                  <label className="form-label">Kategori</label>
                  <select value={aiKategori} onChange={(e) => setAiKategori(e.target.value)} className="form-select">
                    {AI_KATEGORILER.map((k) => <option key={k.id} value={k.id}>{k.icon} {k.ad}</option>)}
                  </select>
                </div>
                <div className="form-alan">
                  <label className="form-label">Şehir</label>
                  <select value={aiSehir} onChange={(e) => setAiSehir(e.target.value)} className="form-select">
                    <option value="Rastgele">🎲 Tüm Türkiye (Rastgele)</option>
                    {SEHIRLER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-alan" style={{ marginTop: 20 }}>
                <label className="form-label">
                  <span>İlan Sayısı</span>
                  <span className="ai-adet-gos">{aiAdet} adet</span>
                </label>
                <input type="range" min={1} max={20} value={aiAdet} onChange={(e) => setAiAdet(Number(e.target.value))} className="ai-range" />
                <div className="ai-range-uc"><span>1</span><span>20</span></div>
              </div>

              <div className="ai-butonlar">
                <button onClick={aiOlustur} disabled={aiYukleniyor} className={`btn btn-ai ${aiYukleniyor ? "btn-loading" : ""}`}>
                  <Sparkles size={16} /> {aiYukleniyor ? "Hazırlanıyor..." : "Yapay İlanları Yayına Al"}
                </button>
                {ilanlarim.length > 0 && (
                  <button onClick={topluSil} disabled={topluSilYukleniyor} className="btn btn-cizgi-tehlike">
                    <Trash2 size={15} /> {topluSilYukleniyor ? "Siliniyor..." : `Tüm İlanları Sil (${ilanlarim.length})`}
                  </button>
                )}
              </div>

              {aiSonuc && (
                <div className={`ai-sonuc ${aiSonuc.includes("❌") ? "ai-sonuc-hata" : "ai-sonuc-ok"}`}>
                  {aiSonuc}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── DÜZENLEME MODALI ── */}
      {duzenle && (
        <div className="modal-overlay" onClick={() => setDuzenle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Varlığı Düzenle</h2>
              <button onClick={() => setDuzenle(null)} className="modal-kapat"><X size={18} /></button>
            </div>
            <form onSubmit={duzenleKaydet} className="modal-form">
              <div className="modal-grid-2">
                <div className="form-alan">
                  <label className="form-label">Başlık</label>
                  <input type="text" value={duzenle.baslik || ""} onChange={(e) => setDuzenle({ ...duzenle, baslik: e.target.value })} className="form-input" required />
                </div>
                <div className="form-alan">
                  <label className="form-label">Fiyat (₺)</label>
                  <input type="number" value={duzenle.fiyat || ""} onChange={(e) => setDuzenle({ ...duzenle, fiyat: e.target.value })} className="form-input" required />
                </div>
              </div>
              <div className="form-alan">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={duzenle.kategori || ""} onChange={(e) => setDuzenle({ ...duzenle, kategori: e.target.value })} required>
                  <option value="" disabled>Seçiniz...</option>
                  {AI_KATEGORILER.map((k) => <option key={k.id} value={k.id}>{k.icon} {k.ad}</option>)}
                </select>
              </div>
              <div className="modal-grid-3">
                <div className="form-alan">
                  <label className="form-label">Şehir</label>
                  <select className="form-select" value={duzenle.sehir || ""} onChange={(e) => setDuzenle({ ...duzenle, sehir: e.target.value })} required>
                    {SEHIRLER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-alan">
                  <label className="form-label">İlçe</label>
                  <input type="text" value={duzenle.ilce || ""} onChange={(e) => setDuzenle({ ...duzenle, ilce: e.target.value })} className="form-input" required />
                </div>
                <div className="form-alan">
                  <label className="form-label">Mahalle</label>
                  <input type="text" value={duzenle.mahalle || ""} onChange={(e) => setDuzenle({ ...duzenle, mahalle: e.target.value })} className="form-input" />
                </div>
              </div>
              <div className="form-alan">
                <label className="form-label">Açıklama</label>
                <textarea value={duzenle.aciklama || ""} onChange={(e) => setDuzenle({ ...duzenle, aciklama: e.target.value })} rows={4} className="form-textarea" required />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setDuzenle(null)} className="btn btn-cizgi">İptal</button>
                <button type="submit" disabled={islemYukleniyor} className="btn btn-ana">
                  {islemYukleniyor ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STİLLER ── */}
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .panel-root {
          min-height: 100vh;
          display: flex;
          font-family: "DM Sans", var(--font-sans, sans-serif);
          background: #f0f2f5;
          color: #1a2740;
        }

        /* ─ MOBİL HEADER ─ */
        .mobil-header {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: #fff; border-bottom: 1px solid #dce6f0;
          padding: 0 20px; height: 56px;
          align-items: center; justify-content: space-between;
        }
        @media (max-width: 768px) { .mobil-header { display: flex; } }
        .mobil-logo {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 20px; font-weight: 800; color: #0f2540; cursor: pointer;
        }
        .mobil-logo span { color: #c9a84c; }
        .mobil-bildirim {
          background: #e85d24; color: #fff;
          font-size: 10px; font-weight: 700;
          padding: 2px 7px; border-radius: 999px;
        }
        .mobil-menu-btn {
          background: none; border: none; cursor: pointer;
          color: #0f2540; padding: 4px; display: flex; align-items: center;
        }
        .mobil-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(15,37,64,0.6); backdrop-filter: blur(4px);
        }
        .mobil-drawer {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 280px; background: #fff;
          display: flex; flex-direction: column;
          animation: drawerAc 0.22s ease;
        }
        @keyframes drawerAc { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        /* ─ SIDEBAR ─ */
        .sidebar {
          width: 256px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #e8edf3;
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0; z-index: 10;
        }
        @media (max-width: 768px) { .sidebar { display: none; } }

        .sb-ust { padding: 28px 22px 18px; border-bottom: 1px solid #f0f4f8; }
        .sb-logo {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 20px; font-weight: 800; color: #0f2540;
          cursor: pointer; letter-spacing: -0.02em; display: inline-block; margin-bottom: 6px;
        }
        .sb-logo span { color: #c9a84c; }
        .sb-email { font-size: 11px; color: #8097b1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 10px; }
        .sb-bakiye {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fdf6e3; border: 1px solid #f0dda0;
          color: #a07830; font-size: 12px; font-weight: 700;
          padding: 4px 12px; border-radius: 999px;
        }
        .sb-nav { flex: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
        .sb-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 10px; border: none;
          background: transparent; font-family: inherit; font-size: 13px; font-weight: 500;
          color: #5a6a7e; cursor: pointer; transition: all 0.12s; text-align: left;
        }
        .sb-btn:hover { background: #f5f7fa; color: #0f2540; }
        .sb-btn-aktif { background: #eef3f8 !important; color: #0f2540 !important; font-weight: 600; }
        .sb-btn-ozel { color: #b08030 !important; font-weight: 600; }
        .sb-btn-ozel.sb-btn-aktif { background: #fdf6e3 !important; }
        .sb-btn-sol { display: flex; align-items: center; gap: 9px; }
        .sb-sayi {
          font-size: 10px; font-weight: 700; padding: 2px 7px;
          border-radius: 999px; background: #eef3f8; color: #5a6a7e;
        }
        .sb-sayi-uyari { background: #fff0eb; color: #e85d24; }
        .sb-alt { padding: 12px 10px; border-top: 1px solid #f0f4f8; }
        .sb-cikis {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px; background: #f5f7fa; border: 1px solid #e0e8f0;
          border-radius: 10px; font-family: inherit; font-size: 12px; font-weight: 600;
          color: #5a6a7e; cursor: pointer; transition: all 0.12s;
        }
        .sb-cikis:hover { background: #fdecea; color: #c0392b; border-color: #f5c6c2; }

        /* ─ ANA İÇERİK ─ */
        .panel-icerik {
          flex: 1; padding: 36px 40px; min-height: 100vh;
          overflow-x: hidden;
        }
        @media (max-width: 768px) { .panel-icerik { padding: 76px 16px 32px; } }

        .fade-in { animation: fadeIn 0.22s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* ─ SAYFA BAŞLIĞI ─ */
        .sayfa-baslik {
          display: flex; justify-content: space-between; align-items: flex-start;
          flex-wrap: wrap; gap: 12px; margin-bottom: 28px;
        }
        .sayfa-baslik h1 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 26px; font-weight: 700; color: #0f2540;
          letter-spacing: -0.02em; margin-bottom: 3px;
        }
        .sayfa-baslik p { font-size: 13px; color: #8097b1; }

        /* ─ İSTATİSTİK ─ */
        .istat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px; }
        .istat-kart {
          background: #fff; border: 1px solid #e8edf3;
          border-radius: 16px; padding: 20px;
          transition: all 0.15s;
        }
        .istat-kart-tikla { cursor: pointer; }
        .istat-kart-tikla:hover { border-color: #c9a84c; box-shadow: 0 4px 16px rgba(201,168,76,0.1); transform: translateY(-1px); }
        .istat-ust { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .istat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #8097b1; }
        .istat-icon { font-size: 20px; }
        .istat-deger { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin-bottom: 8px; }
        .istat-git { font-size: 11px; font-weight: 600; color: #8097b1; display: flex; align-items: center; gap: 3px; }

        /* ─ UYARI BANNER ─ */
        .uyari-banner {
          display: flex; align-items: center; gap: 10px;
          background: #fff8f0; border: 1px solid #fbd8b8;
          border-radius: 12px; padding: 12px 16px;
          font-size: 13px; color: #a05010; margin-bottom: 24px;
        }
        .uyari-git {
          margin-left: auto; display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700; color: #e85d24;
          background: none; border: none; cursor: pointer; white-space: nowrap;
        }

        /* ─ HIZLI ERİŞİM ─ */
        .hizli-baslik { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #8097b1; margin-bottom: 10px; }
        .hizli-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
        .hizli-btn {
          display: flex; align-items: center; gap: 14px;
          background: #fff; border: 1px solid #e8edf3; border-radius: 14px;
          padding: 16px 18px; font-family: inherit; cursor: pointer;
          transition: all 0.15s; text-align: left;
        }
        .hizli-btn:hover { border-color: #0f2540; box-shadow: 0 3px 12px rgba(15,37,64,0.07); transform: translateY(-1px); }
        .hizli-emoji { font-size: 22px; flex-shrink: 0; }
        .hizli-ad { font-size: 13px; font-weight: 700; color: #0f2540; margin-bottom: 2px; }
        .hizli-aciklama { font-size: 11px; color: #8097b1; }
        .hizli-ok { margin-left: auto; color: #c0ccd8; flex-shrink: 0; }

        /* ─ BUTONLAR ─ */
        .btn-grup { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px;
          font-family: inherit; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.14s; border: none; white-space: nowrap;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ana { background: #0f2540; color: #fff; }
        .btn-ana:hover:not(:disabled) { background: #1a3a5c; }
        .btn-tehlike { background: #fdecea; color: #c0392b; border: 1px solid #f5c6c2; }
        .btn-tehlike:hover:not(:disabled) { background: #c0392b; color: #fff; }
        .btn-cizgi-tehlike { background: #fff; color: #c0392b; border: 1px solid #f5c6c2; }
        .btn-cizgi-tehlike:hover:not(:disabled) { background: #fdecea; }
        .btn-basari { background: #1a7a4a; color: #fff; }
        .btn-basari:hover:not(:disabled) { background: #145e39; }
        .btn-uyari { background: #f5a623; color: #fff; }
        .btn-uyari:hover:not(:disabled) { background: #e09520; }
        .btn-mor { background: #5b21b6; color: #fff; }
        .btn-mor:hover:not(:disabled) { background: #4a1a9a; }
        .btn-cizgi { background: #fff; color: #5a6a7e; border: 1px solid #e0e8f0; }
        .btn-cizgi:hover:not(:disabled) { background: #f5f7fa; }
        .btn-ai { background: #0f2540; color: #fff; flex: 1; justify-content: center; font-size: 13px; padding: 13px; }
        .btn-ai:hover:not(:disabled) { background: #1a3a5c; }
        .btn-loading { opacity: 0.65; cursor: wait; }

        /* ─ İLAN GRİD ─ */
        .ilan-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
        .ilan-kart {
          background: #fff; border: 1px solid #e8edf3;
          border-radius: 18px; overflow: hidden; transition: all 0.18s;
        }
        .ilan-kart:hover:not(.ilan-kart-pasif) { border-color: #c9a84c40; box-shadow: 0 6px 24px rgba(15,37,64,0.09); transform: translateY(-2px); }
        .ilan-kart-pasif { opacity: 0.65; border-color: #f5c6c2; filter: grayscale(15%); }
        .ilan-gorsel-wrap { position: relative; height: 196px; overflow: hidden; background: #f0f4f8; }
        .ilan-gorsel { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .ilan-kart:hover .ilan-gorsel { transform: scale(1.04); }
        .ilan-durum-rozet {
          position: absolute; top: 10px; right: 10px;
          font-size: 10px; font-weight: 700; padding: 3px 9px;
          border-radius: 999px; letter-spacing: 0.03em;
        }
        .ilan-durum-aktif { background: rgba(26,122,74,0.9); color: #fff; }
        .ilan-durum-pasif { background: rgba(192,57,43,0.85); color: #fff; }
        .ilan-bilgi { padding: 14px 16px 10px; }
        .ilan-kat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #c9a84c; display: block; margin-bottom: 4px; }
        .ilan-baslik { font-size: 14px; font-weight: 600; color: #0f2540; line-height: 1.35; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38px; }
        .ilan-fiyat-row { display: flex; justify-content: space-between; align-items: center; }
        .ilan-fiyat { font-size: 18px; font-weight: 800; color: #0f2540; letter-spacing: -0.02em; }
        .ilan-sehir { font-size: 11px; color: #8097b1; }
        .ilan-butonlar { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; padding: 10px 12px 14px; border-top: 1px solid #f0f4f8; }
        .ilan-btn { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 8px 4px; border-radius: 8px; font-family: inherit; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.13s; border: none; }
        .ilan-btn-duzenle { background: #f0f4f8; color: #0f2540; }
        .ilan-btn-duzenle:hover { background: #0f2540; color: #fff; }
        .ilan-btn-yayinla { background: #eaf5ee; color: #1a7a4a; }
        .ilan-btn-yayinla:hover { background: #1a7a4a; color: #fff; }
        .ilan-btn-durdur { background: #fef9e7; color: #a07830; }
        .ilan-btn-durdur:hover { background: #f5a623; color: #fff; }
        .ilan-btn-sil { background: #fdecea; color: #c0392b; }
        .ilan-btn-sil:hover { background: #c0392b; color: #fff; }

        /* ─ BOŞ DURUM ─ */
        .bos-durum { text-align: center; padding: 60px 24px; background: #fff; border-radius: 18px; border: 1.5px dashed #dce6f0; }
        .bos-icon { color: #dce6f0; margin: 0 auto 14px; display: block; }
        .bos-baslik { font-size: 15px; font-weight: 600; color: #5a6a7e; margin-bottom: 5px; }
        .bos-alt { font-size: 13px; color: #9aabb8; }

        /* ─ FİLTRE ─ */
        .filtre-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
        .filtre-btn { padding: 7px 15px; border-radius: 999px; font-family: inherit; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer; transition: all 0.13s; background: #fff; border: 1px solid #e0e8f0; color: #5a6a7e; white-space: nowrap; }
        .filtre-btn:hover { border-color: #0f2540; color: #0f2540; }
        .filtre-btn-aktif { background: #0f2540 !important; color: #fff !important; border-color: #0f2540 !important; }

        /* ─ İŞLEM KARTLARI ─ */
        .islem-liste { display: flex; flex-direction: column; gap: 12px; }
        .islem-kart { background: #fff; border: 1px solid #e8edf3; border-radius: 16px; padding: 20px; }
        .islem-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .islem-tip { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 6px; }
        .islem-tip-takas { background: #eef3f8; color: #0f2540; }
        .islem-tip-satis { background: #fef9e7; color: #a07830; border: 1px solid #f0dda0; }
        .islem-tip-alis { background: #f0ebff; color: #5b21b6; border: 1px solid #d8cfff; }
        .takas-kutu { display: flex; align-items: center; gap: 14px; background: #f5f7fa; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; flex-wrap: wrap; }
        .takas-taraf { flex: 1; min-width: 110px; }
        .takas-taraf-sag { text-align: right; }
        .takas-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #8097b1; display: block; margin-bottom: 4px; }
        .takas-deger { font-size: 13px; font-weight: 600; color: #0f2540; }
        .takas-ok { font-size: 18px; color: #8097b1; font-weight: 700; flex-shrink: 0; }
        .siparis-detay { display: flex; gap: 20px; background: #f5f7fa; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; flex-wrap: wrap; }
        .siparis-teslimat { flex: 1; min-width: 130px; }
        .siparis-odeme { flex: 1; min-width: 130px; border-left: 1px solid #e0e8f0; padding-left: 20px; display: flex; flex-direction: column; gap: 3px; }
        .siparis-kisi { font-size: 14px; font-weight: 700; color: #0f2540; display: block; margin-bottom: 4px; }
        .siparis-adres { font-size: 12px; color: #5a6a7e; line-height: 1.5; }
        .siparis-tutar { font-size: 22px; font-weight: 800; color: #0f2540; letter-spacing: -0.02em; }
        .siparis-yontem { font-size: 11px; color: #8097b1; }
        .kargo-rozet { display: inline-block; font-size: 11px; font-weight: 700; background: #f0ebff; color: #5b21b6; padding: 4px 10px; border-radius: 6px; }
        .islem-aksiyonlar { display: flex; gap: 8px; flex-wrap: wrap; }
        .kargo-form { display: flex; gap: 8px; flex: 1; min-width: 200px; }
        .kargo-input { flex: 1; padding: 10px 14px; background: #f5f7fa; border: 1px solid #e0e8f0; border-radius: 10px; font-family: inherit; font-size: 13px; outline: none; }
        .kargo-input:focus { border-color: #0f2540; background: #fff; }

        /* ─ ROZETLER ─ */
        .rozet { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .rozet-bekle { background: #fef9e7; color: #a07830; border: 1px solid #f0dda0; }
        .rozet-onay { background: #eef3f8; color: #0f2540; border: 1px solid #dce6f0; }
        .rozet-kargo { background: #f0ebff; color: #5b21b6; border: 1px solid #d8cfff; }
        .rozet-tamam { background: #eaf5ee; color: #1a7a4a; border: 1px solid #b8dfc6; }
        .rozet-iptal { background: #fdecea; color: #c0392b; border: 1px solid #f5c6c2; }
        .rozet-diger { background: #f5f7fa; color: #5a6a7e; }

        /* ─ MESAJLAR ─ */
        .mesaj-root { display: flex; gap: 16px; height: calc(100vh - 108px); }
        @media (max-width: 768px) { .mesaj-root { flex-direction: column; height: auto; } }
        .mesaj-sol { width: 280px; flex-shrink: 0; background: #fff; border: 1px solid #e8edf3; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        @media (max-width: 768px) { .mesaj-sol { width: 100%; max-height: 240px; } }
        .mesaj-sol-header { padding: 14px 16px; font-size: 13px; font-weight: 700; color: #0f2540; border-bottom: 1px solid #f0f4f8; background: #f8fafc; display: flex; align-items: center; gap: 8px; }
        .mesaj-badge { background: #e85d24; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
        .mesaj-liste { flex: 1; overflow-y: auto; }
        .mesaj-bos { padding: 20px; text-align: center; font-size: 12px; color: #9aabb8; }
        .mesaj-satir { padding: 12px 14px; border-bottom: 1px solid #f0f4f8; cursor: pointer; transition: background 0.1s; }
        .mesaj-satir:hover { background: #f8fafc; }
        .mesaj-satir-aktif { background: #eef3f8 !important; }
        .mesaj-satir-ust { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
        .mesaj-kisi { font-size: 13px; font-weight: 700; color: #0f2540; }
        .mesaj-mini-badge { background: #0f2540; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 999px; }
        .mesaj-ilan-adi { font-size: 11px; font-weight: 600; color: #c9a84c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px; }
        .mesaj-onizleme { font-size: 11px; color: #9aabb8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mesaj-sag { flex: 1; background: #fff; border: 1px solid #e8edf3; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        .mesaj-bos-ekran { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9aabb8; font-size: 13px; }
        .mesaj-sag-header { padding: 14px 18px; border-bottom: 1px solid #f0f4f8; background: #f8fafc; display: flex; align-items: center; gap: 12px; }
        .mesaj-avatar { width: 36px; height: 36px; border-radius: 50%; background: #0f2540; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
        .mesaj-sag-header strong { display: block; font-size: 14px; color: #0f2540; margin-bottom: 2px; }
        .mesaj-sag-header span { font-size: 11px; color: #8097b1; }
        .mesaj-gecmis { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; background: #f8fafc; }
        .balon-wrap { display: flex; }
        .balon-wrap-ben { justify-content: flex-end; }
        .balon { max-width: 70%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
        .balon-ben { background: #0f2540; color: #fff; border-bottom-right-radius: 4px; }
        .balon-karsi { background: #fff; border: 1px solid #e8edf3; color: #1a2740; border-bottom-left-radius: 4px; }
        .balon-saat { font-size: 9px; margin-top: 3px; text-align: right; opacity: 0.55; }
        .mesaj-input-alan { padding: 12px 14px; border-top: 1px solid #f0f4f8; background: #fff; display: flex; gap: 8px; }
        .mesaj-input { flex: 1; padding: 10px 16px; background: #f5f7fa; border: 1px solid #e0e8f0; border-radius: 10px; font-family: inherit; font-size: 13px; outline: none; transition: all 0.14s; }
        .mesaj-input:focus { border-color: #0f2540; background: #fff; }
        .mesaj-gonder-btn { width: 40px; height: 40px; background: #0f2540; border: none; border-radius: 10px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.14s; flex-shrink: 0; }
        .mesaj-gonder-btn:hover:not(:disabled) { background: #1a3a5c; }
        .mesaj-gonder-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ─ AI İLAN ─ */
        .ai-kart { background: #fff; border: 1px solid #e8edf3; border-radius: 18px; padding: 28px; max-width: 640px; }
        .ai-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .ai-form-grid { grid-template-columns: 1fr; } }
        .ai-range { width: 100%; accent-color: #0f2540; cursor: pointer; margin-top: 4px; }
        .ai-range-uc { display: flex; justify-content: space-between; font-size: 11px; color: #8097b1; font-weight: 500; margin-top: 4px; }
        .ai-adet-gos { font-size: 13px; font-weight: 700; color: #0f2540; background: #eef3f8; padding: 2px 10px; border-radius: 6px; }
        .ai-butonlar { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .ai-sonuc { padding: 14px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-top: 16px; }
        .ai-sonuc-ok { background: #eaf5ee; border: 1px solid #b8dfc6; color: #1a7a4a; }
        .ai-sonuc-hata { background: #fdecea; border: 1px solid #f5c6c2; color: #c0392b; }

        /* ─ FORM ELEMANLARI ─ */
        .form-alan { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #5a6a7e; display: flex; justify-content: space-between; align-items: center; }
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 11px 14px;
          background: #f5f7fa; border: 1.5px solid #e0e8f0;
          border-radius: 10px; font-family: inherit; font-size: 13px;
          color: #1a2740; outline: none; transition: all 0.14s;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #0f2540; background: #fff;
          box-shadow: 0 0 0 3px rgba(15,37,64,0.05);
        }
        .form-textarea { resize: none; }
        .form-select { cursor: pointer; }

        /* ─ MODAL ─ */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15,37,64,0.65); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .modal {
          background: #fff; border-radius: 20px; width: 100%; max-width: 580px;
          max-height: 90vh; overflow-y: auto; padding: 28px;
          box-shadow: 0 24px 60px rgba(15,37,64,0.22);
          animation: modalAc 0.22s ease;
        }
        @keyframes modalAc { from { opacity: 0; transform: scale(0.97) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 1px solid #f0f4f8; }
        .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f2540; }
        .modal-kapat { background: #f5f7fa; border: 1px solid #e0e8f0; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5a6a7e; transition: all 0.13s; }
        .modal-kapat:hover { background: #fdecea; color: #c0392b; border-color: #f5c6c2; }
        .modal-form { display: flex; flex-direction: column; gap: 14px; }
        .modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .modal-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) { .modal-grid-2, .modal-grid-3 { grid-template-columns: 1fr; } }
        .modal-footer { display: flex; gap: 10px; margin-top: 8px; padding-top: 16px; border-top: 1px solid #f0f4f8; }
        .modal-footer .btn { flex: 1; justify-content: center; }
      `}</style>
    </div>
  );
}
