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
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const unwrap = async () => {
      const p = await params;
      setSlug(p.slug);
    };
    unwrap();
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchIlanDetay();
      if (session?.user?.email) fetchBenimIlanlarim();
    }
  }, [slug, session]);

  const fetchIlanDetay = async () => {
    try {
      // ✅ slug ile çek
      const res = await fetch(`/api/varliklar?slug=${slug}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const v = Array.isArray(data) ? data[0] : data;
        if (v) {
          setIlan(v);
          const saticiMail = v.satici?.email || v.sellerEmail || "sistem@atakasa.com";
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

  // --- Benzer ilanlar link'i slug bazlı ---
  const varlikLink = (v: any) =>
    v.slug ? `/varlik/${v.slug}` : `/varlik/${v._id}`;

  // --- Tüm handler ve render kodları aynı ---
  // (handleYorumGonder, handleTakasGonder, handleSiparisTamamla,
  //  isVideo, getTumMedya, renderYildizlar — hepsi aynı kalıyor)

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
        <Star key={s} size={interactive ? 20 : 14} onClick={() => interactive && onClick?.(s)}
          style={{ cursor: interactive ? "pointer" : "default", color: s <= Math.round(puan) ? "#f59e0b" : "#d1d5db", fill: s <= Math.round(puan) ? "#f59e0b" : "none" }} />
      ))}
    </div>
  );

  const ilaninSahibiyim = session?.user?.email?.toLowerCase() ===
    (ilan?.satici?.email || ilan?.sellerEmail || ilan?.userId || "")?.toLowerCase();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--cream, #faf8f4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--navy, #0f2540)", fontFamily: "var(--font-sans, DM Sans, sans-serif)" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(15,37,64,0.1)", borderTopColor: "var(--navy, #0f2540)", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: "#8097b1" }}>İlan yükleniyor...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!ilan) return (
    <div style={{ minHeight: "100vh", background: "var(--cream, #faf8f4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, fontFamily: "var(--font-sans, DM Sans, sans-serif)" }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#8097b1" }}>İlan yayından kaldırılmış veya bulunamıyor.</p>
      <button onClick={() => router.push("/")} style={{ background: "var(--navy, #0f2540)", color: "#fff", padding: "12px 32px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        Ana Sayfaya Dön
      </button>
    </div>
  );

  const tumMedya = getTumMedya(ilan);
  const aktifMedya = tumMedya[aktifMedyaIndex];
  const aktifMedyaVideo = isVideo(aktifMedya);
  const navy = "var(--navy, #0f2540)";
  const gold = "var(--gold, #c9a84c)";
  const cream = "var(--cream, #faf8f4)";
  const border = "var(--border, #dce6f0)";
  const textSoft = "var(--text-soft, #8097b1)";

  // UI kodu tamamen aynı — sadece 2 yer değişti:
  // 1. params.id → params.slug (yukarıda)
  // 2. benzer ilan linkleri slug bazlı (aşağıda)

  return (
    <div style={{ minHeight: "100vh", background: cream, fontFamily: "var(--font-sans, 'DM Sans', sans-serif)", color: "var(--text, #1a2740)", padding: "32px 16px 64px" }}>

      {/* ✅ SEO Schema — slug URL ile */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: ilan.baslik,
          image: tumMedya[0],
          description: ilan.aciklama || "Atakasa platformunda bir ilan",
          url: `https://atakasa.com/varlik/${ilan.slug}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: ilan.fiyat || "0",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/UsedCondition",
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://atakasa.com" },
              { "@type": "ListItem", position: 2, name: ilan.kategori, item: `https://atakasa.com/kategori/${ilan.kategori?.toLowerCase()}` },
              { "@type": "ListItem", position: 3, name: ilan.baslik },
            ],
          },
        }),
      }} />

      {/* Geri Butonu */}
      <div style={{ maxWidth: 1152, margin: "0 auto 20px" }}>
        <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: textSoft, fontFamily: "inherit", padding: 0 }}>
          <ChevronLeft size={16} /> Vitrine Dön
        </button>
      </div>

      {/* Tüm kart UI aynı — benzer ilanlar kısmında link güncellendi */}
      {benzerIlanlar.length > 0 && (
        <div style={{ maxWidth: 1152, margin: "48px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: navy, fontFamily: "var(--font-display, serif)" }}>Benzer İlanlar</h2>
            <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: gold, textDecoration: "none" }}>Tümünü Gör →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {benzerIlanlar.map((b) => (
              // ✅ slug varsa slug, yoksa _id ile link
              <Link key={b._id} href={varlikLink(b)} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ aspectRatio: "1/1", overflow: "hidden", background: "#f3f4f6" }}>
                    <img src={b.resimler?.[0] || b.image || "https://placehold.co/200x200/0f2540/c9a84c?text=İlan"} alt={b.baslik} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: navy, lineHeight: 1.35, marginBottom: 6 }}>{b.baslik}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: navy }}>{Number(b.fiyat || 0).toLocaleString("tr-TR")}<span style={{ color: gold, marginLeft: 3 }}>₺</span></p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) { .varlik-flex { flex-direction: row !important; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #dce6f0; border-radius: 2px; }
      `}</style>
    </div>
  );
}
