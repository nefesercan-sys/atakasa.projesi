import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Search, MapPin, Tag } from "lucide-react";

// 🤖 YAPAY ZEKA SEO MOTORU: Google'a özel dinamik başlıklar üretir
export async function generateMetadata({ params }: { params: { sehir: string, kategori: string } }): Promise<Metadata> {
  // Gelen verileri düzelt (örn: "izmir" -> "İzmir")
  const sehir = params.sehir.charAt(0).toUpperCase() + params.sehir.slice(1).toLowerCase();
  const kategori = params.kategori.charAt(0).toUpperCase() + params.kategori.slice(1).toLowerCase();

  return {
    title: `${sehir} ${kategori} Takas İlanları ve Fırsatları | Atakasa`,
    description: `${sehir} bölgesinde takaslık ${kategori} mi arıyorsun? Paran cebinde kalsın! En güncel ${sehir} ${kategori} takas ilanlarını incele veya kendi eşyanı hemen takasa koy.`,
    keywords: `${sehir} takas, ${sehir} ${kategori} takasla, 2.el ${kategori} takas, atakasa ${sehir}`,
  };
}

// 🌐 DİNAMİK İNİŞ SAYFASI (LANDING PAGE)
export default function DinamikTakasSayfasi({ params }: { params: { sehir: string, kategori: string } }) {
  const sehir = params.sehir.charAt(0).toUpperCase() + params.sehir.slice(1).toLowerCase();
  const kategori = params.kategori.charAt(0).toUpperCase() + params.kategori.slice(1).toLowerCase();

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-6 relative overflow-hidden selection:bg-[#00f260] selection:text-black">
      {/* Siber Arka Plan Efekti */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* SEO Uyumlu Dev Başlık (H1 Kancası) */}
        <div className="mb-12 border-b border-white/10 pb-8 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 text-[#00f260] text-sm font-black uppercase tracking-widest">
            <span className="flex items-center gap-1 bg-[#00f260]/10 px-3 py-1 rounded-full"><MapPin size={14}/> {sehir}</span>
            <span className="flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-full"><Tag size={14}/> {kategori}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            {sehir} <span className="text-white">Bölgesinde</span> <br/> 
            <span className="text-[#00f260]">{kategori}</span> Takasla.
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl text-sm leading-relaxed">
            Nakit harcamaya son! {sehir} çevresindeki kullanıcılarla iletişime geç, kullanmadığın eşyalarını verip ihtiyacın olan {kategori} ile anında takas et.
          </p>
        </div>

        {/* Aksiyon Çağrısı (Call To Action) */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[2rem] shadow-2xl text-center flex flex-col items-center">
          <Search className="w-16 h-16 text-slate-500 mb-6 opacity-50" />
          <h2 className="text-2xl font-black uppercase mb-4">Bu Bölgedeki İlanları Keşfet</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-xl">
            Sistemimiz şu anda <strong>{sehir}</strong> lokasyonundaki <strong>{kategori}</strong> ilanlarını ana vitrinde listeliyor. Hemen vitrine gidip en güncel takas fırsatlarını yakala!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/" className="px-8 py-4 bg-[#00f260] text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.2)]">
              Ana Vitrine Git
            </Link>
            <Link href="/ilan-ver" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Kendin İlan Ver
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
