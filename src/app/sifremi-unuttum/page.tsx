"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-10 shadow-2xl z-10 text-center">
        {!sent ? (
          <>
            <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🛰️</div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">ŞİFRE <span className="text-[#00f260]">KURTARMA.</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">Kayıtlı e-postanı gir, sana bir kurtarma sinyali gönderelim.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
              <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-Posta Adresin" className="w-full bg-[#050505] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-all text-sm" required />
              <button className="w-full py-5 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">SİNYAL GÖNDER</button>
            </form>
          </>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#00f260]/10 border border-[#00f260]/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 text-[#00f260]">✓</div>
            <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tighter">SİNYAL İLETİLDİ!</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Kurtarma bağlantısı siber kutuna ışınlandı.</p>
          </div>
        )}
        <div className="mt-10 pt-6 border-t border-white/5">
          <Link href="/giris" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors">← Geri Dön</Link>
        </div>
      </div>
    </div>
  );
}
