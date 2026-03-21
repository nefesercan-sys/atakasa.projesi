"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Play, Share2, Search, SlidersHorizontal, ShoppingCart,
  Zap, ChevronDown, Star, Shield, TrendingUp, TrendingDown,
  User, LogIn,
} from "lucide-react";

export default function HomeClient({ initialIlanlar }: { initialIlanlar: any[] }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [ilanlar, setIlanlar] = useState<any[]>(initialIlanlar);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [aktifKategori, setAktifKategori] = useState("Hepsi");
  const [aktifAltFiltre, setAktifAltFiltre] = useState("Yeni İlanlar");
  const [aktifSehir, setAktifSehir] = useState("Tüm Şehirler");
  const [minFiyat, setMinFiyat] = useState("");
  const [maxFiyat, setMaxFiyat] = useState("");
  const [sadeceTakaslik, setSadeceTakaslik] = useState(false);
  const [filtreMenusuAcik, setFiltreMenusuAcik] = useState(false);
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [siparisForm, setSiparisForm] = useState({
    adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti",
  });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [videoModalBaslik, setVideoModalBaslik] = useState("");
  const [heroSlogan, setHeroSlogan] = useState(0);

  const sloganlar = [
    { emoji: "🔄", text: "Takasla, kazan!", alt: "Ürününü ver, istediğini al" },
    { emoji: "💰", text: "Sat, büyü!", alt: "Güvenli havuzda anında ödeme" },
    { emoji: "🛡️", text: "Güvenli alışveriş!", alt: "%100 alıcı & satıcı koruması" },
    { emoji: "⚡", text: "Hızlı takas!", alt: "Binlerce ürün, bir tık uzağında" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlogan(p => (p + 1) % sloganlar.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sehirler = useMemo(() => [
    "Tüm Şehirler", "İstanbul", "Ankara", "İzmir",
    "Bursa", "Antalya", "Adana", "Konya",
  ], []);

  const sektorler = useMemo(() => [
    { ad: "Elektronik", degisim: "+4.2", emoji: "💻" },
    { ad: "Emlak", degisim: "+1.8", emoji: "🏠" },
    { ad: "Araç", degisim: "-2.4", emoji: "🚗" },
    { ad: "2. El", degisim: "+0.5", emoji: "♻️" },
    { ad: "Sıfır Ürünler", degisim: "+6.1", emoji: "✨" },
    { ad: "Mobilya", degisim: "-1.1", emoji: "🪑" },
    { ad: "Makine", degisim: "+3.3", emoji: "⚙️" },
    { ad: "Tekstil", degisim: "-0.9", emoji: "👕" },
    { ad: "Oyuncak", degisim: "+1.2", emoji: "🧸" },
    { ad: "El Sanatları", degisim: "+12.4", emoji: "🎨" },
    { ad: "Kitap", degisim: "-0.4", emoji: "📚" },
    { ad: "Antika Eserler", degisim: "+15.8", emoji: "🏺" },
    { ad: "Kırtasiye", degisim: "+0.2", emoji: "📎" },
    { ad: "Doğal Ürünler", degisim: "+2.5", emoji: "🌿" },
    { ad: "Kozmetik", degisim: "-3.2", emoji: "💄" },
    { ad: "Petshop", degisim: "+1.1", emoji: "🐾" },
    { ad: "Oyun/Konsol", degisim: "+8.7", emoji: "🎮" },
  ], []);

  useEffect(() => {
    try {
      const bozukVeri = localStorage.getItem("atakasa_sepet");
      if (bozukVeri) JSON.parse(bozukVeri);
    } catch {
      localStorage.removeItem("atakasa_sepet");
    }
  }, []);

  useEffect(() => {
    if (initialIlanlar.length === 20) {
      const veriCek = async () => {
        try {
          const res2 = await fetch("/api/varliklar?limit=200&skip=20");
          const data2 = await res2.json();
          const liste2 = Array.isArray(data2) ? data2 : [];
          if (liste2.length > 0)
            setIlanlar((prev) => [...prev, ...liste2]);
        } catch {}
      };
      setTimeout(veriCek, 500);
    }
  }, [initialIlanlar.length]);

  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kEmail = session.user.email.toLowerCase();
      setBenimIlanlarim(
        ilanlar.filter((i: any) => {
          const sEmail = (
            i.satici?.email || i.sellerEmail || i.satici || ""
          ).toString().toLowerCase();
          return sEmail === kEmail;
        })
      );
    }
  }, [session, ilanlar]);

  const isVideo = useCallback(
    (url: string) =>
      !!url &&
      (url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") || url.includes("video")),
    []
  );

  const optimizeCloudinary = useCallback((url: string, w = 400, h = 180) => {
    if (!url || !url.includes("res.cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto:eco,w_${w},h_${h},c_fill/`);
  }, []);

  const getImageUrl = useCallback((ilan: any) => {
    if (!ilan) return "https://placehold.co/400x180/1e3a5f/c9a84c?text=A-TAKASA";
    const checkArray = (arr: any) => Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    const img = checkArray(ilan.resimler) || checkArray(ilan.medyalar) || checkArray(ilan.images);
    if (img && typeof img === "string") return img;
    if (typeof ilan.resimler === "string" && ilan.resimler.length > 5) return ilan.resimler;
    if (typeof ilan.medyalar === "string" && ilan.medyalar.length > 5) return ilan.medyalar;
    if (typeof ilan.images === "string" && ilan.images.length > 5) return ilan.images;
    return "https://placehold.co/400x180/1e3a5f/c9a84c?text=A-TAKASA";
  }, []);

  const filtrelenmisIlanlar = useMemo(() => {
    let liste = [...ilanlar];
    if (searchTerm)
      liste = liste.filter(
        (i) =>
          (i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (i.aciklama || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (aktifKategori !== "Hepsi") {
      liste = liste.filter((i) => {
        const kat = (i.kategori || i.sektorId || "").toLowerCase();
        const aranan = aktifKategori.toLowerCase();
        if (kat.includes(aranan)) return true;
        if (aranan === "araç" && kat.includes("vasıta")) return true;
        if (aranan === "tekstil" && (kat.includes("giyim") || kat.includes("moda"))) return true;
        if (aranan === "oyun/konsol" && kat.includes("oyun")) return true;
        if (aranan === "elektronik" && kat.includes("telefon")) return true;
        if (aranan === "emlak" && kat.includes("konut")) return true;
        if (aranan === "mobilya" && kat.includes("ev")) return true;
        return false;
      });
    }
    if (aktifSehir !== "Tüm Şehirler")
      liste = liste.filter((i) => (i.sehir || "").toUpperCase() === aktifSehir.toUpperCase());
    if (minFiyat) liste = liste.filter((i) => Number(i.fiyat || 0) >= Number(minFiyat));
    if (maxFiyat) liste = liste.filter((i) => Number(i.fiyat || 0) <= Number(maxFiyat));
    if (sadeceTakaslik) liste = liste.filter((i) => i.takasIstegi);
    switch (aktifAltFiltre) {
      case "En Çok Fiyatı Düşenler":
        liste.sort((a, b) => (a.degisimYuzdesi || 0) - (b.degisimYuzdesi || 0));
        break;
      case "En Çok Yükselenler":
        liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0));
        break;
      case "En Çok Takas Edilenler":
        liste.sort((a, b) => (b.takasTeklifiSayisi || 0) - (a.takasTeklifiSayisi || 0));
        break;
      default:
        liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return liste;
  }, [ilanlar, searchTerm, aktifKategori, aktifSehir, minFiyat, maxFiyat, sadeceTakaslik, aktifAltFiltre]);

  const openModal = useCallback(
    (ilan: any, tur: "takas" | "satinal") => {
      if (!session) return router.push("/giris");
      const saticiEmail = (ilan.satici?.email || ilan.sellerEmail || "").toLowerCase();
      if (saticiEmail === session.user?.email?.toLowerCase())
        return alert("Kendi ilanınızla işlem yapamazsınız.");
      setSeciliIlan(ilan);
      setModalTuru(tur);
      setKabulSozlesme(false);
      setKabulYasalZirh(false);
    },
    [session, router]
  );

  const closeModal = useCallback(() => {
    setSeciliIlan(null);
    setModalTuru(null);
    setSecilenBenimIlanim("");
    setEklenecekNakit("");
  }, []);

  const handleSepeteEkle = useCallback(
    (ilan: any) => {
      try {
        const mevcutSepet = JSON.parse(localStorage.getItem("atakasa_sepet") || "[]");
        const urunId = ilan._id || ilan.id;
        if (mevcutSepet.find((item: any) => item.id === urunId))
          return alert("Bu ürün zaten sepetinizde.");
        mevcutSepet.push({
          id: urunId,
          baslik: ilan.baslik,
          fiyat: Number(ilan.fiyat),
          resim: getImageUrl(ilan),
          saticiMail: ilan.satici?.email || ilan.sellerEmail || "",
        });
        localStorage.setItem("atakasa_sepet", JSON.stringify(mevcutSepet));
        alert("Ürün sepete eklendi!");
      } catch {
        localStorage.removeItem("atakasa_sepet");
        alert("Önbellek temizlendi, tekrar deneyin.");
      }
    },
    [getImageUrl]
  );

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen takas edeceğiniz ürününüzü seçin.");
    const [id, baslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: seciliIlan.satici?.email || seciliIlan.sellerEmail,
          hedefIlanId: seciliIlan._id,
          hedefIlanBaslik: seciliIlan.baslik,
          hedefIlanFiyat: seciliIlan.fiyat,
          teklifEdilenIlanId: id,
          teklifEdilenIlanBaslik: baslik,
          eklenenNakit: eklenecekNakit || 0,
          durum: "bekliyor",
        }),
      });
      if (res.ok) { alert("Takas teklifiniz iletildi!"); closeModal(); }
      else { const err = await res.json(); alert(`Hata: ${err.error}`); }
    } catch { alert("Bağlantı hatası."); }
  };

  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon)
      return alert("Lütfen teslimat bilgilerini eksiksiz doldurun.");
    if (!kabulSozlesme || !kabulYasalZirh)
      return alert("Devam etmek için sözleşmeleri onaylamalısınız.");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: seciliIlan._id,
          sellerEmail: seciliIlan.satici?.email || seciliIlan.sellerEmail,
          adSoyad: siparisForm.adSoyad,
          telefon: siparisForm.telefon,
          adres: siparisForm.adres,
          not: siparisForm.not,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: seciliIlan.fiyat,
          durum: "bekliyor",
        }),
      });
      if (res.ok) { alert("Siparişiniz alındı! Panelinizden takip edebilirsiniz."); closeModal(); }
      else { alert("Sipariş alınamadı, tekrar deneyin."); }
    } catch { alert("Bağlantı hatası."); }
  };

  const BorsaKarti = useCallback(
    ({ ilan, index }: { ilan: any; index: number }) => {
      const ilkMedya = getImageUrl(ilan);
      const videoVar = isVideo(ilkMedya);
      const pozitif = (ilan.degisimYuzdesi || 0) >= 0;
      const optimizedSrc = videoVar ? ilkMedya : optimizeCloudinary(ilkMedya, 400, 180);

      const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/varlik/${ilan._id}`;
        if (navigator.share) {
          try { await navigator.share({ title: `${ilan.baslik} | A-TAKASA`, text: "Bu ilana bakmalısın!", url: shareUrl }); } catch {}
        } else {
          navigator.clipboard.writeText(shareUrl);
          alert("İlan linki kopyalandı!");
        }
      };

      return (
        <div className="product-card" itemScope itemType="https://schema.org/Product">
          <meta itemProp="name" content={`${ilan.baslik} | A-TAKASA`} />
          <meta itemProp="description" content={ilan.aciklama || "Ürün"} />
          <div className={`change-badge ${pozitif ? "change-up" : "change-down"}`}>
            {pozitif ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            %{Math.abs(ilan.degisimYuzdesi || 0)}
          </div>
          {videoVar && (
            <div className="video-badge">
              <Play size={8} fill="currentColor" /> VİDEO
            </div>
          )}
          <div className="card-media" onClick={() => {
            if (videoVar) { setVideoModalUrl(ilkMedya); setVideoModalBaslik(ilan.baslik || ""); }
            else { router.push(`/varlik/${ilan._id}`); }
          }}>
            {videoVar ? (
              <div className="video-thumb">
                {ilkMedya.includes("res.cloudinary.com") ? (
                  <img src={ilkMedya.replace(/\.(mp4|webm|mov)$/i, ".jpg")} className="thumb-img" alt="Video Kapak" width={400} height={180} loading="lazy" decoding="async" />
                ) : (
                  <video src={`${ilkMedya}#t=0.1`} className="thumb-img" muted playsInline preload="metadata" />
                )}
                <div className="play-overlay"><div className="play-btn"><Play size={22} fill="white" /></div></div>
              </div>
            ) : (
              <img
                src={optimizedSrc}
                loading={index < 4 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : index < 3 ? "auto" : "low"}
                decoding={index < 4 ? "sync" : "async"}
                width={400} height={180}
                className="card-img"
                alt={ilan.baslik || "Ürün"}
                itemProp="image"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x180/1e3a5f/c9a84c?text=A-TAKASA"; }}
              />
            )}
            <div className="city-tag">📍 {ilan.sehir || "TÜRKİYE"}</div>
          </div>

          <div className="card-body">
            <span className="category-label">{ilan.kategori || "Genel"}</span>
            <h3 className="card-title" onClick={() => router.push(`/varlik/${ilan._id}`)}>
              {ilan.baslik}
            </h3>
            <div className="price-row" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span className="price-main">
                <span itemProp="price">{Number(ilan.fiyat).toLocaleString("tr-TR")}</span>
                <meta itemProp="priceCurrency" content="TRY" />
                <span className="price-currency"> ₺</span>
              </span>
              <span className="card-date">{new Date(ilan.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
            <div className="card-actions">
              <div className="action-row-top">
                <button onClick={handleShare} className="btn-icon" title="Paylaş" aria-label="İlanı paylaş"><Share2 size={15} /></button>
                <button onClick={() => router.push(`/varlik/${ilan._id}`)} className="btn-outline flex-1">İncele</button>
                <button onClick={() => handleSepeteEkle(ilan)} className="btn-cart" aria-label="Sepete ekle"><ShoppingCart size={15} /></button>
              </div>
              <div className="action-row-bottom">
                <button onClick={() => openModal(ilan, "takas")} className="btn-swap">🔄 Takas Teklifi</button>
                <button onClick={() => openModal(ilan, "satinal")} className="btn-buy">Satın Al</button>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [getImageUrl, isVideo, optimizeCloudinary, router, handleSepeteEkle, openModal]
  );

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Atakasa",
    url: "https://atakasa.com",
    description: "Küresel B2B Barter ve Takas Platformu",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://atakasa.com/ilanlar?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }), []);

  return (
    <div className="at-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-texture" aria-hidden="true" />

      {/* TRUST BAR */}
      <div className="trust-bar" role="banner">
        <div className="trust-bar-inner">
          <span className="trust-item"><Shield size={13} /> Güvenli Takas Havuzu</span>
          <span className="trust-divider" />
          <span className="trust-item"><Star size={13} /> Onaylı Üyeler</span>
          <span className="trust-divider" />
          <span className="trust-item">🛡️ %100 Alıcı &amp; Satıcı Koruması</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="top-nav" aria-label="Ana navigasyon">
        <div className="nav-inner">
          <div onClick={() => router.push("/")} style={{ cursor: "pointer", marginRight: "16px", display: "flex", alignItems: "center" }} role="link" aria-label="Ana sayfaya git">
            <h1 style={{ color: "var(--navy)", fontSize: "24px", fontWeight: "800", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", margin: 0 }}>
              A-TAKASA<span style={{ color: "var(--gold)" }}>.</span>
            </h1>
          </div>
          <div className="search-wrap">
            <Search size={17} className="search-icon" aria-hidden="true" />
            <input className="search-input" placeholder="Varlık ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} aria-label="Varlık ara" type="search" />
          </div>
          <div className="nav-actions">
            <button onClick={() => setFiltreMenusuAcik(!filtreMenusuAcik)} className={`btn-filter ${filtreMenusuAcik ? "active" : ""}`} aria-expanded={filtreMenusuAcik}>
              <SlidersHorizontal size={15} /> Filtrele <ChevronDown size={13} className={`chevron ${filtreMenusuAcik ? "open" : ""}`} />
            </button>
            <button onClick={() => router.push("/sepet")} className="btn-sepet" aria-label="Sepete git"><ShoppingCart size={15} /> Sepet</button>
            <button onClick={() => router.push(session ? "/panel" : "/giris")} className="btn-filter"
              style={{ background: session ? "rgba(22,163,74,0.08)" : "transparent", borderColor: session ? "rgba(22,163,74,0.3)" : undefined, color: session ? "#16a34a" : undefined }}>
              {session ? <><User size={15} /> Panel</> : <><LogIn size={15} /> Giriş Yap</>}
            </button>
            <button onClick={() => session ? router.push("/ilan-ver") : router.push("/giris")} className="btn-primary">
              <Zap size={15} /> İlan Ver
            </button>
          </div>
        </div>
        {filtreMenusuAcik && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-field">
                <label className="filter-label" htmlFor="sehir-select">Şehir / Bölge</label>
                <select id="sehir-select" value={aktifSehir} onChange={(e) => setAktifSehir(e.target.value)} className="filter-select">
                  {sehirler.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label className="filter-label" htmlFor="min-fiyat">Min Fiyat (₺)</label>
                <input id="min-fiyat" type="number" placeholder="Örn: 1000" value={minFiyat} onChange={(e) => setMinFiyat(e.target.value)} className="filter-input" min="0" />
              </div>
              <div className="filter-field">
                <label className="filter-label" htmlFor="max-fiyat">Max Fiyat (₺)</label>
                <input id="max-fiyat" type="number" placeholder="Örn: 50000" value={maxFiyat} onChange={(e) => setMaxFiyat(e.target.value)} className="filter-input" min="0" />
              </div>
              <div className="filter-field" style={{ justifyContent: "flex-end" }}>
                <button onClick={() => setSadeceTakaslik(!sadeceTakaslik)} className={`swap-toggle ${sadeceTakaslik ? "active" : ""}`} aria-pressed={sadeceTakaslik}>
                  🔄 {sadeceTakaslik ? "Sadece Takaslıklar" : "Takas Durumu"}
                </button>
              </div>
            </div>
            <div className="filter-footer">
              <button onClick={() => { setAktifSehir("Tüm Şehirler"); setMinFiyat(""); setMaxFiyat(""); setSadeceTakaslik(false); }} className="btn-reset">Sıfırla</button>
              <button onClick={() => setFiltreMenusuAcik(false)} className="btn-apply">Filtrele</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════ */}
      {/* HERO BÖLÜMÜ */}
      {/* ══════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(135deg, #0f2347 0%, #1e3a5f 50%, #0f2347 100%)",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Arka plan desen */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>

            {/* Sol: Slogan alanı */}
            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Animasyonlu slogan */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 50, padding: "6px 16px", marginBottom: 16,
              }}>
                <span style={{ fontSize: "1.1rem" }}>{sloganlar[heroSlogan].emoji}</span>
                <span style={{ color: "#c9a84c", fontSize: ".82rem", fontWeight: 700, letterSpacing: ".05em" }}>
                  {sloganlar[heroSlogan].alt}
                </span>
              </div>

              <h2 style={{
                color: "#fff",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: 12,
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "-0.03em",
              }}>
                <span style={{ color: "#c9a84c" }}>Tak</span>as<span style={{ color: "#c9a84c" }}>a</span>
                <span style={{ color: "rgba(255,255,255,.4)", fontSize: "60%" }}>.</span>
                <br />
                <span style={{ fontSize: "55%", color: "rgba(255,255,255,.7)", fontWeight: 700 }}>
                  Sat. İster Et. Büyü.
                </span>
              </h2>

              <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".95rem", lineHeight: 1.7, maxWidth: 420, marginBottom: 24 }}>
                Türkiye&apos;nin en güvenli takas &amp; satış platformu.
                Ürününü ver, istediğini al — ya da sat ve büyü.
              </p>

              {/* CTA butonları */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push(session ? "/ilan-ver" : "/giris")}
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #d4a017)",
                    color: "#0f2347", border: "none", padding: "12px 24px",
                    borderRadius: 40, fontWeight: 800, fontSize: ".9rem",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
                    transition: ".2s",
                  }}
                >
                  <Zap size={16} /> Hemen İlan Ver
                </button>
                <button
                  onClick={() => router.push("/takas")}
                  style={{
                    background: "rgba(255,255,255,.08)", color: "#fff",
                    border: "1.5px solid rgba(255,255,255,.2)", padding: "12px 24px",
                    borderRadius: 40, fontWeight: 700, fontSize: ".9rem",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    transition: ".2s",
                  }}
                >
                  🔄 Takas Yap
                </button>
              </div>
            </div>

            {/* Sağ: İstatistik kartları */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {[
                { icon: "📦", sayi: `${ilanlar.length}+`, label: "Aktif İlan" },
                { icon: "🔄", sayi: "12K+", label: "Takas Tamamlandı" },
                { icon: "🛡️", sayi: "%100", label: "Güvenli İşlem" },
                { icon: "⚡", sayi: "7/24", label: "Destek" },
              ].map(item => (
                <div key={item.label} style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 16, padding: "16px 20px",
                  textAlign: "center", minWidth: 90,
                  backdropFilter: "blur(8px)",
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ color: "#c9a84c", fontWeight: 900, fontSize: "1.2rem", fontFamily: "var(--font-display, sans-serif)" }}>{item.sayi}</div>
                  <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alt: Öne çıkan kategoriler */}
          <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".78rem", fontWeight: 600, display: "flex", alignItems: "center" }}>Popüler:</span>
            {["💻 Elektronik", "🚗 Araç", "🏠 Emlak", "🎮 Oyun/Konsol", "🏺 Antika"].map(kat => (
              <button key={kat} onClick={() => { setAktifKategori(kat.split(" ").slice(1).join(" ")); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                style={{
                  background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                  color: "rgba(255,255,255,.75)", padding: "5px 14px", borderRadius: 20,
                  fontSize: ".78rem", fontWeight: 600, cursor: "pointer", transition: ".2s",
                }}>
                {kat}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* ══════════════════════════════════════════ */}

      {/* KATEGORİ STRIP */}
      <div className="cat-strip" role="navigation" aria-label="Kategori filtresi">
        <div className="cat-inner">
          <button onClick={() => { setAktifKategori("Hepsi"); setAktifAltFiltre("Yeni İlanlar"); }} className={`cat-btn ${aktifKategori === "Hepsi" ? "active" : ""}`} aria-pressed={aktifKategori === "Hepsi"}>
            🌐 Tümü
          </button>
          {sektorler.map((s) => (
            <button key={s.ad} onClick={() => { setAktifKategori(s.ad); setAktifAltFiltre("Yeni İlanlar"); }} className={`cat-btn ${aktifKategori === s.ad ? "active" : ""}`} aria-pressed={aktifKategori === s.ad}>
              {s.emoji} {s.ad}{" "}
              <span className={`cat-pct ${Number(s.degisim) >= 0 ? "up" : "down"}`}>{s.degisim}%</span>
            </button>
          ))}
        </div>
      </div>

      {aktifKategori !== "Hepsi" && (
        <div className="sub-filter-bar" role="navigation" aria-label="Alt filtreler">
          {["Yeni İlanlar", "En Çok Fiyatı Düşenler", "En Çok Yükselenler", "En Çok Takas Edilenler"].map((f) => (
            <button key={f} onClick={() => setAktifAltFiltre(f)} className={`sub-filter-btn ${aktifAltFiltre === f ? "active" : ""}`} aria-pressed={aktifAltFiltre === f}>{f}</button>
          ))}
        </div>
      )}

      <main className="main-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">{aktifKategori === "Hepsi" ? "Borsa Vitrini" : aktifKategori}</h2>
            <p className="section-sub">{filtrelenmisIlanlar.length} varlık listeleniyor{aktifKategori !== "Hepsi" && ` · ${aktifAltFiltre}`}</p>
          </div>
        </div>

        {loading ? (
          <div className="product-grid" aria-busy="true">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line medium" />
                </div>
              </div>
            ))}
          </div>
        ) : filtrelenmisIlanlar.length > 0 ? (
          <div className="product-grid">
            {filtrelenmisIlanlar.map((ilan, index) => <BorsaKarti key={ilan._id} ilan={ilan} index={index} />)}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <span className="empty-icon" aria-hidden="true">🔍</span>
            <p className="empty-title">Bu kriterlerde varlık bulunamadı.</p>
            <p className="empty-sub">Farklı filtreler deneyin veya arama terimini değiştirin.</p>
          </div>
        )}
      </main>

      {seciliIlan && modalTuru && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-label={modalTuru === "takas" ? "Takas Teklifi" : "Satın Al"}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="modal-close" aria-label="Kapat">✕</button>
            <div className="modal-header">
              <img src={optimizeCloudinary(getImageUrl(seciliIlan), 80, 80)} className="modal-img" alt={seciliIlan.baslik || "Ürün"} loading="lazy" width={80} height={80} />
              <div className="modal-info">
                <span className="modal-type-label">{modalTuru === "takas" ? "Takas Teklifi" : "Güvenli Satın Alma"}</span>
                <h3 className="modal-title">{seciliIlan.baslik}</h3>
                <p className="modal-price">{Number(seciliIlan.fiyat).toLocaleString("tr-TR")} ₺</p>
              </div>
            </div>

            {modalTuru === "takas" ? (
              <div className="modal-form">
                <label className="form-label" htmlFor="takas-secim">Vereceğiniz Varlığı Seçin</label>
                <select id="takas-secim" value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="form-select">
                  <option value="">-- İlanlarınızdan seçin --</option>
                  {benimIlanlarim.map((b) => <option key={b._id} value={`${b._id}|${b.baslik}`}>{b.baslik}</option>)}
                </select>
                <label className="form-label" htmlFor="nakit-ekle">Üste Nakit Ekle (₺) — İsteğe Bağlı</label>
                <input id="nakit-ekle" type="number" placeholder="Örn: 5000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="form-input" min="0" />
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim} className="btn-modal-primary" style={{ marginTop: "16px" }}>
                  Takas Teklifini Gönder →
                </button>
              </div>
            ) : (
              <div className="modal-form">
                <div className="price-summary">
                  <span>Ödenecek Tutar</span>
                  <span className="price-big">{Number(seciliIlan.fiyat).toLocaleString("tr-TR")} ₺</span>
                </div>
                <input type="text" placeholder="Ad Soyad" value={siparisForm.adSoyad} onChange={(e) => setSiparisForm({ ...siparisForm, adSoyad: e.target.value })} className="form-input" aria-label="Ad Soyad" autoComplete="name" />
                <input type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon} onChange={(e) => setSiparisForm({ ...siparisForm, telefon: e.target.value })} className="form-input" aria-label="Telefon" autoComplete="tel" />
                <textarea placeholder="Teslimat Adresi" value={siparisForm.adres} onChange={(e) => setSiparisForm({ ...siparisForm, adres: e.target.value })} className="form-textarea" aria-label="Adres" autoComplete="street-address" />
                <select value={siparisForm.odemeYontemi} onChange={(e) => setSiparisForm({ ...siparisForm, odemeYontemi: e.target.value })} className="form-select" aria-label="Ödeme yöntemi">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                </select>
                <div className="legal-box">
                  <label className="legal-check">
                    <input type="checkbox" checked={kabulSozlesme} onChange={(e) => setKabulSozlesme(e.target.checked)} />
                    <span><strong>📄 Kullanıcı Sözleşmesi:</strong> Satış koşullarını ve kullanıcı sözleşmesini okudum, kabul ediyorum.</span>
                  </label>
                  <label className="legal-check" style={{ marginTop: "8px" }}>
                    <input type="checkbox" checked={kabulYasalZirh} onChange={(e) => setKabulYasalZirh(e.target.checked)} />
                    <span><strong>🛡️ Siber Kalkan:</strong> Teslimat tamamlanana kadar ödeme havuzda bekler. Onaylıyorum.</span>
                  </label>
                </div>
                <button onClick={handleSiparisTamamla} className="btn-modal-primary">✓ Güvenli Ödemeyi Tamamla</button>
              </div>
            )}
          </div>
        </div>
      )}

      {videoModalUrl && (
        <div className="modal-overlay" onClick={() => setVideoModalUrl(null)} role="dialog" aria-modal="true" aria-label="Video oynatıcı">
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, padding: 0, overflow: "hidden" }}>
            <button onClick={() => setVideoModalUrl(null)} className="modal-close" aria-label="Kapat" style={{ zIndex: 10 }}>✕</button>
            <video src={videoModalUrl} controls autoPlay style={{ width: "100%", display: "block" }} />
            {videoModalBaslik && <div style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{videoModalBaslik}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
