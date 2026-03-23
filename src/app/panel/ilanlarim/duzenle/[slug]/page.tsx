"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const KATEGORILER = [
  "Elektronik", "Emlak", "Araç", "2. El", "Sıfır Ürünler",
  "Mobilya", "Makine", "Tekstil", "Oyuncak", "El Sanatları",
  "Kitap", "Antika Eserler", "Kırtasiye", "Doğal Ürünler",
  "Kozmetik", "Petshop", "Oyun/Konsol",
];

const SEHIRLER = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya",
  "Adana", "Konya", "Gaziantep", "Kayseri", "Eskişehir",
  "Mersin", "Diyarbakır", "Samsun", "Trabzon", "Malatya",
];

export default function IlanDuzenle() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const [ilanId, setIlanId] = useState("");

  const [form, setForm] = useState({
    baslik: "",
    aciklama: "",
    fiyat: "",
    kategori: "",
    sehir: "",
    takasIstegi: false,
    resimler: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
      return;
    }
    if (status === "authenticated" && slug) {
      fetchIlan();
    }
  }, [status, slug]);

  const fetchIlan = async () => {
    try {
      setYukleniyor(true);
      const isId = /^[0-9a-f]{24}$/i.test(slug);
      const url = isId
        ? `/api/varliklar?id=${slug}`
        : `/api/varliklar?slug=${slug}`;

      const res = await fetch(url);
      const data = await res.json();
      const ilan = Array.isArray(data) ? data[0] : data;

      if (!ilan) {
        setHata("İlan bulunamadı.");
        return;
      }

      // Yetki kontrolü
      const saticiEmail = (ilan.satici?.email || ilan.sellerEmail || "").toLowerCase();
      if (saticiEmail !== session?.user?.email?.toLowerCase()) {
        setHata("Bu ilanı düzenleme yetkiniz yok.");
        return;
      }

      setIlanId(ilan._id);
      setForm({
        baslik: ilan.baslik || "",
        aciklama: ilan.aciklama || "",
        fiyat: String(ilan.fiyat || ""),
        kategori: ilan.kategori || "",
        sehir: ilan.sehir || "",
        takasIstegi: !!ilan.takasIstegi,
        resimler: Array.isArray(ilan.resimler) ? ilan.resimler : ilan.resimler ? [ilan.resimler] : [],
      });
    } catch {
      setHata("İlan yüklenemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.baslik.trim()) return setHata("Başlık zorunludur.");
    if (!form.fiyat || Number(form.fiyat) < 0) return setHata("Geçerli bir fiyat girin.");
    if (!form.kategori) return setHata("Kategori seçiniz.");

    setKaydediliyor(true);
    setHata("");
    setBasari("");

    try {
      const res = await fetch("/api/varliklar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ilanId,
          baslik: form.baslik.trim(),
          aciklama: form.aciklama.trim(),
          fiyat: Number(form.fiyat),
          kategori: form.kategori,
          sehir: form.sehir,
          takasIstegi: form.takasIstegi,
          resimler: form.resimler,
        }),
      });

      if (res.ok) {
        setBasari("✅ İlanınız başarıyla güncellendi!");
        setTimeout(() => router.push(`/varlik/${slug}`), 1500);
      } else {
        const err = await res.json();
        setHata(err.error || "Güncelleme başarısız.");
      }
    } catch {
      setHata("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setKaydediliyor(false);
    }
  };

  const handleResimEkle = () => {
    const url = prompt("Resim URL'si girin (Cloudinary veya direkt link):");
    if (url && url.trim()) {
      setForm(p => ({ ...p, resimler: [...p.resimler, url.trim()] }));
    }
  };

  const handleResimSil = (index: number) => {
    setForm(p => ({ ...p, resimler: p.resimler.filter((_, i) => i !== index) }));
  };

  if (yukleniyor) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p style={{ color: "#888" }}>İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (hata && !form.baslik) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: "#0f2540", fontWeight: 800, marginBottom: 8 }}>{hata}</h2>
        <a href="/panel" style={{ color: "#6c63ff", fontWeight: 700 }}>← Panele Dön</a>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <a href="/panel" style={{ color: "#6c63ff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            ← Panele Dön
          </a>
          <h1 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 900, color: "#0f2540", margin: 0 }}>
            ✏️ İlanı Düzenle
          </h1>
        </div>

        {/* Bildirimler */}
        {hata && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontWeight: 600, fontSize: 14 }}>
            ⚠️ {hata}
          </div>
        )}
        {basari && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#166534", fontWeight: 600, fontSize: 14 }}>
            {basari}
          </div>
        )}

        {/* FORM */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>

          {/* Başlık */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
              📝 İlan Başlığı *
            </label>
            <input
              type="text"
              value={form.baslik}
              onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))}
              placeholder="Örn: Samsung Galaxy S23 Ultra — Sıfır Ayarında"
              maxLength={100}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 600,
                outline: "none", boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{form.baslik.length}/100</p>
          </div>

          {/* Açıklama */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
              📋 Açıklama
            </label>
            <textarea
              value={form.aciklama}
              onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))}
              placeholder="Ürününüz hakkında detaylı bilgi verin..."
              rows={5}
              maxLength={2000}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: "2px solid #e5e7eb", fontSize: 14, resize: "vertical",
                outline: "none", boxSizing: "border-box", lineHeight: 1.6,
              }}
            />
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{form.aciklama.length}/2000</p>
          </div>

          {/* Fiyat + Kategori */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                💰 Fiyat (₺) *
              </label>
              <input
                type="number"
                value={form.fiyat}
                onChange={e => setForm(p => ({ ...p, fiyat: e.target.value }))}
                placeholder="0"
                min="0"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 700,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
                🏷️ Kategori *
              </label>
              <select
                value={form.kategori}
                onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 600,
                  outline: "none", background: "#fff", boxSizing: "border-box",
                }}
              >
                <option value="">Kategori Seçin</option>
                {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* Şehir */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 8, fontSize: 14 }}>
              📍 Şehir
            </label>
            <select
              value={form.sehir}
              onChange={e => setForm(p => ({ ...p, sehir: e.target.value }))}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: "2px solid #e5e7eb", fontSize: 14, fontWeight: 600,
                outline: "none", background: "#fff", boxSizing: "border-box",
              }}
            >
              <option value="">Şehir Seçin</option>
              {SEHIRLER.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Takas */}
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setForm(p => ({ ...p, takasIstegi: !p.takasIstegi }))}
              style={{
                width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                background: form.takasIstegi ? "#6c63ff" : "#e5e7eb",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
              aria-label="Takas toggle"
            >
              <span style={{
                position: "absolute", top: 3, left: form.takasIstegi ? 25 : 3,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </button>
            <div>
              <div style={{ fontWeight: 700, color: "#0f2540", fontSize: 14 }}>🔄 Takas Kabul Ediyorum</div>
              <div style={{ fontSize: 12, color: "#888" }}>Başka ürünlerle takas tekliflerine açık olun</div>
            </div>
          </div>

          {/* Resimler */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#0f2540", marginBottom: 12, fontSize: 14 }}>
              🖼️ Resimler
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {form.resimler.map((r, i) => (
                <div key={i} style={{ position: "relative", width: 90, height: 72, borderRadius: 10, overflow: "hidden", border: "2px solid #e5e7eb" }}>
                  <img src={r} alt={`Resim ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => handleResimSil(i)}
                    style={{
                      position: "absolute", top: 2, right: 2, width: 20, height: 20,
                      borderRadius: "50%", background: "rgba(220,38,38,0.9)", color: "#fff",
                      border: "none", fontSize: 11, fontWeight: 800, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleResimEkle}
                style={{
                  width: 90, height: 72, borderRadius: 10,
                  border: "2px dashed #c9a84c", background: "rgba(201,168,76,0.04)",
                  color: "#c9a84c", fontWeight: 700, fontSize: 12, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                }}
              >
                <span style={{ fontSize: 20 }}>+</span>
                Resim Ekle
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#999" }}>Cloudinary URL veya direkt resim linki ekleyebilirsiniz.</p>
          </div>

          {/* Kaydet */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handleSubmit}
              disabled={kaydediliyor}
              style={{
                flex: 1, minWidth: 160,
                background: kaydediliyor ? "#e5e7eb" : "linear-gradient(135deg,#6c63ff,#5a52d5)",
                color: kaydediliyor ? "#999" : "#fff",
                padding: "14px 24px", borderRadius: 14, fontWeight: 800,
                fontSize: 15, border: "none", cursor: kaydediliyor ? "not-allowed" : "pointer",
                boxShadow: kaydediliyor ? "none" : "0 4px 16px rgba(108,99,255,0.35)",
              }}
            >
              {kaydediliyor ? "⏳ Kaydediliyor..." : "✅ Değişiklikleri Kaydet"}
            </button>
            <button
              onClick={() => router.push(`/varlik/${slug}`)}
              style={{
                padding: "14px 24px", borderRadius: 14, fontWeight: 700,
                fontSize: 14, border: "2px solid #e5e7eb", background: "#fff",
                color: "#555", cursor: "pointer",
              }}
            >
              İptal
            </button>
          </div>

        </div>

        {/* Tehlikeli Alan — İlan Silme */}
        <div style={{
          marginTop: 24, background: "#fff", borderRadius: 20, padding: "20px 24px",
          border: "1px solid #fecaca",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>
            ⚠️ Tehlikeli Alan
          </h3>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
            İlanı silmek geri alınamaz. Tüm teklifler ve mesajlar da silinir.
          </p>
          <button
            onClick={async () => {
              if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
              try {
                const res = await fetch(`/api/varliklar?id=${ilanId}`, { method: "DELETE" });
                if (res.ok) {
                  alert("İlan silindi.");
                  router.push("/panel");
                } else {
                  alert("Silme işlemi başarısız.");
                }
              } catch {
                alert("Bağlantı hatası.");
              }
            }}
            style={{
              background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca",
              padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: "pointer",
            }}
          >
            🗑️ İlanı Sil
          </button>
        </div>

      </div>
    </div>
  );
}
