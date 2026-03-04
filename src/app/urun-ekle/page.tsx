"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UrunEklePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    ownerEmail: "test@atakasa.com", // Şimdilik test maili, sonra girişe bağlanacak
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("🚀 SİBER BAŞARI: Varlık sisteme mühürlendi!");
        router.push("/products"); // Başarılıysa vitrine yolla
      } else {
        alert("Kayıt sırasında bir hata oluştu.");
      }
    } catch (error) {
      alert("Sunucuya bağlanılamadı!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 border-l-4 border-[#00f260] pl-4">
          Sisteme Varlık <span className="text-[#00f260]">Ekle</span>
        </h1>

        <form onSubmit={handleSubmit} className="bg-[#0b0f19] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-6">
          <div>
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Varlık Başlığı</label>
            <input 
              required 
              type="text"
              placeholder="Örn: 2023 Model MacBook Pro"
              className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Değer (₺)</label>
            <input 
              required 
              type="number"
              placeholder="Örn: 45000"
              className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Detaylı Açıklama</label>
            <textarea 
              required 
              placeholder="Varlığın durumu, takas şartları vs..."
              className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl min-h-[120px] outline-none focus:border-[#00f260] transition-colors"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all ${loading ? 'bg-slate-500' : 'bg-[#00f260] hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,96,0.3)]'}`}
          >
            {loading ? "MÜHÜRLENİYOR..." : "KASAYA EKLE 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
