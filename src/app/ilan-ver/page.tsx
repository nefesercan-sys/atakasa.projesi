"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function IlanVerPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "", category: "Elektronik", price: 0, type: "takas_satis", description: ""
  });

  // 📸 SİBER KAMERA VE MEDYA
  const triggerCamera = () => {
    // Mobil cihazda doğrudan kamerayı tetikler
    setStep(2);
  };

  const handlePublish = async () => {
    if (formData.price <= 0) {
       setError("Siber Uyarı: Geçerli bir takas fiyatı girilmelidir!");
       return;
    }
    alert("İlanınız Siber Ağda Yayına Alınıyor...");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-6 pt-24 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black italic mb-2 tracking-tighter">ATAKASA <span className="text-[#38bdf8] text-xl">TERMINAL</span></h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-12">Güvenli Varlık Tanımlama Merkezi</p>

        {/* 1. ADIM: MEDYA ENJEKSİYONU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div onClick={triggerCamera} className="h-48 bg-[#0b0f19] border-2 border-dashed border-[#38bdf8]/30 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-[#38bdf8]/5 transition-all">
            <span className="text-4xl mb-2">📸</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Resim / Video Çek</span>
          </div>
          <div className="h-48 bg-[#0b0f19] border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-center text-center">
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
              Lütfen ürünün net fotoğraflarını ve <br/> çalışır durumdaki videosunu yükleyin.
            </p>
          </div>
        </div>

        {/* 2. ADIM: AKILLI FORM SENTEZİ */}
        <div className="space-y-6 bg-[#0b0f19] p-10 rounded-[3rem] border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#38bdf8] uppercase pl-2">Kategori</label>
              <select className="w-full bg-[#030712] border border-white/10 p-5 rounded-2xl outline-none focus:border-[#38bdf8]" 
                onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="Elektronik">Elektronik Eşya</option>
                <option value="Mobilya">Mobilya / Ev</option>
                <option value="Vasıta">Oto / Vasıta</option>
                <option value="Oyuncak">Oyuncak / Hobi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#38bdf8] uppercase pl-2">Varlık Değeri (₺)</label>
              <input type="number" placeholder="0.00" className="w-full bg-[#030712] border border-white/10 p-5 rounded-2xl outline-none focus:border-[#38bdf8] font-bold text-xl"
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}/>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[9px] font-black text-[#38bdf8] uppercase pl-2">İşlem Modu</label>
             <div className="flex gap-3">
               {['takas', 'satis', 'ikisi'].map((type) => (
                 <button key={type} onClick={() => setFormData({...formData, type})}
                   className={`flex-1 py-4 rounded-2xl border text-[9px] font-black uppercase transition-all ${formData.type === type ? 'bg-[#38bdf8] text-black border-[#38bdf8]' : 'border-white/10 hover:border-white/30'}`}>
                   {type === 'ikisi' ? 'Takas & Satış' : type}
                 </button>
               ))}
             </div>
          </div>

          <textarea placeholder="Ürün açıklaması ve teknik özellikler..." rows={4} className="w-full bg-[#030712] border border-white/10 p-6 rounded-[2rem] outline-none focus:border-[#38bdf8] text-sm"/>

          {error && <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-500 text-[9px] font-black uppercase text-center">{error}</div>}

          <button onClick={handlePublish} className="w-full bg-[#38bdf8] text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-[0_15px_30px_rgba(56,189,248,0.2)] hover:scale-[1.02] transition-all">
            İLANINIZI SİBER AĞDA YAYINLAYIN
          </button>
        </div>
      </div>
    </div>
  );
}
