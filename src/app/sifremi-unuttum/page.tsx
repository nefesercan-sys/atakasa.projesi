"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSifreSifirla = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMesaj("");
    setHata("");

    try {
      const res = await fetch("/api/sifre-islemleri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // 🛡️ Link artık ekrana gelmez, sadece başarı mesajı gösterilir
        setMesaj(data.message);
        setEmail("");
      } else {
        setHata(data.error);
      }
    } catch (err) {
      setHata("Sinyal koptu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3rem] w-full max-w-md">
        <h1 className="text-3xl font-black text-white text-center mb-10 italic">A-TAKASA<span className="text-[#00f260]">.</span></h1>
        
        <form onSubmit={handleSifreSifirla} className="space-y-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Kayıtlı E-Postanız"
            className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-[#00f260]"
          />

          {hata && <div className="text-red-500 text-[10px] font-black uppercase text-center">{hata}</div>}
          {mesaj && <div className="text-[#00f260] text-[10px] font-black uppercase text-center animate-pulse">{mesaj}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase text-xs"
          >
            {loading ? "Sinyal Gönderiliyor..." : "KURTARMA SİNYALİ GÖNDER ⚡"}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <Link href="/giris" className="text-slate-500 text-[10px] font-black uppercase">← Giriş Ekranına Dön</Link>
        </div>
      </div>
    </div>
  );
}
