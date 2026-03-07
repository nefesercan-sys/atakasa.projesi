"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SifreYenileForm() {
  const [sifre, setSifre] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSifreYenile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("SİBER HATA: Geçersiz veya eksik kurtarma kiliti!");
    if (sifre !== tekrar) return alert("Yeni şifreler eşleşmiyor!");
    if (sifre.length < 6) return alert("Şifre en az 6 karakter olmalıdır!");
    
    setLoading(true);
    try {
      const res = await fetch("/api/sifre-islemleri", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yeniSifre: sifre })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}\nLütfen yeni şifrenizle giriş yapın.`);
        router.push("/giris");
      } else {
        alert(`❌ İhlal: ${data.error}`);
      }
    } catch (err) { alert("Sistem motoru yanıt vermiyor."); }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-[#0a0a0a] border border-[#00f260]/30 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,242,96,0.1)] relative z-10 animate-in slide-in-from-bottom duration-500">
      <h2 className="text-3xl font-black italic uppercase mb-2 text-white text-center">Şifreyi <span className="text-[#00f260]">Mühürle.</span></h2>
      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center mb-8">Siber ağa dönmek için yeni bir şifre belirleyin.</p>

      <form onSubmit={handleSifreYenile} className="space-y-4">
        <input 
          type="password" placeholder="Yeni Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)}
          className="w-full bg-[#030712] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" required 
        />
        <input 
          type="password" placeholder="Yeni Şifre (Tekrar)" value={tekrar} onChange={(e) => setTekrar(e.target.value)}
          className="w-full bg-[#030712] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" required 
        />
        <button type="submit" disabled={loading} className="w-full bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] mt-4 disabled:opacity-50">
          {loading ? "MÜHÜRLENİYOR..." : "ŞİFREYİ KAYDET VE GİRİŞ YAP"}
        </button>
      </form>
    </div>
  );
}

export default function SifreYenile() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600 opacity-[0.03] blur-[150px] rounded-full"></div>
      <Suspense fallback={<div className="text-[#00f260] font-black animate-pulse tracking-widest">SİBER KİLİT ÇÖZÜLÜYOR...</div>}>
        <SifreYenileForm />
      </Suspense>
    </div>
  );
}
