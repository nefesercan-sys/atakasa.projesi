"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Kategoriye Göre Akıllı Alanlar
const kategoriDetaylari: any = {
  "Elektronik": ["Cep Telefonu", "Televizyon", "Bilgisayar"],
  "Mobilya": ["Koltuk Takımı", "Yatak Odası", "Mutfak Masası"],
  "Oyuncak": ["Akülü Araba", "Lego", "Figür"]
};

export default function IlanVerPage() {
  const [step, setStep] = useState(1);
  const [media, setMedia] = useState<{urls: string[], video: string}>({ urls: [], video: "" });
  const [formData, setFormData] = useState({
    category: "", subCategory: "", price: 0, title: "", brand: "", model: "", year: "", location: "", delivery: "kargo", type: "takas_satis"
  });

  // 📷 Kamera ve Medya Enjektörü
  const handleMedia = (e: any, type: 'img' | 'vid') => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'img') setMedia(prev => ({ ...prev, urls: [...prev.urls, url] }));
      else setMedia(prev => ({ ...prev, video: url }));
      if (step === 1) setStep(2); // İlk medya yüklemede formu aç
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] p-6 text-white pt-24">
      <h1 className="text-3xl font-black mb-8 uppercase italic border-l-4 border-[#38bdf8] pl-4">Takas Başlat</h1>

      {/* 01. MEDYA YÜKLEME (KAMERA ODAKLI) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <label className="aspect-square bg-[#0b0f19] border-2 border-dashed border-[#38bdf8]/30 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#38bdf8]">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleMedia(e, 'img')} />
          <span className="text-3xl">📸</span>
          <span className="text-[10px] font-bold mt-2">RESİM ÇEK</span>
        </label>
        <label className="aspect-[4/3] col-span-2 bg-[#38bdf8]/5 border-2 border-dashed border-[#38bdf8]/50 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer">
          <input type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => handleMedia(e, 'vid')} />
          <span className="text-3xl">🎥</span>
          <span className="text-[10px] font-bold mt-2">VİDEO KAYDET</span>
        </label>
      </div>

      {/* 02. AKILLI SENTEZ FORMU */}
      {step >= 2 && (
        <div className="space-y-6 bg-[#0b0f19] p-8 rounded-[3rem] border border-white/5 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select className="siber-input" onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option>Kategori Seçin</option>
              {Object.keys(kategoriDetaylari).map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            {formData.category && (
              <select className="siber-input animate-pulse" onChange={(e) => setFormData({...formData, subCategory: e.target.value})}>
                <option>Alt Kategori (Akıllı Seçim)</option>
                {kategoriDetaylari[formData.category].map((s:string) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input placeholder="Marka" className="siber-input" />
            <input placeholder="Model" className="siber-input" />
            <input placeholder="Yıl" className="siber-input" type="number" />
            <input placeholder="Ortalama Fiyat (₺)" className="siber-input text-[#38bdf8] font-bold" type="number" />
          </div>

          <div className="flex gap-4">
            <button className={`flex-1 p-5 rounded-2xl border ${formData.type === 'takas' ? 'bg-[#38bdf8] text-black' : 'border-white/10'}`} onClick={() => setFormData({...formData, type: 'takas'})}>SADECE TAKAS</button>
            <button className={`flex-1 p-5 rounded-2xl border ${formData.type === 'satis' ? 'bg-[#38bdf8] text-black' : 'border-white/10'}`} onClick={() => setFormData({...formData, type: 'satis'})}>SADECE SATIŞ</button>
            <button className={`flex-1 p-5 rounded-2xl border ${formData.type === 'ikisi' ? 'bg-[#38bdf8] text-black' : 'border-white/10'}`} onClick={() => setFormData({...formData, type: 'ikisi'})}>İKİSİ DE UYGUN</button>
          </div>

          <button className="w-full bg-[#38bdf8] text-black py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-[#38bdf8]/20">İLANINIZI YAYINLAYIN 🚀</button>
        </div>
      )}
    </div>
  );
}
