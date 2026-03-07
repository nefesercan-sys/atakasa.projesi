"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleKurtarma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("E-Posta girmediniz!");
    setLoading(true);

    try {
      const res = await fetch("/api/sifre-islemleri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (res.ok) {
        // 🚨 SİBER SİMÜLASYON: Normalde mail gider, biz test için yönlendiriyoruz.
        alert(`🚨 SİMÜLASYON MODU: Kurtarma linki üretildi.\nLütfen Tamam'a basarak şifre yenileme ekranına gidin.`);
        router.push(data.link);
      } else {
        alert(`❌ HATA: ${data.error}`);
      }
    } catch (err) { alert("Ağa bağlanılamadı."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden italic">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-black uppercase mb-2 text-white text-center">Siber <span className="text-[#00f260]">Kurtarma.</span></h2>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center mb-8">Kayıtlı e-postanızı girin, kurtarma sinyali gönderelim.</p>
        <form onSubmit={handleKurtarma} className="space-y-5">
          <input type="email" placeholder="Ajan E-Posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#030712] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" required />
          <button type="submit" disabled={loading} className="w-full bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] disabled:opacity-50">
            {loading ? "SİNYAL ARANIYOR..." : "KURTARMA SİNYALİ GÖNDER"}
          </button>
        </form>
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <Link href="/giris" className="text-slate-400 hover:text-[#00f260] text-[10px] font-black uppercase tracking-widest transition-colors">← TERMİNALE GERİ DÖN</Link>
        </div>
      </div>
    </div>
  );
}
