"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, X, CheckCircle, Loader2 } from "lucide-react";

export default function IlanVer() {
  const [formData, setFormData] = useState({
    title: "",
    deger: "",
    takasIstegi: "",
    kategori: "Teknoloji",
    images: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ☁️ CLOUDINARY SİBER BULUT BİLGİLERİ (Tam Otomatik Mod)
  const CLOUD_NAME = "dluamcnej"; 
  const UPLOAD_PRESET = "atakasa_hizli"; 

  // 🚀 DOĞRUDAN BULUTA YÜKLEME MOTORU (Vercel ByPass)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", UPLOAD_PRESET);
        uploadData.append("cloud_name", CLOUD_NAME);

        // Buluta fırlat! (auto/upload sayesinde 100MB video bile yağ gibi akar)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
          method: "POST",
          body: uploadData,
        });

        const data = await res.json();
        
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url); // Linki hafızaya al
        } else {
          console.error("Bulut reddetti:", data);
        }
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (error) {
      console.error("Bulut yükleme hatası:", error);
      alert("Medya yüklenirken siber bir kalkanla karşılaştık.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ⚠️ DİKKAT: Veritabanına sadece hafif bir link (URL) gidiyor
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({ title: "", deger: "", takasIstegi: "", kategori: "Teknoloji", images: [] });
      } else {
         const errorData = await res.json();
         alert(`Sunucu Hatası: ${errorData.error || errorData.message || "Bilinmeyen hata"}`);
      }
    } catch (error) {
      console.error("Yükleme Hatası:", error);
      alert("Sistem bağlantısı koptu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans pt-28 pb-24 px-6 relative overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-[#00f260] opacity-[0.03] blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-white">
            Sisteme Varlık <span className="text-[#00f260]">Mühürle.</span>
          </h1>
        </div>

        <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {success ? (
            <div className="text-center py-16">
              <CheckCircle className="w-24 h-24 text-[#00f260] mx-auto mb-6" />
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Varlık Tahtaya Düştü!</h2>
              <button onClick={() => setSuccess(false)} className="bg-white/[0.05] hover:bg-[#00f260] hover:text-black text-white font-bold tracking-widest uppercase px-8 py-4 rounded-xl transition-all mt-4">
                Yeni Varlık Ekle
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Varlık Adı / Modeli</label>
                <input type="text" required placeholder="Örn: MacBook Pro M3..." className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Tahmini Değer (₺)</label>
                  <input type="number" required placeholder="120000" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 outline-none" value={formData.deger} onChange={(e) => setFormData({...formData, deger: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Kategori</label>
                  <select className="w-full bg-[#0a0a0a] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 outline-none" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}>
                    <option>Teknoloji Endeksi</option>
                    <option>Araç & Mobilite</option>
                    <option>Gayrimenkul</option>
                    <option>Moda & Lüks</option>
                    <option>Diğer Varlıklar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#00f260] uppercase tracking-widest ml-2">Ne İle Takas Edilecek?</label>
                <textarea required placeholder="Araba ile takas olur..." className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-5 text-white focus:border-[#00f260]/50 outline-none min-h-[120px]" value={formData.takasIstegi} onChange={(e) => setFormData({...formData, takasIstegi: e.target.value})}></textarea>
              </div>

              {/* ☁️ CLOUDINARY MEDYA YÜKLEME ALANI */}
              <div className="space-y-4">
                <input type="file" accept="image/*,video/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                
                <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`border-2 border-dashed border-white/[0.1] rounded-3xl p-10 text-center transition-colors cursor-pointer group bg-white/[0.01] ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00f260]/30'}`}>
                  <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#00f260]/20 transition-colors">
                    {isUploading ? <Loader2 className="animate-spin text-[#00f260]" /> : <UploadCloud className="text-slate-400 group-hover:text-[#00f260]" />}
                  </div>
                  <p className="text-white font-bold tracking-wide mb-1">
                    {isUploading ? "Siber Buluta Aktarılıyor..." : "Varlık Medyalarını Yükle"}
                  </p>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Sınırsız Boyut - Fotoğraf ve Video Destekli</p>
                </div>

                {/* Yüklenen Medyaların Önizlemesi */}
                {formData.images.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto py-2 custom-scrollbar">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                        {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                          <video src={url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={url} alt={`Medya ${index}`} className="w-full h-full object-cover" />
                        )}
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading || isUploading || formData.images.length === 0} className="w-full bg-[#00f260] text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 mt-4 disabled:opacity-50 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                {loading ? "MÜHÜRLENİYOR..." : "VARLIĞI PİYASAYA SÜR"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
