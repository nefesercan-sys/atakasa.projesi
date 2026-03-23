"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SEKTOR_FORMLARI, SEKTOR_LISTESI, FormAlani } from "@/lib/sektorForms";

const SEHIRLER = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya",
  "Gaziantep", "Kayseri", "Eskişehir", "Mersin", "Diyarbakır", "Samsun",
  "Trabzon", "Malatya", "Denizli", "Kocaeli", "Sakarya", "Balıkesir", "Manisa",
];

const YILLAR = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));

interface IlanForm {
  baslik: string;
  aciklama: string;
  fiyat: string;
  sektor: string;
  altKategori: string;
  sehir: string;
  takasIstegi: boolean;
  resimler: string[];
  ozelAlanlar: Record<string, any>;
}

export default function IlanVerForm({ duzenlemeModu = false, mevcutIlan = null }: {
  duzenlemeModu?: boolean;
  mevcutIlan?: any;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [adim, setAdim] = useState(1); // 1: Sektör, 2: Detaylar, 3: Fiyat & Resim, 4: Önizleme
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");

  const [form, setForm] = useState<IlanForm>({
    baslik: mevcutIlan?.baslik || "",
    aciklama: mevcutIlan?.aciklama || "",
    fiyat: String(mevcutIlan?.fiyat || ""),
    sektor: mevcutIlan?.sektor || mevcutIlan?.kategori || "",
    altKategori: mevcutIlan?.altKategori || "",
    sehir: mevcutIlan?.sehir || "",
    takasIstegi: !!mevcutIlan?.takasIstegi,
    resimler: Array.isArray(mevcutIlan?.resimler) ? mevcutIlan.resimler : [],
    ozelAlanlar: mevcutIlan?.ozelAlanlar || {},
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status]);

  const secilenSektor = form.sektor ? SEKTOR_FORMLARI[form.sektor] : null;
  const aktifAlanlar: FormAlani[] = secilenSektor ? [
    ...secilenSektor.genelAlanlar,
    ...(form.altKategori && secilenSektor.altKategoriAlanlari?.[form.altKategori]
      ? secilenSektor.altKategoriAlanlari[form.altKategori]
      : []),
  ] : [];

  const setOzelAlan = useCallback((key: string, value: any) => {
    setForm(p => ({ ...p, ozelAlanlar: { ...p.ozelAlanlar, [key]: value } }));
  }, []);

  const toggleMultiselect = useCallback((key: string, item: string) => {
    setForm(p => {
      const mevcut: string[] = p.ozelAlanlar[key] || [];
      const yeni = mevcut.includes(item)
        ? mevcut.filter(x => x !== item)
        : [...mevcut, item];
      return { ...p, ozelAlanlar: { ...p.ozelAlanlar, [key]: yeni } };
    });
  }, []);

  const handleResimEkle = () => {
    const url = prompt("Resim URL'si girin (Cloudinary veya direkt link):");
    if (url?.trim()) setForm(p => ({ ...p, resimler: [...p.resimler, url.trim()] }));
  };

  // Adım 1 → 2 kontrolü
  const ilerleAdim1 = () => {
    if (!form.sektor) return setHata("Lütfen sektör seçin.");
    if (!form.altKategori) return setHata("Lütfen alt kategori seçin.");
    setHata(""); setAdim(2);
  };

  // Adım 2 → 3 kontrolü
  const ilerleAdim2 = () => {
    if (!form.baslik.trim()) return setHata("Başlık zorunludur.");
    const zorunluAlanlar = aktifAlanlar.filter(a => a.zorunlu);
    for (const alan of zorunluAlanlar) {
      const deger = form.ozelAlanlar[alan.key];
      if (!deger || (typeof deger === "string" && !deger.trim())) {
        return setHata(`"${alan.label}" alanı zorunludur.`);
      }
    }
    setHata(""); setAdim(3);
  };

  // Adım 3 → 4 kontrolü
  const ilerleAdim3 = () => {
    if (!form.fiyat || Number(form.fiyat) < 0) return setHata("Geçerli bir fiyat girin.");
    if (!form.sehir) return setHata("Şehir seçin.");
    setHata(""); setAdim(4);
  };

  const handleGonder = async () => {
    setYukleniyor(true);
    setHata("");
    try {
      const payload = {
        baslik: form.baslik.trim(),
        aciklama: form.aciklama.trim(),
        fiyat: Number(form.fiyat),
        kategori: form.altKategori || form.sektor,
        sektor: form.sektor,
        altKategori: form.altKategori,
        sehir: form.sehir,
        takasIstegi: form.takasIstegi,
        resimler: form.resimler,
        ozelAlanlar: form.ozelAlanlar,
        ...(duzenlemeModu && mevcutIlan?._id ? { id: mevcutIlan._id } : {}),
      };

      const res = await fetch("/api/varliklar", {
        method: duzenlemeModu ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setBasari(duzenlemeModu ? "✅ İlan güncellendi!" : "✅ İlanınız yayınlandı!");
        setTimeout(() => router.push(data.slug ? `/varlik/${data.slug}` : "/panel"), 1500);
      } else {
        const err = await res.json();
        setHata(err.error || "Bir hata oluştu.");
      }
    } catch {
      setHata("Bağlantı hatası.");
    } finally {
      setYukleniyor(false);
    }
  };

  const renderFormAlani = (alan: FormAlani) => {
    const deger = form.ozelAlanlar[alan.key] ?? "";
    const base: React.CSSProperties = {
      width: "100%", padding: "11px 14px", borderRadius: 10,
      border: "2px solid #e5e7eb", fontSize: 14, outline: "none",
      boxSizing: "border-box", fontFamily: "inherit",
    };

    switch (alan.tip) {
      case "select":
        return (
          <select value={deger} onChange={e => setOzelAlan(alan.key, e.target.value)} style={{ ...base, background: "#fff" }}>
            <option value="">Seçin...</option>
            {alan.secenekler?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        );

      case "multiselect":
        const secili: string[] = form.ozelAlanlar[alan.key] || [];
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {alan.secenekler?.map(s => (
              <button key={s} type="button"
                onClick={() => toggleMultiselect(alan.key, s)}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: secili.includes(s) ? "2px solid #6c63ff" : "2px solid #e5e7eb",
                  background: secili.includes(s) ? "#f0efff" : "#fff",
                  color: secili.includes(s) ? "#6c63ff" : "#555",
                }}
              >
                {secili.includes(s) ? "✓ " : ""}{s}
              </button>
            ))}
          </div>
        );

      case "boolean":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button"
              onClick={() => setOzelAlan(alan.key, !deger)}
              style={{
                width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                background: deger ? "#6c63ff" : "#e5e7eb", position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: deger ? 25 : 3, width: 20, height: 20,
                borderRadius: "50%", background: "#fff", transition: "left 0.2s",
              }} />
            </button>
            <span style={{ fontSize: 13, color: deger ? "#6c63ff" : "#888", fontWeight: 600 }}>
              {deger ? "Evet" : "Hayır"}
            </span>
          </div>
        );

      case "textarea":
        return (
          <textarea value={deger} onChange={e => setOzelAlan(alan.key, e.target.value)}
            placeholder={alan.placeholder} rows={3}
            style={{ ...base, resize: "vertical", lineHeight: 1.6 }}
          />
        );

      case "year":
        return (
          <select value={deger} onChange={e => setOzelAlan(alan.key, e.target.value)} style={{ ...base, background: "#fff" }}>
            <option value="">Yıl seçin</option>
            {YILLAR.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        );

      case "km":
      case "number":
        return (
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {alan.prefix && <span style={{ position: "absolute", left: 14, color: "#888", fontSize: 14 }}>{alan.prefix}</span>}
            <input type="number" value={deger} onChange={e => setOzelAlan(alan.key, e.target.value)}
              placeholder={alan.placeholder} min={alan.min ?? 0} max={alan.max}
              style={{ ...base, paddingLeft: alan.prefix ? 28 : 14, paddingRight: alan.suffix ? 48 : 14 }}
            />
            {alan.suffix && <span style={{ position: "absolute", right: 14, color: "#888", fontSize: 13 }}>{alan.suffix}</span>}
          </div>
        );

      default:
        return (
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input type="text" value={deger} onChange={e => setOzelAlan(alan.key, e.target.value)}
              placeholder={alan.placeholder}
              style={{ ...base, paddingRight: alan.suffix ? 48 : 14 }}
            />
            {alan.suffix && <span style={{ position: "absolute", right: 14, color: "#888", fontSize: 13 }}>{alan.suffix}</span>}
          </div>
        );
    }
  };

  if (status === "loading") return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 36 }}>⏳</div><p style={{ color: "#888" }}>Yükleniyor...</p></div>
    </div>
  );

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* BAŞLIK */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#0f2540", marginBottom: 6 }}>
            {duzenlemeModu ? "✏️ İlanı Düzenle" : "📢 Ücretsiz İlan Ver"}
          </h1>
          <p style={{ color: "#888", fontSize: 14 }}>
            {duzenlemeModu ? "İlanınızı güncelleyin" : "Türkiye'nin en büyük takas & satış platformunda ilanını ver, hemen kazan!"}
          </p>
        </div>

        {/* ADIM GÖSTERGESİ */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {[
            { n: 1, label: "Sektör" },
            { n: 2, label: "Detaylar" },
            { n: 3, label: "Fiyat & Resim" },
            { n: 4, label: "Önizleme" },
          ].map((a, i) => (
            <div key={a.n} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 800, fontSize: 14,
                  background: adim === a.n ? "#6c63ff" : adim > a.n ? "#22c55e" : "#f3f4f6",
                  color: adim >= a.n ? "#fff" : "#888",
                  boxShadow: adim === a.n ? "0 2px 10px rgba(108,99,255,0.4)" : "none",
                }}>
                  {adim > a.n ? "✓" : a.n}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: adim === a.n ? "#6c63ff" : "#888", marginTop: 4, textAlign: "center" }}>
                  {a.label}
                </span>
              </div>
              {i < 3 && <div style={{ width: 32, height: 2, background: adim > a.n ? "#22c55e" : "#e5e7eb", flexShrink: 0 }} />}
            </div>
          ))}
        </div>

        {/* BİLDİRİMLER */}
        {hata && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontWeight: 600, fontSize: 14 }}>
            ⚠️ {hata}
          </div>
        )}
        {basari && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#166534", fontWeight: 700, fontSize: 14 }}>
            {basari}
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* ADIM 1: SEKTÖR SEÇİMİ */}
        {/* ══════════════════════════════════════════════ */}
        {adim === 1 && (
          <div>
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2540", marginBottom: 18 }}>1️⃣ Sektör Seçin</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                {SEKTOR_LISTESI.map(s => (
                  <button key={s.key} type="button"
                    onClick={() => setForm(p => ({ ...p, sektor: s.key, altKategori: "" }))}
                    style={{
                      padding: "14px 12px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: form.sektor === s.key ? "linear-gradient(135deg,#6c63ff,#5a52d5)" : "#f8f9fb",
                      color: form.sektor === s.key ? "#fff" : "#0f2540",
                      fontWeight: 700, fontSize: 13, textAlign: "center",
                      boxShadow: form.sektor === s.key ? "0 4px 14px rgba(108,99,255,0.35)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
                    {s.ad}
                  </button>
                ))}
              </div>
            </div>

            {/* Alt Kategori */}
            {secilenSektor && (
              <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2540", marginBottom: 16 }}>
                  {secilenSektor.emoji} Alt Kategori Seçin
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {secilenSektor.altKategoriler.map(ak => (
                    <button key={ak} type="button"
                      onClick={() => setForm(p => ({ ...p, altKategori: ak }))}
                      style={{
                        padding: "8px 18px", borderRadius: 20, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        border: form.altKategori === ak ? "2px solid #6c63ff" : "2px solid #e5e7eb",
                        background: form.altKategori === ak ? "#f0efff" : "#fff",
                        color: form.altKategori === ak ? "#6c63ff" : "#555",
                        transition: "all 0.15s",
                      }}
                    >
                      {form.altKategori === ak ? "✓ " : ""}{ak}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={ilerleAdim1}
              disabled={!form.sektor || !form.altKategori}
              style={{
                width: "100%", padding: "15px", borderRadius: 14, fontWeight: 800, fontSize: 15,
                background: form.sektor && form.altKategori ? "linear-gradient(135deg,#6c63ff,#5a52d5)" : "#e5e7eb",
                color: form.sektor && form.altKategori ? "#fff" : "#999",
                border: "none", cursor: form.sektor && form.altKategori ? "pointer" : "not-allowed",
                boxShadow: form.sektor && form.altKategori ? "0 4px 16px rgba(108,99,255,0.35)" : "none",
              }}
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* ADIM 2: İLAN DETAYLARI */}
        {/* ══════════════════════════════════════════════ */}
        {adim === 2 && (
          <div>
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 24 }}>{secilenSektor?.emoji}</span>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2540", margin: 0 }}>
                    2️⃣ {secilenSektor?.ad} — {form.altKategori} Detayları
                  </h2>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Bu kategoriye özel alanlar</p>
                </div>
              </div>

              {/* Başlık */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                  📝 İlan Başlığı <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" value={form.baslik}
                  onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))}
                  placeholder={`Örn: ${secilenSektor?.emoji} ${form.altKategori} ilanı başlığı`}
                  maxLength={100}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{form.baslik.length}/100</p>
              </div>

              {/* Sektöre Özel Alanlar */}
              {aktifAlanlar.map(alan => (
                <div key={alan.key} style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                    {alan.label}
                    {alan.zorunlu && <span style={{ color: "#ef4444" }}> *</span>}
                  </label>
                  {renderFormAlani(alan)}
                  {alan.ipucu && (
                    <p style={{ fontSize: 11, color: "#6c63ff", marginTop: 4 }}>💡 {alan.ipucu}</p>
                  )}
                </div>
              ))}

              {/* Açıklama */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                  📋 Detaylı Açıklama
                </label>
                <textarea value={form.aciklama}
                  onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))}
                  placeholder="Ürün hakkında alıcıları ikna edecek detayları yazın..."
                  rows={5} maxLength={2000}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                />
                <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{form.aciklama.length}/2000</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAdim(1)}
                style={{ flex: "0 0 100px", padding: "14px", borderRadius: 14, fontWeight: 700, fontSize: 14, border: "2px solid #e5e7eb", background: "#fff", color: "#555", cursor: "pointer" }}>
                ← Geri
              </button>
              <button onClick={ilerleAdim2}
                style={{ flex: 1, padding: "14px", borderRadius: 14, fontWeight: 800, fontSize: 15, background: "linear-gradient(135deg,#6c63ff,#5a52d5)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(108,99,255,0.35)" }}>
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* ADIM 3: FİYAT, ŞEHİR, RESİM */}
        {/* ══════════════════════════════════════════════ */}
        {adim === 3 && (
          <div>
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2540", marginBottom: 20 }}>3️⃣ Fiyat, Şehir & Resimler</h2>

              {/* Fiyat */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                  💰 Fiyat <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input type="number" value={form.fiyat}
                    onChange={e => setForm(p => ({ ...p, fiyat: e.target.value }))}
                    placeholder="0" min="0"
                    style={{ width: "100%", padding: "13px 50px 13px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 18, fontWeight: 800, outline: "none", boxSizing: "border-box" }}
                  />
                  <span style={{ position: "absolute", right: 14, fontSize: 16, fontWeight: 800, color: "#0f2540" }}>₺</span>
                </div>
              </div>

              {/* Şehir */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                  📍 Şehir <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select value={form.sehir} onChange={e => setForm(p => ({ ...p, sehir: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }}>
                  <option value="">Şehir seçin</option>
                  {SEHIRLER.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Takas */}
              <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 14, background: "#f8f9fb", borderRadius: 12, padding: "14px 16px" }}>
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, takasIstegi: !p.takasIstegi }))}
                  style={{
                    width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
                    background: form.takasIstegi ? "#6c63ff" : "#e5e7eb",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 4, left: form.takasIstegi ? 28 : 4,
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </button>
                <div>
                  <div style={{ fontWeight: 800, color: "#0f2540", fontSize: 14 }}>🔄 Takas Kabul Ediyorum</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {form.takasIstegi ? "✅ Takas tekliflerine açıksınız" : "Başka ürünlerle takas tekliflerine açık olun"}
                  </div>
                </div>
              </div>

              {/* Resimler */}
              <div>
                <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 12, fontSize: 14 }}>
                  🖼️ Resimler
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 500, marginLeft: 8 }}>({form.resimler.length}/10)</span>
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {form.resimler.map((r, i) => (
                    <div key={i} style={{ position: "relative", width: 96, height: 76, borderRadius: 10, overflow: "hidden", border: "2px solid #e5e7eb" }}>
                      <img src={r} alt={`Resim ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {i === 0 && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(108,99,255,0.85)", color: "#fff", fontSize: 10, fontWeight: 700, textAlign: "center", padding: "2px" }}>
                          ANA
                        </div>
                      )}
                      <button onClick={() => setForm(p => ({ ...p, resimler: p.resimler.filter((_, idx) => idx !== i) }))}
                        style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "rgba(220,38,38,0.9)", color: "#fff", border: "none", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✕
                      </button>
                    </div>
                  ))}
                  {form.resimler.length < 10 && (
                    <button onClick={handleResimEkle}
                      style={{ width: 96, height: 76, borderRadius: 10, border: "2px dashed #c9a84c", background: "rgba(201,168,76,0.04)", color: "#c9a84c", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <span style={{ fontSize: 22 }}>+</span>
                      Resim Ekle
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>💡 İlk resim ana fotoğraf olarak gösterilir. Cloudinary URL veya direkt link.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAdim(2)}
                style={{ flex: "0 0 100px", padding: "14px", borderRadius: 14, fontWeight: 700, fontSize: 14, border: "2px solid #e5e7eb", background: "#fff", color: "#555", cursor: "pointer" }}>
                ← Geri
              </button>
              <button onClick={ilerleAdim3}
                style={{ flex: 1, padding: "14px", borderRadius: 14, fontWeight: 800, fontSize: 15, background: "linear-gradient(135deg,#6c63ff,#5a52d5)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(108,99,255,0.35)" }}>
                Önizlemeye Geç →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* ADIM 4: ÖNİZLEME & YAYINLA */}
        {/* ══════════════════════════════════════════════ */}
        {adim === 4 && (
          <div>
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2540", marginBottom: 20 }}>4️⃣ Önizleme — İlanınız böyle görünecek</h2>

              {/* Önizleme Kartı */}
              <div style={{ border: "2px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
                {form.resimler[0] && (
                  <img src={form.resimler[0]} alt="Önizleme"
                    style={{ width: "100%", height: 220, objectFit: "cover" }} />
                )}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ background: "#f0efff", color: "#6c63ff", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      🏷️ {form.altKategori || form.sektor}
                    </span>
                    {form.sehir && (
                      <span style={{ background: "#f3f4f6", color: "#555", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                        📍 {form.sehir}
                      </span>
                    )}
                    {form.takasIstegi && (
                      <span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        🔄 Takas İsteniyor
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f2540", marginBottom: 10 }}>{form.baslik || "Başlık girilmedi"}</h3>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0f2540", marginBottom: 14 }}>
                    {Number(form.fiyat || 0).toLocaleString("tr-TR")} ₺
                  </div>

                  {/* Özel Alanlar Özeti */}
                  {Object.keys(form.ozelAlanlar).length > 0 && (
                    <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {aktifAlanlar.filter(a => form.ozelAlanlar[a.key] && form.ozelAlanlar[a.key] !== false).map(alan => {
                          const deger = form.ozelAlanlar[alan.key];
                          const gosterim = Array.isArray(deger) ? deger.join(", ") : deger === true ? "Evet" : String(deger);
                          return (
                            <div key={alan.key} style={{ fontSize: 12 }}>
                              <span style={{ color: "#888", fontWeight: 600 }}>{alan.label}: </span>
                              <span style={{ color: "#0f2540", fontWeight: 700 }}>{gosterim}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {form.aciklama && (
                    <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
                      {form.aciklama.slice(0, 200)}{form.aciklama.length > 200 ? "..." : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Uyarı */}
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginTop: 16 }}>
                <p style={{ fontSize: 13, color: "#92400e", fontWeight: 600, margin: 0 }}>
                  ✅ İlanınız yayınlanmadan önce kontrol edin. Yayınlanan ilanlar A-Takasa kurallarına tabi olup uygunsuz içerikler kaldırılır.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAdim(3)}
                style={{ flex: "0 0 100px", padding: "14px", borderRadius: 14, fontWeight: 700, fontSize: 14, border: "2px solid #e5e7eb", background: "#fff", color: "#555", cursor: "pointer" }}>
                ← Geri
              </button>
              <button onClick={handleGonder} disabled={yukleniyor}
                style={{
                  flex: 1, padding: "15px", borderRadius: 14, fontWeight: 900, fontSize: 16,
                  background: yukleniyor ? "#e5e7eb" : "linear-gradient(135deg,#c9a84c,#d4a017)",
                  color: yukleniyor ? "#999" : "#0f2540",
                  border: "none", cursor: yukleniyor ? "not-allowed" : "pointer",
                  boxShadow: yukleniyor ? "none" : "0 4px 20px rgba(201,168,76,0.4)",
                }}>
                {yukleniyor ? "⏳ Yayınlanıyor..." : duzenlemeModu ? "✅ Güncelle" : "🚀 İlanı Yayınla!"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
