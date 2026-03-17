"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Play, Share2, Search, SlidersHorizontal, ShoppingCart,
  Zap, ChevronDown, Star, Shield, TrendingUp, TrendingDown,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      const b = localStorage.getItem("atakasa_sepet");
      if (b) JSON.parse(b);
    } catch {
      localStorage.removeItem("atakasa_sepet");
    }
  }, []);

  useEffect(() => {
    const veriCek = async () => {
      try {
        const res = await fetch("/api/varliklar?limit=20", {
          next: { revalidate: 30 },
        } as RequestInit);
        const data = await res.json();
        const liste = Array.isArray(data)
          ? data : data.data || data.ilanlar || data.varliklar || [];
        setIlanlar(liste);
        setLoading(false);
        if (liste.length === 20) {
          setTimeout(async () => {
            try {
              const r2 = await fetch("/api/varliklar?limit=200&skip=20");
              const d2 = await r2.json();
              const l2 = Array.isArray(d2) ? d2 : [];
              if (l2.length > 0) setIlanlar(p => [...p, ...l2]);
            } catch {}
          }, 600);
        }
      } catch {
        setLoading(false);
      }
    };
    veriCek();
  }, []);

  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const k = session.user.email.toLowerCase();
      setBenimIlanlarim(
        ilanlar.filter((i: any) =>
          (i.satici?.email || i.sellerEmail || i.satici || "")
            .toString().toLowerCase() === k
        )
      );
    }
  }, [session, ilanlar]);

  const isVideo = useCallback((url: string) =>
    !!url && (url.includes(".mp4") || url.includes(".mov") ||
      url.includes(".webm") || url.includes("video")), []);

  const optimizeImg = useCallback((url: string, w = 520, h = 220) => {
    if (!url) return url;
    if (url.includes("res.cloudinary.com") && url.includes("/upload/"))
      return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},h_${h},c_fill/`);
    return url;
  }, []);

  const getImageUrl = useCallback((ilan: any): string => {
    if (!ilan) return "https://placehold.co/520x220/0f2540/c9a84c?text=A-TAKASA";
    const chk = (a: any) =>
      Array.isArray(a) && a.length > 0 && typeof a[0] === "string" ? a[0] : null;
    const img = chk(ilan.resimler) || chk(ilan.medyalar) || chk(ilan.images);
    if (img) return img;
    if (typeof ilan.resimler === "string" && ilan.resimler.length > 5) return ilan.resimler;
    if (typeof ilan.medyalar === "string" && ilan.medyalar.length > 5) return ilan.medyalar;
    if (typeof ilan.images === "string" && ilan.images.length > 5) return ilan.images;
    return "https://placehold.co/520x220/0f2540/c9a84c?text=A-TAKASA";
  }, []);

  const filtrelenmisIlanlar = useMemo(() => {
    let liste = [...ilanlar];
    if (searchTerm)
      liste = liste.filter(i =>
        (i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.aciklama || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (aktifKategori !== "Hepsi") {
      liste = liste.filter(i => {
        const kat = (i.kategori || i.sektorId || "").toLowerCase();
        const ar = aktifKategori.toLowerCase();
        if (kat.includes(ar)) return true;
        if (ar === "araç" && kat.includes("vasıta")) return true;
        if (ar === "tekstil" && (kat.includes("giyim") || kat.includes("moda"))) return true;
        if (ar === "oyun/konsol" && kat.includes("oyun")) return true;
        if (ar === "elektronik" && kat.includes("telefon")) return true;
        if (ar === "emlak" && kat.includes("konut")) return true;
        if (ar === "mobilya" && kat.includes("ev")) return true;
        return false;
      });
    }
    if (aktifSehir !== "Tüm Şehirler")
      liste = liste.filter(i => (i.sehir || "").toUpperCase() === aktifSehir.toUpperCase());
    if (minFiyat) liste = liste.filter(i => Number(i.fiyat || 0) >= Number(minFiyat));
    if (maxFiyat) liste = liste.filter(i => Number(i.fiyat || 0) <= Number(maxFiyat));
    if (sadeceTakaslik) liste = liste.filter(i => i.takasIstegi);
    switch (aktifAltFiltre) {
      case "En Çok Fiyatı Düşenler":
        liste.sort((a, b) => (a.degisimYuzdesi || 0) - (b.degisimYuzdesi || 0)); break;
      case "En Çok Yükselenler":
        liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0)); break;
      case "En Çok Takas Edilenler":
        liste.sort((a, b) => (b.takasTeklifiSayisi || 0) - (a.takasTeklifiSayisi || 0)); break;
      default:
        liste.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return liste;
  }, [ilanlar, searchTerm, aktifKategori, aktifSehir, minFiyat, maxFiyat, sadeceTakaslik, aktifAltFiltre]);

  const openModal = useCallback((ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    const sEmail = (ilan.satici?.email || ilan.sellerEmail || "").toLowerCase();
    if (sEmail === session.user?.email?.toLowerCase())
      return alert("Kendi ilanınızla işlem yapamazsınız.");
    setSeciliIlan(ilan); setModalTuru(tur);
    setKabulSozlesme(false); setKabulYasalZirh(false);
  }, [session, router]);

  const closeModal = useCallback(() => {
    setSeciliIlan(null); setModalTuru(null);
    setSecilenBenimIlanim(""); setEklenecekNakit("");
  }, []);

  const handleSepeteEkle = useCallback((ilan: any) => {
    try {
      const sepet = JSON.parse(localStorage.getItem("atakasa_sepet") || "[]");
      const uid = ilan._id || ilan.id;
      if (sepet.find((x: any) => x.id === uid)) return alert("Bu ürün zaten sepetinizde.");
      sepet.push({
        id: uid, baslik: ilan.baslik, fiyat: Number(ilan.fiyat),
        resim: getImageUrl(ilan), saticiMail: ilan.satici?.email || ilan.sellerEmail || "",
      });
      localStorage.setItem("atakasa_sepet", JSON.stringify(sepet));
      alert("Ürün sepete eklendi!");
    } catch {
      localStorage.removeItem("atakasa_sepet");
      alert("Önbellek temizlendi, tekrar deneyin.");
    }
  }, [getImageUrl]);

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen takas edeceğiniz ürününüzü seçin.");
    const [id, baslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: seciliIlan.satici?.email || seciliIlan.sellerEmail,
          hedefIlanId: seciliIlan._id, hedefIlanBaslik: seciliIlan.baslik,
          hedefIlanFiyat: seciliIlan.fiyat, teklifEdilenIlanId: id,
          teklifEdilenIlanBaslik: baslik, eklenenNakit: eklenecekNakit || 0, durum: "bekliyor",
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: seciliIlan._id,
          sellerEmail: seciliIlan.satici?.email || seciliIlan.sellerEmail,
          adSoyad: siparisForm.adSoyad, telefon: siparisForm.telefon,
          adres: siparisForm.adres, not: siparisForm.not,
          odemeYontemi: siparisForm.odemeYontemi, fiyat: seciliIlan.fiyat, durum: "bekliyor",
        }),
      });
      if (res.ok) { alert("Siparişiniz alındı! Panelinizden takip edebilirsiniz."); closeModal(); }
      else { alert("Sipariş alınamadı, tekrar deneyin."); }
    } catch { alert("Bağlantı hatası."); }
  };

  const BorsaKarti = useCallback(({ ilan, index }: { ilan: any; index: number }) => {
    const ham = getImageUrl(ilan);
    const videoVar = isVideo(ham);
    const gorsel = videoVar ? ham : optimizeImg(ham, 520, 220);
    const pozitif = (ilan.degisimYuzdesi || 0) >= 0;

    const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/varlik/${ilan._id}`;
      if (navigator.share) {
        try { await navigator.share({ title: `${ilan.baslik} | A-TAKASA`, url }); } catch {}
      } else {
        navigator.clipboard.writeText(url);
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

        <div
          className="card-media"
          onClick={() => {
            if (videoVar) { setVideoModalUrl(ham); setVideoModalBaslik(ilan.baslik || ""); }
            else router.push(`/varlik/${ilan._id}`);
          }}
        >
          {videoVar ? (
            <div className="video-thumb">
              {ham.includes("res.cloudinary.com") ? (
                <img
                  src={ham.replace(/\.(mp4|webm|mov)$/i, ".jpg")}
                  className="thumb-img" alt="Video Kapak"
                  width={520} height={220} loading="lazy" decoding="async"
                />
              ) : (
                <video src={`${ham}#t=0.1`} className="thumb-img" muted playsInline preload="metadata" />
              )}
              <div className="play-overlay">
                <div className="play-btn"><Play size={22} fill="white" /></div>
              </div>
            </div>
          ) : (
            <img
              src={gorsel}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : index < 3 ? "auto" : "low"}
              decoding={index < 4 ? "sync" : "async"}
              width={520}
              height={220}
              className="card-img"
              alt={ilan.baslik || "Ürün"}
              itemProp="image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/520x220/0f2540/c9a84c?text=A-TAKASA";
              }}
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
            <span className="card-date">
              {new Date(ilan.createdAt).toLocaleDateString("tr-TR")}
            </span>
          </div>
          <div className="card-actions">
            <div className="action-row-top">
              <button onClick={handleShare} className="btn-icon" title="Paylaş" aria-label="Paylaş">
                <Share2 size={15} />
              </button>
              <button onClick={() => router.push(`/varlik/${ilan._id}`)} className="btn-outline flex-1">
                İncele
              </button>
              <button onClick={() => handleSepeteEkle(ilan)} className="btn-cart" aria-label="Sepete ekle">
                <ShoppingCart size={15} />
              </button>
            </div>
            <div className="action-row-bottom">
              <button onClick={() => openModal(ilan, "takas")} className="btn-swap">
                🔄 Takas Teklifi
              </button>
              <button onClick={() => openModal(ilan, "satinal")} className="btn-buy">
                Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [getImageUrl, isVideo, optimizeImg, router, handleSepeteEkle, openModal]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-texture" aria-hidden="true" />

      {/* Trust Bar */}
      <div className="trust-bar" role="banner">
        <div className="trust-bar-inner">
          <span className="trust-item"><Shield size={13} /> Güvenli Takas Havuzu</span>
          <span className="trust-divider" />
          <span className="trust-item"><Star size={13} /> Onaylı Üyeler</span>
          <span className="trust-divider" />
          <span className="trust-item">🛡️ %100 Alıcı &amp; Satıcı Koruması</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="top-nav" aria-label="Ana navigasyon">
        <div className="nav-inner">
          <div
            onClick={() => router.push("/")}
            style={{ cursor: "pointer", marginRight: "16px", display: "flex", alignItems: "center" }}
            role="link" aria-label="Ana sayfaya git"
          >
            <h1 style={{
              color: "var(--navy)", fontSize: "24px", fontWeight: "800",
              fontFamily: "var(--font-display)", letterSpacing: "-0.02em", margin: 0,
            }}>
              A-TAKASA<span style={{ color: "var(--gold)" }}>.</span>
            </h1>
          </div>

          <div className="search-wrap">
            <Search size={17} className="search-icon" aria-hidden="true" />
            <input
              className="search-input"
              placeholder="Varlık ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Varlık ara"
              type="search"
            />
          </div>

          <div className="nav-actions">
            <button
              onClick={() => setFiltreMenusuAcik(!filtreMenusuAcik)}
              className={`btn-filter ${filtreMenusuAcik ? "active" : ""}`}
              aria-expanded={filtreMenusuAcik}
            >
              <SlidersHorizontal size={15} /> Filtrele
              <ChevronDown size={13} className={`chevron ${filtreMenusuAcik ? "open" : ""}`} />
            </button>
            <button onClick={() => router.push("/sepet")} className="btn-sepet" aria-label="Sepete git">
              <ShoppingCart size={15} /> Sepet
            </button>
            <button
              onClick={() => session ? router.push("/ilan-ver") : router.push("/giris")}
              className="btn-primary"
            >
              <Zap size={15} /> İlan Ver
            </button>
          </div>
        </div>

        {filtreMenusuAcik && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-field">
                <label className="filter-label" htmlFor="sehir-select">Şehir / Bölge</label>
                <select
                  id="sehir-select" value={aktifSehir}
                  onChange={(e) => setAktifSehir(e.target.value)} className="filter-select"
                >
                  {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label className="filter-label" htmlFor="min-fiyat">Min Fiyat (₺)</label>
                <input
                  id="min-fiyat" type="number" placeholder="Örn: 1000"
                  value={minFiyat} onChange={(e) => setMinFiyat(e.target.value)}
                  className="filter-input" min="0"
                />
              </div>
              <div className="filter-field">
                <label className="filter-label" htmlFor="max-fiyat">Max Fiyat (₺)</label>
                <input
                  id="max-fiyat" type="number" placeholder="Örn: 50000"
                  value={maxFiyat} onChange={(e) => setMaxFiyat(e.target.value)}
                  className="filter-input" min="0"
                />
              </div>
              <div className="filter-field" style={{ justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSadeceTakaslik(!sadeceTakaslik)}
                  className={`swap-toggle ${sadeceTakaslik ? "active" : ""}`}
                  aria-pressed={sadeceTakaslik}
                >
                  🔄 {sadeceTakaslik ? "Sadece Takaslıklar" : "Takas Durumu"}
                </button>
              </div>
            </div>
            <div className="filter-footer">
              <button
                onClick={() => {
                  setAktifSehir("Tüm Şehirler");
                  setMinFiyat(""); setMaxFiyat(""); setSadeceTakaslik(false);
                }}
                className="btn-reset"
              >
                Sıfırla
              </button>
              <button onClick={() => setFiltreMenusuAcik(false)} className="btn-apply">
                Filtrele
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Kategoriler */}
      <div className="cat-strip" role="navigation" aria-label="Kategori filtresi">
        <div className="cat-inner">
          <button
            onClick={() => { setAktifKategori("Hepsi"); setAktifAltFiltre("Yeni İlanlar"); }}
            className={`cat-btn ${aktifKategori === "Hepsi" ? "active" : ""}`}
            aria-pressed={aktifKategori === "Hepsi"}
          >
            🌐 Tümü
          </button>
          {sektorler.map(s => (
            <button
              key={s.ad}
              onClick={() => { setAktifKategori(s.ad); setAktifAltFiltre("Yeni İlanlar"); }}
              className={`cat-btn ${aktifKategori === s.ad ? "active" : ""}`}
              aria-pressed={aktifKategori === s.ad}
            >
              {s.emoji} {s.ad}{" "}
              <span className={`cat-pct ${Number(s.degisim) >= 0 ? "up" : "down"}`}>
                {s.degisim}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alt filtreler */}
      {aktifKategori !== "Hepsi" && (
        <div className="sub-filter-bar" role="navigation" aria-label="Alt filtreler">
          {["Yeni İlanlar", "En Çok Fiyatı Düşenler", "En Çok Yükselenler", "En Çok Takas Edilenler"].map(f => (
            <button
              key={f} onClick={() => setAktifAltFiltre(f)}
              className={`sub-filter-btn ${aktifAltFiltre === f ? "active" : ""}`}
              aria-pressed={aktifAltFiltre === f}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Ana İçerik */}
      <main className="main-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {aktifKategori === "Hepsi" ? "Borsa Vitrini" : aktifKategori}
            </h2>
            <p className="section-sub">
              {filtrelenmisIlanlar.length} varlık listeleniyor
              {aktifKategori !== "Hepsi" && ` · ${aktifAltFiltre}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="product-grid" aria-busy="true">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
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
            {filtrelenmisIlanlar.map((ilan, index) => (
              <BorsaKarti key={ilan._id} ilan={ilan} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <span className="empty-icon" aria-hidden="true">🔍</span>
            <p className="empty-title">Bu kriterlerde varlık bulunamadı.</p>
            <p className="empty-sub">Farklı filtreler deneyin veya arama terimini değiştirin.</p>
          </div>
        )}
      </main>

      {/* Takas / Satın Al Modal */}
      {seciliIlan && modalTuru && (
        <div
          className="modal-overlay" onClick={closeModal}
          role="dialog" aria-modal="true"
          aria-label={modalTuru === "takas" ? "Takas Teklifi" : "Satın Al"}
        >
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="modal-close" aria-label="Kapat">✕</button>
            <div className="modal-header">
              <img
                src={optimizeImg(getImageUrl(seciliIlan), 80, 80)}
                className="modal-img"
                alt={seciliIlan.baslik || "Ürün"}
                loading="lazy" width={80} height={80}
              />
              <div className="modal-info">
                <span className="modal-type-label">
                  {modalTuru === "takas" ? "Takas Teklifi" : "Güvenli Satın Alma"}
                </span>
                <h3 className="modal-title">{seciliIlan.baslik}</h3>
                <p className="modal-price">{Number(seciliIlan.fiyat).toLocaleString("tr-TR")} ₺</p>
              </div>
            </div>

            {modalTuru === "takas" ? (
              <div className="modal-form">
                <label className="form-label" htmlFor="takas-secim">Vereceğiniz Varlığı Seçin</label>
                <select
                  id="takas-secim" value={secilenBenimIlanim}
                  onChange={e => setSecilenBenimIlanim(e.target.value)} className="form-select"
                >
                  <option value="">-- İlanlarınızdan seçin --</option>
                  {benimIlanlarim.map(b => (
                    <option key={b._id} value={`${b._id}|${b.baslik}`}>{b.baslik}</option>
                  ))}
                </select>
                <label className="form-label" htmlFor="nakit-ekle">
                  Üste Nakit Ekle (₺) — İsteğe Bağlı
                </label>
                <input
                  id="nakit-ekle" type="number" placeholder="Örn: 5000"
                  value={eklenecekNakit} onChange={e => setEklenecekNakit(e.target.value)}
                  className="form-input" min="0"
                />
                <button
                  onClick={handleTakasGonder} disabled={!secilenBenimIlanim}
                  className="btn-modal-primary" style={{ marginTop: "16px" }}
                >
                  Takas Teklifini Gönder →
                </button>
              </div>
            ) : (
              <div className="modal-form">
                <div className="price-summary">
                  <span>Ödenecek Tutar</span>
                  <span className="price-big">{Number(seciliIlan.fiyat).toLocaleString("tr-TR")} ₺</span>
                </div>
                <input
                  type="text" placeholder="Ad Soyad" value={siparisForm.adSoyad}
                  onChange={e => setSiparisForm({ ...siparisForm, adSoyad: e.target.value })}
                  className="form-input" aria-label="Ad Soyad" autoComplete="name"
                />
                <input
                  type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon}
                  onChange={e => setSiparisForm({ ...siparisForm, telefon: e.target.value })}
                  className="form-input" aria-label="Telefon" autoComplete="tel"
                />
                <textarea
                  placeholder="Teslimat Adresi" value={siparisForm.adres}
                  onChange={e => setSiparisForm({ ...siparisForm, adres: e.target.value })}
                  className="form-textarea" aria-label="Adres" autoComplete="street-address"
                />
                <select
                  value={siparisForm.odemeYontemi}
                  onChange={e => setSiparisForm({ ...siparisForm, odemeYontemi: e.target.value })}
                  className="form-select" aria-label="Ödeme yöntemi"
                >
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                </select>
                <div className="legal-box">
                  <label className="legal-check">
                    <input
                      type="checkbox" checked={kabulYasalZirh}
                      onChange={e => setKabulYasalZirh(e.target.checked)}
                    />
                    <span>
                      <strong>🛡️ Siber Kalkan:</strong> Teslimat tamamlanana kadar
                      ödeme havuzda bekler. Onaylıyorum.
                    </span>
                  </label>
                </div>
                <button onClick={handleSiparisTamamla} className="btn-modal-primary">
                  ✓ Güvenli Ödemeyi Tamamla
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalUrl && (
        <div
          className="modal-overlay" onClick={() => setVideoModalUrl(null)}
          role="dialog" aria-modal="true" aria-label="Video oynatıcı"
        >
          <div
            className="modal-box" onClick={e => e.stopPropagation()}
            style={{ maxWidth: 640, padding: 0, overflow: "hidden" }}
          >
            <button
              onClick={() => setVideoModalUrl(null)}
              className="modal-close" aria-label="Kapat" style={{ zIndex: 10 }}
            >✕</button>
            <video src={videoModalUrl} controls autoPlay style={{ width: "100%", display: "block" }} />
            {videoModalBaslik && (
              <div style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                {videoModalBaslik}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
