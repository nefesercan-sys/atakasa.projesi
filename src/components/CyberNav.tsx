"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function CyberNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // 🚀 ZIRHLI REFERANSLAR
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 🚀 ZIRHLI STATE'LER
  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [showForm, setShowForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const [images, setImages] = useState<(string | null)[]>(Array(5).fill(null));
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
      
      if (context) {
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
    }
  };

  const handlePublish = () => {
     if(!formData.baslik || !formData.fiyat) return alert("Zorunlu alanları doldurun!");
     alert("⚡ SİBER BAŞARI: İlan sisteme mühürlendi ve vitrine aktarıldı!");
     
     setActiveModal(null);
     setShowForm(false);
     setCameraActive(false);
     setImages(Array(5).fill(null));
     setFormData({ baslik: "", fiyat: "", takasFiyati: "", kategori: "" });
  };

  return (
    <>
      {/* 📂 SEKTÖRLER MODALI (Yumuşak ve Derin) */}
      {activeModal === 'sectors' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4 mt-4">
            <h2 className="text-white font-black uppercase tracking-tighter text-2xl">Piyasa <span className="text-[#00f260]">Endeksleri.</span></h2>
            <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {sectors.map((s, idx) => (
              <button key={idx} onClick={() => { router.push(`/kategori/${s.slug}`); setActiveModal(null); }} className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-[#00f260]/50 hover:bg-white/[0.04] transition-all shadow-lg hover:-translate-y-1">
                <span className="text-4xl drop-shadow-lg">{s.icon}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ AT TAKASA (KAMERA/İLAN) MODALI */}
      {activeModal === 'ilan' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in slide-in-from-bottom-8 duration-500">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4">
                <h2 className="text-white font-black uppercase tracking-tighter text-3xl">AT <span className="text-[#00f260] drop-shadow-[0_0_10px_rgba(0,242,96,0.5)]">TAKASA.</span></h2>
                <button onClick={() => {setActiveModal(null); setShowForm(false); setCameraActive(false)}} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
              </div>

              {/* SİBER VİZÖR (Kamera Alanı) */}
              <div className="aspect-square bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] mb-6 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {!cameraActive ? (
                  <button onClick={startCamera} className="absolute inset-0 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform border border-white/[0.05]">
                      <span className="text-4xl opacity-80 group-hover:opacity-100">📸</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#00f260] transition-colors">Varlığı Tarat</span>
                  </button>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {/* Estetik Deklanşör */}
                    <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-black/30 backdrop-blur-md rounded-full border-4 border-[#00f260] flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_30px_rgba(0,242,96,0.4)]">
                        <div className="w-14 h-14 bg-[#00f260] rounded-full"></div>
                    </button>
                    {/* Tarayıcı Çizgisi Efekti */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#00f260] opacity-50 shadow-[0_0_20px_rgba(0,242,96,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* FOTOĞRAF GALERİSİ */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square bg-[#0a0a0a] border border-white/[0.04] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                    {img ? <img src={img} className="w-full h-full object-cover" alt={`Foto ${i+1}`} /> : <span className="text-slate-600 text-[8px] font-black tracking-widest">FOTO {i+1}</span>}
                  </div>
                ))}
              </div>

              {/* FORM ALANI */}
              {!showForm ? (
                <button onClick={() => setShowForm(true)} className="w-full py-5 bg-white/[0.02] border border-[#00f260]/20 text-[#00f260] rounded-3xl font-bold uppercase text-xs tracking-widest hover:bg-[#00f260]/10 hover:border-[#00f260]/50 transition-all shadow-lg">
                  Detayları Gir ve Mühürle
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <input type="text" placeholder="Varlık Başlığı (Örn: iPhone 14 Pro)" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 focus:bg-white/[0.02] transition-colors placeholder:text-slate-600 text-sm" onChange={e => setFormData({...formData, baslik: e.target.value})} />
                  <input type="number" placeholder="Tahmini Değer (₺)" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-[#00f260] font-black outline-none focus:border-[#00f260]/50 focus:bg-white/[0.02] transition-colors placeholder:text-slate-600 text-sm" onChange={e => setFormData({...formData, fiyat: e.target.value})} />
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function CyberNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // 🚀 ZIRHLI REFERANSLAR
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚀 ZIRHLI STATE'LER
  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [showForm, setShowForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const [images, setImages] = useState<(string | null)[]>(Array(5).fill(null));
  
  // DETAYLI İLAN FORMU
  const [formData, setFormData] = useState({ 
    sektor: "", 
    baslik: "", 
    fiyat: "", 
    ulke: "Türkiye", 
    sehir: "", 
    ilce: "", 
    aciklama: "" 
  });

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
      alert("SİBER HATA: Kamera izni reddedildi!");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/png');
        addImageToState(url);
      }
    }
  };

  // GALERİDEN YÜKLEME FONKSİYONU
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addImageToState(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageToState = (url: string) => {
    setImages(prev => {
      const newImages = [...prev];
      const emptyIndex = newImages.findIndex(img => img === null);
      if (emptyIndex !== -1) newImages[emptyIndex] = url;
      return newImages;
    });
  };

  // İLAN YAYINLAMA
  const handlePublish = () => {
     if(!formData.baslik || !formData.fiyat || !formData.sektor || !formData.sehir) {
       return alert("Lütfen tüm zorunlu alanları (Sektör, Başlık, Fiyat, Şehir) doldurun!");
     }
     
     setPublishStatus('loading');
     
     // Simüle edilmiş sunucu yükleme süresi
     setTimeout(() => {
       setPublishStatus('success');
       stopCamera();
     }, 1500);
  };

  // PAYLAŞ BUTONU
  const handleShare = async () => {
    const shareData = {
      title: formData.baslik || 'ATAKASA İlanı',
      text: 'Bu siber varlığı Atakasa\'da incele!',
      url: window.location.href, 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Paylaşım iptal edildi veya desteklenmiyor.");
      }
    } else {
      alert("Siber Bağlantı Kopyalandı!");
    }
  };

  // MODALI TAMAMEN SIFIRLA VE KAPAT
  const closeModal = () => {
    setActiveModal(null); 
    setShowForm(false); 
    stopCamera();
    setPublishStatus('idle');
    setImages(Array(5).fill(null));
    setFormData({ sektor: "", baslik: "", fiyat: "", ulke: "Türkiye", sehir: "", ilce: "", aciklama: "" });
  };

  return (
    <>
      {/* 📂 SEKTÖRLER MODALI */}
      {activeModal === 'sectors' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4 mt-4">
            <h2 className="text-white font-black uppercase tracking-tighter text-2xl">Piyasa <span className="text-[#00f260]">Endeksleri.</span></h2>
            <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {sectors.map((s, idx) => (
              <button key={idx} onClick={() => { router.push(`/kategori/${s.slug}`); closeModal(); }} className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-[#00f260]/50 hover:bg-white/[0.04] transition-all shadow-lg hover:-translate-y-1">
                <span className="text-4xl drop-shadow-lg">{s.icon}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ AT TAKASA (KAMERA/İLAN) MODALI */}
      {activeModal === 'ilan' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in slide-in-from-bottom-8 duration-500">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-4">
                <h2 className="text-white font-black uppercase tracking-tighter text-3xl">AT <span className="text-[#00f260] drop-shadow-[0_0_10px_rgba(0,242,96,0.5)]">TAKASA.</span></h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
              </div>

              {publishStatus === 'success' ? (
                /* 🟢 BAŞARI EKRANI VE PAYLAŞ BUTONU */
                <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500 text-center">
                  <div className="w-24 h-24 bg-[#00f260]/10 rounded-full flex items-center justify-center border border-[#00f260]/30 shadow-[0_0_40px_rgba(0,242,96,0.3)] mb-6">
                    <span className="text-5xl text-[#00f260]">✓</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Varlık Mühürlendi!</h3>
                  <p className="text-slate-400 text-sm mb-10 px-4">İlanın başarıyla sisteme aktarıldı ve vitrinde yerini aldı.</p>
                  
                  <button onClick={handleShare} className="w-full mb-4 py-5 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)] transition-all">
                    <span className="text-xl">↗️</span> İlanı Paylaş
                  </button>
                  <button onClick={() => { setPublishStatus('idle'); setShowForm(false); }} className="w-full py-5 bg-white/[0.05] text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all">
                    Yeni Varlık Yükle
                  </button>
                </div>
              ) : (
                /* 📸 MEDYA YÜKLEME VE FORM EKRANI */
                <>
                  <div className="aspect-video md:aspect-square bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] mb-6 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {!cameraActive ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
                        <div className="flex gap-4 w-full px-4">
                          {/* Kamera Aç Butonu */}
                          <button onClick={startCamera} className="flex-1 flex flex-col items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.05] hover:border-[#00f260]/50 transition-all group">
                            <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Kamerayı Aç</span>
                          </button>
                          
                          {/* Galeriden Yükle Butonu */}
                          <div className="flex-1 relative group">
                            <input type="file" accept="image/*,video/*" multiple className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" ref={fileInputRef} onChange={handleFileUpload} />
                            <div className="h-full flex flex-col items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl group-hover:bg-white/[0.05] group-hover:border-[#00f260]/50 transition-all">
                              <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Galeriden Yükle</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        {/* Estetik Deklanşör */}
                        <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-black/30 backdrop-blur-md rounded-full border-4 border-[#00f260] flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_30px_rgba(0,242,96,0.4)] z-20">
                            <div className="w-10 h-10 bg-[#00f260] rounded-full"></div>
                        </button>
                        {/* Kamerayı Kapat */}
                        <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/10 z-20">✕</button>
                        {/* Tarayıcı Çizgisi Efekti */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#00f260] opacity-50 shadow-[0_0_20px_rgba(0,242,96,1)] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
                      </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* FOTOĞRAF GALERİSİ */}
                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {images.map((img, i) => (
                      <div key={i} className="aspect-square bg-[#0a0a0a] border border-white/[0.04] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner relative group">
                        {img ? (
                          <>
                            <img src={img} className="w-full h-full object-cover" alt={`Foto ${i+1}`} />
                            <button onClick={() => {
                              const newImages = [...images]; newImages[i] = null; setImages(newImages);
                            }} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">✕</button>
                          </>
                        ) : (
                          <span className="text-slate-600 text-[8px] font-black tracking-widest">FOTO {i+1}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* DETAYLI İLAN FORMU */}
                  {!showForm ? (
                    <button onClick={() => setShowForm(true)} className="w-full py-5 bg-white/[0.02] border border-[#00f260]/20 text-[#00f260] rounded-3xl font-bold uppercase text-xs tracking-widest hover:bg-[#00f260]/10 hover:border-[#00f260]/50 transition-all shadow-lg">
                      Detayları Gir ve Mühürle
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pb-10">
                      
                      {/* Sektör Seçimi */}
                      <select className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-slate-300 outline-none focus:border-[#00f260]/50 focus:bg-white/[0.02] transition-colors appearance-none text-sm font-bold uppercase tracking-wide"
                        value={formData.sektor} onChange={e => setFormData({...formData, sektor: e.target.value})}>
                        <option value="" disabled>SEKTÖR SEÇİNİZ...</option>
                        {sectors.map(s => <option key={s.slug} value={s.name}>{s.name}</option>)}
                      </select>

                      {/* Başlık ve Fiyat */}
                      <input type="text" placeholder="İlan Başlığı (Örn: MacBook Pro M3)" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 font-bold" value={formData.baslik} onChange={e => setFormData({...formData, baslik: e.target.value})} />
                      <input type="number" placeholder="İlan Fiyatı / Değeri (₺)" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-[#00f260] font-black outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600" value={formData.fiyat} onChange={e => setFormData({...formData, fiyat: e.target.value})} />
                      
                      {/* Konum (Ülke, Şehir, İlçe) */}
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Ülke" className="col-span-2 w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" value={formData.ulke} onChange={e => setFormData({...formData, ulke: e.target.value})} />
                        <input type="text" placeholder="Şehir" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" value={formData.sehir} onChange={e => setFormData({...formData, sehir: e.target.value})} />
                        <input type="text" placeholder="İlçe" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm" value={formData.ilce} onChange={e => setFormData({...formData, ilce: e.target.value})} />
                      </div>

                      {/* Açıklama */}
                      <textarea placeholder="Varlık Açıklaması ve Takas Şartları..." rows={4} className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none focus:border-[#00f260]/50 transition-colors placeholder:text-slate-600 text-sm resize-none" value={formData.aciklama} onChange={e => setFormData({...formData, aciklama: e.target.value})}></textarea>

                      {/* YAYINLA BUTONU */}
                      <button onClick={handlePublish} disabled={publishStatus === 'loading'} className="w-full mt-6 py-6 bg-gradient-to-r from-[#00f260] to-emerald-400 text-black rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)] transition-all flex items-center justify-center">
                        {publishStatus === 'loading' ? (
                           <span className="animate-pulse">SİSTEME AKTARILIYOR...</span>
                        ) : "AT TAKASA"}
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      )}

      {/* 💬 MESAJLAR MODALI */}
      {activeModal === 'messages' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4">
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Siber <span className="text-[#00f260]">Ağ.</span></h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
              </div>
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <span className="text-6xl mb-4">📭</span>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Henüz sinyal yok.</p>
              </div>
          </div>
        </div>
      )}

      {/* 👤 PANEL MODALI */}
      {activeModal === 'panel' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-10 border-b border-white/[0.05] pb-6">
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Siber <span className="text-[#00f260]">Kontrol.</span></h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
              </div>
              
              <div className="space-y-4">
                <button className="w-full bg-red-500/[0.02] text-red-500 py-6 rounded-3xl font-bold uppercase tracking-widest text-xs border border-red-500/10 hover:bg-red-500/10 transition-colors">Sistemden Çıkış Yap</button>
              </div>
          </div>
        </div>
      )}

      {/* 📱 SİBER MOBİL ALT MENÜ */}
      <nav className="fixed bottom-0 left-0 z-[500] w-full md:hidden">
        <div className="absolute bottom-0 w-full h-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.04] shadow-[0_-20px_40px_rgba(0,0,0,0.8)]"></div>
        
        <div className="relative flex justify-between items-end px-4 pb-3 h-24">
          
          <Link href="/" onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <span className={`text-2xl mb-1.5 transition-transform group-hover:scale-110 ${pathname === '/' && !activeModal ? 'grayscale-0' : 'grayscale opacity-50'}`}>🏠</span>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${pathname === '/' && !activeModal ? 'text-[#00f260]' : 'text-slate-500'}`}>VİTRİN</span>
          </Link>

          <button onClick={() => setActiveModal('sectors')} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <span className={`text-2xl mb-1.5 transition-transform group-hover:scale-110 ${activeModal === 'sectors' ? 'grayscale-0' : 'grayscale opacity-50'}`}>🗂️</span>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${activeModal === 'sectors' ? 'text-[#00f260]' : 'text-slate-500'}`}>SEKTÖR</span>
          </button>

          {/* ⚡ AT TAKASA REAKTÖRÜ */}
          <div className="relative flex justify-center w-full px-2 z-20">
            <button onClick={() => setActiveModal('ilan')} className="group flex flex-col items-center outline-none relative -top-6">
              <div className="absolute inset-0 bg-[#00f260] rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-[72px] h-[72px] bg-[#050505] rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-[0_10px_30px_rgba(0,242,96,0.3)] group-hover:border-[#00f260]/50 transition-all duration-300">
                <span className="text-3xl text-[#00f260] drop-shadow-[0_0_8px_rgba(0,242,96,0.8)] group-hover:scale-110 transition-transform duration-300">⚡</span>
              </div>
              <span className="absolute -bottom-5 text-[10px] font-black text-[#00f260] tracking-widest whitespace-nowrap drop-shadow-md">
                AT TAKASA
              </span>
            </button>
          </div>

          <button onClick={() => setActiveModal('messages')} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <div className="relative mb-1.5 transition-transform group-hover:scale-110">
              <span className={`text-2xl ${activeModal === 'messages' ? 'grayscale-0' : 'grayscale opacity-50'}`}>💬</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f260] rounded-full border-2 border-[#0a0a0a] animate-pulse shadow-[0_0_10px_rgba(0,242,96,0.5)]"></span>
            </div>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${activeModal === 'messages' ? 'text-[#00f260]' : 'text-slate-500'}`}>MESAJ</span>
          </button>

          <button onClick={() => setActiveModal('panel')} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <span className={`text-2xl mb-1.5 transition-transform group-hover:scale-110 ${activeModal === 'panel' ? 'grayscale-0' : 'grayscale opacity-50'}`}>👤</span>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${activeModal === 'panel' ? 'text-[#00f260]' : 'text-slate-500'}`}>PANEL</span>
          </button>
          
        </div>
      </nav>

    </>
  );
}
