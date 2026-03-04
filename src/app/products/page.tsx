"use client";
import React from "react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white py-24 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Varlık <span className="text-[#00f260]">Vitrinİ</span>
        </h1>
        <Link href="/" className="text-[#00f260] font-black uppercase text-xs border border-[#00f260]/30 px-6 py-2 rounded-xl hover:bg-[#00f260]/10 transition-all">
          ANA MERKEZ
        </Link>
      </div>

      {/* Gelecekte burası veritabanından çekilen ilanlarla dolacak */}
      <div className="bg-[#0b0f19] border border-white/5 rounded-[2rem] p-12 text-center shadow-2xl">
        <span className="text-6xl mb-6 block">📡</span>
        <h2 className="text-slate-400 font-black uppercase tracking-widest text-sm">
          Sistem taranıyor... Henüz aktif varlık bulunamadı.
        </h2>
      </div>
    </div>
  );
}
