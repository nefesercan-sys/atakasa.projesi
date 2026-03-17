"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Zap, MessageCircle, Play, Star,
  ChevronLeft, ArrowRightLeft, ShoppingCart, Info, MapPin, Tag,
} from "lucide-react";

export default function VarlikDetay({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baslangicSekmesi = searchParams?.get("islem") || "incele";

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState(baslangicSekmesi);
  const [aktifMedyaIndex, setAktifMedyaIndex] = useState(0);
  const [videoAcik, setVideoAcik] = useState(false);
  const [benzerIlanlar, setBenzerIlanlar] = useState<any[]>([]);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");
  const [siparisForm, setSiparisForm] = useState({
    adSoyad: "", telefon: "", adres: "", siparisNotu: "",
    odemeYontemi: "kredi_karti", sozlesmeOnay1: false, sozlesmeOnay2: false,
  });
  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [ortalamaPuan, setOrtalamaPuan] = useState(0);
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yeniYorumMetni, setYeniYorumMetni] = useState("");
  const [ilanId, setIlanId] = useState<string>("");

  useEffect(() => {
    const unwrap = async () => {
      const p = await params;
      setIlanId(p.id);
    };
    unwrap();
  }, [params]);

  useEffect(() => {
    if (ilanId) {
      fetchIlanDetay();
      if (session?.user?.email) fetchBenimIlanlarim();
    }
  }, [ilanId, session]);

  const fetchIlanDetay = async () => {
    try {
      const res = await fetch(`/api/varliklar?id=${ilanId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const v = Array.isArray(data) ? data[0] : data;
        if (v) {
          setIlan(v);
          const saticiMail = v.satici?.email || v.sellerEmail || v.userId || "sistem@atakasa.com";
          fetchSaticiYorumlari(saticiMail);
          if (v.kategori) fetchBenzerIlanlar(v.kategori, v._id);
        } else setIlan(null);
      } else setIlan(null);
    } catch { setIlan(null); }
    setLoading(false);
  };

  const fetchBenzerIlanlar = async (kategori: string, suankiId: string) => {
    try {
      const res = await fetch(`/api/varliklar?kategori=${encodeURIComponent(kategori)}`);
      if (res.ok) {
        const data = await res.json();
        const liste = Array.isArray(data) ? data : [];
        setBenzerIlanlar(liste.filter((i: any) => i._id !== suankiId).slice(0, 6));
      }
    } catch {}
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/varliklar`);
      if (res.ok) {
        const data = await res.json();
        const liste = Array.isArray(data) ? data : [];
        setBenimIlanlarim(liste.filter((i: any) =>
          (i.satici?.email || i.satici || "").toString().toLowerCase() ===
          session?.user?.email?.toLowerCase()
        ));
      }
    } catch {}
  };

  const fetchSaticiYorumlari = async (saticiEmail: string) => {
    try {
      const res = await fetch(`/api/yorumlar?satici=${saticiEmail}`);
      if (res.ok) {
        const data = await res.json();
        setYorumlar(data.yorumlar || []);
        setOrtalamaPuan(data.ortalama || 0);
      }
    } catch {}
  };

  const handleYorumGonder = async () => {
    if (!yeniYorumMetni.trim()) return alert("Değerlendirme metni boş olamaz!");
    const saticiMail = ilan.satici?.email || ilan.sellerEmail || "sistem@atakasa.com";
    try {
      const res = await fetch("/api/yorumlar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saticiEmail: saticiMail, ilanId: ilan._id, puan: yeniPuan, icerik: yeniYorumMetni }),
      });
      if (res.ok) { alert("✅ Değerlendirmeniz kaydedildi."); setYeniYorumMetni(""); fetchSaticiYorumlari(saticiMail); }
      else { const err = await res.json(); alert(`❌ ${err.error}`); }
    } catch { alert("Bağlantı hatası."); }
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen vereceğiniz ilanı seçin!");
    const [teklifIlanId, teklifIlanBaslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: ilan.satici?.email || ilan.sellerEmail || "sistem@atakasa.com",
          hedefIlanId: ilan._id, hedefIlanBaslik: ilan.baslik, hedefIlanFiyat: ilan.fiyat || 0,
          teklifEdilenIlanId: teklifIlanId, teklifEdilenIlanBaslik: teklifIlanBaslik,
          eklenenNakit: eklenecekNakit || 0,
        }),
      });
      if (res.ok) { alert("✅ Takas teklifiniz iletildi!"); router.push("/panel"); }
      else { const err = await res.json(); alert(`Hata: ${err.error}`); }
    } catch { alert("Bağlantı hatası."); }
  };

  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.telefon || !siparisForm.adres)
      return alert("Lütfen teslimat bilgilerini eksiksiz doldurun!");
    if (!siparisForm.sozlesmeOnay1 || !siparisForm.sozlesmeOnay2)
      return alert("Lütfen her iki sözleşmeyi de onaylayın!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id, sellerEmail: ilan.satici?.email || ilan.sellerEmail || "sistem@atakasa.com",
          adSoyad: siparisForm.adSoyad, telefon: siparisForm.telefon, adres: siparisForm.adres,
          siparisNotu: siparisForm.siparisNotu, odemeYontemi: siparisForm.odemeYontemi, fiyat: ilan.fiyat,
        }),
      });
      if (res.ok) { alert("📦 Siparişiniz oluşturuldu!"); router.push("/panel"); }
      else { alert("Sipariş oluşturulamadı."); }
    } catch { alert("Bağlantı hatası."); }
  };

  const isVideo = (url: string) =>
    !!url && (url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") || url.includes("video"));

  const getTumMedya = (v: any): string[] => {
    if (v?.resimler?.length) return v.resimler;
    if (v?.images?.length) return v.images;
    if (v?.image) return [v.image];
    return ["https://placehold.co/600x400/0f2540/c9a84c?text=A-TAKASA"];
  };

  const renderYildizlar = (puan: number, interactive = false, onClick?: (n: number) => void) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s} size={interactive ? 20 : 14}
          onClick={() => interactive && onClick?.(s)}
          style={{
            cursor: interactive ? "pointer" : "default",
            color: s <= Math.round(puan) ? "#f59e0b" : "#d1d5db",
            fill: s <= Math.round(puan) ? "#f59e0b" : "none",
          }}
        />
      ))}
    </div>
  );

  const ilaninSahibiyim = session?.user?.email?.toLowerCase() ===
    (ilan?.satici?.email || ilan?.sellerEmail || ilan?.userId || "")?.toLowerCase();

  // Loading
  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "var(--cream, #faf8f4)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", color: "var(--navy, #0f2540)",
      fontFamily: "var(--font-sans, DM Sans, sans-serif)",
    }}>
      <div style={{
        width: 40, height: 40, border: "3px solid rgba(15,37,64,0.1)",
        borderTopColor: "var(--navy, #0f2540)", borderRadius: "50%",
        animation: "spin 0.8s linear infinite", marginBottom: 16,
      }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: "#8097b1" }}>İlan yükleniyor...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // 404
  if (!ilan) return (
    <div style={{
      minHeight: "100vh", background: "var(--cream, #faf8f4)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 20, padding: 24,
      fontFamily: "var(--font-sans, DM Sans, sans-serif)",
    }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#8097b1" }}>
        İlan yayından kaldırılmış veya bulunamıyor.
      </p>
      <button
        onClick={() => router.push("/")}
        style={{
          background: "var(--navy, #0f2540)", color: "#fff",
          padding: "12px 32px", borderRadius: 12, border: "none",
          fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );

  const tumMedya = getTumMedya(ilan);
  const aktifMedya = tumMedya[aktifMedyaIndex];
  const aktifMedyaVideo = isVideo(aktifMedya);

  // Renkler
  const navy = "var(--navy, #0f2540)";
  const gold = "var(--gold, #c9a84c)";
  const cream = "var(--cream, #faf8f4)";
  const border = "var(--border, #dce6f0)";
  const textSoft = "var(--text-soft, #8097b1)";

  return (
    <div style={{
      minHeight: "100vh", background: cream,
      fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
      color: "var(--text, #1a2740)",
      padding: "32px 16px 64px",
    }}>
      {/* SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org/", "@type": "Product",
          name: ilan.baslik, image: tumMedya[0],
          description: ilan.aciklama || "Atakasa platformunda bir ilan",
          offers: { "@type": "Offer", priceCurrency: "TRY", price: ilan.fiyat || "0" },
        }),
      }} />

      {/* Geri Butonu */}
      <div style={{ maxWidth: 1152, margin: "0 auto 20px" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: textSoft,
            fontFamily: "inherit", padding: 0,
          }}
        >
          <ChevronLeft size={16} /> Vitrine Dön
        </button>
      </div>

      {/* Ana Kart */}
      <div style={{
        maxWidth: 1152, margin: "0 auto",
        background: "#fff", border: `1px solid ${border}`,
        borderRadius: 28, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 4px 24px rgba(15,37,64,0.08)",
      }} className="varlik-flex">

        {/* SOL PANEL */}
        <div style={{
          flex: 1, background: "#f9fafb",
          borderRight: `1px solid ${border}`,
          padding: "28px 28px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Ana Görsel */}
          <div
            onClick={() => aktifMedyaVideo && setVideoAcik(true)}
            style={{
              borderRadius: 16, overflow: "hidden",
              background: "#f3f4f6", border: `1px solid ${border}`,
              marginBottom: 14, cursor: aktifMedyaVideo ? "pointer" : "default",
              aspectRatio: "4/3", display: "flex", alignItems: "center",
              justifyContent: "center", position: "relative",
            }}
          >
            {aktifMedyaVideo ? (
              <>
                <video
                  src={`${aktifMedya}#t=0.001`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                  muted playsInline preload="metadata"
                />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 60, height: 60, background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}>
                    <Play size={26} color="#fff" fill="#fff" />
                  </div>
                </div>
              </>
            ) : (
              <img
                src={aktifMedya}
                alt={ilan.baslik}
                fetchPriority="high"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400/0f2540/c9a84c?text=A-TAKASA"; }}
              />
            )}
          </div>

          {/* Thumbnails */}
          {tumMedya.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto" }}>
              {tumMedya.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => setAktifMedyaIndex(idx)}
                  style={{
                    width: 60, height: 60, borderRadius: 10, overflow: "hidden",
                    cursor: "pointer", flexShrink: 0,
                    border: `2px solid ${aktifMedyaIndex === idx ? navy : border}`,
                    transition: "border-color 0.15s",
                  }}
                >
                  {isVideo(m) ? (
                    <div style={{ width: "100%", height: "100%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Play size={16} color="#9ca3af" fill="#9ca3af" />
                    </div>
                  ) : (
                    <img src={m} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Satıcı Güven Kartı */}
          <div style={{
            background: "#fff", border: `1px solid ${border}`,
            borderRadius: 16, padding: "20px 20px",
            maxHeight: 380, overflowY: "auto",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: navy }}>
                <ShieldCheck size={15} color="#4f46e5" /> Satıcı Güven Puanı
              </div>
              {ortalamaPuan > 0 ? renderYildizlar(ortalamaPuan) : (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: textSoft,
                  background: "#f3f4f6", padding: "3px 8px", borderRadius: 6,
                }}>YENİ ÜYE</span>
              )}
            </div>

            {/* Yorumlar */}
            {yorumlar.length === 0 ? (
              <p style={{ fontSize: 12, color: textSoft, textAlign: "center", padding: "20px 0" }}>
                Henüz değerlendirme yapılmamış.
              </p>
            ) : yorumlar.map((y: any, i: number) => (
              <div key={i} style={{
                background: "#f9fafb", border: `1px solid ${border}`,
                borderRadius: 12, padding: "12px 14px", marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  {renderYildizlar(y.puan)}
                  <span style={{ fontSize: 10, color: textSoft }}>
                    {new Date(y.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>"{y.icerik}"</p>
                <p style={{ fontSize: 10, color: textSoft, fontWeight: 700 }}>— {y.gonderenAd}</p>
              </div>
            ))}

            {/* Yorum Yaz */}
            {session?.user && !ilaninSahibiyim && (
              <div style={{
                background: "#eef2ff", border: "1px solid #c7d2fe",
                borderRadius: 12, padding: "16px",
                marginTop: 12,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: navy, marginBottom: 10 }}>
                  Bu satıcıyla işlem yaptınız mı?
                </p>
                {renderYildizlar(yeniPuan, true, setYeniPuan)}
                <textarea
                  value={yeniYorumMetni}
                  onChange={(e) => setYeniYorumMetni(e.target.value)}
                  placeholder="Deneyiminizi kısaca paylaşın..."
                  style={{
                    width: "100%", marginTop: 10, padding: "10px 12px",
                    background: "#fff", border: `1px solid ${border}`,
                    borderRadius: 10, fontSize: 13, color: navy,
                    resize: "none", height: 72, outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleYorumGonder}
                  style={{
                    width: "100%", marginTop: 8, padding: "10px",
                    background: navy, color: "#fff", border: "none",
                    borderRadius: 10, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Değerlendirmeyi Gönder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column" }}>

          {/* Sekmeler */}
          <div style={{
            display: "flex", background: "#f3f4f6", padding: 6,
            borderRadius: 14, marginBottom: 28, border: `1px solid ${border}`,
            gap: 4,
          }}>
            {[
              { id: "incele", icon: <Info size={13} />, label: "İncele" },
              ...(!ilaninSahibiyim ? [
                { id: "takas", icon: <ArrowRightLeft size={13} />, label: "Takas Et" },
                { id: "satinal", icon: <ShoppingCart size={13} />, label: "Satın Al" },
              ] : []),
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setAktifSekme(s.id)}
                style={{
                  flex: 1, padding: "10px 8px", borderRadius: 10,
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.15s",
                  background: aktifSekme === s.id
                    ? (s.id === "satinal" ? navy : "#fff")
                    : "transparent",
                  color: aktifSekme === s.id
                    ? (s.id === "satinal" ? "#fff" : navy)
                    : textSoft,
                  boxShadow: aktifSekme === s.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* SEKME: İNCELE */}
          {aktifSekme === "incele" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  background: "#eef2ff", color: "#4338ca",
                  border: "1px solid #c7d2fe", padding: "5px 12px", borderRadius: 8,
                }}>
                  <Tag size={11} /> {ilan.kategori || "Genel"}
                </span>
                {ilan.sehir && (
                  <span style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    background: "#f3f4f6", color: "#374151",
                    border: `1px solid ${border}`, padding: "5px 12px", borderRadius: 8,
                  }}>
                    <MapPin size={11} /> {ilan.sehir}
                  </span>
                )}
              </div>

              <h1 style={{
                fontSize: 26, fontWeight: 800, color: navy,
                letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 16,
                fontFamily: "var(--font-display, 'Playfair Display', serif)",
              }}>
                {ilan.baslik}
              </h1>

              <div style={{
                fontSize: 36, fontWeight: 800, color: navy,
                letterSpacing: "-0.03em", marginBottom: 24,
                paddingBottom: 20, borderBottom: `1px solid ${border}`,
              }}>
                {Number(ilan.fiyat || 0).toLocaleString("tr-TR")}
                <span style={{ fontSize: 20, color: gold, marginLeft: 6 }}>₺</span>
              </div>

              {ilan.takasIstegi && (
                <div style={{
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: 14, padding: "14px 16px", marginBottom: 20,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <ArrowRightLeft size={12} /> Takas Tercihi
                  </p>
                  <p style={{ fontSize: 13, color: "#14532d" }}>{ilan.takasIstegi}</p>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 8 }}>Açıklama</p>
                <p style={{
                  fontSize: 13, color: "#4b5563", lineHeight: 1.7,
                  whiteSpace: "pre-line", background: "#f9fafb",
                  border: `1px solid ${border}`, borderRadius: 12,
                  padding: "14px 16px",
                }}>
                  {ilan.aciklama || "Bu ilan için açıklama girilmemiş."}
                </p>
              </div>

              {!ilaninSahibiyim && (
                <Link
                  href={`/panel?tab=mesajlar&yeniSohbet=${ilan._id}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px", background: "#fff",
                    border: `2px solid ${border}`, borderRadius: 14,
                    fontSize: 13, fontWeight: 700, color: navy,
                    textDecoration: "none", marginTop: "auto",
                    transition: "border-color 0.15s",
                  }}
                >
                  <MessageCircle size={17} /> 💬 Satıcıya Mesaj Gönder
                </Link>
              )}

              {ilaninSahibiyim && (
                <div style={{
                  background: "#eff6ff", border: "1px solid #bfdbfe",
                  borderRadius: 12, padding: "14px", textAlign: "center", marginTop: "auto",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                    Bu sizin kendi ilanınızdır.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SEKME: TAKAS */}
          {aktifSekme === "takas" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{
                background: "#eef2ff", border: "1px solid #c7d2fe",
                borderRadius: 14, padding: "16px 18px", marginBottom: 24,
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: navy, marginBottom: 4 }}>
                  Takas Teklifi Oluştur
                </h3>
                <p style={{ fontSize: 12, color: "#4338ca" }}>
                  Kendi ürünlerinizden birini teklif edin.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: navy, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                    1. Vereceğiniz Ürünü Seçin
                  </label>
                  <select
                    onChange={(e) => setSecilenBenimIlanim(e.target.value)}
                    style={{
                      width: "100%", padding: "12px 14px", background: "#fff",
                      border: `1.5px solid ${border}`, borderRadius: 12,
                      fontSize: 13, color: navy, outline: "none",
                      fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    <option value="">— Yayındaki ilanlarınızdan seçin —</option>
                    {benimIlanlarim.map(b => (
                      <option key={b._id} value={`${b._id}|${b.baslik}`}>{b.baslik}</option>
                    ))}
                  </select>
                  {benimIlanlarim.length === 0 && (
                    <div style={{
                      background: "#fffbeb", border: "1px solid #fde68a",
                      borderRadius: 10, padding: "12px 14px", marginTop: 8, textAlign: "center",
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
                        Takas için önce ilan eklemelisiniz.
                      </p>
                      <button
                        onClick={() => router.push("/ilan-ver")}
                        style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                      >
                        Hemen İlan Ver
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: navy, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                    2. Üste Nakit (İsteğe Bağlı)
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number" placeholder="0" value={eklenecekNakit}
                      onChange={(e) => setEklenecekNakit(e.target.value)}
                      style={{
                        width: "100%", padding: "12px 40px 12px 14px", background: "#fff",
                        border: `1.5px solid ${border}`, borderRadius: 12,
                        fontSize: 13, color: navy, outline: "none",
                        fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: textSoft, fontWeight: 700 }}>₺</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: navy, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                    3. Teklif Notu (İsteğe Bağlı)
                  </label>
                  <textarea
                    value={takasMesaji}
                    onChange={(e) => setTakasMesaji(e.target.value)}
                    placeholder="Ürününüz hakkında kısa bir not..."
                    style={{
                      width: "100%", padding: "12px 14px", background: "#fff",
                      border: `1.5px solid ${border}`, borderRadius: 12,
                      fontSize: 13, color: navy, outline: "none",
                      fontFamily: "inherit", resize: "none", height: 88,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleTakasGonder}
                disabled={!secilenBenimIlanim}
                style={{
                  width: "100%", marginTop: 20, padding: "14px",
                  background: secilenBenimIlanim ? navy : "#9ca3af",
                  border: "none", borderRadius: 14, color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: secilenBenimIlanim ? "pointer" : "not-allowed",
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <ArrowRightLeft size={16} /> Takas Teklifini Gönder
              </button>
            </div>
          )}

          {/* SEKME: SATIN AL */}
          {aktifSekme === "satinal" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* Ürün özeti */}
              <div style={{
                display: "flex", gap: 14, alignItems: "center",
                background: "#f9fafb", border: `1px solid ${border}`,
                borderRadius: 14, padding: "14px 16px", marginBottom: 20,
              }}>
                <div style={{ width: 60, height: 60, borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, flexShrink: 0 }}>
                  <img src={aktifMedya} alt="Ürün" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 4 }}>{ilan.baslik}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: navy }}>
                    {Number(ilan.fiyat || 0).toLocaleString("tr-TR")}
                    <span style={{ fontSize: 14, color: gold, marginLeft: 4 }}>₺</span>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {[
                  { ph: "Teslim Alacak Ad Soyad", val: siparisForm.adSoyad, key: "adSoyad", type: "text" },
                  { ph: "Telefon Numarası", val: siparisForm.telefon, key: "telefon", type: "tel" },
                ].map((f) => (
                  <input
                    key={f.key} type={f.type} placeholder={f.ph} value={f.val}
                    onChange={(e) => setSiparisForm({ ...siparisForm, [f.key]: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 14px", background: "#fff",
                      border: `1.5px solid ${border}`, borderRadius: 12,
                      fontSize: 13, color: navy, outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box",
                    }}
                  />
                ))}
                <textarea
                  placeholder="Açık Teslimat Adresi"
                  value={siparisForm.adres}
                  onChange={(e) => setSiparisForm({ ...siparisForm, adres: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 14px", background: "#fff",
                    border: `1.5px solid ${border}`, borderRadius: 12,
                    fontSize: 13, color: navy, outline: "none",
                    fontFamily: "inherit", resize: "none", height: 72,
                    boxSizing: "border-box",
                  }}
                />
                <select
                  value={siparisForm.odemeYontemi}
                  onChange={(e) => setSiparisForm({ ...siparisForm, odemeYontemi: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 14px", background: "#fff",
                    border: `1.5px solid ${border}`, borderRadius: 12,
                    fontSize: 13, color: navy, outline: "none",
                    fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                  <option value="kapida_odeme">🚚 Kapıda Ödeme</option>
                </select>
              </div>

              {/* Sözleşmeler */}
              <div style={{
                marginTop: 16, background: "#f9fafb",
                border: `1px solid ${border}`, borderRadius: 14, padding: "16px 18px",
              }}>
                {[
                  { key: "sozlesmeOnay1", label: "Mesafeli Satış Sözleşmesi'ni okudum, onaylıyorum." },
                  { key: "sozlesmeOnay2", label: "Ön Bilgilendirme Formu'nu okudum, onaylıyorum." },
                ].map((s) => (
                  <label key={s.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={(siparisForm as any)[s.key]}
                      onChange={(e) => setSiparisForm({ ...siparisForm, [s.key]: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: navy, flexShrink: 0, marginTop: 1 }}
                    />
                    <span style={{ fontSize: 12, color: "#374151" }}>{s.label}</span>
                  </label>
                ))}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 12, borderTop: `1px solid ${border}` }}>
                  <ShieldCheck size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#374151" }}>
                    <strong style={{ color: navy }}>Alıcı Koruması:</strong> Ürün size ulaşıp onay verene kadar ödeme havuzda tutulur.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSiparisTamamla}
                style={{
                  width: "100%", marginTop: 14, padding: "14px",
                  background: "#16a34a", border: "none", borderRadius: 14,
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <ShieldCheck size={17} /> Güvenli Ödemeye Geç
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {videoAcik && aktifMedyaVideo && (
        <div
          onClick={() => setVideoAcik(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "100%", maxWidth: 900, background: "#000", borderRadius: 20, overflow: "hidden" }}
          >
            <button
              onClick={() => setVideoAcik(false)}
              style={{
                position: "absolute", top: 12, right: 12, zIndex: 10,
                width: 36, height: 36, background: "rgba(0,0,0,0.5)",
                border: "none", borderRadius: "50%", color: "#fff",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
            <video src={aktifMedya} controls autoPlay style={{ width: "100%", maxHeight: "80vh" }} />
          </div>
        </div>
      )}

      {/* Benzer İlanlar */}
      {benzerIlanlar.length > 0 && (
        <div style={{ maxWidth: 1152, margin: "48px auto 0" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${border}`,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: navy, fontFamily: "var(--font-display, serif)" }}>
              Benzer İlanlar
            </h2>
            <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: gold, textDecoration: "none" }}>
              Tümünü Gör →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {benzerIlanlar.map((b) => (
              <Link
                key={b._id} href={`/varlik/${b._id}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div style={{
                  background: "#fff", border: `1px solid ${border}`,
                  borderRadius: 14, overflow: "hidden",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}>
                  <div style={{ aspectRatio: "1/1", overflow: "hidden", background: "#f3f4f6" }}>
                    <img
                      src={b.resimler?.[0] || b.image || "https://placehold.co/200x200/0f2540/c9a84c?text=İlan"}
                      alt={b.baslik}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{
                      fontSize: 12, fontWeight: 700, color: navy, lineHeight: 1.35,
                      marginBottom: 6, display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {b.baslik}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: navy }}>
                      {Number(b.fiyat || 0).toLocaleString("tr-TR")}
                      <span style={{ color: gold, marginLeft: 3 }}>₺</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .varlik-flex { flex-direction: row !important; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #dce6f0; border-radius: 2px; }
      `}</style>
    </div>
  );
}
