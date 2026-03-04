"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UrunEklePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    isim: "",
    deger: "",
    gorsel: ""
  });

  // 🚀 İŞTE ZIRHLI SATIR BURASI: (e: React.FormEvent)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("⚡ SİBER BAŞARI: Varlık sisteme mühürlendi!");
        router.push("/products");
      } else {
        alert("Kayıt sırasında bir hata oluştu.");
      }
    } catch (error) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-black text-white mb-8 text-center uppercase tracking-tighter italic border-b-2 border-[#00f260] pb-4">
          Sisteme Varlık <span className="text-[#00f260]">Ekle</span>
        </h1>

        <form onSubmit={handleSubmit} className="bg-[#0b0f19] border border-white/5 p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,242,96,0.1)] space-y-6">
          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">Varlık Adı</label>
            <input
              type="text"
              required
              placeholder="Örn: Apple MacBook Pro"
              className="w-full bg-[#030712] border border-white/5 p-4 rounded-xl outline-none focus:border-[#00f260] text-white font-bold transition-colors"
              onChange={(e) => setFormData({...formData, isim: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">Piyasa Değeri (₺)</label>
            <input
              type="number"
              required
              placeholder="Örn: 45000"
              className="w-full bg-[#030712] border border-white/5 p-4 rounded-xl outline-none focus:border-[#00f260] text-white font-bold transition-colors"
              onChange={(e) => setFormData({...formData, deger: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">Görsel URL (İsteğe Bağlı)</label>
            <input
              type="text"
              placeholder="https://gorsel.adresi.com/resim.jpg"
              className="w-full bg-[#030712] border border-white/5 p-4 rounded-xl outline-none focus:border-[#00f260] text-white font-bold transition-colors"
              onChange={(e) => setFormData({...formData, gorsel: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all bg-[#00f260] text-black hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting ? "YÜKLENİYOR..." : "VARLIĞI EKLE ⚡"}
          </button>
        </form>
      </div>
    </div>
  );
}
