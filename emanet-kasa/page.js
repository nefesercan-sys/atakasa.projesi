"use client";
import React from "react";
import Link from "next/link";

export default function EmanetKasa() {
  return (
    <div className="min-h-screen bg-[#030712] py-24 px-4 text-white flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-[#0b0f19] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl text-center">
        
        <div className="text-6xl mb-6 animate-bounce">🛡️</div>
        
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 italic tracking-wider">
          SİBER <span className="text-[#00f260]">EMANET KASA.</span>
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base mb-10 leading-relaxed">
          Burası güvenli ticaretin kalbidir. Alıcı onay verene kadar varlıklarınız siber ağda, kriptografik güvence altında tutulur. Çok yakında tam kapasiteyle aktif edilecek.
        </p>

        <Link href="/" className="inline-block bg-[#00f260] text-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,242,96,0.3)] hover:scale-105 transition-transform">
          ⚡ ANA KARARGAHA DÖN
        </Link>
        
      </div>
    </div>
  );
}
