"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function KayitOl() {
  const [name, setName] = useState("");
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
              Kayıt olarak <Link href="/sozlesme" className="text-[#00f260] hover:underline">Kullanıcı Sözleşmesini</Link> ve <Link href="/sozlesme" className="text-[#00f260] hover:underline">KVKK Metnini</Link> kabul ediyorum.
            </label>
          </div>

          <button 
            disabled={loading || !sozlesmeKabul} 
            className={`w-full mt-4 py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${sozlesmeKabul 
                ? 'bg-[#00f260] text-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)]' 
                : 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/5'}`}
          >
            {!sozlesmeKabul ? <ShieldAlert size={16} className="opacity-50" /> : null}
            {loading ? "MÜHÜRLENİYOR..." : sozlesmeKabul ? "SİBER AĞA KATIL" : "ÖNCE SÖZLEŞMEYİ ONAYLA"}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Zaten üye misin? <Link href="/giris" className="text-white hover:text-[#00f260] ml-1 transition-colors">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
