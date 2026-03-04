"use client";
import React from "react";
import Link from "next/link";

export default function TradesPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white py-24 px-4 max-w-5xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-center">
        TAKAS <span className="text-yellow-500">KONTROL PANELİ</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0b0f19] border border-white/5 p-8 rounded-[2rem] shadow-2xl">
          <h3 className="text-[#00f260] font-black uppercase text-xs mb-4 border-l-4 border-[#00f260] pl-3">Gelen Teklifler</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Henüz gelen bir teklif yok.</p>
        </div>

        <div className="bg-[#0b0f19] border border-white/5 p-8 rounded-[2rem] shadow-2xl">
          <h3 className="text-yellow-500 font-black uppercase text-xs mb-4 border-l-4 border-yellow-500 pl-3">Gönderdiğim Teklifler</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Bekleyen teklifiniz bulunmuyor.</p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-block bg-white/5 text-white font-black uppercase text-xs px-10 py-4 rounded-2xl hover:bg-white/10 transition-all">
          Geri Dön
        </Link>
      </div>
    </div>
  );
}
