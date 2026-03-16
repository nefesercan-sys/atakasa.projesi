"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Play, Share2, Search, SlidersHorizontal, ShoppingCart, Zap, ChevronDown, Star, Shield, TrendingUp, TrendingDown } from "lucide-react";

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
  const sehirler = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya"];
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [videoModalBaslik, setVideoModalBaslik] = useState("");

  const sektorler = [
    { ad: "Elektronik", degisim: "+4.2", emoji: "💻" }, { ad: "Emlak", degisim: "+1.8", emoji: "🏠" },
    { ad: "Araç", degisim: "-2.4", emoji: "🚗" }, { ad: "2. El", degisim: "+0.5", emoji: "♻️" },
    { ad: "Sıfır Ürünler", degisim: "+6.1", emoji: "✨" }, { ad: "Mobilya", degisim: "-1.1", emoji: "🪑" },
    { ad: "Makine", degisim: "+3.3", emoji: "⚙️" }, { ad: "Tekstil", degisim: "-0.9", emoji: "👕" },
    { ad: "Oyuncak", degisim: "+1.2", emoji: "🧸" }, { ad: "El Sanatları", degisim: "+12.4", emoji: "🎨" },
    { ad: "Kitap", degisim: "-0.4", emoji: "📚" }, { ad: "Antika Eserler", degisim: "+15.8", emoji: "🏺" },
    { ad: "Kırtasiye", degisim: "+0.2", emoji: "📎" }, { ad: "Doğal Ürünler", degisim: "+2.5", emoji: "🌿" },
    { ad: "Kozmetik", degisim: "-3.2", emoji: "💄" }, { ad: "Petshop", degisim: "+1.1", emoji: "🐾" },
    { ad: "Oyun/Konsol", degisim: "+8.7", emoji: "🎮" }
  ];

  useEffect(() => {
    try {
      const bozukVeri = localStorage.getItem('atakasa_sepet');
      if (bozukVeri) JSON.parse(bozukVeri);
    } catch {
      localStorage.removeItem('atakasa_sepet');
    }
  }, []);

  useEffect(() => {
    const veriCek = async () => {
      try {
        const res = await fetch("/api/varliklar?limit=20", { next: { revalidate: 30 } } as any);
        const data = await res.json();
        const liste = Array.isArray(data) ? data : data.data || data.ilanlar || data.varliklar || [];
        setIlanlar(liste);
        setLoading(false);
        if (liste.length === 20) {
          const res2 = await fetch("/api/varliklar?limit=200&skip=20");
          const data2 = await res2.json();
          const liste2 = Array.isArray(data2) ? data2 : [];
          if (liste2.length > 0) setIlanlar(prev => [...prev, ...liste2]);
        }
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        setLoading(false);
      }
    };
    veriCek();
  }, []);

  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kEmail = session.user.email.toLowerCase();
      setBenimIlanlarim(ilanlar.filter((i: any) => {
        const sEmail = (i.satici?.email || i.sellerEmail || i.satici || "").toString().toLowerCase();
        return sEmail === kEmail;
      }));
    }
  }, [session, ilanlar]);

  const isVideo = useCallback((url: string) =>
    !!url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video')), []);

  const getImageUrl = useCallback((ilan: any) => {
    if (!ilan) return "https://placehold.co/600x400/1e3a5f/c9a84c?text=A-TAKASA";
    const checkArray = (arr: any) => Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    const img = checkArray(ilan.resimler) || checkArray(ilan.medyalar) || checkArray(ilan.images);
    if (img && typeof img === 'string') return img;
    if (typeof ilan.resimler === 'string' && ilan.resimler.length > 5) return ilan.resimler;
    if (typeof ilan.medyalar === 'string' && ilan.medyalar.length > 5) return ilan.medyalar;
    if (typeof ilan.images === 'string' && ilan.images.length > 5) return ilan.images;
    return "https://placehold.co/600x400/1e3a5f/c9a84c?text=A-TAKASA";
  }, []);

  // 🚨 SİBER ÇÖZÜM 1: AKILLI KATEGORİ EŞLEŞTİRME MOTORU
  const filtrelenmisIlanlar = useMemo(() => {
    let liste = [...ilanlar];
    if (searchTerm) liste = liste.filter(i =>
      (i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.aciklama || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (aktifKategori !== "Hepsi") {
      liste = liste.filter(i => {
        const kat = (i.kategori || i.sektorId || "").toLowerCase();
        const aranan = aktifKategori.toLowerCase();
        if (kat.includes(aranan)) return true;
        // Zeki Eşleştirme Kuralları
        if (aranan === "araç" && kat.includes("vasıta")) return true;
        if (aranan === "tekstil" && (kat.includes("giyim") || kat.includes("moda"))) return true;
        if (aranan === "oyun/konsol" && kat.includes("oyun")) return true;
        if (aranan === "elektronik" && kat.includes("telefon")) return true;
        if (aranan === "emlak" && kat.includes("konut")) return true;
        if (aranan === "mobilya" && kat.includes("ev")) return true;
        return false;
      });
    }
    if (aktifSehir !== "Tüm Şehirler") liste = liste.filter(i => (i.sehir || "").toUpperCase() === aktifSehir.toUpperCase());
    if (minFiyat) liste = liste.filter(i => Number(i.fiyat) >= Number(minFiyat));
    if (maxFiyat) liste = liste.filter(i => Number(i.fiyat) <= Number(maxFiyat));
    if (sadeceTakaslik) liste = liste.filter(i => i.takasIstegi);
    switch (aktifAltFiltre) {
      case "En Çok Fiyatı Düşenler": liste.sort((a, b) => (a.degisimYuzdesi || 0) - (b.degisimYuzdesi || 0)); break;
      case "En Çok Yükselenler": liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0)); break;
      case "En Çok Takas Edilenler": liste.sort((a, b) => (b.takasTeklifiSayisi || 0) - (a.takasTeklifiSayisi || 0)); break;
      default: liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return liste;
  }, [ilanlar, searchTerm, aktifKategori, aktifSehir, minFiyat, maxFiyat, sadeceTakaslik, aktifAltFiltre]);

  const openModal = useCallback((ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    const saticiEmail = (ilan.satici?.email || ilan.sellerEmail || "").toLowerCase();
    if (saticiEmail === session.user?.email?.toLowerCase()) return alert("Kendi ilanınızla işlem yapamazsınız.");
    setSeciliIlan(ilan); setModalTuru(tur);
    setKabulSozlesme(false); setKabulYasalZirh(false);
  }, [session, router]);

  const closeModal = useCallback(() => {
    setSeciliIlan(null); setModalTuru(null); setSecilenBenimIlanim(""); setEklenecekNakit("");
  }, []);

  const handleSepeteEkle = useCallback((ilan: any) => {
    try {
      const mevcutSepet = JSON.parse(localStorage.getItem('atakasa_sepet') || '[]');
      const urunId = ilan._id || ilan.id;
      if (mevcutSepet.find((item: any) => item.id === urunId)) return alert("Bu ürün zaten sepetinizde.");
      mevcutSepet.push({
        id: urunId, baslik: ilan.baslik, fiyat: Number(ilan.fiyat),
        resim: getImageUrl(ilan),
        saticiMail: ilan.satici?.email || ilan.sellerEmail || ""
      });
      localStorage.setItem('atakasa_sepet', JSON.stringify(mevcutSepet));
      alert("Ürün sepete eklendi!");
    } catch {
      localStorage.removeItem('atakasa_sepet');
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
          teklifEdilenIlanBaslik: baslik, eklenenNakit: eklenecekNakit || 0, durum: "bekliyor"
        })
      });
      if (res.ok) { alert("Takas teklifiniz iletildi!"); closeModal(); }
      else { const err = await res.json(); alert(`Hata: ${err.error}`); }
    } catch { alert("Bağlantı hatası."); }
  };

  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon) return alert("Lütfen teslimat bilgilerini eksiksiz doldurun.");
    if (!kabulSozlesme || !kabulYasalZirh) return alert("Devam etmek için sözleşmeleri onaylamalısınız.");
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: seciliIlan._id, sellerEmail: seciliIlan.satici?.email || seciliIlan.sellerEmail,
          adSoyad: siparisForm.adSoyad, telefon: siparisForm.telefon,
          adres: siparisForm.adres, not: siparisForm.not,
          odemeYontemi: siparisForm.odemeYontemi, fiyat: seciliIlan.fiyat, durum: "bekliyor"
        })
      });
      if (res.ok) { alert("Siparişiniz alındı! Panelinizden takip edebilirsiniz."); closeModal(); }
      else { alert("Sipariş alınamadı, tekrar deneyin."); }
    } catch { alert("Bağlantı hatası."); }
  };

  const BorsaKarti = React.memo(({ ilan }: { ilan: any }) => {
    const ilkMedya = getImageUrl(ilan);
    const videoVar = isVideo(ilkMedya);
    const pozitif = (ilan.degisimYuzdesi || 0) >= 0;

    const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const shareUrl = `${window.location.origin}/varlik/${ilan._id}`;
      const shareData = { title: `${ilan.baslik} | A-TAKASA`, text: `Bu ilana bakmalısın!`, url: shareUrl };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch { }
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert("İlan linki kopyalandı!");
      }
    };

    return (
      <div className="product-card" itemScope itemType="https://schema.org/Product">
        <meta itemProp="name" content={`${ilan.baslik} | A-TAKASA`} />
        <meta itemProp="description" content={ilan.aciklama || "Ürün"} />

        <div className={`change-badge ${pozitif ? 'change-up' : 'change-down'}`}>
          {pozitif ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          %{Math.abs(ilan.degisimYuzdesi || 0)}
        </div>

        {videoVar && (
          <div className="video-badge">
            <Play size={8} fill="currentColor" /> VİDEO
          </div>
        )}

        <div className="card-media" onClick={() => { if (videoVar) { setVideoModalUrl(ilkMedya); setVideoModalBaslik(ilan.baslik || ""); } else { router.push(`/varlik/${ilan._id}`); } }}>
          {videoVar ? (
            <div className="video-thumb">
              {ilkMedya.includes("res.cloudinary.com") ? (
                <img src={ilkMedya.replace(/\.(mp4|webm|mov)$/i, ".jpg")} className="thumb-img" alt="Video Kapak" />
              ) : (
                <video src={`${ilkMedya}#t=0.1`} className="thumb-img" muted playsInline preload="metadata" />
              )}
              <div className="play-overlay">
                <div className="play-btn">
                  <Play size={22} fill="white" className="ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <img src={ilkMedya} loading="lazy" decoding="async" className="card-img" alt={ilan.baslik || "Ürün"} itemProp="image" />
          )}
          <div className="city-tag">📍 {ilan.sehir || "TÜRKİYE"}</div>
        </div>

        <div className="card-body">
          <span className="category-label">{ilan.kategori || "Genel"}</span>
          <h3 className="card-title" onClick={() => router.push(`/varlik/${ilan._id}`)}>{ilan.baslik}</h3>

          <div className="price-row" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span className="price-main">
              <span itemProp="price">{Number(ilan.fiyat).toLocaleString()}</span>
              <meta itemProp="priceCurrency" content="TRY" />
              <span className="price-currency"> ₺</span>
            </span>
            <span className="card-date">{new Date(ilan.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>

          <div className="card-actions">
            <div className="action-row-top">
              <button onClick={handleShare} className="btn-icon" title="Paylaş"><Share2 size={15} /></button>
              <button onClick={() => router.push(`/varlik/${ilan._id}`)} className="btn-outline flex-1">İncele</button>
              <button onClick={() => handleSepeteEkle(ilan)} className="btn-cart"><ShoppingCart size={15} /></button>
            </div>
            <div className="action-row-bottom">
              <button onClick={() => openModal(ilan, "takas")} className="btn-swap">🔄 Takas Teklifi</button>
              <button onClick={() => openModal(ilan, "satinal")} className="btn-buy">Satın Al</button>
            </div>
          </div>
        </div>
      </div>
    );
  });
  BorsaKarti.displayName = "BorsaKarti";

  return (
    <div className="at-root">
      {/* 🤖 SİBER TURBO: Google Zengin Sonuçlar (Rich Snippets) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Atakasa",
            "url": "https://atakasa.com",
            "description": "Küresel B2B Barter ve Takas Platformu",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://atakasa.com/ilanlar?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />
      
      <div className="bg-texture" aria-hidden />

      {/* Trust banner */}
      <div className="trust-bar">
        <div className="trust-bar-inner">
          <span className="trust-item"><Shield size={13} /> Güvenli Takas Havuzu</span>
          <span className="trust-divider" />
          <span className="trust-item"><Star size={13} /> Onaylı Üyeler</span>
          <span className="trust-divider" />
          <span className="trust-item">🛡️ %100 Alıcı & Satıcı Koruması</span>
        </div>
      </div>

      {/* Search & Nav */}
      <div className="top-nav">
        <div className="nav-inner">
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer', marginRight: '16px', display: 'flex', alignItems: 'center' }}>
            <h1 style={{ color: 'var(--navy)', fontSize: '24px', fontWeight: '800', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em', margin: 0 }}>
              A-TAKASA<span style={{ color: 'var(--gold)' }}>.</span>
            </h1>
          </div>
          
          <div className="search-wrap">
            <Search size={17} className="search-icon" />
            <input className="search-input" placeholder="Varlık ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="nav-actions">
            <button onClick={() => setFiltreMenusuAcik(!filtreMenusuAcik)} className={`btn-filter ${filtreMenusuAcik ? 'active' : ''}`}>
              <SlidersHorizontal size={15} /> Filtrele <ChevronDown size={13} className={`chevron ${filtreMenusuAcik ? 'open' : ''}`} />
            </button>
            <button onClick={() => router.push('/sepet')} className="btn-sepet">
              <ShoppingCart size={15} /> Sepet
            </button>
            <button onClick={() => session ? router.push('/ilan-ver') : router.push('/giris')} className="btn-primary">
              <Zap size={15} /> İlan Ver
            </button>
          </div>
        </div>

        {filtreMenusuAcik && (
          <div className="filter-panel">
            <div className="filter-grid">
              <div className="filter-field">
                <label className="filter-label">Şehir / Bölge</label>
                <select value={aktifSehir} onChange={(e) => setAktifSehir(e.target.value)} className="filter-select">
                  {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label className="filter-label">Min Fiyat (₺)</label>
                <input type="number" placeholder="Örn: 1.000" value={minFiyat} onChange={(e) => setMinFiyat(e.target.value)} className="filter-input" />
              </div>
              <div className="filter-field">
                <label className="filter-label">Max Fiyat (₺)</label>
                <input type="number" placeholder="Örn: 50.000" value={maxFiyat} onChange={(e) => setMaxFiyat(e.target.value)} className="filter-input" />
              </div>
              <div className="filter-field flex items-end">
                <button onClick={() => setSadeceTakaslik(!sadeceTakaslik)} className={`swap-toggle ${sadeceTakaslik ? 'active' : ''}`}>
                  🔄 {sadeceTakaslik ? 'Sadece Takaslıklar' : 'Takas Durumu'}
                </button>
              </div>
            </div>
            <div className="filter-footer">
              <button onClick={() => { setAktifSehir("Tüm Şehirler"); setMinFiyat(""); setMaxFiyat(""); setSadeceTakaslik(false); }} className="btn-reset">Sıfırla</button>
              <button onClick={() => setFiltreMenusuAcik(false)} className="btn-apply">Filtrele</button>
            </div>
          </div>
        )}
      </div>

      {/* Kategoriler */}
      <div className="cat-strip">
        <div className="cat-inner">
          <button onClick={() => { setAktifKategori("Hepsi"); setAktifAltFiltre("Yeni İlanlar"); }} className={`cat-btn ${aktifKategori === "Hepsi" ? 'active' : ''}`}>
            🌐 Tümü
          </button>
          {sektorler.map(s => (
            <button key={s.ad} onClick={() => { setAktifKategori(s.ad); setAktifAltFiltre("Yeni İlanlar"); }} className={`cat-btn ${aktifKategori === s.ad ? 'active' : ''}`}>
              {s.emoji} {s.ad} <span className={`cat-pct ${Number(s.degisim) >= 0 ? 'up' : 'down'}`}>{s.degisim}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alt filtreler */}
      {aktifKategori !== "Hepsi" && (
        <div className="sub-filter-bar">
          {["Yeni İlanlar", "En Çok Fiyatı Düşenler", "En Çok Yükselenler", "En Çok Takas Edilenler"].map(f => (
            <button key={f} onClick={() => setAktifAltFiltre(f)} className={`sub-filter-btn ${aktifAltFiltre === f ? 'active' : ''}`}>{f}</button>
          ))}
        </div>
      )}

      {/* Ana içerik */}
      <main className="main-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">{aktifKategori === "Hepsi" ? "Borsa Vitrini" : aktifKategori}</h2>
            <p className="section-sub">{filtrelenmisIlanlar.length} varlık listeleniyor {aktifKategori !== "Hepsi" && ` · ${aktifAltFiltre}`}</p>
          </div>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} className="skeleton-card"><div className="skeleton-img" /><div className="skeleton-body"><div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line medium" /></div></div>
            ))}
          </div>
        ) : filtrelenmisIlanlar.length > 0 ? (
          <div className="product-grid">
            {filtrelenmisIlanlar.map((ilan) => <BorsaKarti key={ilan._id} ilan={ilan} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p className="empty-title">Bu kriterlerde varlık bulunamadı.</p>
            <p className="empty-sub">Farklı filtreler deneyin veya arama terimini değiştirin.</p>
          </div>
        )}
      </main>

      {/* TAKAS / SATIN AL MODALLARI */}
      {seciliIlan && modalTuru && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="modal-close">✕</button>
            <div className="modal-header">
              <img src={getImageUrl(seciliIlan)} className="modal-img" alt="Ürün" loading="lazy" />
              <div className="modal-info">
                <span className="modal-type-label">{modalTuru === 'takas' ? 'Takas Teklifi' : 'Güvenli Satın Alma'}</span>
                <h3 className="modal-title">{seciliIlan.baslik}</h3>
                <p className="modal-price">{Number(seciliIlan.fiyat).toLocaleString()} ₺</p>
              </div>
            </div>

            {modalTuru === "takas" ? (
              <div className="modal-form">
                <label className="form-label">Vereceğiniz Varlığı Seçin</label>
                <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="form-select">
                  <option value="">-- İlanlarınızdan seçin --</option>
                  {benimIlanlarim.map(b => <option key={b._id} value={`${b._id}|${b.baslik}`}>{b.baslik}</option>)}
                </select>
                <label className="form-label mt-4">Üste Nakit Ekle (₺) — İsteğe Bağlı</label>
                <input type="number" placeholder="Örn: 5.000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="form-input" />
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim} className="btn-modal-primary mt-6">Takas Teklifini Gönder →</button>
              </div>
            ) : (
              <div className="modal-form">
                <div className="price-summary">
                  <span>Ödenecek Tutar</span>
                  <span className="price-big">{Number(seciliIlan.fiyat).toLocaleString()} ₺</span>
                </div>
                <input type="text" placeholder="Ad Soyad" value={siparisForm.adSoyad} onChange={(e) => setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="form-input" />
                <input type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon} onChange={(e) => setSiparisForm({...siparisForm, telefon: e.target.value})} className="form-input" />
                <textarea placeholder="Teslimat Adresi" value={siparisForm.adres} onChange={(e) => setSiparisForm({...siparisForm, adres: e.target.value})} className="form-textarea" />
                <select value={siparisForm.odemeYontemi} onChange={(e) => setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="form-select">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                </select>
                <div className="legal-box">
                  <label className="legal-check">
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

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

        :root {
          --navy: #0f2540;
          --navy-mid: #1a3a5c;
          --navy-light: #234875;
          --gold: #c9a84c;
          --gold-light: #e2c97e;
          --gold-pale: #f5edd6;
          --cream: #faf8f4;
          --white: #ffffff;
          --text: #1a2740;
          --text-mid: #4a5e78;
          --text-soft: #8097b1;
          --border: #dce6f0;
          --border-light: #eef3f8;
          --success: #1a7a4a;
          --success-bg: #eaf5ee;
          --danger: #c0392b;
          --danger-bg: #fdecea;
          --shadow-sm: 0 1px 4px rgba(15,37,64,0.06);
          --shadow-md: 0 4px 16px rgba(15,37,64,0.1);
          --shadow-lg: 0 8px 32px rgba(15,37,64,0.14);
          --radius: 14px;
          --radius-lg: 20px;
          --radius-xl: 28px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
        }

        .at-root { min-height: 100vh; background: var(--cream); position: relative; }

        .bg-texture {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(ellipse 80% 50% at 10% 0%, rgba(201,168,76,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(15,37,64,0.05) 0%, transparent 60%);
        }

        /* TRUST BAR */
        .trust-bar { background: var(--navy); padding: 8px 0; position: relative; z-index: 10; }
        .trust-bar-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 16px; overflow-x: auto; scrollbar-width: none; }
        .trust-bar-inner::-webkit-scrollbar { display: none; }
        .trust-item { display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 500; white-space: nowrap; letter-spacing: 0.02em; }
        .trust-item svg { color: var(--gold-light); flex-shrink: 0; }
        .trust-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.2); flex-shrink: 0; }

        /* TOP NAV */
        .top-nav { background: var(--white); border-bottom: 1px solid var(--border); padding: 12px 24px; position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
        .nav-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; gap: 12px; }
        .search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 14px; color: var(--text-soft); pointer-events: none; }
        .search-input { width: 100%; padding: 10px 14px 10px 42px; background: var(--cream); border: 1.5px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: var(--navy-mid); background: var(--white); }
        .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .btn-filter, .btn-sepet { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: var(--radius); background: var(--cream); border: 1.5px solid var(--border); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-mid); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .btn-filter:hover, .btn-sepet:hover { border-color: var(--navy-mid); color: var(--navy); }
        .btn-filter.active { background: var(--navy); color: var(--white); border-color: var(--navy); }
        .chevron { transition: transform 0.2s; }
        .chevron.open { transform: rotate(180deg); }
        .btn-primary { display: flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: var(--radius); background: var(--gold); border: none; font-family: inherit; font-size: 12px; font-weight: 700; color: var(--navy); cursor: pointer; transition: all 0.2s; white-space: nowrap; box-shadow: 0 2px 8px rgba(201,168,76,0.35); }
        .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,0.45); }

        /* FILTER PANEL */
        .filter-panel { max-width: 1280px; margin: 12px auto 0; background: var(--cream); border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; animation: slideDown 0.2s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .filter-field { display: flex; flex-direction: column; gap: 6px; }
        .filter-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-soft); }
        .filter-select, .filter-input { padding: 9px 12px; border-radius: var(--radius); border: 1.5px solid var(--border); background: var(--white); font-family: inherit; font-size: 13px; color: var(--text); outline: none; }
        .swap-toggle { width: 100%; padding: 9px 12px; border-radius: var(--radius); border: 1.5px solid var(--border); background: var(--white); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-mid); cursor: pointer; transition: all 0.2s; }
        .swap-toggle.active { background: var(--navy); color: var(--white); border-color: var(--navy); }
        .filter-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
        .btn-reset { padding: 8px 20px; background: transparent; border: 1.5px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--text-soft); cursor: pointer; }
        .btn-apply { padding: 8px 24px; background: var(--navy); border: none; border-radius: var(--radius); font-family: inherit; font-size: 12px; font-weight: 700; color: var(--white); cursor: pointer; }

        /* CATEGORY STRIP */
        .cat-strip { background: var(--white); border-bottom: 1px solid var(--border); position: relative; z-index: 50; }
        .cat-inner { max-width: 1280px; margin: 0 auto; padding: 10px 24px; display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
        .cat-inner::-webkit-scrollbar { display: none; }
        .cat-btn { display: flex; align-items: center; gap: 5px; white-space: nowrap; padding: 7px 14px; border-radius: 999px; border: 1.5px solid transparent; background: transparent; font-family: inherit; font-size: 12px; font-weight: 500; color: var(--text-mid); cursor: pointer; transition: all 0.15s; }
        .cat-btn:hover { background: var(--cream); border-color: var(--border); color: var(--text); }
        .cat-btn.active { background: var(--navy); color: var(--white); border-color: var(--navy); font-weight: 600; box-shadow: 0 2px 8px rgba(15,37,64,0.2); }
        .cat-pct { font-size: 10px; opacity: 0.6; }
        .cat-pct.up { color: var(--success); opacity: 1; }
        .cat-pct.down { color: var(--danger); opacity: 1; }

        /* SUB FILTERS */
        .sub-filter-bar { background: var(--white); border-bottom: 1px solid var(--border-light); display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; padding: 8px 24px; }
        .sub-filter-bar::-webkit-scrollbar { display: none; }
        .sub-filter-btn { padding: 5px 14px; border-radius: 999px; background: transparent; border: 1.5px solid transparent; font-family: inherit; font-size: 11px; font-weight: 500; color: var(--text-soft); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .sub-filter-btn:hover { color: var(--text); }
        .sub-filter-btn.active { background: rgba(15,37,64,0.07); border-color: var(--navy-mid); color: var(--navy); font-weight: 600; }

        /* MAIN */
        .main-content { max-width: 1280px; margin: 0 auto; padding: 32px 24px 64px; position: relative; z-index: 1; }
        .section-header { margin-bottom: 24px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--navy); letter-spacing: -0.02em; margin-bottom: 4px; }
        .section-sub { font-size: 13px; color: var(--text-soft); }

        /* GRID */
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* PRODUCT CARD */
        .product-card { background: var(--white); border: 1.5px solid var(--border-light); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s; position: relative; }
        .product-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); border-color: rgba(201,168,76,0.4); }

        .change-badge { position: absolute; top: 12px; left: 12px; z-index: 10; display: flex; align-items: center; gap: 3px; padding: 4px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.02em; backdrop-filter: blur(8px); }
        .change-up { background: rgba(26,122,74,0.12); color: #1a7a4a; border: 1px solid rgba(26,122,74,0.2); }
        .change-down { background: rgba(192,57,43,0.1); color: #c0392b; border: 1px solid rgba(192,57,43,0.2); }

        .video-badge { position: absolute; top: 12px; right: 12px; z-index: 10; display: flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 999px; background: rgba(0,0,0,0.65); color: white; font-size: 9px; font-weight: 700; letter-spacing: 0.06em; backdrop-filter: blur(6px); }

        .card-media { height: 220px; overflow: hidden; cursor: pointer; background: var(--border-light); position: relative; flex-shrink: 0; }
        .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .product-card:hover .card-img { transform: scale(1.04); }
        .city-tag { position: absolute; bottom: 10px; right: 10px; background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); color: var(--text-mid); font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 999px; border: 1px solid var(--border); }

        .card-body { padding: 16px 18px 18px; display: flex; flex-direction: column; flex: 1; }
        .category-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); display: block; margin-bottom: 5px; }
        .card-title { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.35; cursor: pointer; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.15s; }
        .card-title:hover { color: var(--navy-mid); }

        .price-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border-light); }
        .price-main { font-size: 20px; font-weight: 700; color: var(--navy); letter-spacing: -0.03em; }
        .price-currency { font-size: 14px; color: var(--gold); font-weight: 700; }
        .card-date { font-size: 11px; color: var(--text-soft); }

        .card-actions { display: flex; flex-direction: column; gap: 7px; margin-top: auto; }
        .action-row-top, .action-row-bottom { display: flex; gap: 6px; }

        .btn-icon { width: 36px; height: 36px; border-radius: var(--radius); flex-shrink: 0; background: var(--cream); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-soft); cursor: pointer; transition: all 0.15s; }
        .btn-icon:hover { background: var(--navy); color: var(--white); border-color: var(--navy); }
        .btn-outline { padding: 8px 12px; border-radius: var(--radius); background: var(--cream); border: 1.5px solid var(--border); font-family: inherit; font-size: 11px; font-weight: 600; color: var(--text-mid); cursor: pointer; transition: all 0.15s; }
        .btn-outline:hover { background: var(--navy); color: var(--white); border-color: var(--navy); }
        .btn-cart { width: 36px; height: 36px; border-radius: var(--radius); flex-shrink: 0; background: var(--cream); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-soft); cursor: pointer; transition: all 0.15s; }
        .btn-cart:hover { background: var(--navy-light); color: var(--white); border-color: var(--navy-light); }
        .btn-swap { flex: 1; padding: 9px 10px; border-radius: var(--radius); background: rgba(15,37,64,0.05); border: 1.5px solid rgba(15,37,64,0.12); font-family: inherit; font-size: 11px; font-weight: 600; color: var(--navy-mid); cursor: pointer; transition: all 0.15s; }
        .btn-swap:hover { background: var(--navy); color: var(--white); border-color: var(--navy); }
        .btn-buy { flex: 1; padding: 9px 10px; border-radius: var(--radius); background: var(--gold); border: none; font-family: inherit; font-size: 11px; font-weight: 700; color: var(--navy); cursor: pointer; transition: all 0.15s; box-shadow: 0 2px 6px rgba(201,168,76,0.3); }
        .btn-buy:hover { background: var(--gold-light); box-shadow: 0 4px 12px rgba(201,168,76,0.45); }
        .flex-1 { flex: 1; }

        /* EMPTY STATE & SKELETON & MODALS (Kept Original) */
        .empty-state { text-align: center; padding: 80px 24px; background: var(--white); border-radius: var(--radius-xl); border: 1.5px dashed var(--border); }
        .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.5; }
        .empty-title { font-size: 16px; font-weight: 600; color: var(--text-mid); margin-bottom: 6px; }
        .empty-sub { font-size: 13px; color: var(--text-soft); }

        .skeleton-card { background: var(--white); border: 1.5px solid var(--border-light); border-radius: var(--radius-xl); overflow: hidden; }
        .skeleton-img { height: 220px; background: linear-gradient(90deg, var(--border-light) 0%, var(--cream) 50%, var(--border-light) 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .skeleton-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--border-light) 0%, var(--cream) 50%, var(--border-light) 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .skeleton-line.short { width: 40%; }
        .skeleton-line.medium { width: 65%; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .modal-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(15,37,64,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: fadeIn 0.2s ease; }
        .modal-box { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; scrollbar-width: none; padding: 28px; position: relative; box-shadow: 0 24px 64px rgba(15,37,64,0.25); animation: slideUp 0.25s ease; }
        .modal-box::-webkit-scrollbar { display: none; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-close { position: absolute; top: 18px; right: 18px; width: 32px; height: 32px; border-radius: 50%; background: var(--cream); border: 1.5px solid var(--border); color: var(--text-soft); cursor: pointer; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .modal-close:hover { background: var(--danger-bg); color: var(--danger); border-color: var(--danger); }

        .modal-header { display: flex; gap: 16px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1.5px solid var(--border-light); align-items: center; }
        .modal-img { width: 80px; height: 80px; border-radius: var(--radius); object-fit: cover; border: 1.5px solid var(--border); flex-shrink: 0; }
        .modal-type-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); display: block; margin-bottom: 4px; }
        .modal-title { font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.3; margin-bottom: 6px; padding-right: 40px; }
        .modal-price { font-size: 18px; font-weight: 700; color: var(--navy); letter-spacing: -0.02em; }

        .modal-form { display: flex; flex-direction: column; gap: 10px; }
        .form-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-soft); }
        .form-select, .form-input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius); background: var(--cream); font-family: inherit; font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; }
        .form-select:focus, .form-input:focus { border-color: var(--navy-mid); background: var(--white); }
        .form-textarea { width: 100%; padding: 11px 14px; height: 80px; resize: none; border: 1.5px solid var(--border); border-radius: var(--radius); background: var(--cream); font-family: inherit; font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; }
        .form-textarea:focus { border-color: var(--navy-mid); background: var(--white); }

        .price-summary { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--cream); border: 1.5px solid var(--border); border-radius: var(--radius); font-size: 12px; font-weight: 600; color: var(--text-soft); }
        .price-big { font-size: 20px; font-weight: 700; color: var(--navy); letter-spacing: -0.02em; }

        .legal-box { background: var(--cream); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
        .legal-check { display: flex; gap: 10px; cursor: pointer; align-items: flex-start; }
        .legal-check input[type="checkbox"] { accent-color: var(--navy); width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px; }
        .legal-check span { font-size: 11px; color: var(--text-mid); line-height: 1.5; }

        .btn-modal-primary { width: 100%; padding: 13px; background: var(--navy); border: none; border-radius: var(--radius); font-family: inherit; font-size: 13px; font-weight: 700; color: var(--white); cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em; }
        .btn-modal-primary:hover { background: var(--navy-mid); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(15,37,64,0.25); }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .nav-inner { flex-wrap: wrap; }
          .nav-actions { width: 100%; }
          .btn-filter, .btn-sepet, .btn-primary { flex: 1; justify-content: center; }
          .product-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
