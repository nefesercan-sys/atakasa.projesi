"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function IlanVer() {
  const [formData, setFormData] = useState({
    title: "",
    deger: "",
    takasIstegi: "",
    kategori: "Teknoloji",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Siber Not: Burada /api/assets rotasına veriyi yolluyoruz (Daha önce kurmuştuk)
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({ title: "", deger: "", takasIstegi: "", kategori: "Teknoloji" });
      }
    } catch (error) {
      console.error("Yükleme Hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pt-28 pb-24 px-6 relative overflow-hidden">
      
      {/* 🌌 YUMUŞATILMIŞ ARKA PLAN IŞIKLARI */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-blue-600 opacity-[0.02] blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        
        {/* BAŞLIK */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-white">
            Sisteme Varlık <span className="text-[#00f260]">Mühürle.</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            Elindeki gücü küresel takas tahtasına sür.
          </p>
        </div>

        {/* 🛡️ SİBER FORM */}
        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {success ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#00f260]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00f260]/30 shadow-[0_0_30px_rgba(0,242,96,0.2)]">
                <span className="text-[#00f260] text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Varlık Tahtaya Düştü!</h2>
              <p className="text-slate-400 mb-8">Teklifler kısa süre içinde paneline akmaya başlayacak.</p>
              <button onClick={() => setSuccess(false)} className="bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold tracking-widest uppercase px-8 py-4 rounded-xl transition-all">
                Yeni Varlık Ekle
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Varlık Adı */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Varlık Adı / Modeli</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: MacBook Pro M3, Rolex Submariner..."
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 focus:bg-white/[0.04] transition-all outline-none shadow-inner"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tahmini Değer */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Tahmini Piyasa Değeri (₺)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Örn: 120000"
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 focus:bg-white/[0.04] transition-all outline-none shadow-inner"
                    value={formData.deger}
                    onChange={(e) => setFormData({...formData, deger: e.target.value})}
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Endeks / Kategori</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 transition-all outline-none appearance-none"
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  >
                    <option>Teknoloji Endeksi</option>
                    <option>Araç & Mobilite</option>
                    <option>Gayrimenkul</option>
                    <option>Moda & Lüks</option>
                    <option>Diğer Varlıklar</option>
                  </select>
                </div>
              </div>

              {/* Takas İsteği */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#00f260] uppercase tracking-widest ml-2 flex items-center gap-2">
                  <span>🔄</span> Ne İle Takas Etmek İstiyorsun?
                </label>
                <textarea 
                  required
                  placeholder="Örn: Sadece üst model araçlarla veya İzmir içi arsa ile takas olur..."
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 focus:bg-white/[0.04] transition-all outline-none shadow-inner min-h-[120px] resize-none"
                  value={formData.takasIstegi}
                  onChange={(e) => setFormData({...formData, takasIstegi: e.target.value})}
                ></textarea>
              </div>

              {/* Görsel Yükleme Alanı (Görsel Estetik, İleride Cloudinary eklenecek) */}
              <div className="border-2 border-dashed border-white/[0.1] rounded-3xl p-10 text-center hover:border-[#00f260]/30 transition-colors cursor-pointer group bg-white/[0.01]">
                <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#00f260]/20 transition-colors">
                  <span className="text-2xl text-slate-400 group-hover:text-[#00f260]">📷</span>
                </div>
                <p className="text-white font-bold tracking-wide mb-1">Varlık Görsellerini Yükle</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest">Sürükle bırak veya tıkla (Maks 5 Fotoğraf)</p>
              </div>

              {/* MÜHÜRLE BUTONU */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00f260] to-emerald-500 text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,242,96,0.3)] transition-all duration-300 mt-4"
              >
                {loading ? "Sisteme Aktarılıyor..." : "VARLIĞI PİYASAYA SÜR"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
