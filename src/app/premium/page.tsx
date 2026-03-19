"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PLANLAR } from "@/lib/planlar";

export default function PremiumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [odemeModeli, setOdemeModeli] = useState<"aylik" | "yillik">("aylik");
  const [ucretliAktif, setUcretliAktif] = useState(false);
  const [toplamUye, setToplamUye] = useState(0);
  const [kalanUye, setKalanUye] = useState(10000);
  const [mevcutPlan, setMevcutPlan] = useState("ucretsiz");
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    fetch("/api/uyelik/kontrol")
      .then(r => r.json())
      .then(d => {
        setUcretliAktif(d.ucretliSistemAktif);
        setToplamUye(d.toplamUye);
        setKalanUye(d.kalanUye);
        setMevcutPlan(d.plan);
      })
      .catch(() => {});
  }, []);

  const handleYukselt = async (plan: string) => {
    if (!session) return router.push("/giris");
    if (plan === "ucretsiz") return;
    setYukleniyor(true);
    try {
      const res = await fetch("/api/uyelik/yukselt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, odemeModeli }),
      });
      if (res.ok) {
        alert("✅ Planınız güncellendi!");
        router.refresh();
      }
    } catch {}
    setYukleniyor(false);
  };

  const ilerlemeYuzdesi = Math.min((toplamUye / 10000) * 100, 100);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 120px" }}>

      {/* BAŞLIK */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-block", background: "rgba(201,168,76,.15)",
          border: "1px solid rgba(201,168,76,.3)", color: "#c9a84c",
          padding: "6px 16px", borderRadius: 99, fontSize: ".78rem",
          fontWeight: 700, marginBottom: 16,
        }}>
          💎 Premium Üyelik
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#0f2540", marginBottom: 12 }}>
          Daha Fazla Kazan, Daha Hızlı Büyü
        </h1>
        <p style={{ color: "#475569", fontSize: "1.05rem", maxWidth: 560, margin: "0 auto" }}>
          10.000 üyeye ulaşana kadar tüm özellikler ücretsiz.
          Erken üye ol, fiyat kilitlensin!
        </p>
      </div>

      {/* 10.000 ÜYE SAYACI */}
      {!ucretliAktif && (
        <div style={{
          background: "linear-gradient(135deg, #0f2540, #1e3a8a)",
          borderRadius: 20, padding: 32, marginBottom: 48, color: "#fff",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🎯</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>
            Ücretli Sisteme {kalanUye.toLocaleString("tr-TR")} Üye Kaldı!
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", marginBottom: 24 }}>
            {toplamUye.toLocaleString("tr-TR")} / 10.000 üyeye ulaşıldığında ücretli sistem devreye girecek.
            Şu an ücretsiz kayıt ol, erken üye fiyatını kilitle!
          </p>
          {/* İlerleme çubuğu */}
          <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 99, height: 12, marginBottom: 8 }}>
            <div style={{
              background: "linear-gradient(90deg, #c9a84c, #f5d78e)",
              borderRadius: 99, height: "100%",
              width: `${ilerlemeYuzdesi}%`,
              transition: "width 1s ease",
            }} />
          </div>
          <p style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)" }}>
            %{ilerlemeYuzdesi.toFixed(1)} tamamlandı
          </p>
        </div>
      )}

      {/* ÖDEME MODELİ SEÇİCİ */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
        <div style={{
          background: "#f1f5f9", borderRadius: 14, padding: 5,
          display: "flex", gap: 4,
        }}>
          <button
            onClick={() => setOdemeModeli("aylik")}
            style={{
              padding: "10px 28px", borderRadius: 10, border: "none",
              fontWeight: 700, fontSize: ".9rem", cursor: "pointer",
              background: odemeModeli === "aylik" ? "#fff" : "transparent",
              color: odemeModeli === "aylik" ? "#0f2540" : "#64748b",
              boxShadow: odemeModeli === "aylik" ? "0 2px 8px rgba(0,0,0,.08)" : "none",
              transition: ".2s",
            }}
          >
            Aylık
          </button>
          <button
            onClick={() => setOdemeModeli("yillik")}
            style={{
              padding: "10px 28px", borderRadius: 10, border: "none",
              fontWeight: 700, fontSize: ".9rem", cursor: "pointer",
              background: odemeModeli === "yillik" ? "#fff" : "transparent",
              color: odemeModeli === "yillik" ? "#0f2540" : "#64748b",
              boxShadow: odemeModeli === "yillik" ? "0 2px 8px rgba(0,0,0,.08)" : "none",
              transition: ".2s",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            Yıllık
            <span style={{
              background: "#10b981", color: "#fff",
              fontSize: ".65rem", fontWeight: 800,
              padding: "2px 6px", borderRadius: 6,
            }}>
              %17 İndirim
            </span>
          </button>
        </div>
      </div>

      {/* PLAN KARTLARI */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20,
        marginBottom: 60,
      }}>
        {Object.entries(PLANLAR).map(([key, plan]) => {
          const aktif = mevcutPlan === key;
          const populer = (plan as any).populer;
          const fiyat = odemeModeli === "yillik" ? plan.fiyatYillik : plan.fiyatAylik;
          const aylikFiyat = odemeModeli === "yillik"
            ? Math.round(plan.fiyatYillik / 12)
            : plan.fiyatAylik;

          return (
            <div key={key} style={{
              background: "#fff",
              border: populer ? `2px solid ${plan.renk}` : "1.5px solid #e2e8f0",
              borderRadius: 20,
              padding: 28,
              position: "relative",
              boxShadow: populer ? `0 8px 32px ${plan.renk}22` : "0 2px 8px rgba(0,0,0,.06)",
              transition: ".2s",
            }}>
              {populer && (
                <div style={{
                  position: "absolute", top: -12, left: "50%",
                  transform: "translateX(-50%)",
                  background: plan.renk, color: "#fff",
                  padding: "4px 16px", borderRadius: 99,
                  fontSize: ".72rem", fontWeight: 800,
                  whiteSpace: "nowrap",
                }}>
                  ⭐ En Popüler
                </div>
              )}

              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{plan.emoji}</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f2540", marginBottom: 4 }}>
                {plan.ad}
              </h3>

              <div style={{ marginBottom: 20 }}>
                {fiyat === 0 ? (
                  <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#0f2540" }}>
                    Ücretsiz
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "2.2rem", fontWeight: 900, color: plan.renk }}>
                      ₺{aylikFiyat}
                      <span style={{ fontSize: ".9rem", color: "#64748b", fontWeight: 600 }}>
                        /ay
                      </span>
                    </div>
                    {odemeModeli === "yillik" && (
                      <div style={{ fontSize: ".8rem", color: "#64748b" }}>
                        Yıllık ₺{fiyat} ödenecek
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Özellikler */}
              <div style={{ marginBottom: 24 }}>
                {[
                  {
                    label: "İlan Sayısı",
                    deger: plan.ozellikler.ilanSayisi === Infinity
                      ? "Sınırsız" : `${plan.ozellikler.ilanSayisi}/ay`,
                  },
                  {
                    label: "Öne Çıkarma",
                    deger: plan.ozellikler.oneCikarma === Infinity
                      ? "Sınırsız" : plan.ozellikler.oneCikarma === 0
                      ? "❌" : `${plan.ozellikler.oneCikarma}/ay`,
                  },
                  {
                    label: "Mesajlaşma",
                    deger: plan.ozellikler.mesajSayisi === Infinity
                      ? "Sınırsız" : `${plan.ozellikler.mesajSayisi}/ay`,
                  },
                  {
                    label: "Takas Güvencesi",
                    deger: plan.ozellikler.takasGuvencesi ? "✅" : "❌",
                  },
                  {
                    label: "Profil Rozeti",
                    deger: plan.ozellikler.profilRozeti || "❌",
                  },
                  {
                    label: "Analitik Rapor",
                    deger: plan.ozellikler.analizRaporu === "tam"
                      ? "✅ Tam" : plan.ozellikler.analizRaporu === "gelismis"
                      ? "✅ Gelişmiş" : plan.ozellikler.analizRaporu === "temel"
                      ? "✅ Temel" : "❌",
                  },
                ].map(o => (
                  <div key={o.label} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: ".85rem",
                  }}>
                    <span style={{ color: "#475569", fontWeight: 600 }}>{o.label}</span>
                    <span style={{ fontWeight: 700, color: "#0f2540" }}>{o.deger}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleYukselt(key)}
                disabled={aktif || yukleniyor || (!ucretliAktif && key !== "ucretsiz")}
                style={{
                  width: "100%", padding: "13px",
                  borderRadius: 12, border: "none",
                  fontWeight: 800, fontSize: ".9rem",
                  cursor: aktif || (!ucretliAktif && key !== "ucretsiz") ? "not-allowed" : "pointer",
                  background: aktif ? "#e2e8f0" : plan.renk,
                  color: aktif ? "#64748b" : key === "starter" ? "#fff" : key === "ucretsiz" ? "#fff" : "#fff",
                  opacity: !ucretliAktif && key !== "ucretsiz" ? 0.5 : 1,
                  transition: ".2s",
                  fontFamily: "inherit",
                }}
              >
                {aktif ? "✅ Mevcut Planın"
                  : !ucretliAktif && key !== "ucretsiz" ? "🔒 10.000 Üyede Açılır"
                  : yukleniyor ? "İşleniyor..."
                  : key === "ucretsiz" ? "Ücretsiz Başla"
                  : `${plan.emoji} ${plan.ad}'a Geç`}
              </button>
            </div>
          );
        })}
      </div>

      {/* SSS */}
      <div style={{ background: "#f8fafc", borderRadius: 20, padding: 32 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f2540", marginBottom: 24, textAlign: "center" }}>
          Sık Sorulan Sorular
        </h2>
        {[
          {
            s: "10.000 üyeye ulaşmadan ücret ödemem gerekiyor mu?",
            c: "Hayır! Site 10.000 üyeye ulaşana kadar tüm özellikler tamamen ücretsiz."
          },
          {
            s: "Erken üye olmanın avantajı ne?",
            c: "Erken üyeler için fiyatlar kilitlenir. 10.000 üye sonrası fiyatlar artabilir ama erken üyeler eski fiyattan devam eder."
          },
          {
            s: "İstediğim zaman iptal edebilir miyim?",
            c: "Evet, istediğiniz zaman iptal edebilirsiniz. Kalan süreniz boyunca premium özelliklerden yararlanmaya devam edersiniz."
          },
          {
            s: "Yıllık planın avantajı nedir?",
            c: "Yıllık planda 2 ay ücretsiz kullanım hakkı kazanırsınız — toplam %17 tasarruf."
          },
        ].map((item, i) => (
          <div key={i} style={{
            padding: "16px 0",
            borderBottom: i < 3 ? "1px solid #e2e8f0" : "none",
          }}>
            <h3 style={{ fontWeight: 800, color: "#0f2540", marginBottom: 6, fontSize: ".95rem" }}>
              ❓ {item.s}
            </h3>
            <p style={{ color: "#475569", fontSize: ".88rem", lineHeight: 1.7 }}>{item.c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
