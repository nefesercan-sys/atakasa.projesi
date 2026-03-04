"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TakasTeklif() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offeredProductId: "ornek_benim_varligim_id", // İleride seçilen üründen gelecek
    requestedProductId: "ornek_karsi_varlik_id", 
    message: "",
  });

  const handleTeklifGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("🚀 SİBER BAŞARI: Takas teklifi karşı tarafa mühürlendi!");
        router.push("/trades"); // Teklif gönderilince kontrol paneline at
      } else {
        alert("Teklif iletilemedi, kalkanlara takıldı.");
      }
    } catch (error) {
      alert("Siber ağ bağlantısı koptu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 border-l-4 border-[#00f260] pl-4">
          Takas Teklifi <span className="text-[#00f260]">Fırlat</span>
        </h1>
        
        <form onSubmit={handleTeklifGonder} className="bg-[#0b0f19] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <div>
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Siber Takas Notunuz</label>
            <textarea 
              required 
              placeholder="Örn: Benim cihazım tertemiz, üste 5000 ₺ verebilirim..."
              className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl min-h-[120px] outline-none focus:border-[#00f260] transition-colors"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all ${loading ? 'bg-slate-500' : 'bg-[#00f260] hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,96,0.3)]'}`}
          >
            {loading ? "SİSTEM İŞLİYOR..." : "TEKLİFİ MÜHÜRLE 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
