"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Share2, ShoppingCart, ArrowLeft, MapPin, Calendar, Tag, Shield, MessageCircle } from "lucide-react";

function optimizeCloudinary(url: string, w = 800, h = 600): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_") || url.includes("/upload/q_")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w},h_${h},c_fill/`);
}

export default function IlanDetayPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifGorsel, setAktifGorsel] = useState(0);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulZirh, setKabulZirh] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/varliklar/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const d = Array.isArray(data) ? data[0] : data;
        setIlan(d);
        setLoading(false);
        if (d) {
          document.title = `${d.baslik} | ${d.sehir || "Türkiye"} — A-TAKASA`;
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/varliklar?email=${session.user.email}`)
        .then((r) => r.json())
        .then((data) => {
          const liste = Array.isArray(data) ? data : data.ilanlar || data.data || [];
          setBenimIlanlarim(liste.filter((i: any) =>
            (i.satici?.email || i.sellerEmail || "").toLowerCase() === session.user!.email!.toLowerCase()
          ));
        })
        .catch(() => {});
    }
  }, [session]);

  const gorseller: string[] = ilan
    ? (Array.isArray(ilan.resimler) ? ilan.resimler : []).filter((u: string) => typeof u === "string" && u.length > 5)
    : [];
  if (gorseller.length === 0 && ilan) gorseller.push("https://placehold.co/800x600/1e3a5f/c9a84c?text=A-TAKASA");

  const isVideo = (url: string) =>
    url.includes(".mp4") || url.includes(".mov") || url.includes(".webm");

  const handleShare = async () => {
    const url = `https://atakasa.com/varlik/${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: ilan?.baslik, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      alert("Bağlantı kopyalandı!");
    }
  };

  const handleSepeteEkle = () => {
    try {
      const sepet = JSON.parse(localStorage.getItem("atakasa_sepet") || "[]");
      if (sepet.find((i: any) => i.id === id)) return alert("Zaten sepetinizde!");
      sepet.push({ id, baslik: ilan.baslik, fiyat: Number(ilan.fiyat), resim: gorseller[0], saticiMail: ilan.satici?.email || ilan.sellerEmail || "" });
      localStorage.setItem("atakasa_sepet", JSON.stringify(sepet));
      alert("Sepete eklendi!");
    } catch { localStorage.removeItem("atakasa_sepet"); }
  };

  const handleMesajGonder = () => {
    if (!session) return router.push("/giris");
    router.push(`/panel?yeniSohbet=${id}`);
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Takas edeceğiniz ürünü seçin.");
    const [teklifId, teklifBaslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: ilan.satici?.email || ilan.sellerEmail,
          hedefIlanId: id, hedefIlanBaslik: ilan.baslik, hedefIlanFiyat: ilan.fiyat,
          teklifEdilenIlanId: teklifId, teklifEdilenIlanBaslik: teklifBaslik,
          eklenenNakit: eklenecekNakit || 0, durum: "bekliyor",
        }),
      });
      if (res.ok) { alert("Takas teklifiniz gönderildi!"); setModalTuru(null); }
      else alert("Hata oluştu.");
    } catch { alert("Bağlantı hatası."); }
  };

  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon)
      return alert("Tüm alanları doldurun.");
    if (!kabulSozlesme || !kabulZirh) return alert("Sözleşmeleri onaylayın.");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id, sellerEmail: ilan.satici?.email || ilan.sellerEmail,
          adSoyad: siparisForm.adSoyad, telefon: siparisForm.telefon,
          adres: siparisForm.adres, odemeYontemi: siparisForm.odemeYontemi,
          fiyat: ilan.fiyat, durum: "bekliyor",
        }),
      });
      if (res.ok) { alert("Siparişiniz alındı!"); setModalTuru(null); }
      else alert("Sipariş alınamadı.");
    } catch { alert("Bağlantı hatası."); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e8edf3", borderTopColor: "#0f2540", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#8097b1", fontSize: 14 }}>İlan yükleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!ilan) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "sans-serif" }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: "#0f2540" }}>İlan bulunamadı</p>
      <button onClick={() => router.push("/")} style={{ padding: "10px 24px", background: "#0f2540", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
        Ana Sayfaya Dön
      </button>
    </div>
  );

  const saticiEmail = (ilan.satici?.email || ilan.sellerEmail || "").toLowerCase();
  const benimIlanim = session?.user?.email?.toLowerCase() === saticiEmail;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 }}>

      {/* Breadcrumb + Geri */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8edf3", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#5a6a7e", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <span style={{ color: "#dce6f0" }}>|</span>
        <nav style={{ fontSize: 12, color: "#8097b1", display: "flex", gap: 6, alignItems: "center" }}>
          <a href="/" style={{ color: "#8097b1", textDecoration: "none" }}>Ana Sayfa</a>
          <span>›</span>
          <a href={`/kategori/${(ilan.kategori || "diger").toLowerCase().replace(/\s/g, "-")}`}
            style={{ color: "#8097b1", textDecoration: "none" }}>{ilan.kategori || "İlanlar"}</a>
          <span>›</span>
          <span style={{ color: "#0f2540", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{ilan.baslik}</span>
        </nav>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* SOL: Görseller */}
          <div style={{ gridColumn: "1 / 2" }}>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #e8edf3", aspectRatio: "4/3", position: "relative" }}>
              {isVideo(gorseller[aktifGorsel]) ? (
                <video src={gorseller[aktifGorsel]} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <img
                  src={optimizeCloudinary(gorseller[aktifGorsel], 800, 600)}
                  alt={ilan.baslik}
                  fetchPriority="high"
                  loading="eager"
                  width={800} height={600}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x600/1e3a5f/c9a84c?text=A-TAKASA"; }}
                />
              )}
            </div>

            {gorseller.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
                {gorseller.map((g, i) => (
                  <div key={i} onClick={() => setAktifGorsel(i)} style={{
                    width: 72, height: 72, borderRadius: 10, overflow: "hidden",
                    border: `2px solid ${aktifGorsel === i ? "#0f2540" : "#e8edf3"}`,
                    cursor: "pointer", flexShrink: 0,
                  }}>
                    {isVideo(g) ? (
                      <video src={g} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <img src={optimizeCloudinary(g, 144, 144)} alt="" width={72} height={72}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/72x72/1e3a5f/c9a84c?text=?"; }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: Bilgiler */}
          <div style={{ gridColumn: "2 / 3" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e8edf3" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {ilan.kategori || "Genel"}
              </span>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2540", marginTop: 8, marginBottom: 16, lineHeight: 1.3 }}>
                {ilan.baslik}
              </h1>

              <div style={{ fontSize: 32, fontWeight: 900, color: "#0f2540", letterSpacing: "-0.03em", marginBottom: 20 }}>
                {Number(ilan.fiyat || 0).toLocaleString("tr-TR")} ₺
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {ilan.sehir && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5a6a7e" }}>
                    <MapPin size={15} style={{ color: "#c9a84c" }} />
                    {ilan.sehir}{ilan.ilce ? `, ${ilan.ilce}` : ""}
                  </div>
                )}
                {ilan.createdAt && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5a6a7e" }}>
                    <Calendar size={15} style={{ color: "#c9a84c" }} />
                    {new Date(ilan.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#5a6a7e" }}>
                  <Shield size={15} style={{ color: "#22c55e" }} />
                  Siber Kalkan Korumalı İşlem
                </div>
              </div>

              {!benimIlanim && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  <button onClick={() => { if (!session) router.push("/giris"); else setModalTuru("satinal"); }}
                    style={{ padding: "15px", background: "#0f2540", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                    Satın Al
                  </button>
                  <button onClick={() => { if (!session) router.push("/giris"); else setModalTuru("takas"); }}
                    style={{ padding: "14px", background: "transparent", color: "#0f2540", border: "2px solid #0f2540", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                    🔄 Takas Teklifi Gönder
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button onClick={handleMesajGonder}
                      style={{ padding: "11px", background: "#f0f4f8", color: "#0f2540", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <MessageCircle size={15} /> Mesaj At
                    </button>
                    <button onClick={handleSepeteEkle}
                      style={{ padding: "11px", background: "#f0f4f8", color: "#0f2540", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <ShoppingCart size={15} /> Sepete Ekle
                    </button>
                  </div>
                </div>
              )}

              {benimIlanim && (
                <div style={{ padding: "14px 18px", background: "#f0f4f8", borderRadius: 12, fontSize: 13, color: "#5a6a7e", fontWeight: 600, marginBottom: 20 }}>
                  Bu sizin ilanınız.
                  <button onClick={() => router.push("/panel")} style={{ marginLeft: 8, color: "#0f2540", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>
                    Panelde Yönet
                  </button>
                </div>
              )}

              <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#8097b1", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                <Share2 size={15} /> İlanı Paylaş
              </button>
            </div>
          </div>
        </div>

        {/* Açıklama */}
        {ilan.aciklama && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e8edf3", marginTop: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f2540", marginBottom: 14 }}>İlan Açıklaması</h2>
            <p style={{ color: "#5a6a7e", lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>{ilan.aciklama}</p>
          </div>
        )}

        {/* Güvenlik Bilgisi */}
        <div style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: 20, padding: 24, border: "1px solid #bae6fd", marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0369a1", marginBottom: 8 }}>🛡️ A-TAKASA Güvencesi</h3>
          <p style={{ fontSize: 13, color: "#0369a1", lineHeight: 1.7 }}>
            Ödemeniz, ürün teslim edildiğini onaylayana kadar güvenli havuzda bekler.
            Takas anlaşmazlıklarında platformumuz arabuluculuk yapar.
            Tüm işlemler A-TAKASA güvencesi altındadır.
          </p>
        </div>
      </div>

      {/* Takas / Satın Al Modal */}
      {modalTuru && (
        <div onClick={() => setModalTuru(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,37,64,0.65)", backdropFilter: "blur(6px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2540" }}>
                {modalTuru === "takas" ? "🔄 Takas Teklifi" : "✓ Güvenli Satın Al"}
              </h2>
              <button onClick={() => setModalTuru(null)} style={{ background: "#f5f7fa", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", background: "#f8fafc", padding: 14, borderRadius: 14, marginBottom: 20 }}>
              <img src={optimizeCloudinary(gorseller[0], 80, 80)} alt={ilan.baslik} width={64} height={64}
                style={{ borderRadius: 10, objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64/1e3a5f/c9a84c?text=?"; }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#0f2540", marginBottom: 4 }}>{ilan.baslik}</p>
                <p style={{ fontWeight: 900, fontSize: 20, color: "#0f2540" }}>{Number(ilan.fiyat).toLocaleString("tr-TR")} ₺</p>
              </div>
            </div>

            {modalTuru === "takas" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5a6a7e", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                    Vereceğiniz Varlık
                  </label>
                  <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", background: "#f5f7fa", border: "1.5px solid #e0e8f0", borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none" }}>
                    <option value="">-- İlanlarınızdan seçin --</option>
                    {benimIlanlarim.map((b) => <option key={b._id} value={`${b._id}|${b.baslik}`}>{b.baslik}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5a6a7e", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                    Üste Nakit (₺) — İsteğe Bağlı
                  </label>
                  <input type="number" placeholder="Örn: 5000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", background: "#f5f7fa", border: "1.5px solid #e0e8f0", borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim}
                  style={{ padding: "15px", background: !secilenBenimIlanim ? "#e0e8f0" : "#0f2540", color: !secilenBenimIlanim ? "#8097b1" : "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: secilenBenimIlanim ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                  Takas Teklifini Gönder →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "adSoyad", placeholder: "Ad Soyad", type: "text", auto: "name" },
                  { key: "telefon", placeholder: "Telefon", type: "tel", auto: "tel" },
                ].map((f) => (
                  <input key={f.key} type={f.type} placeholder={f.placeholder} autoComplete={f.auto}
                    value={(siparisForm as any)[f.key]} onChange={(e) => setSiparisForm({ ...siparisForm, [f.key]: e.target.value })}
                    style={{ padding: "12px 14px", background: "#f5f7fa", border: "1.5px solid #e0e8f0", borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
                ))}
                <textarea placeholder="Teslimat Adresi" autoComplete="street-address"
                  value={siparisForm.adres} onChange={(e) => setSiparisForm({ ...siparisForm, adres: e.target.value })} rows={3}
                  style={{ padding: "12px 14px", background: "#f5f7fa", border: "1.5px solid #e0e8f0", borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none", resize: "none" }} />
                <select value={siparisForm.odemeYontemi} onChange={(e) => setSiparisForm({ ...siparisForm, odemeYontemi: e.target.value })}
                  style={{ padding: "12px 14px", background: "#f5f7fa", border: "1.5px solid #e0e8f0", borderRadius: 10, fontFamily: "inherit", fontSize: 13, outline: "none" }}>
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                </select>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#f8fafc", padding: 14, borderRadius: 12 }}>
                  {[
                    { key: "sozlesme", label: "📄 Kullanıcı Sözleşmesi'ni okudum, kabul ediyorum.", val: kabulSozlesme, set: setKabulSozlesme },
                    { key: "zirh", label: "🛡️ Siber Kalkan: ödeme teslimat sonrası aktarılır.", val: kabulZirh, set: setKabulZirh },
                  ].map((cb) => (
                    <label key={cb.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 12, color: "#5a6a7e" }}>
                      <input type="checkbox" checked={cb.val} onChange={(e) => cb.set(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                      {cb.label}
                    </label>
                  ))}
                </div>
                <button onClick={handleSiparisTamamla}
                  style={{ padding: "15px", background: "#0f2540", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  ✓ Güvenli Ödemeyi Tamamla
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridColumn: 2 / 3"] {
            grid-column: 1 !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
