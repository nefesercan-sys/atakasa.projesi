"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TakasBaslat() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teklifEdilenVarlik: "",
    nakitFarki: "",
    takasNotu: ""
  });

  const handleTakas = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Burada API'ye gönderme işlemi olacak (Şimdilik simülasyon)
    setTimeout(() => {
      alert("⚡ SİBER BAŞARI: Takas teklifi karşı tarafa fırlatıldı!");
      setIsSubmitting(false);
      router.push("/"); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030712] py-24 px-4 text-white flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        
        {/* ÜST BİLGİ ALANI */}
        <div className="text-center mb-12 animate-in fade-in duration-700">
           <Link href="/" className="inline-block text-[#00f260] text-sm font-black uppercase tracking-[0.4em] mb-4 border-b-2 border-[#00f260]/20 pb-1 hover:border-[#00f260] transition-all">
             ← ANA KARARGAH
           </Link>
           <h1 className="text-5xl md:text-6xl font-black uppercase italic leading-none tracking-tighter mt-4">
             TAKAS TEKLİFİ <span className="text-[#00f260]">FIRLAT.</span>
           </h1>
           <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed">
             Karşı tarafa sunacağınız varlığı ve şartları belirleyin. Adil bir siber ticaret için detayları net yazın.
           </p>
        </div>

        {/* TAKAS FORMU */}
        <form onSubmit={handleTakas} className="bg-[#0b0f19] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-[0_0_50px_rgba(0,242,96,0.1)] space-y-6">
            
            <div className="space-y-2">
               <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">TEKLİF ETTİĞİNİZ VARLIK</label>
               <input 
                 required 
                 placeholder="Örn: iPhone 13 Pro Max (Kutulu, Çiziksiz)" 
                 className="w-full bg-[#030712] border border-white/5 p-6 rounded-2xl outline-none focus:border-[#00f260] font-bold text-sm transition-all focus:bg-[#00f260]/5" 
                 onChange={e => setFormData({...formData, teklifEdilenVarlik: e.target.value})} 
               />
            </div>

            <div className="space-y-2">
               <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">NAKİT FARKI (OPSİYONEL)</label>
               <input 
                 type="number"
                 placeholder="Üste verilecek veya alınacak tutar (₺)" 
                 className="w-full bg-[#030712] border border-white/5 p-6 rounded-2xl outline-none focus:border-[#00f260] font-bold text-sm transition-all focus:bg-[#00f260]/5" 
                 onChange={e => setFormData({...formData, nakitFarki: e.target.value})} 
               />
            </div>

            <div className="space-y-2">
               <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">SİBER TAKAS NOTUNUZ</label>
               <textarea 
                 required 
                 placeholder="Örn: Benim cihazım tertemiz, üste 5000 ₺ verebilirim. Elden teslim alabilirim..." 
                 className="w-full bg-[#030712] border border-white/5 p-6 rounded-2xl min-h-[120px] outline-none focus:border-[#00f260] font-bold text-sm transition-all focus:bg-[#00f260]/5 resize-none leading-relaxed" 
                 onChange={e => setFormData({...formData, takasNotu: e.target.value})}
               ></textarea>
            </div>
            
            <div className="pt-4">
               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className={`w-full py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] transition-all duration-300 group flex items-center justify-center gap-3 ${isSubmitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-[#00f260] text-black shadow-[0_0_30px_rgba(0,242,96,0.2)] hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(0,242,96,0.4)]'}`}
               >
                 {isSubmitting ? "SİBER AĞA İLETİLİYOR..." : "🚀 TEKLİFİ MÜHÜRLE VE FIRLAT"}
               </button>
            </div>

        </form>

      </div>
    </div>
  );
}
