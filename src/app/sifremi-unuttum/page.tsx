"use client";

import { useState } from "react";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHata("");
    if (!email || !email.includes("@")) {
      setHata("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setGonderildi(true); }, 1800);
  };

  return (
    <div style={{minHeight:"100vh",background:"#F5F0E8",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",fontFamily:"Georgia, serif"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{textAlign:"center",marginBottom:"36px"}}>
          <h1 style={{fontSize:"36px",fontWeight:"900",letterSpacing:"-1px",color:"#1A1A1A",margin:0}}>A-TAKASA</h1>
          <p style={{color:"#C8A96E",fontSize:"11px",fontWeight:"700",letterSpacing:"4px",textTransform:"uppercase",marginTop:"4px"}}>Takas Platformu</p>
        </div>
        <div style={{background:"white",borderRadius:"24px",boxShadow:"0 20px 60px rgba(0,0,0,0.08)",overflow:"hidden"}}>
          <div style={{height:"5px",background:"linear-gradient(90deg,#2C5F2E,#C8A96E,#2C5F2E)"}} />
          <div style={{padding:"32px"}}>
            {!gonderildi ? (
              <>
                <div style={{width:"52px",height:"52px",borderRadius:"16px",background:"#F5F0E8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",marginBottom:"16px"}}>🔑</div>
                <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1A1A1A",margin:"0 0 6px"}}>Şifreni mi unuttun?</h2>
                <p style={{color:"#6B6B6B",fontSize:"13px",lineHeight:"1.6",margin:"0 0 24px"}}>E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>
                {hata && <div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",borderRadius:"12px",padding:"10px 14px",fontSize:"13px",marginBottom:"16px"}}>⚠️ {hata}</div>}
                <form onSubmit={handleSubmit}>
                  <label style={{display:"block",fontSize:"10px",fontWeight:"800",color:"#1A1A1A",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"8px"}}>E-posta Adresi</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@email.com" style={{width:"100%",background:"#F8F6F2",border:"1.5px solid rgba(0,0,0,0.08)",borderRadius:"12px",padding:"12px 14px",fontSize:"14px",color:"#1A1A1A",outline:"none",boxSizing:"border-box",marginBottom:"16px"}} />
                  <button type="submit" disabled={loading} style={{width:"100%",background:loading?"#6B9E6D":"#2C5F2E",color:"white",fontWeight:"800",padding:"14px",borderRadius:"12px",border:"none",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",cursor:loading?"not-allowed":"pointer",transition:"all 0.2s"}}>
                    {loading ? "⏳ Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder →"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{textAlign:"center",padding:"16px 0"}}>
                <div style={{fontSize:"56px",marginBottom:"16px"}}>✉️</div>
                <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1A1A1A",margin:"0 0 10px"}}>E-posta Gönderildi!</h2>
                <p style={{color:"#6B6B6B",fontSize:"13px",lineHeight:"1.7",marginBottom:"6px"}}><strong>{email}</strong> adresine bağlantı gönderildi.</p>
                <p style={{color:"#ABABAB",fontSize:"11px",marginBottom:"24px"}}>Spam klasörünü de kontrol etmeyi unutma!</p>
                <button onClick={()=>{setGonderildi(false);setEmail("");}} style={{color:"#C8A96E",background:"none",border:"none",fontSize:"13px",fontWeight:"700",cursor:"pointer",textDecoration:"underline"}}>Farklı e-posta dene</button>
              </div>
            )}
          </div>
          <div style={{padding:"0 32px 28px",display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#6B6B6B",fontSize:"13px",cursor:"pointer"}}>← Giriş Yap</span>
            <span style={{color:"#C8A96E",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>Hesap Oluştur</span>
          </div>
        </div>
        <p style={{textAlign:"center",fontSize:"11px",color:"#ABABAB",marginTop:"20px"}}>© 2025 atakasa.com · Türkiye'nin Takas Platformu</p>
      </div>
    </div>
  );
}
