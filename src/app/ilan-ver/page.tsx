"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, X, CheckCircle, Loader2, MapPin, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const sehirler = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın",
  "Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir",
  "Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş",
  "Karabük","Karaman","Kars","Kastamonu","Kayseri","Kırıkkale","Kırklareli","Kırşehir","Kilis","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye",
  "Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon",
  "Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

const kategoriler = [
  { grup: "🏢 EMLAK & GAYRİMENKUL", secenekler: [
    "Emlak - Konut", "Emlak - İşyeri & Mağaza", "Emlak - Arsa & Tarla",
  ]},
  { grup: "🚗 VASITA & MOBİLİTE", secenekler: [
    "Vasıta - Otomobil", "Vasıta - Motosiklet & Bisiklet", "Vasıta - Deniz & Diğer", "Vasıta - Yedek Parça",
  ]},
  { grup: "💻 ELEKTRONİK & TEKNOLOJİ", secenekler: [
    "Elektronik - Telefon", "Elektronik - Bilgisayar", "Elektronik - TV & Görüntü", "Elektronik - Oyun Konsolu",
  ]},
  { grup: "🛋️ EV, YAŞAM & BEYAZ EŞYA", secenekler: [
    "Ev - Mobilya & Tekstil", "Ev - Beyaz Eşya & Isıtıcı", "Ev - Dekorasyon & Banyo",
  ]},
  { grup: "⌚ MODA, SAAT & KOZMETİK", secenekler: [
    "Moda - Giyim & Ayakkabı", "Moda - Saat & Takı", "Kozmetik & Kişisel Bakım",
  ]},
  { grup: "🎨 ANTİKA, SANAT & HOBİ", secenekler: [
    "Sanat - Antika & El Sanatı", "Sanat - Özel Tasarım", "Hobi - Oyuncak & Kitap",
  ]},
  { grup: "⚙️ SANAYİ & DİĞER", secenekler: [
    "Sanayi - Makine & Nalbur", "Evcil Hayvan & Petshop", "Gıda & İçecek", "Diğer",
  ]},
];

const CLOUD_NAME = "diuamcnej";
const UPLOAD_PRESET = "atakasa_hizli";

// CSS değişkenleri
const navy = "var(--navy, #0f2540)";
const gold = "var(--gold, #c9a84c)";
const cream = "var(--cream, #faf8f4)";
const white = "#ffffff";
const border = "var(--border, #dce6f0)";
const textSoft = "var(--text-soft, #8097b1)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px",
  background: "#f5f7fa", border: `1.5px solid ${border}`,
  borderRadius: 12, fontFamily: "inherit", fontSize: 14,
  color: navy, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
  letterSpacing: "0.06em", color: textSoft, display: "block",
  marginBottom: 7,
};

export default function IlanVer() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "", deger: "", takasIstegi: "", kategori: "",
    ulke: "Türkiye", sehir: "", ilce: "", mahalle: "",
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) {
          alert(`${file.name} 100MB'tan büyük!`); continue;
        }
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
          method: "POST", body: data,
        });
        const result = await res.json();
        if (result.secure_url) uploadedUrls.push(result.secure_url);
        else alert("Yükleme hatası: " + (result.error?.message || "Bilinmeyen"));
      }
      setFormData(p => ({ ...p, images: [...p.images, ...uploadedUrls] }));
    } catch { alert("Bağlantı hatası."); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return alert("İşlem için giriş yapmalısınız!");
    if (formData.images.length === 0) return alert("En az bir görsel/video ekleyin!");
    if (!formData.kategori) return alert("Lütfen kategori seçin!");
    if (!formData.sehir) return alert("Lütfen şehir seçin!");
    setLoading(true);
    try {
      const res = await fetch("/api/varlik-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik: formData.title,
          fiyat: Number(formData.deger),
          kategori: formData.kategori,
          ulke: formData.ulke,
          sehir: formData.sehir,
          ilce: formData.ilce,
          mahalle: formData.mahalle,
          aciklama: formData.takasIstegi,
          resimler: formData.images,
          sellerEmail: session.user.email,
          satici: session.user.email,
          saticiEmail: session.user.email,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ title: "", deger: "", takasIstegi: "", kategori: "", ulke: "Türkiye", sehir: "", ilce: "", mahalle: "", images: [] });
      } else {
        const err = await res.json();
        alert(`Hata: ${err.message || err.error || "Bilinmeyen"}`);
      }
    } catch { alert("Bağlantı hatası."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: cream,
      fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
      color: navy, padding: "40px 16px 80px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Başlık */}
        <div style={{ marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display, 'Playfair Display', serif)",
              fontSize: 28, fontWeight: 800, color: navy,
              letterSpacing: "-0.02em", marginBottom: 4,
            }}>
              İlan Ver<span style={{ color: gold }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: textSoft }}>
              Varlığınızı platformda yayınlayın
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", background: white,
              border: `1px solid ${border}`, borderRadius: 10,
              fontSize: 12, fontWeight: 600, color: textSoft,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ← Vitrine Dön
          </button>
        </div>

        {/* Kart */}
        <div style={{
          background: white, border: `1px solid ${border}`,
          borderRadius: 24, padding: "32px 28px",
          boxShadow: "0 4px 24px rgba(15,37,64,0.08)",
        }}>

          {success ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <CheckCircle size={64} style={{ color: "#16a34a", margin: "0 auto 20px", display: "block" }} />
              <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, marginBottom: 8 }}>
                İlan Başarıyla Yayınlandı!
              </h2>
              <p style={{ fontSize: 14, color: textSoft, marginBottom: 28 }}>
                İlanınız Borsa Vitrini'nde görüntülenmeye başladı.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => setSuccess(false)}
                  style={{
                    padding: "12px 24px", background: white,
                    border: `1.5px solid ${border}`, borderRadius: 12,
                    fontSize: 13, fontWeight: 700, color: navy,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Yeni İlan Ver
                </button>
                <button
                  onClick={() => router.push("/")}
                  style={{
                    padding: "12px 24px", background: navy,
                    border: "none", borderRadius: 12,
                    fontSize: 13, fontWeight: 700, color: white,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Vitrine Git →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Başlık */}
              <div>
                <label style={labelStyle}>Kategori ve Ürün İsmi</label>
                <input
                  type="text" required
                  placeholder="Örn: Elektronik - MacBook Pro M3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = navy}
                  onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                />
              </div>

              {/* Fiyat + Kategori */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ilan-grid">
                <div>
                  <label style={labelStyle}>Tahmini Fiyat (₺)</label>
                  <input
                    type="text" inputMode="numeric" required
                    placeholder="Örn: 8750000"
                    value={formData.deger}
                    onChange={(e) => setFormData({ ...formData, deger: e.target.value.replace(/[^0-9]/g, "") })}
                    style={{ ...inputStyle, color: navy, fontWeight: 700 }}
                    onFocus={e => e.target.style.borderColor = navy}
                    onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                  />
                  {formData.deger && (
                    <p style={{ fontSize: 11, color: textSoft, marginTop: 5 }}>
                      Görünecek: <strong style={{ color: gold }}>
                        {Number(formData.deger).toLocaleString("tr-TR")} ₺
                      </strong>
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Ürün Kategorisi</label>
                  <select
                    required
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
                    onFocus={e => e.target.style.borderColor = navy}
                    onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                  >
                    <option value="" disabled>SEKTÖR SEÇİNİZ...</option>
                    {kategoriler.map(g => (
                      <optgroup key={g.grup} label={g.grup}>
                        {g.secenekler.map(s => (
                          <option key={s} value={s}>{s.split(" - ")[1] || s}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Konum */}
              <div style={{
                background: "#f5f7fa", border: `1px solid ${border}`,
                borderRadius: 16, padding: "20px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <MapPin size={16} style={{ color: gold }} />
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: navy }}>
                    Ürün Konumu
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="ilan-grid">
                  <div>
                    <label style={labelStyle}>Ülke</label>
                    <input
                      type="text" readOnly value="Türkiye"
                      style={{ ...inputStyle, color: textSoft, cursor: "not-allowed", background: "#eef3f8" }}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, color: navy }}>Şehir *</label>
                    <select
                      required value={formData.sehir}
                      onChange={(e) => setFormData({ ...formData, sehir: e.target.value })}
                      style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
                      onFocus={e => e.target.style.borderColor = navy}
                      onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                    >
                      <option value="" disabled>Seçiniz...</option>
                      {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>İlçe *</label>
                    <input
                      type="text" required placeholder="Örn: Muratpaşa"
                      value={formData.ilce}
                      onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = navy}
                      onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Mahalle / Semt</label>
                    <input
                      type="text" placeholder="Örn: Şirinyalı Mah."
                      value={formData.mahalle}
                      onChange={(e) => setFormData({ ...formData, mahalle: e.target.value })}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = navy}
                      onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                    />
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label style={labelStyle}>Açıklama / Takas Şartları</label>
                <textarea
                  required
                  placeholder="Ürünüzü detaylıca açıklayın. Takas şartlarınızı belirtin..."
                  value={formData.takasIstegi}
                  onChange={(e) => setFormData({ ...formData, takasIstegi: e.target.value })}
                  style={{
                    ...inputStyle, height: 120, resize: "none",
                    lineHeight: 1.6,
                  }}
                  onFocus={e => e.target.style.borderColor = navy}
                  onBlur={e => e.target.style.borderColor = "var(--border, #dce6f0)"}
                />
              </div>

              {/* Medya Yükleme */}
              <div>
                <label style={labelStyle}>Fotoğraf / Video</label>
                <input
                  type="file" accept="image/*,video/*" multiple
                  className="hidden" ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isUploading ? border : "#dce6f0"}`,
                    borderRadius: 16, padding: "32px 20px",
                    textAlign: "center", cursor: isUploading ? "not-allowed" : "pointer",
                    background: "#f9fafb", transition: "border-color 0.2s",
                    opacity: isUploading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!isUploading) (e.currentTarget as HTMLElement).style.borderColor = navy; }}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#dce6f0"}
                >
                  <div style={{
                    width: 52, height: 52, background: "#eef3f8",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 12px",
                  }}>
                    {isUploading
                      ? <Loader2 size={22} style={{ color: navy, animation: "spin 0.8s linear infinite" }} />
                      : <UploadCloud size={22} style={{ color: textSoft }} />
                    }
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 4 }}>
                    {isUploading ? "Yükleniyor..." : "Medya Yükle"}
                  </p>
                  <p style={{ fontSize: 11, color: textSoft }}>
                    Fotoğraf ve video desteklenir · Maksimum 100MB
                  </p>
                </div>

                {/* Önizleme */}
                {formData.images.length > 0 && (
                  <div style={{ display: "flex", gap: 10, marginTop: 14, overflowX: "auto", paddingBottom: 4 }}>
                    {formData.images.map((url, i) => (
                      <div key={i} style={{
                        position: "relative", width: 84, height: 84,
                        borderRadius: 12, overflow: "hidden",
                        border: `1.5px solid ${border}`, flexShrink: 0,
                        background: "#f3f4f6",
                      }}>
                        {url.includes(".mp4") || url.includes(".mov") || url.includes(".webm") ? (
                          <video src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                        ) : (
                          <img src={url} alt={`Medya ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                          style={{
                            position: "absolute", top: 4, right: 4,
                            width: 20, height: 20, background: "rgba(0,0,0,0.65)",
                            border: "none", borderRadius: "50%", color: white,
                            cursor: "pointer", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: 12, lineHeight: 1,
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={loading || isUploading || formData.images.length === 0}
                style={{
                  width: "100%", padding: "15px",
                  background: loading || isUploading || formData.images.length === 0
                    ? "#9ca3af" : gold,
                  border: "none", borderRadius: 14,
                  fontFamily: "inherit", fontSize: 14, fontWeight: 800,
                  color: navy, cursor: loading || isUploading || formData.images.length === 0
                    ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  letterSpacing: "0.02em", transition: "all 0.2s",
                  boxShadow: formData.images.length > 0 && !loading
                    ? "0 4px 16px rgba(201,168,76,0.35)" : "none",
                }}
              >
                <Zap size={16} />
                {loading ? "İlan Yayınlanıyor..." : isUploading ? "Medya Yükleniyor..." : "İlanı Yayınla"}
              </button>

            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          .ilan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
