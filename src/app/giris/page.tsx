"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";

export default function GirisYap() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [sozlesmeKabul, setSozlesmeKabul] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sozlesmeKabul) return setError("Devam etmek için sözleşmeyi onaylayın.");
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("E-posta veya şifre hatalı.");
        setLoading(false);
      } else {
        router.push("/panel");
      }
    } catch {
      setError("Sistem hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        minHeight: "100vh", display: "flex",
        fontFamily: "'DM Sans', sans-serif", background: "#faf8f4"
      }}>

        {/* SOL — Dekoratif Panel */}
        <div style={{
          width: "45%", background: "#0f2540", position: "relative",
          overflow: "hidden", padding: "60px 56px",
          flexDirection: "column", justifyContent: "center",
          display: "none"
        }} className="giris-sol">
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 40,
              fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16
            }}>
              A-TAKASA<span style={{ color: "#c9a84c" }}>.</span>
            </div>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 48 }}>
              Küresel B2B Barter<br />ve Takas Platformu
            </p>
            {[
              { icon: "🛡️", text: "Güvenli Takas Havuzu" },
              { icon: "⚡", text: "Anlık İlan Bildirimleri" },
              { icon: "🔄", text: "Akıllı Eşleştirme Motoru" },
              { icon: "✅", text: "%100 Alıcı & Satıcı Koruması" },
            ].map((o) => (
              <div key={o.text} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 38, height: 38, background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0
                }}>{o.icon}</div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 500 }}>{o.text}</span>
              </div>
            ))}
          </div>
          {/* Dekoratif çemberler */}
          {[
            { w: 400, h: 400, bottom: -100, right: -100 },
            { w: 250, h: 250, top: -60, right: 60 },
            { w: 150, h: 150, bottom: 120, left: 40 },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute", borderRadius: "50%",
              background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.1)",
              width: c.w, height: c.h, ...c
            }} />
          ))}
        </div>

        {/* SAĞ — Form */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center", padding: "40px 24px"
        }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            {/* Mobil Logo */}
            <div className="giris-mobil-logo" style={{
              fontFamily: "'Playfair Display', serif", fontSize: 26,
              fontWeight: 800, color: "#0f2540", letterSpacing: "-0.02em",
              marginBottom: 32, textAlign: "center"
            }}>
              A-TAKASA<span style={{ color: "#c9a84c" }}>.</span>
            </div>

            {/* Başlık */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontSize: 28,
                fontWeight: 700, color: "#0f2540", letterSpacing: "-0.02em",
                margin: "0 0 6px"
              }}>Sisteme Giriş</h1>
              <p style={{ fontSize: 14, color: "#8097b1", margin: 0 }}>
                Hesabınıza güvenli erişim sağlayın
              </p>
            </div>

            {/* Hata */}
            {error && (
              <div style={{
                background: "#fdecea", border: "1px solid #f5c6c2",
                borderRadius: 12, padding: "12px 16px", fontSize: 13,
                color: "#c0392b", fontWeight: 500, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 8
              }}>⚠️ {error}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "#4a5e78"
                }}>E-Posta Adresi</label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  style={{
                    width: "100%", padding: "13px 16px", background: "#f5f7fa",
                    border: "1.5px solid #dce6f0", borderRadius: 12,
                    fontFamily: "inherit", fontSize: 14, color: "#1a2740",
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => { e.target.style.borderColor = "#0f2540"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#dce6f0"; e.target.style.background = "#f5f7fa"; }}
                />
              </div>

              {/* Şifre */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "#4a5e78"
                  }}>Şifre</label>
                  <Link href="/sifremi-unuttum" style={{
                    fontSize: 12, color: "#c9a84c", fontWeight: 600, textDecoration: "none"
                  }}>Şifremi Unuttum?</Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%", padding: "13px 48px 13px 16px",
                      background: "#f5f7fa", border: "1.5px solid #dce6f0",
                      borderRadius: 12, fontFamily: "inherit", fontSize: 14,
                      color: "#1a2740", outline: "none", boxSizing: "border-box"
                    }}
                    onFocus={e => { e.target.style.borderColor = "#0f2540"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#dce6f0"; e.target.style.background = "#f5f7fa"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute", right: 14, top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: "#8097b1",
                      padding: 4, display: "flex", alignItems: "center"
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sözleşme */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sozlesmeKabul}
                  onChange={(e) => setSozlesmeKabul(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#0f2540", flexShrink: 0, marginTop: 2, cursor: "pointer" }}
                />
                <span style={{ fontSize: 12, color: "#4a5e78", lineHeight: 1.6 }}>
                  Giriş yaparak{" "}
                  <Link href="/sozlesme" style={{ color: "#c9a84c", fontWeight: 600, textDecoration: "none" }}>
                    Kullanıcı Sözleşmesini
                  </Link>{" "}ve{" "}
                  <Link href="/kvkk" style={{ color: "#c9a84c", fontWeight: 600, textDecoration: "none" }}>
                    KVKK Metnini
                  </Link>{" "}kabul ediyorum.
                </span>
              </label>

              {/* Giriş Butonu */}
              <button
                type="submit"
                disabled={loading || !sozlesmeKabul}
                style={{
                  width: "100%", padding: "14px",
                  background: loading || !sozlesmeKabul ? "#8097b1" : "#0f2540",
                  border: "none", borderRadius: 12, fontFamily: "inherit",
                  fontSize: 14, fontWeight: 700, color: "#fff", cursor: loading || !sozlesmeKabul ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, letterSpacing: "0.01em", marginTop: 4,
                  transition: "all 0.2s", opacity: loading || !sozlesmeKabul ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite", display: "inline-block"
                    }} />
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <><Shield size={16} /> Güvenli Giriş Yap <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Ayraç */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#dce6f0" }} />
              <span style={{ fontSize: 12, color: "#8097b1" }}>veya</span>
              <div style={{ flex: 1, height: 1, background: "#dce6f0" }} />
            </div>

            {/* Kayıt */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#4a5e78", margin: 0 }}>
              Ağda kimliğin yok mu?{" "}
              <Link href="/kayit" style={{
                color: "#c9a84c", fontWeight: 700, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 4
              }}>
                <Zap size={13} /> Hemen Kayıt Ol
              </Link>
            </p>

            {/* İlan Ver butonu */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Link href="/" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#8097b1", textDecoration: "none",
                padding: "8px 16px", border: "1px solid #dce6f0",
                borderRadius: 8, transition: "all 0.15s"
              }}>
                ← Ana Sayfaya Dön
              </Link>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .giris-sol { display: flex !important; }
          .giris-mobil-logo { display: none !important; }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #b0bec5; }
        a:hover { opacity: 0.8; }
      `}</style>
    </>
  );
}
