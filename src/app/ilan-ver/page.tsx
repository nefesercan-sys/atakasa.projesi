"use client";
import React, { useState, useRef } from "react";

export default function IlanVer() {
  const [formData, setFormData] = useState({
    title: "",
    deger: "",
    takasIstegi: "",
    kategori: "Teknoloji",
    mediaBase64: [] as string[] // Sıkıştırılmış görseller burada toplanacak
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚀 YERLEŞİK SİBER SIKIŞTIRMA MOTORU (Kütüphane Gerektirmez!)
  const compressImageLocally = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Maksimum genişlik
          const MAX_HEIGHT = 800; // Maksimum yükseklik
          let width = img.width;
          let height = img.height;

          // En-boy oranını koruyarak yeniden boyutlandır
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // %70 Kalite ile JPEG formatında Base64'e çevir (Vercel limitini ezer)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsCompressing(true);
    const files = Array.from(e.target.files);
    const compressedBase64Array: string[] = [];

    try {
      for (const file of files) {
        // Video ise atla
        if (file.type.startsWith('video/')) {
           alert("Video yükleme geçici olarak devre dışı. Lütfen fotoğraf seçin.");
           continue; 
        }

        // 🚀 Kendi yazdığımız motorla sıkıştır
        const base64data = await compressImageLocally(file);
        compressedBase64Array.push(base64data);
      }

      setFormData(prev => ({ ...prev, mediaBase64: [...prev.mediaBase64, ...compressedBase64Array] }));
    } catch (error) {
      console.error("Sıkıştırma sırasında siber hata:", error);
      alert("Görseller sıkıştırılırken bir hata oluştu.");
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaBase64: prev.mediaBase64.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({ title: "", deger: "", takasIstegi: "", kategori: "Teknoloji", mediaBase64: [] });
      } else {
         const errorData = await res.json();
         alert(`Sunucu Hatası: ${errorData.message || "Bilinmeyen hata"}`);
      }
    } catch (error) {
      console.error("Yükleme Hatası:", error);
      alert("Sistem bağlantısı koptu. Veri çok büyük veya sunucu yanıt vermiyor.");
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

              {/* GÖRSEL YÜKLEME VE ÖNİZLEME ALANI */}
              <div className="space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.1] rounded-3xl p-10 text-center hover:border-[#00f260]/30 transition-colors cursor-pointer group bg-white/[0.01]"
                >
                  <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#00f260]/20 transition-colors">
                    <span className="text-2xl text-slate-400 group-hover:text-[#00f260]">
                      {isCompressing ? "⏳" : "📷"}
                    </span>
                  </div>
                  <p className="text-white font-bold tracking-wide mb-1">
                    {isCompressing ? "Siber Sıkıştırma Aktif..." : "Varlık Görsellerini Yükle"}
                  </p>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">
                    Fotoğraflar otomatik sıkıştırılır. (Maks 5)
                  </p>
                </div>

                {/* Yüklenen Görsellerin Önizlemesi */}
                {formData.mediaBase64.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto py-2">
                    {formData.mediaBase64.map((imgSrc, index) => (
                      <div key={index} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10">
                        <img src={imgSrc} alt={`Yüklenen ${index}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MÜHÜRLE BUTONU */}
              <button 
                type="submit" 
                disabled={loading || isCompressing}
                className="w-full bg-gradient-to-r from-[#00f260] to-emerald-500 text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,242,96,0.3)] transition-all duration-300 mt-4 disabled:opacity-50"
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
