"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function GirisYap() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🛡️ SİBER KİLİT: Sözleşme onay durumu
  const [sozlesmeKabul, setSozlesmeKabul] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sozlesmeKabul) return; // Çift dikiş güvenlik
    
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Kimlik doğrulaması başarısız. Bilgilerini kontrol et.");
        setLoading(false);
      } else {
        router.push("/panel");
      }
    } catch (error) {
      setError("Siber bağlantı hatası.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🔐</div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">SİSTEME <span className="text-[#00f260]">GİRİŞ.</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-Posta Adresi" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-all placeholder:text-slate-600 text-sm" required />
          <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Şifre" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-all placeholder:text-slate-600 text-sm" required />
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-4 rounded-xl text-center uppercase tracking-widest animate-pulse">{error}</div>}

          {/* ⚖️ ULTRA GÜVENLİK: KVKK VE SÖZLEŞME ONAY KUTUSU */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-start gap-3 mt-2">
            <div className="pt-1">
              <input 
                type="checkbox" 
                id="kvkk" 
                checked={sozlesmeKabul}
                onChange={(e) => setSozlesmeKabul(e.target.checked)}
                className="w-5 h-5 accent-[#00f260] cursor-pointer rounded bg-black border-white/10"
              />
            </div>
            <label htmlFor="kvkk" className="text-[10px] text-slate-400 cursor-pointer leading-relaxed tracking-wider uppercase font-bold">
              Giriş yaparak <Link href="/sozlesme" className="text-[#00f260] hover:underline">Kullanıcı Sözleşmesini</Link> ve <Link href="/sozlesme" className="text-[#00f260] hover:underline">KVKK Metnini</Link> kabul ediyorum.
            </label>
          </div>

          <button 
            disabled={loading || !sozlesmeKabul} 
            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${sozlesmeKabul 
                ? 'bg-gradient-to-r from-[#00f260] to-emerald-400 text-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)]' 
                : 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/5'}`}
          >
            {!sozlesmeKabul ? <ShieldAlert size={16} className="opacity-50" /> : null}
            {loading ? "AĞA BAĞLANILIYOR..." : sozlesmeKabul ? "KAPILARI AÇ" : "ÖNCE SÖZLEŞMEYİ ONAYLA"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/sifremi-unuttum" className="text-slate-500 hover:text-white transition-colors">Şifremi Unuttum?</Link>
          <div className="h-[1px] w-12 bg-white/5 mx-auto"></div>
          <div>Ağda kimliğin yok mu? <Link href="/kayit" className="text-[#00f260] hover:underline ml-1">Kayıt Ol</Link></div>
        </div>
      </div>
    </div>
  );
}
