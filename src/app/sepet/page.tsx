"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Eye, ArrowLeft, ShieldCheck } from "lucide-react";

export default function Sepet() {
  const [sepetItems, setSepetItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const hafiza = JSON.parse(localStorage.getItem("atakasa_sepet") || "[]");
      setSepetItems(Array.isArray(hafiza) ? hafiza : []);
    } catch {
      setSepetItems([]);
    }
  }, []);

  const sepettenSil = (id: string) => {
    const yeni = sepetItems.filter((i) => i.id !== id);
    setSepetItems(yeni);
    localStorage.setItem("atakasa_sepet", JSON.stringify(yeni));
  };

  const toplamTutar = sepetItems.reduce((t, i) => t + Number(i.fiyat || 0), 0);

  const navy = "var(--navy, #0f2540)";
  const gold = "var(--gold, #c9a84c)";
  const cream = "var(--cream, #faf8f4)";
  const border = "var(--border, #dce6f0)";
  const white = "#ffffff";
  const textSoft = "var(--text-soft, #8097b1)";

  return (
    <div style={{
      minHeight: "100vh", background: cream,
      fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
      color: navy, padding: "32px 16px 80px",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: textSoft,
              fontFamily: "inherit", padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Vitrine Dön
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "var(--font-display, 'Playfair Display', serif)",
              fontSize: 26, fontWeight: 800, color: navy,
              letterSpacing: "-0.02em", margin: 0,
            }}>
              Sepetim<span style={{ color: gold }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: textSoft, margin: "4px 0 0" }}>
              Güvenli işlem sırasındaki varlıklar
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: white, border: `1px solid ${border}`,
            borderRadius: 10, padding: "6px 14px",
            fontSize: 12, fontWeight: 700, color: navy,
          }}>
            <ShoppingCart size={14} />
            {sepetItems.length} ürün
          </div>
        </div>

        {/* Boş Sepet */}
        {sepetItems.length === 0 ? (
          <div style={{
            background: white, border: `1.5px dashed ${border}`,
            borderRadius: 24, padding: "80px 24px",
            textAlign: "center",
          }}>
            <ShoppingCart size={52} style={{ color: border, margin: "0 auto 20px", display: "block" }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: navy, marginBottom: 8 }}>
              Sepetiniz şu an boş
            </p>
            <p style={{ fontSize: 13, color: textSoft, marginBottom: 28 }}>
              Beğendiğiniz ürünleri sepete ekleyerek buradan takip edebilirsiniz.
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 28px", background: navy, borderRadius: 12,
              fontSize: 13, fontWeight: 700, color: white, textDecoration: "none",
            }}>
              Piyasaya Dön
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

            {/* Ürün Listesi */}
            <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>
              {sepetItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: white, border: `1px solid ${border}`,
                    borderRadius: 18, padding: "16px 18px",
                    display: "flex", gap: 16, alignItems: "center",
                    boxShadow: "0 2px 8px rgba(15,37,64,0.06)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Görsel */}
                  <div style={{
                    width: 80, height: 80, borderRadius: 12, overflow: "hidden",
                    border: `1px solid ${border}`, flexShrink: 0, background: cream,
                  }}>
                    <img
                      src={item.resim || "https://placehold.co/80x80/0f2540/c9a84c?text=A"}
                      alt={item.baslik}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/80x80/0f2540/c9a84c?text=A"; }}
                    />
                  </div>

                  {/* Bilgi */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 700, color: navy,
                      margin: "0 0 6px", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.baslik}
                    </h3>
                    <p style={{ fontSize: 18, fontWeight: 800, color: navy, margin: 0 }}>
                      {Number(item.fiyat).toLocaleString("tr-TR")}
                      <span style={{ fontSize: 13, color: gold, marginLeft: 4 }}>₺</span>
                    </p>
                  </div>

                  {/* Butonlar */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => router.push(`/varlik/${item.id}?islem=satinal`)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "8px 14px", borderRadius: 10,
                        background: navy, border: "none",
                        fontSize: 11, fontWeight: 700, color: white,
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                      }}
                    >
                      <Eye size={13} /> İncele
                    </button>
                    <button
                      onClick={() => sepettenSil(item.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: 10,
                        background: "var(--danger-bg, #fdecea)",
                        border: "1px solid #f5c6c2",
                        cursor: "pointer", color: "var(--danger, #c0392b)",
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Özet Paneli */}
            <div style={{
              width: 280, flexShrink: 0, alignSelf: "flex-start",
              background: white, border: `1px solid ${border}`,
              borderRadius: 20, padding: "24px 22px",
              boxShadow: "0 4px 16px rgba(15,37,64,0.08)",
              position: "sticky", top: 80,
            }}>
              <h3 style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: textSoft,
                marginBottom: 18, paddingBottom: 14,
                borderBottom: `1px solid ${border}`,
              }}>
                Sepet Özeti
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: textSoft }}>Toplam Ürün</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: navy }}>{sepetItems.length} Adet</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${border}`,
              }}>
                <span style={{ fontSize: 13, color: textSoft }}>Toplam Tutar</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: navy, letterSpacing: "-0.02em" }}>
                  {toplamTutar.toLocaleString("tr-TR")}
                  <span style={{ fontSize: 14, color: gold, marginLeft: 4 }}>₺</span>
                </span>
              </div>

              {/* Güvenlik Notu */}
              <div style={{
                background: "var(--success-bg, #eaf5ee)",
                border: "1px solid #b8dfc6",
                borderRadius: 12, padding: "12px 14px",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <ShieldCheck size={15} style={{ color: "var(--success, #1a7a4a)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: "var(--success, #1a7a4a)", lineHeight: 1.5, margin: 0 }}>
                  İşlemler A-Takasa güvencesiyle korunur. Her ürün için "İncele" butonuna tıklayın.
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                style={{
                  width: "100%", marginTop: 16, padding: "12px",
                  background: "transparent", border: `1.5px solid ${border}`,
                  borderRadius: 12, fontFamily: "inherit",
                  fontSize: 12, fontWeight: 600, color: textSoft,
                  cursor: "pointer",
                }}
              >
                Alışverişe Devam Et
              </button>
            </div>

          </div>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 600px) {
          .sepet-flex { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
