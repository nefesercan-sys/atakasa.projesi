"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Image as ImageIcon, Loader2 } from "lucide-react";

export default function LuksIlanEklemeEkrani() {
  const router = useRouter();
  
  // 🚀 ADIM KONTROLÜ (1: Fotoğraf Seçimi, 2: Detaylar)
  const [step, setStep] = useState(1);

  // ☁️ MEDYA VE FORM STATE'LERİ
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    isim: "",
    deger: "",
    kategori: "Teknoloji Endeksi",
    takasIstegi: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GİZLİ İNPUT REFERANSLARI
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ☁️ CLOUDINARY BİLGİLERİN
  const CLOUD_NAME = "diuamcnej";
  const UPLOAD_PRESET = "nexus_preset";

  // 🚀 BULUT MOTORU
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (images.length >= 5) {
        alert("Maksimum 5 görsel yükleyebilirsiniz.");
        return;
    }

    setIsUploading(true);
    // Sadece kalan boş kutu sayısı kadar dosya al
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", UPLOAD_PRESET);
        uploadData.append("cloud_name", CLOUD_NAME);

        // Vercel'i atla, direkt buluta yolla
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
          method: "POST",
          body: uploadData,
        });
        
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      }
      // Yeni linkleri ekranın kutularına yerleştir
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      alert("Buluta aktarılırken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Arka plana sadece hafif veriler (Linkler) gidiyor
      const payload = {
        ...formData,
        gorsel: images[0] || "", // İlk fotoğraf ana görsel
        images: images // Tüm fotoğraflar
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("SİBER MÜHÜR VURULDU! Varlık sisteme eklendi.");
        router.push("/products"); // İlan eklendikten sonra gideceği yer
      } else {
        alert("Kayıt sırasında hata oluştu.");
      }
    } catch (error) {
      alert("Sistem bağlantısı koptu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#00f260] selection:text-black">
      
      {/* 🚀 ÜST BİLGİ BAR (HEADER) */}
      <div className="flex justify-between items-center p-6 border-b border-white/5">
        <h1 className="text-2xl font-black italic tracking-tighter">
          AT <span className="text-[#00f260]">TAKASA.</span>
        </h1>
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors">
          <X size={28} />
        </button>
      </div>

      <div className="max-w-md mx-auto p-6 mt-4">
        
        {/* ======================================================= */}
        {/* ADIM 1: MEDYA YÜKLEME EKRANI (SENİN ATTIĞIN TASARIM)    */}
        {/* ======================================================= */}
        {step === 1 ? (
          <div className="animate-in fade-in duration-300">
            
            {/* Lüks Yükleme Butonları */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div 
                onClick={() => !isUploading && cameraInputRef.current?.click()}
                className={`bg-[#111] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 h-36 shadow-lg ${isUploading ? 'opacity-50' : 'hover:border-zinc-500'}`}
              >
                <Camera size={38} strokeWidth={1.5} className="text-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kamerayı Aç</span>
              </div>
              <div 
                onClick={() => !isUploading && galleryInputRef.current?.click()}
                className={`bg-[#111] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 h-36 shadow-lg ${isUploading ? 'opacity-50' : 'hover:border-amber-500/50'}`}
              >
                <ImageIcon size={38} strokeWidth={1.5} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Galeriden Yükle</span>
              </div>
            </div>

            {/* Gizli Inputlar */}
            <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
            <input type="file" accept="image/*,video/*" multiple className="hidden" ref={galleryInputRef} onChange={handleFileChange} />

            {/* Bulut Yükleme Göstergesi */}
            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-6 bg-[#00f260]/10 py-3 rounded-xl border border-[#00f260]/20">
                <Loader2 size={16} className="animate-spin" /> Varlık Buluta Transfer Ediliyor...
              </div>
            )}

            {/* 5'li Fotoğraf Kutuları */}
            <div className="flex justify-between gap-2 mb-10">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="flex-1 aspect-square bg-[#111] rounded-[1rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  {images[index] ? (
                    <>
                      {images[index].includes('.mp4') || images[index].includes('.mov') ? (
                        <video src={images[index]} className="w-full h-full object-cover opacity-90" muted />
                      ) : (
                        <img src={images[index]} className="w-full h-full object-cover opacity-90" alt={`Foto ${index + 1}`} />
                      )}
                      <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center hover:bg-red-500">
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Foto {index + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* İleri Butonu */}
            <button 
              onClick={() => setStep(2)}
              disabled={images.length === 0}
              className="w-full border border-zinc-700 text-zinc-400 font-black text-[11px] uppercase tracking-[0.1em] py-5 rounded-2xl hover:border-[#00f260] hover:text-[#00f260] transition-all disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400"
            >
              DETAYLARI GİR VE MÜHÜRLE
            </button>
          </div>
        ) : (
          
        /* ======================================================= */
        /* ADIM 2: FORM BİLGİLERİ GİRİŞ EKRANI                     */
        /* ======================================================= */
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 space-y-5 shadow-xl">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Varlık Adı</label>
                <input type="text" required placeholder="Örn: iPhone 14 Pro Max" className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#00f260]/50 outline-none text-sm transition-colors" value={formData.isim} onChange={(e) => setFormData({...formData, isim: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Piyasa Değeri (₺)</label>
                <input type="number" required placeholder="Örn: 45000" className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#00f260]/50 outline-none text-sm transition-colors" value={formData.deger} onChange={(e) => setFormData({...formData, deger: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Kategori Endeksi</label>
                <select className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#00f260]/50 outline-none text-sm appearance-none transition-colors" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}>
                  <option>Teknoloji Endeksi</option>
                  <option>Araç & Mobilite</option>
                  <option>Ev & Yaşam</option>
                  <option>Moda & Lüks</option>
                  <option>Diğer Varlıklar</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#00f260] uppercase tracking-widest ml-2">Takas Beklentisi</label>
                <textarea required placeholder="Sadece üst modellerle takas olur..." className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#00f260]/50 outline-none text-sm h-24 resize-none transition-colors" value={formData.takasIstegi} onChange={(e) => setFormData({...formData, takasIstegi: e.target.value})}></textarea>
              </div>
            </div>

            {/* Alt Kontrol Butonları */}
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-5 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">
                GERİ
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#00f260] text-black font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl shadow-[0_0_20px_rgba(0,242,96,0.3)] disabled:opacity-50 hover:scale-[1.02] transition-all">
                {isSubmitting ? "MÜHÜRLENİYOR..." : "SİSTEME AKTAR"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
