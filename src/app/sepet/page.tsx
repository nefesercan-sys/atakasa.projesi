"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SiberSepet() {
  const [sepetItems, setSepetItems] = useState<any[]>([]);
  const router = useRouter();

  // 📡 Tarayıcının siber hafızasından verileri çek
  useEffect(() => {
    const hafiza = JSON.parse(localStorage.getItem('atakasa_sepet') || '[]');
    setSepetItems(hafiza);
  }, []);

  // 🗑️ Sepetten Silme Motoru
  const sepettenSil = (id: string) => {
    const yeniSepet = sepetItems.filter((item) => item.id !== id);
    setSepetItems(yeniSepet);
    localStorage.setItem('atakasa_sepet', JSON.stringify(yeniSepet));
  };

  const toplamTutar = sepetItems.reduce((toplam, item) => toplam + item.fiyat, 0);

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 text-white font-sans italic relative overflow-hidden">
      {/* 🟢 Arka Plan Siber Efekt */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto z-10 relative">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Siber <span className="text-[#00f260]">Kasa (Sepet).</span></h1>
        <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mb-10">Güvenli İşlem Sırasındaki Varlıklar</p>

        {sepetItems.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] py-32 text-center shadow-2xl flex flex-col items-center">
            <span className="text-6xl mb-6 block grayscale opacity-30">🛒</span>
            <p className="text-white font-black tracking-[0.3em] uppercase text-sm mb-6">SİBER KASANIZ ŞU AN BOŞ</p>
            <Link href="/" className="bg-[#00f260]/10 text-[#00f260] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">
              PİYASAYA GERİ DÖN
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 🛒 ÜRÜN LİSTESİ */}
            <div className="flex-1 space-y-4">
              {sepetItems.map((item) => (
                <div key={item.id} className="bg-[#0a0a0a] border border-white/5 p-4 md:p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-xl relative group hover:border-white/10 transition-colors">
                  <img src={item.resim} alt={item.baslik} className="w-24 h-24 object-cover rounded-xl border border-white/5" />
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-white font-black uppercase text-lg mb-1">{item.baslik}</h3>
                    <p className="text-[#00f260] font-black text-xl">{item.fiyat.toLocaleString()} ₺</p>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button onClick={() => sepettenSil(item.id)} className="flex-1 md:flex-none bg-red-500/10 text-red-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      SİL
                    </button>
                    {/* 🚀 SATIN ALMA SAYFASINA YÖNLENDİRME (İşlem Parametresi İle) */}
                    <button onClick={() => router.push(`/varlik/${item.id}?islem=satinal`)} className="flex-1 md:flex-none bg-cyan-500/10 text-cyan-400 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
                      İNCELE / AL
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 💰 ÖDEME ÖZETİ PANELİ */}
            <div className="w-full lg:w-80 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 h-max sticky top-24 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 border-b border-white/5 pb-4">Kasa Özeti</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-xs font-bold">Toplam Varlık:</span>
                <span className="text-white font-black">{sepetItems.length} Adet</span>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-slate-500 text-xs font-bold">Toplam Tutar:</span>
                <span className="text-[#00f260] font-black text-2xl">{toplamTutar.toLocaleString()} ₺</span>
              </div>
              
              <div className="bg-[#00f260]/10 border border-[#00f260]/20 p-4 rounded-xl text-center">
                <span className="text-[#00f260] text-[9px] font-black uppercase tracking-widest block leading-relaxed">
                  İşlemler A-Takasa Escrow güvencesiyle tek tek mühürlenir. İşlem yapmak istediğiniz varlığın yanındaki "İncele / Al" butonuna tıklayınız.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
