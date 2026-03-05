"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GirisYap() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Kimlik doğrulanamadı. Şifreni kontrol et.");
        setLoading(false);
      } else {
        router.push("/panel"); // Başarılıysa doğrudan panele ışınla
      }
    } catch (error) {
      setError("Bağlantı koptu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
            🔐
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">
            Sisteme <span className="text-[#00f260]">Giriş.</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Siber kimliğini doğrula</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-Posta Adresi" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" />
          <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Şifre" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" />
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl text-center uppercase tracking-wider">{error}</div>}

          <button disabled={loading} className="w-full mt-4 py-5 bg-gradient-to-r from-[#00f260] to-emerald-400 text-black rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)] transition-all flex items-center justify-center">
             {loading ? <span className="animate-pulse">AĞA BAĞLANILIYOR...</span> : "KAPILARI AÇ"}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Ağda kimliğin yok mu? <Link href="/kayit" className="text-white hover:text-[#00f260] ml-1 transition-colors">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
