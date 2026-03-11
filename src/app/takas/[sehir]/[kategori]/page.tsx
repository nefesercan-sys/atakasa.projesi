import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Search, MapPin, Tag } from "lucide-react";

// 🚀 VERCEL'İN "0/39" ÇÖKME KRİZİNİ BİTİREN SİBER MÜHÜR!
export const dynamic = "force-dynamic";

// 🚀 SİBER SEO OPTİMİZASYONU: Google'a dinamik başlıklar üretir
export async function generateMetadata({ params }: { params: { sehir: string, kategori: string } }): Promise<Metadata> {
  const sehirFormatli = params.sehir.charAt(0).toUpperCase() + params.sehir.slice(1);
  const kategoriFormatli = params.kategori.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `${sehirFormatli} ${kategoriFormatli} Takas İlanları | At takasa`,
    description: `${sehirFormatli} şehrinde ${kategoriFormatli} kategorisindeki en güncel takas ilanları. Zararına satma, At takasa!`,
    alternates: {
      canonical: `https://atakasa.com/${params.sehir}/${params.kategori}`
    }
  };
}

export default async function KategoriSehirPage({ params }: { params: { sehir: string, kategori: string } }) {
  const sehirFormatli = params.sehir.charAt(0).toUpperCase() + params.sehir.slice(1);
  const kategoriFormatli = params.kategori.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  // API'den veri çekme (SSR)
  let ilanlar = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://atakasa.com";
    const res = await fetch(`${apiUrl}/api/varliklar?sehir=${params.sehir}&kategori=${params.kategori}`, { 
      cache: 'no-store' 
    });
    
    if (res.ok) {
      ilanlar = await res.json();
    }
  } catch (error) {
    console.error("İlanlar çekilirken hata oluştu:", error);
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-8 md:py-12">
      {/* 🌌 SİBER BAŞLIK */}
      <div className="mb-8 border-b border-white/[0.05] pb-6">
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-2">
          <span className="text-white">{sehirFormatli}</span> <span className="text-[#00f260]">{kategoriFormatli}</span> TAKASLARI
        </h1>
        <p className="text-gray-400">Zararına satma, değerinde takasla. {sehirFormatli} şehrindeki fırsatları keşfet.</p>
      </div>

      {/* 📋 İLAN LİSTESİ */}
      {ilanlar.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ilanlar.map((ilan: any) => (
            <Link href={`/ilan/${ilan._id}`} key={ilan._id} className="group bg-[#0a0a0a] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-[#00f260]/50 transition-all duration-300 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,242,96,0.15)]">
              {/* RESİM ALANI */}
              <div className="aspect-[4/3] relative w-full bg-[#111] overflow-hidden">
                <img 
                  src={ilan.resimler?.[0] || ilan.image || "/placeholder.jpg"} 
                  alt={ilan.baslik}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {ilan.borsaDurumu && (
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${ilan.borsaDurumu === 'YÜKSELİŞ' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ilan.borsaDurumu === 'DÜŞÜŞ' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                    {ilan.borsaDurumu}
                  </div>
                )}
              </div>
              
              {/* İÇERİK ALANI */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="text-[#00f260] text-xs font-bold mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <Tag size={12} /> {ilan.kategori || kategoriFormatli}
                </div>
                <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-[#00f260] transition-colors leading-tight">{ilan.baslik}</h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/[0.05]">
                  <span className="text-xl font-black text-white">{ilan.fiyat} ₺</span>
                  <div className="flex items-center text-gray-400 text-xs gap-1">
                    <MapPin size={12} /> {ilan.sehir || sehirFormatli}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* 🚫 BOŞ DURUM EKRANI */
        <div className="py-24 text-center border border-white/[0.05] rounded-3xl bg-[#050505] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Henüz İlan Yok</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">{sehirFormatli} şehrinde <span className="text-[#00f260]">{kategoriFormatli}</span> kategorisi için henüz takas ilanı girilmemiş. İlk fırsatı sen yarat!</p>
          <Link href="/ilan-ver" className="inline-flex items-center justify-center px-8 py-4 bg-[#00f260] text-black font-black uppercase italic tracking-tight rounded-xl hover:bg-[#00d250] hover:shadow-[0_0_20px_rgba(0,242,96,0.4)] transition-all">
            Hemen İlan Ver
          </Link>
        </div>
      )}
    </div>
  );
}
