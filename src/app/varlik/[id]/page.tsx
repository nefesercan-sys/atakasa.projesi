import React from "react";
import Link from "next/link";
import { Metadata } from "next";

// 🛡️ SİBER PAYLAŞIM AYARLARI (SEO & ZENGİN MEDYA)
// Bu fonksiyon WhatsApp/Instagram paylaşımında resmin ve başlığın çıkmasını sağlar.
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const siteUrl = "https://atakasa.com";
  
  try {
    // API'den ilan verisini çekiyoruz
    const res = await fetch(`${siteUrl}/api/varliklar`, { cache: 'no-store' });
    const data = await res.json();
    const ilan = data.find((i: any) => i._id === params.id);

    // Resim Sunucu Motoru üzerinden gerçek resim linkini oluşturuyoruz
    const resimUrl = `${siteUrl}/api/varlik-resim/${params.id}`;

    return {
      title: `${ilan?.baslik || "Varlık"} | Atakasa`,
      description: ilan?.aciklama || "Bu siber varlığı Atakasa'da incele!",
      openGraph: {
        title: ilan?.baslik,
        description: ilan?.aciklama,
        url: `${siteUrl}/varlik/${params.id}`,
        images: [{ url: resimUrl, width: 800, height: 600 }], // 🖼️ Küçük fotoğraf burada mühürleniyor
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: ilan?.baslik,
        description: ilan?.aciklama,
        images: [resimUrl],
      }
    };
  } catch (error) {
    return { title: "Atakasa Varlık Detay" };
  }
}

// 📡 ANA SAYFA BİLEŞENİ (SERVER SIDE)
export default async function VarlikDetay({ params }: { params: { id: string } }) {
  const siteUrl = "https://atakasa.com"; 
  let ilan = null;

  try {
    const res = await fetch(`${siteUrl}/api/varliklar`, { cache: 'no-store' });
    const data = await res.json();
    ilan = data.find((i: any) => i._id === params.id);
  } catch (err) {
    console.error("Sinyal hatası:", err);
  }

  if (!ilan) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#00f260]">
        <span className="text-6xl mb-4 animate-pulse">📡</span>
        <p className="font-black uppercase tracking-widest text-center px-4">Sinyal İşlenemedi / Varlık Bulunamadı</p>
        <Link href="/" className="mt-8 text-white text-xs underline uppercase font-bold">Vitrin'e Dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 pb-40">
      <div className="max-w-4xl mx-auto">
        
        {/* 🖼️ SİBER GÖRSEL */}
        <div className="aspect-video bg-white/5 rounded-[3rem] overflow-hidden mb-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <img 
            src={ilan.resimler?.[0] || "https://via.placeholder.com/800x450?text=Gorsel+Yok"} 
            alt={ilan.baslik} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* 🏷️ BİLGİ ALANI */}
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-[#00f260] text-xs font-black uppercase tracking-[0.4em]">{ilan.kategori || "GENEL PİYASA"}</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">
            {ilan.baslik}
          </h1>
        </div>

        {/* 💰 DEĞER TABLOSU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-inner">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Tahmini Varlık Değeri</p>
            <p className="text-5xl font-black text-[#00f260] drop-shadow-[0_0_15px_rgba(0,242,96,0.3)]">
              {Number(ilan.fiyat).toLocaleString()} ₺
            </p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-inner">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Takas Durumu</p>
            <p className="text-xl font-bold text-white uppercase tracking-tight italic">
              {ilan.takasIstegi || "Takas Tekliflerine Açık"}
            </p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] p-10 rounded-[3rem] mb-12">
           <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Broker Açıklaması</h3>
           <p className="text-slate-300 leading-relaxed text-xl font-medium">{ilan.aciklama}</p>
        </div>
        
        {/* ⚡ TEKLİF BUTONU (MESAJLAŞMAYA BAĞLANDI) */}
        {/* Router.push yerine doğrudan Link kullanarak Client Component ihtiyacını kaldırdık */}
        <Link 
          href={`/mesajlar?satici=${ilan.satici}&ilan=${ilan._id}`}
          className="block w-full text-center py-7 bg-gradient-to-r from-[#00f260] to-emerald-400 text-black font-black uppercase tracking-[0.2em] rounded-[2.5rem] hover:scale-[1.03] transition-all shadow-[0_15px_40px_rgba(0,242,96,0.3)] active:scale-95"
        >
          TEKLİF GÖNDER & TAKAS ET
        </Link>
      </div>
    </div>
  );
}
