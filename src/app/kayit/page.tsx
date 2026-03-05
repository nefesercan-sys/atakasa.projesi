"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KayitOl() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Tüm siber alanları doldurmalısın.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const form = e.target as HTMLFormElement;
        form.reset();
        router.push("/giris"); // Başarılıysa giriş sayfasına fırlat
      } else {
        const { message } = await res.json();
        setError(message);
      }
    } catch (error) {
      setError("Sisteme bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            A-<span className="text-[#00f260] drop-shadow-[0_0_10px_rgba(0,242,96,0.3)]">TAKASA.</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Siber Ağa Katıl</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input onChange={(e) => setName(e.target.value)} type="text" placeholder="Ad Soyad veya Takma Ad" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" />
          <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-Posta Adresi" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" />
          <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Şifre" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" />
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl text-center uppercase tracking-wider">{error}</div>}

          <button disabled={loading} className="w-full mt-4 py-5 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)] transition-all flex items-center justify-center">
             {loading ? <span className="animate-pulse">SİSTEME KAYDEDİLİYOR...</span> : "KİMLİĞİ OLUŞTUR"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          Zaten ağda mısın? <Link href="/giris" className="text-[#00f260] hover:underline ml-1">Sisteme Gir</Link>
        </div>
      </div>
    </div>
  );
}
