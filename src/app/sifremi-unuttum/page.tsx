"use client";

import { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState<string>("");
  const [hata, setHata] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [gonderildi, setGonderildi] = useState<boolean>(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setHata("");
    setLoading(true);
    try {
      const res = await fetch("/api/sifre-islemleri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setGonderildi(true);
      } else {
        setHata(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setHata("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#F5F0E8",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>

        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <Link href="/">
            <h1 style={{fontSize:"36px",fontWeight:"900",color:"#1A1A1A",margin:"0",fontFamily:"Georgia,serif"}}>A-TAKASA</h1>
            <p style={{color:"#C8A96E",fontSize:"11px",fontWeight:"700",letterSpacing:"4px",textTransform:"uppercase",margin:"4px 0 0"}}>Takas Platformu</p>
          </Link>
        </div>

        <div style={{background:"white",borderRadius:"24px",boxShadow:"0 8px 40px rgba(0,0,0,0.10)",overflow:"hidden"}}>
          <div style={{height:"5px",background:"linear-gradient(90deg,#2C5F2E,#C8A96E,#2C5F2E)"}} />

          <div style={{padding:"36px 32px"}}>
            {!gonderildi ? (
              <>
                <div style={{width:"56px",height:"56px",borderRadius:"16px",background:"#F5F0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",marginBottom:"16px"}}>🔑</div>
                <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1A1A1A",margin:"0 0 8px",fontFamily:"Georgia,serif"}}>Şifreni mi unuttun?</h2>
                <p style={{color:"#6B6B6B",fontSize:"14px",margin:"0 0 24px",lineHeight:"1.6"}}>E-posta adresini gir, sıfırlama bağlantısı gönderelim.</p>

                {hata && (
                  <div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",borderRadius:"12px",padding:"12px 14px",fontSize:"13px",marginBottom:"16px"}}>
                    ⚠️ {hata}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"800",color:"#1A1A1A",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"8px"}}>
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    style={{
                      width:"100%",
                      background:"#F8F6F2",
                      border:"2px solid #E5E0D8",
                      borderRadius:"12px",
                      padding:"14px 16px",
                      fontSize:"15px",
                      color:"#1A1A1A",
                      outline:"none",
                      boxSizing:"border-box",
                      marginBottom:"16px",
                      display:"block"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width:"100%",
                      background:loading?"#6B9E6D":"#2C5F2E",
                      color:"white",
                      fontWeight:"800",
                      padding:"15px",
                      borderRadius:"12px",
                      border:"none",
                      fontSize:"13px",
                      letterSpacing:"2px",
                      textTransform:"uppercase",
                      cursor:loading?"not-allowed":"pointer",
                      transition:"all 0.2s"
                    }}
                  >
                    {loading ? "⏳ Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{textAlign:"center",padding:"16px 0"}}>
                <div style={{fontSize:"56px",marginBottom:"16px"}}>✉️</div>
                <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1A1A1A",margin:"0 0 10px",fontFamily:"Georgia,serif"}}>E-posta Gönderildi!</h2>
                <p style={{color:"#6B6B6B",fontSize:"14px",marginBottom:"6px"}}>
                  <strong style={{color:"#1A1A1A"}}>{email}</strong> adresine bağlantı gönderildi.
                </p>
                <p style={{color:"#ABABAB",fontSize:"12px",marginBottom:"24px"}}>Spam klasörünü de kontrol etmeyi unutma!</p>
                <button
                  onClick={() => { setGonderildi(false); setEmail(""); }}
                  style={{color:"#C8A96E",background:"none",border:"none",fontSize:"13px",fontWeight:"700",cursor:"pointer",textDecoration:"underline"}}
                >
                  Farklı e-posta dene
                </button>
              </div>
            )}
          </div>

          <div style={{padding:"0 32px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Link href="/giris" style={{color:"#6B6B6B",fontSize:"13px",textDecoration:"none"}}>← Giriş Yap</Link>
            <Link href="/kayit" style={{color:"#C8A96E",fontSize:"13px",fontWeight:"700",textDecoration:"none"}}>Hesap Oluştur</Link>
          </div>
        </div>

        <p style={{textAlign:"center",fontSize:"11px",color:"#ABABAB",marginTop:"20px"}}>
          © 2025 atakasa.com · Türkiye&apos;nin Takas Platformu
        </p>
      </div>
    </div>
  );
}
