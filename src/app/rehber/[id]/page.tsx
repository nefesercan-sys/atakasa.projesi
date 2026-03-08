import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

// 📝 Aynı siber makale veritabanımız (Şimdilik statik - İleride MongoDB'den gelecek)
const makaleler = [
  {
    id: "telefon-takasi-rehberi",
    baslik: "Telefon Takasında Dolandırılmamak İçin 5 Altın Kural",
    ozet: "İkinci el telefon takası yaparken IMEI kontrolünden batarya sağlığına kadar dikkat etmeniz gereken kritik siber adımlar.",
    icerik: "Takas işlemlerinde karşı tarafın cihazının fiziksel durumunu incelemek buzdağının sadece görünen yüzüdür. Siber karargahta güvenli işlem yapmanın ilk kuralı e-Devlet üzerinden IMEI sorgusu yapmaktır. Cihazın batarya devir sayısını kontrol etmeyi ve 'Güvenli Havuz' sistemi olmadan asla aradaki nakit farkını göndermemeyi unutmayın...",
    tarih: "08 Mart 2026",
    kategori: "MOBİL CİHAZ",
  },
  {
    id: "araba-takas-fiyatlari",
    baslik: "Üste Para Vererek Araç Takası Nasıl Yapılır?",
    ozet: "Nakit paranız tam yetmediğinde, elinizdeki aracı değerinde vererek nasıl üst model bir araca geçersiniz? Tüm detaylar...",
    icerik: "Araç takasında en büyük hata, kendi aracınızın piyasa değerini yanlış hesaplayıp üste gereğinden fazla para ödemektir. A-TAKASA platformunda taraflar anlaştıktan sonra, noter aşamasına geçilir. Plaka üzerinden Tramer sorgusu ve detaylı ekspertiz raporu olmadan siber takas işlemlerine onay vermeyiniz.",
    tarih: "05 Mart 2026",
    kategori: "OTOMOTİV",
  },
  {
    id: "a-takasa-havuz-sistemi",
    baslik: "A-TAKASA Güvenli Havuz Sistemi Nedir? Nasıl Çalışır?",
    ozet: "Takas yaparken aradaki nakit farkını nasıl güvenle gönderirsiniz? Siber kalkanımızın çalışma prensibi.",
    icerik: "Geleneksel ticaret sitelerindeki en büyük zafiyet 'Önce parayı gönder, sonra ürünü kargolarım' yalanıdır. A-TAKASA'nın siber kalkanı bu sorunu kökünden çözer. Aradaki nakit farkı, teslimat onaylanana kadar banka destekli havuz hesabımızda kilitli kalır. İki taraf da 'Teslim Aldım' butonuna basmadan havuzun şifresi çözülmez.",
    tarih: "01 Mart 2026",
    kategori: "SİBER GÜVENLİK",
  }
];

// 🎯 DİNAMİK SEO RADARI: Her makale Google'da kendi özel başlığıyla çıkar!
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const makale = makaleler.find(m => m.id === resolvedParams.id);

  if (!makale) {
    return { title: "Sinyal Bulunamadı | A-TAKASA" };
  }

  return {
    title: `${makale.baslik} | A-TAKASA Takas Rehberi`,
    description: makale.ozet,
  };
}

// 📖 ANA EKRAN: Makale İçeriği
export default async function MakaleDetaySayfasi({ params }: { params: any }) {
  const resolvedParams = await params;
  const makale = makaleler.find(m => m.id === resolvedParams.id);

  if (!makale) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-4">
        <h1 className="text-red-500 font-black text-3xl uppercase tracking-widest animate-pulse">Siber Sinyal Bulunamadı</h1>
        <Link href="/rehber" className="text-cyan-400 hover:text-white underline text-sm uppercase">Ana Rehbere Dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-32 px-4 text-white font-sans selection:bg-[#00f260] selection:text-black">
      <div className="max-w-3xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Arka Plan Neon Işıması */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[150%] h-48 bg-[#00f260]/10 blur-[120px] pointer-events-none"></div>

        <Link href="/rehber" className="text-slate-500 text-[10px] font-black hover:text-[#00f260] transition-colors mb-10 inline-block uppercase tracking-widest border border-white/5 px-4 py-2 rounded-lg bg-black/50">
          ← SİBER REHBERE DÖN
        </Link>

        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <span className="bg-[#00f260]/10 text-[#00f260] text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest border border-[#00f260]/20">
            {makale.kategori}
          </span>
          <span className="text-slate-500 text-xs font-bold">{makale.tarih}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-8 text-white drop-shadow-md leading-tight">
          {makale.baslik}
        </h1>

        <p className="text-lg md:text-xl text-cyan-400/90 font-bold mb-10 leading-relaxed border-l-4 border-cyan-500 pl-5">
          {makale.ozet}
        </p>

        <div className="text-slate-300 leading-loose space-y-6 text-sm md:text-base font-medium">
          <p>{makale.icerik}</p>
          <p>Daha fazla bilgi, güncel piyasa endeksleri ve güvenli siber takas deneyimi için A-TAKASA terminalini kullanmaya devam edin.</p>
        </div>

        <div className="mt-16 pt-10 border-t border-white/5 flex justify-center">
          <Link href="/" className="bg-[#00f260] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,242,96,0.3)]">
            ⚡ SİBER BORSAYA GİRİŞ YAP
          </Link>
        </div>

      </div>
    </div>
  );
}
