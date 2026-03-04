"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function CyberNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [activeModal, setActiveModal] = useState(null); 
  const [showForm, setShowForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const [images, setImages] = useState(Array(5).fill(null));
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

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("SİBER HATA: Kamera izni reddedildi!");
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
      }
    }
  };

  const handlePublish = () => {
     if(!formData.baslik || !formData.fiyat) return alert("Zorunlu alanları doldurun!");
     alert("⚡ SİBER BAŞARI: İlan sisteme mühürlendi ve vitrine aktarıldı!");
     setActiveModal(null);
     setShowForm(false);
     setImages(Array(5).fill(null));
  };

  return (
    <>
      {activeModal === 'sectors' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/95 backdrop-blur-xl p-6 overflow-y-auto pb-32 animate-in fade-in">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 mt-4">
            <h2 className="text-[#00f260] font-black uppercase tracking-tighter text-2xl italic">SEKTÖRLER.</h2>
            <button onClick={() => setActiveModal(null)} className="text-white text-3xl">✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {sectors.map((s, idx) => (
              <button key={idx} onClick={() => { router.push(`/kategori/${s.slug}`); setActiveModal(null); }} className="bg-[#0b0f19] border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3">
                <span className="text-4xl">{s.icon}</span>
                <span className="text-[11px] font-black text-white uppercase">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeModal === 'ilan' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in slide-in-from-bottom">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-[#00f260] font-black uppercase tracking-tighter text-2xl italic">SİBER <span className="text-white">VİTRİN.</span></h2>
                <button onClick={() => {setActiveModal(null); setShowForm(false); setCameraActive(false)}} className="text-white text-3xl">✕</button>
              </div>

              <div className="aspect-square bg-[#0b0f19] border-2 border-[#00f260]/50 rounded-[2.5rem] mb-6 overflow-hidden relative">
                {!cameraActive ? (
                  <button onClick={startCamera} className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <span className="text-6xl">📸</span>
                    <span className="text-[12px] font-black text-white uppercase">SİBER KAMERAYI AÇ</span>
                  </button>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-transparent rounded-full border-[6px] border-[#00f260] flex items-center justify-center">
                        <div className="w-14 h-14 bg-[#00f260] rounded-full"></div>
                    </button>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-5 gap-2 mb-8">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square bg-[#0b0f19] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                    {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-slate-700 text-[9px] font-black">FOTO {i+1}</span>}
                  </div>
                ))}
              </div>

              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="w-full py-6 bg-white/5 border border-[#00f260]/30 text-[#00f260] rounded-[2rem] font-black uppercase text-xs">📝 DETAYLARI GİR VE YAYINLA</button>
              ) : (
                <div className="space-y-5">
                  <input type="text" placeholder="Başlık" className="w-full bg-[#0b0f19] border border-white/5 p-6 rounded-2xl text-white outline-none" onChange={e => setFormData({...formData, baslik: e.target.value})} />
                  <input type="number" placeholder="Fiyat (₺)" className="w-full bg-[#0b0f19] border border-white/5 p-6 rounded-2xl text-[#00f260] outline-none" onChange={e => setFormData({...formData, fiyat: e.target.value})} />
                  <button onClick={handlePublish} className="w-full mt-8 py-7 bg-[#00f260] text-black rounded-[2rem] font-black uppercase">⚡ VİTRİNE MÜHÜRLE</button>
                </div>
              )}
          </div>
        </div>
      )}

      {activeModal === 'messages' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-[#00f260] font-black text-2xl">MESAJLAR</h2>
                <button onClick={() => setActiveModal(null)} className="text-white text-3xl">✕</button>
              </div>
          </div>
        </div>
      )}

      {activeModal === 'panel' && (
        <div className="fixed inset-0 z-[400] bg-[#030712]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <h2 className="text-[#00f260] font-black text-2xl">SİBER KONTROL</h2>
                <button onClick={() => setActiveModal(null)} className="text-white text-3xl">✕</button>
              </div>
              
              <div className="space-y-4">
                <button className="w-full bg-red-500/10 text-red-500 py-6 rounded-3xl font-black uppercase text-xs">SİBER ÇIKIŞ YAP</button>
              </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 z-[500] w-full bg-[#030712]/95 border-t border-white/10 md:hidden">
        <div className="flex justify-around items-end px-2 pb-6 pt-4 relative">
          
          <Link href="/" onClick={() => setActiveModal(null)} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className="text-2xl">🏠</span><span className="text-[9px] font-black text-slate-500">VİTRİN</span>
          </Link>

          <button onClick={() => setActiveModal('sectors')} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className="text-2xl">📂</span><span className="text-[9px] font-black text-slate-500">SEKTÖR</span>
          </button>

          <div className="relative -top-8 px-2 z-10">
            <button onClick={() => setActiveModal('ilan')} className="w-[72px] h-[72px] bg-[#00f260] rounded-full flex items-center justify-center border-[6px] border-[#030712]">
              <span className="text-4xl text-black font-black">＋</span>
            </button>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#00f260]">AT TAKASA</span>
          </div>

          <button onClick={() => setActiveModal('messages')} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className="text-2xl">💬</span><span className="text-[9px] font-black text-slate-500">MESAJ</span>
          </button>

          <button onClick={() => setActiveModal('panel')} className="flex flex-col items-center gap-1 min-w-[50px] py-2">
            <span className="text-2xl">👤</span><span className="text-[9px] font-black text-slate-500">PANEL</span>
          </button>
          
        </div>
      </nav>
    </>
  );
}
