"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
// Eğer SignOutButton bileşenin yoksa veya yolu farklıysa hata almamak için bu satırı kontrol et:
import SignOutButton from '@/components/UserPanel/SignOutButton'; 

export default function CyberNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- MODAL DURUMLARI ---
  const [activeModal, setActiveModal] = useState(null); // 'sectors', 'ilan', 'messages', 'panel'
  const [showForm, setShowForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // --- MEDYA VE FORM STATE ---
  const [images, setImages] = useState(Array(5).fill(null));
  // Video dosyası için state
  const [videoFile, setVideoFile] = useState(null); 
  // Form verileri
  const [formData, setFormData] = useState({ baslik: "", fiyat: "", takasFiyati: "", kategori: "" });

  const sectors = [
    { name: "ÜRÜN SATIŞ", icon: "💰", slug: "urun-satis" }, { name: "HİZMET AL", icon: "🛠️", slug: "hizmet" },
    { name: "TAKAS YAP", icon: "🔄", slug: "takas" }, { name: "KİRALAMA", icon: "🏢", slug: "kiralama" },
    { name: "2. EL PİYASA", icon: "♻️", slug: "ikinci-el" }, { name: "REZERVASYON", icon: "📅", slug: "rezervasyon" },
    { name: "BAĞIŞ YAP", icon: "❤️", slug: "bagis" }, { name: "OYUNCAK", icon: "🧸", slug: "oyuncak" },
    { name: "KİTAP", icon: "📚", slug: "kitap" }, { name: "PETSHOP", icon: "🐾", slug: "petshop" },
    { name: "EĞİTİM", icon: "🎓", slug: "egitim" }, { name: "KİŞİSEL BAKIM", icon: "💄", slug: "bakim" },
    { name: "GİYİM & MODA", icon: "👗", slug: "moda" }, { name: "DOĞAL ÜRÜN", icon: "🌿", slug: "dogal" },
    { name: "ANTİKA", icon: "🏺", slug: "antika" }, { name: "EL SANATLARI", icon: "🎨", slug: "sanat" },
  ];

  // KAMERA FONKSİYONLARI
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("SİBER HATA: Kamera izni reddedildi veya donanım bulunamadı!");
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/png');
      const emptyIndex = images.findIndex(img => img === null);
      if (emptyIndex !== -1) {
        const newImages = [...images];
        newImages[emptyIndex] = url;
        setImages(newImages);
      } else {
        alert("Siber kapasite dolu! Maksimum 5 fotoğraf ekleyebilirsiniz.");
      }
    }
  };

  const handlePublish = () => {
     // Yayınlama simülasyonu. Asıl projede burada API'ye POST isteği atılacak.
     if(!formData.baslik || !formData.fiyat) return alert("Zorunlu alanları doldurun!");
     alert("⚡ SİBER BAŞARI: İlan sisteme mühürlendi ve vitrine aktarıldı!");
     setActiveModal(null);
     setShowForm(false);
     setImages(Array(5).fill(null));
     setFormData({ baslik: "", fiyat: "", takasFiyati: "", kategori: "" });
  };

  return (
    <>
      {/* 🟢 1. SEKTÖRLER MODALI (z-index: 400) */}
      {activeModal === 'sectors' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/95 backdrop-blur-xl p-6 overflow-y-auto pb-32 animate-in fade-in">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 mt-4">
            <h2 className="text-[#00f260] font-black uppercase tracking-tighter text-2xl italic">SEKTÖRLER.</h2>
            <button onClick={() => setActiveModal(null)} className="text-white text-3xl hover:text-red-500 transition-colors">✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {sectors.map((s, idx) => (
              <button key={idx} onClick={() => { router.push(`/kategori/${s.slug}`); setActiveModal(null); }} className="bg-[#0b0f19] border border-white/5 hover:border-[#00f260] p-6 rounded-3xl flex flex-col items-center gap-3 transition-all hover:scale-105 group">
                <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
                <span className="text-[11px] font-black text-white uppercase tracking-wider">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🚀 2. İLAN MERKEZİ (AT TAKASA) MODALI (z-index: 400) */}
      {activeModal === 'ilan' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in slide-in-from-bottom">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-[#00f260] font-black uppercase tracking-tighter text-2xl italic">SİBER <span className="text-white">VİTRİN.</span></h2>
                <button onClick={() => {setActiveModal(null); setShowForm(false); setCameraActive(false)}} className="text-white text-3xl hover:text-red-500 transition-colors">✕</button>
              </div>

              {/* MEDYA ALANI */}
              <div className="aspect-square md:aspect-[4/3] bg-[#0b0f19] border-2 border-[#00f260]/50 rounded-[2.5rem] mb-6 overflow-hidden relative shadow-[0_0_40px_rgba(0,242,96,0.1)]">
                {!cameraActive ? (
                  <button onClick={startCamera} className="absolute inset-0 flex flex-col items-center justify-center gap-4 hover:bg-[#00f260]/5 transition-colors group">
                    <span className="text-6xl group-hover:scale-110 transition-transform">📸</span>
                    <span className="text-[12px] font-black text-white uppercase tracking-[0.3em]">SİBER KAMERAYI AÇ</span>
                  </button>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-transparent rounded-full border-[6px] border-[#00f260] shadow-[0_0_30px_#00f260] hover:scale-95 transition-transform flex items-center justify-center">
                        <div className="w-14 h-14 bg-[#00f260] rounded-full"></div>
                    </button>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* MİNİ GALERİ */}
              <div className="grid grid-cols-5 gap-2 mb-8">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square bg-[#0b0f19] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative group">
                    {img ? (
                        <>
                           <img src={img} className="w-full h-full object-cover" />
                           <button onClick={() => { const newImgs = [...images]; newImgs[i] = null; setImages(newImgs); }} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-black text-xs">SİL</button>
                        </>
                    ) : <span className="text-slate-700 text-[9px] font-black uppercase tracking-tighter">FOTO {i+1}</span>}
                  </div>
                ))}
              </div>

              {/* SİBER FORM */}
              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="w-full py-6 bg-white/5 border border-[#00f260]/30 text-[#00f260] rounded-[2rem] font-black uppercase text-xs hover:bg-[#00f260]/10 transition-colors shadow-lg">📝 DETAYLARI GİR VE YAYINLA</button>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-500">
                  <div className="space-y-2">
                     <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">Varlık Kategori</label>
                     <select className="w-full bg-[#0b0f19] border border-white/5 p-6 rounded-2xl text-white text-sm font-bold outline-none focus:border-[#00f260] appearance-none" onChange={e => setFormData({...formData, kategori: e.target.value})}>
                         <option value="">KATEGORİ SEÇİN...</option>
                         {sectors.map((s, i) => <option key={i} value={s.slug}>{s.name}</option>)}
                     </select>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">Varlık Başlığı</label>
                     <input type="text" placeholder="Örn: iPhone 14 Pro Max 256GB" className="w-full bg-[#0b0f19] border border-white/5 p-6 rounded-2xl text-white text-sm font-bold outline-none focus:border-[#00f260]" onChange={e => setFormData({...formData, baslik: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">Satış Fiyatı (₺)</label>
                         <input type="number" placeholder="0" className="w-full bg-[#0b0f19] border border-white/5 p-6 rounded-2xl text-[#00f260] text-xl font-black outline-none focus:border-[#00f260]" onChange={e => setFormData({...formData, fiyat: e.target.value})} />
                      </div>
                      <div className="space-y-2 relative">
                         <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-4">Takas Değeri (₺)</label>
                         <input type="number" placeholder="0" className="w-full bg-[#0b0f19] border border-amber-500/30 p-6 rounded-2xl text-amber-500 text-xl font-black outline-none focus:border-amber-500" onChange={e => setFormData({...formData, takasFiyati: e.target.value})} />
                         <span className="absolute -bottom-6 left-0 text-[8px] text-amber-500/60 uppercase tracking-widest font-black">%30 Sınırı Uygulanır</span>
                      </div>
                  </div>

                  <button onClick={handlePublish} className="w-full mt-8 py-7 bg-[#00f260] text-black rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-[0_0_40px_rgba(0,242,96,0.3)] hover:scale-[1.02] transition-transform">⚡ VİTRİNE MÜHÜRLE</button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* 📬 3. MESAJ MERKEZİ MODALI (z-index: 400) */}
      {activeModal === 'messages' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-[#00f260] font-black uppercase tracking-tighter text-2xl italic">MESAJ <span className="text-white">HATTI.</span></h2>
                <button onClick={() => setActiveModal(null)} className="text-white text-3xl hover:text-red-500 transition-colors">✕</button>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-[#0b0f19] border-l-4 border-[#00f260] rounded-r-3xl hover:bg-white/5 transition-colors cursor-pointer">
                  <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">İLAN: MacBook Pro M2</span>
                  <p className="text-white text-sm mt-3 font-bold">"Ercan bey, elimdeki iPhone 14 + 5000₺ nakit ile takas düşünür müsünüz?"</p>
                  <span className="text-slate-500 text-[9px] font-black block mt-4">2 DAKİKA ÖNCE</span>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* 👤 4. PANEL MODALI (ALICI/SATICI AYRIMI) (z-index: 400) */}
      {activeModal === 'panel' && session && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <h2 className="text-[#00f260] font-black uppercase tracking-tighter text-2xl italic">SİBER <span className="text-white">KONTROL.</span></h2>
                <button onClick={() => setActiveModal(null)} className="text-white text-3xl hover:text-red-500 transition-colors">✕</button>
              </div>
              
              <div className="space-y-10">
                {/* CÜZDAN & HAVUZ ÖZETİ */}
                <div className="bg-[#0b0f19] p-8 rounded-[2rem] border border-[#00f260]/30 shadow-[0_0_30px_rgba(0,242,96,0.1)]">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">EMANET HAVUZUNDAKİ VARLIK</p>
                   <p className="text-[#00f260] text-4xl font-black italic">14.500 ₺</p>
                </div>

                {/* OPERASYONLAR */}
                <div className="space-y-4">
                  <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] ml-2">🛡️ İŞLEM MERKEZİ</h3>
                  <Link href="/panel" onClick={() => setActiveModal(null)} className="flex justify-between items-center p-6 bg-[#030712] border border-white/5 rounded-2xl text-white font-bold text-xs uppercase hover:border-[#00f260] transition-colors">
                      <div className="flex items-center gap-3"><span className="text-xl">📦</span> DEVAM EDEN TAKASLAR</div>
                      <span className="text-[#00f260]">→</span>
                  </Link>
                  <Link href="/panel" onClick={() => setActiveModal(null)} className="flex justify-between items-center p-6 bg-[#030712] border border-white/5 rounded-2xl text-white font-bold text-xs uppercase hover:border-[#00f260] transition-colors">
                      <div className="flex items-center gap-3"><span className="text-xl">🛒</span> SATIN ALDIKLARIM</div>
                      <span className="text-[#00f260]">→</span>
                  </Link>
                </div>
                
                {/* Eğer SignOutButton bileşenin yoksa burayı standart bir butona çevirebilirsin */}
                {SignOutButton ? <SignOutButton className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-6 rounded-3xl font-black uppercase text-xs tracking-widest mt-8" /> : null}
              </div>
          </div>
        </div>
      )}

      {/* 📱 MASAÜSTÜ: SAĞ KENAR BUTONU (MOBİLDE GİZLİ) */}
      <div className="hidden md:flex fixed right-8 bottom-8 z-[500]">
        <button onClick={() => setActiveModal('ilan')} className="flex items-center gap-3 bg-[#00f260] text-black px-8 py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,242,96,0.3)] hover:scale-105 hover:shadow-[0_0_60px_rgba(0,242,96,0.6)] transition-all">
          <span className="text-2xl">📸</span>
          <span>AT TAKASA</span>
        </button>
      </div>

      {/* 📱 MOBİL: ANA ALT NAVİGASYON (z-index: 500 - HER ZAMAN EN ÜSTTE) */}
      <nav className="fixed bottom-0 left-0 z-[500] w-full bg-[#030712]/95 backdrop-blur-3xl border-t border-white/10 md:hidden shadow-[0_-20px_40px_rgba(0,0,0,0.8)] pb-safe">
        <div className="flex justify-around items-end px-2 pb-6 pt-4 relative">
          
          <Link href="/" onClick={() => setActiveModal(null)} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className={`text-2xl transition-opacity ${pathname === "/" && activeModal === null ? "opacity-100 drop-shadow-[0_0_8px_#fff]" : "opacity-30"}`}>🏠</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${pathname === "/" && activeModal === null ? "text-white" : "text-slate-500"}`}>VİTRİN</span>
          </Link>

          <button onClick={() => setActiveModal('sectors')} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className={`text-2xl transition-all ${activeModal === 'sectors' ? "text-[#00f260] opacity-100 drop-shadow-[0_0_8px_#00f260]" : "opacity-30"}`}>📂</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${activeModal === 'sectors' ? "text-[#00f260]" : "text-slate-500"}`}>SEKTÖR</span>
          </button>

          {/* MERKEZ: AT TAKASA BUTONU */}
          <div className="relative -top-8 px-2 z-10">
            <button onClick={() => setActiveModal('ilan')} className="w-[72px] h-[72px] bg-[#00f260] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,242,96,0.5)] border-[6px] border-[#030712] active:scale-90 transition-transform">
              <span className="text-4xl text-black font-black mb-1">＋</span>
            </button>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#00f260] uppercase tracking-[0.2em] whitespace-nowrap">AT TAKASA</span>
          </div>

          <button onClick={() => setActiveModal('messages')} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className={`text-2xl transition-all ${activeModal === 'messages' ? "text-[#00f260] opacity-100 drop-shadow-[0_0_8px_#00f260]" : "opacity-30"}`}>💬</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${activeModal === 'messages' ? "text-[#00f260]" : "text-slate-500"}`}>MESAJ</span>
          </button>

          <button onClick={() => setActiveModal('panel')} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className={`text-2xl transition-all ${activeModal === 'panel' ? "text-[#00f260] opacity-100 drop-shadow-[0_0_8px_#00f260]" : "opacity-30"}`}>👤</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${activeModal === 'panel' ? "text-[#00f260]" : "text-slate-500"}`}>PANEL</span>
          </button>
          
        </div>
      </nav>
    </>
  );
}
