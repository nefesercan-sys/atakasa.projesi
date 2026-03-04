"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, PlusCircle, MessageCircle, User } from "lucide-react";

export default function CyberNav() {
  const pathname = usePathname();

  return (
    <>
      {/* MOBİL: Instagram Tarzı Alt Siber Navigasyon */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b0f19] border-t border-white/10 z-50 px-6 py-4 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-[#00f260]' : 'text-slate-500 hover:text-white'}`}>
          <Home size={24} />
          <span className="text-[10px] font-black uppercase tracking-wider">Vitrin</span>
        </Link>
        
        <Link href="/ilanlarim" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/ilanlarim' ? 'text-[#00f260]' : 'text-slate-500 hover:text-white'}`}>
          <List size={24} />
          <span className="text-[10px] font-black uppercase tracking-wider">İlanlar</span>
        </Link>
        
        {/* ORTA DEV BUTON: AT TAKASA */}
        <Link href="/takas-baslat" className="relative -top-6 flex flex-col items-center justify-center w-16 h-16 bg-[#00f260] rounded-full border-4 border-[#030712] shadow-[0_0_25px_rgba(0,242,96,0.6)] text-black hover:scale-110 transition-transform">
          <PlusCircle size={32} />
        </Link>

        <Link href="/mesajlar" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/mesajlar' ? 'text-[#00f260]' : 'text-slate-500 hover:text-white'}`}>
          <MessageCircle size={24} />
          <span className="text-[10px] font-black uppercase tracking-wider">Mesaj</span>
        </Link>
        
        <Link href="/panel" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/panel' ? 'text-[#00f260]' : 'text-slate-500 hover:text-white'}`}>
          <User size={24} />
          <span className="text-[10px] font-black uppercase tracking-wider">Panel</span>
        </Link>

      </div>

      {/* MASAÜSTÜ: Sağ Kenarda Sabit İlan Ver Butonu */}
      <div className="hidden md:flex fixed right-8 bottom-8 z-50">
        <Link href="/takas-baslat" className="flex items-center gap-3 bg-[#00f260] text-black px-8 py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,242,96,0.3)] hover:scale-105 hover:shadow-[0_0_60px_rgba(0,242,96,0.6)] transition-all">
          <PlusCircle size={26} />
          <span>AT TAKASA 🚀</span>
        </Link>
      </div>
    </>
  );
}
