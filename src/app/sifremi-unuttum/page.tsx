"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSifreSifirla = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);
    setMesaj("");
    setHata("");

    try {
      // 🚀 Sinyali az önce güvenli hale getirdiğimiz ana merkeze yolluyoruz
      const res = await fetch("/api/sifre-islemleri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        // 🛡️ GÜVENLİK: Link ekrana gelmez, sadece başarı mesajı gösterilir!
        setMesaj(data.message || "Kurtarma sinyali mail adresinize mühürlendi. ⚡");
        setEmail(""); 
      } else {
        setHata(data.error || "Siber ağda bir hata oluştu.");
      }
    } catch (err) {
      setHata("Sinyal koptu, ana merkeze ulaşılamıyor.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🟢 Arka Plan Siber Efektleri */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
            A-TAKASA<span className="text-[#00f260]">.</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase">
            Siber Kalkan Kurtarma Modu
          </p>
        </div>

        <form onSubmit={handleSifreSifirla} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 pl-2">
              Kayıtlı E-Posta Adresiniz
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ajan@ornek.com"
              className="w-full bg-[#030712] border border-white/10 text-white text-sm px-6 py-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors shadow-inner"
            />
          </div>

          {/* ❌ Hata Bildirimi */}
          {hata && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-4 rounded-xl text-center uppercase tracking-widest animate-pulse">
              {hata}
            </div>
          )}

          {/* ✅ Başarı Bildirimi */}
          {mesaj && (
            <div className="bg-[#00f260]/10 border border-[#00f260]/20 text-[#00f260] text-[10px] font-black p-4 rounded-xl text-center uppercase tracking-widest shadow-[0_0_15px_rgba(0,242,96,0.2)]">
              {mesaj}
            </div>
          )}

          <button
            type="submit"
            disabled={yukleniyor || !email}
            className="w-full bg-[#00f260] hover:bg-[#00d250] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] hover:shadow-[0_0_30px_rgba(0,242,96,0.6)] hover:scale-[1.02] disabled:opacity-50"
          >
            {yukleniyor ? "Sinyal Fırlatılıyor..." : "Sıfırlama Bağlantısı Gönder ⚡"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-8">
          <Link href="/giris" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            ← Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
