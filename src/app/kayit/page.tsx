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
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/giris");
      } else {
        const data = await res.json();
        setError(data.message || "Kayıt başarısız.");
        setLoading(false);
      }
    } catch (err) {
      setError("Sistem bağlantısı koptu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-10 shadow-2xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic">A-<span className="text-[#00f260]">TAKASA.</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Yeni Kimlik Oluştur</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input onChange={(e) => setName(e.target.value)} type="text" placeholder="Ad Soyad" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-all text-sm" required />
          <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Siber E-Posta" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-all text-sm" required />
          <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Güçlü Bir Şifre" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-all text-sm" required />
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-4 rounded-xl text-center uppercase tracking-widest">{error}</div>}

          <button disabled={loading} className="w-full mt-4 py-5 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
             {loading ? "MÜHÜRLENİYOR..." : "SİBER AĞA KATIL"}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Zaten üye misin? <Link href="/giris" className="text-white hover:text-[#00f260] ml-1 transition-colors">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
