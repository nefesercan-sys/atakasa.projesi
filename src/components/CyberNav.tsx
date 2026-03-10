"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CyberNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // 🚀 REFERANSLAR
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚀 STATE'LER
  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [showForm, setShowForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [lastPublishedId, setLastPublishedId] = useState<string | null>(null);

  const [images, setImages] = useState<Array<string | null>>(Array(5).fill(null));
  
  const [formData, setFormData] = useState({ 
    sektor: "", 
    baslik: "", 
    fiyat: "", 
    ulke: "Türkiye", 
    sehir: "İstanbul", 
    ilce: "", 
    aciklama: "" 
  });

  // ☁️ CLOUDINARY SİBER BİLGİLER (DOĞRULANDI ✅)
  const CLOUD_NAME = "diuamcnej"; 
  const UPLOAD_PRESET = "atakasa_hizli";

  // Bu dizi "🗂️ SEKTÖR" butonundaki görsel menü için kullanılıyor (Bozmuyoruz)
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

  // 🚀 BULUTA FIRLATMA MOTORU (8MB+ VİDEO DESTEKLİ)
  const uploadToCloudinary = async (file: File | string) => {
    setIsCloudLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.secure_url) {
        addImageToState(json.secure_url);
      } else {
        alert("Bulut reddetti: " + (json.error?.message || "Bilinmeyen Hata"));
      }
    } catch (err) {
      alert("Siber bağlantı hatası!");
    } finally {
      setIsCloudLoading(false);
    }
  };

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
        uploadToCloudinary(url);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 100 * 1024 * 1024) return alert("Dosya 100MB sınırını aşıyor!");
      uploadToCloudinary(file);
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

  const handlePublish = async () => {
     if(!session) return alert("SİBER ENGEL: Önce giriş yapmalısın!");
     if(!formData.baslik || !formData.fiyat || !formData.sektor || !formData.sehir) {
       return alert("Lütfen tüm zorunlu alanları doldurun!");
     }
     
     setPublishStatus('loading');
     
     try {
       const res = await fetch("/api/varlik-ekle", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           baslik: formData.baslik,
           fiyat: formData.fiyat,
           kategori: formData.sektor,
           ulke: formData.ulke,
           sehir: formData.sehir,
           ilce: formData.ilce,
           aciklama: formData.aciklama,
           resimler: images.filter(img => img !== null)
         }),
       });

       if (res.ok) {
         const data = await res.json();
         setLastPublishedId(data.id);
         setPublishStatus('success');
         stopCamera();
       } else {
         const data = await res.json();
         alert(data.message || "Siber hata oluştu.");
         setPublishStatus('idle');
       }
     } catch (err) {
       alert("Sistem bağlantısı koptu.");
       setPublishStatus('idle');
     }
  };

  const handleShare = async () => {
    const shareUrl = lastPublishedId 
      ? `https://atakasa.com/varlik/${lastPublishedId}` 
      : window.location.href;

    const shareData = {
      title: formData.baslik || 'At takasa.com İlanı',
      text: `${formData.baslik} - Bu siber varlığı incele!`,
      url: shareUrl, 
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Siber Bağlantı Kopyalandı!");
    }
  };

  const closeModal = () => {
    setActiveModal(null); 
    setShowForm(false); 
    stopCamera();
    setPublishStatus('idle');
    setLastPublishedId(null);
    setImages(Array(5).fill(null));
    setFormData({ sektor: "", baslik: "", fiyat: "", ulke: "Türkiye", sehir: "İstanbul", ilce: "", aciklama: "" });
  };

  return (
    <React.Fragment>
      {/* 📂 SEKTÖRLER MODALI (Navigasyon Menüsü) */}
      {activeModal === 'sectors' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4 mt-4">
            <h2 className="text-white font-black uppercase tracking-tighter text-2xl">At takasa<span className="text-[#00f260]">.com</span></h2>
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

      {/* ⚡ AT TAKASA MODALI (İlan Verme Formu) */}
      {activeModal === 'ilan' && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32 animate-in slide-in-from-bottom-8 duration-500">
          <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-4">
                <h2 className="text-white font-black uppercase tracking-tighter text-3xl italic">AT <span className="text-[#00f260] drop-shadow-[0_0_10px_rgba(0,242,96,0.5)]">TAKASA.</span></h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl transition-colors">✕</button>
              </div>

              {publishStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500 text-center">
                  <div className="w-24 h-24 bg-[#00f260]/10 rounded-full flex items-center justify-center border border-[#00f260]/30 shadow-[0_0_40px_rgba(0,242,96,0.3)] mb-6">
                    <span className="text-5xl text-[#00f260]">✓</span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Varlık Mühürlendi!</h3>
                  <button onClick={handleShare} className="w-full mb-4 py-5 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    İlanı Paylaş
                  </button>
                  <button onClick={closeModal} className="w-full py-5 bg-white/[0.05] text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all">
                    Kapat
                  </button>
                </div>
              ) : (
                <React.Fragment>
                  <div className="aspect-video md:aspect-square bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] mb-6 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {!cameraActive ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
                         {isCloudLoading && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-10 h-10 text-[#00f260] animate-spin" />
                            <span className="text-[#00f260] font-black text-[10px] tracking-widest uppercase">Buluta Aktarılıyor...</span>
                          </div>
                        )}
                        <div className="flex gap-4 w-full px-4">
                          <button onClick={startCamera} className="flex-1 flex flex-col items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.05] transition-all group">
                            <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kamerayı Aç</span>
                          </button>
                          <div className="flex-1 relative group">
                            <input type="file" accept="image/*,video/*" multiple className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" ref={fileInputRef} onChange={handleFileUpload} />
                            <div className="h-full flex flex-col items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl group-hover:bg-white/[0.05] transition-all">
                              <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Galeriden Yükle</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <React.Fragment>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-black/30 backdrop-blur-md rounded-full border-4 border-[#00f260] flex items-center justify-center active:scale-90 transition-transform z-20">
                            <div className="w-10 h-10 bg-[#00f260] rounded-full"></div>
                        </button>
                        <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/10 z-20">✕</button>
                      </React.Fragment>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="grid grid-cols-5 gap-3 mb-8">
                    {images.map((img, i) => (
                      <div key={i} className="aspect-square bg-[#0a0a0a] border border-white/[0.04] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner relative group">
                        {img ? (
                          <React.Fragment>
                            {img.includes(".mp4") || img.includes(".mov") || img.includes(".webm") ? (
                               <video src={img} className="w-full h-full object-cover" />
                            ) : (
                               <img src={img} className="w-full h-full object-cover" alt={`Medya ${i+1}`} />
                            )}
                            <button onClick={() => { const newImages = [...images]; newImages[i] = null; setImages(newImages); }} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-black">✕</button>
                          </React.Fragment>
                        ) : (
                          <span className="text-slate-600 text-[8px] font-black tracking-widest">MEDYA {i+1}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {!showForm ? (
                    <button onClick={() => setShowForm(true)} className="w-full py-5 bg-white/[0.02] border border-[#00f260]/20 text-[#00f260] rounded-3xl font-bold uppercase text-xs tracking-widest hover:bg-[#00f260]/10 transition-all shadow-lg">
                      Detayları Gir ve Mühürle
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pb-10">
                      
                      {/* 🚀 GÜNCELLENMİŞ SİBER KATEGORİ SEÇİCİ */}
                      <select 
                        className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-slate-300 outline-none appearance-none text-sm font-bold uppercase tracking-wide" 
                        value={formData.sektor} 
                        onChange={e => setFormData({...formData, sektor: e.target.value})}
                      >
                        <option value="" disabled>SEKTÖR SEÇİNİZ...</option>
                        <optgroup label="🏢 EMLAK & GAYRİMENKUL">
                          <option value="Emlak - Konut">Konut / Ev</option>
                          <option value="Emlak - İşyeri & Mağaza">İşyeri / Dükkan / Mağaza / Fabrika</option>
                          <option value="Emlak - Arsa & Tarla">Arsa / Tarla</option>
                        </optgroup>
                        <optgroup label="🚗 VASITA & MOBİLİTE">
                          <option value="Vasıta - Otomobil">Otomobil (Araç)</option>
                          <option value="Vasıta - Motosiklet & Bisiklet">Motosiklet / Bisiklet / Scooter</option>
                          <option value="Vasıta - Deniz & Diğer">Deniz Araçları / Akülü Araçlar</option>
                          <option value="Vasıta - Yedek Parça">Yedek Parça & Donanım</option>
                        </optgroup>
                        <optgroup label="💻 ELEKTRONİK & TEKNOLOJİ">
                          <option value="Elektronik - Telefon">Cep Telefonu</option>
                          <option value="Elektronik - Bilgisayar">Bilgisayar / Donanım</option>
                          <option value="Elektronik - TV & Görüntü">Televizyon / Ses / Görüntü</option>
                          <option value="Elektronik - Oyun Konsolu">PlayStation / Oyun Konsolu</option>
                        </optgroup>
                        <optgroup label="🛋️ EV, YAŞAM & BEYAZ EŞYA">
                          <option value="Ev - Mobilya & Tekstil">Mobilya / Halı / Ev Tekstili</option>
                          <option value="Ev - Beyaz Eşya & Isıtıcı">Beyaz Eşya / Isıtıcı</option>
                          <option value="Ev - Dekorasyon & Banyo">Duş Eşyaları / Dekorasyon</option>
                        </optgroup>
                        <optgroup label="⌚ MODA, SAAT & KOZMETİK">
                          <option value="Moda - Giyim & Ayakkabı">Elbise / Giyim</option>
                          <option value="Moda - Saat & Takı">Saat / Takı / Özel Eşya</option>
                          <option value="Kozmetik & Kişisel Bakım">Kozmetik / Kişisel Bakım</option>
                        </optgroup>
                        <optgroup label="🎨 ANTİKA, SANAT & HOBİ">
                          <option value="Sanat - Antika & El Sanatı">Antika Eserler / El Sanatları</option>
                          <option value="Sanat - Özel Tasarım">Özel Tasarımlar</option>
                          <option value="Hobi - Oyuncak & Kitap">Oyuncak / Kitap / Kırtasiye</option>
                        </optgroup>
                        <optgroup label="⚙️ SANAYİ & DİĞER">
                          <option value="Sanayi - Makine & Nalbur">Makine / Nalbur Ürünleri</option>
                          <option value="Evcil Hayvan & Petshop">Canlı Hayvan / Petshop</option>
                          <option value="Gıda & İçecek">Gıda / Yiyecek / İçecek</option>
                          <option value="Diğer">Diğer İlanlar</option>
                        </optgroup>
                      </select>

                      <input type="text" placeholder="İlan Başlığı" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none font-bold" value={formData.baslik} onChange={e => setFormData({...formData, baslik: e.target.value})} />
                      <input type="number" placeholder="İlan Fiyatı / Değeri (₺)" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-[#00f260] font-black outline-none focus:border-[#00f260]/50" value={formData.fiyat} onChange={e => setFormData({...formData, fiyat: e.target.value})} />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Şehir" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none text-sm" value={formData.sehir} onChange={e => setFormData({...formData, sehir: e.target.value})} />
                        <input type="text" placeholder="İlçe" className="w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none text-sm" value={formData.ilce} onChange={e => setFormData({...formData, ilce: e.target.value})} />
                      </div>
                      
                      <textarea placeholder="Varlık Açıklaması ve Takas Şartları..." rows={3} className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none text-sm resize-none" value={formData.aciklama} onChange={e => setFormData({...formData, aciklama: e.target.value})}></textarea>
                      
                      <button onClick={handlePublish} disabled={publishStatus === 'loading' || isCloudLoading} className="w-full mt-6 py-6 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,96,0.3)] transition-all flex items-center justify-center">
                        {publishStatus === 'loading' ? <span className="animate-pulse">AKTARILIYOR...</span> : "AT TAKASA"}
                      </button>
                    </div>
                  )}
                </React.Fragment>
              )}
          </div>
        </div>
      )}

      {/* 📱 SİBER MOBİL ALT MENÜ */}
      <nav className="fixed bottom-0 left-0 z-[500] w-full md:hidden">
        <div className="absolute bottom-0 w-full h-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.04]"></div>
        <div className="relative flex justify-between items-end px-4 pb-3 h-24">
          
          <Link href="/" onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <span className={`text-2xl mb-1.5 transition-transform group-hover:scale-110 ${pathname === '/' && !activeModal ? '' : 'grayscale opacity-50'}`}>🏠</span>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${pathname === '/' && !activeModal ? 'text-[#00f260]' : 'text-slate-500'}`}>VİTRİN</span>
          </Link>

          <button onClick={() => setActiveModal('sectors')} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <span className={`text-2xl mb-1.5 transition-transform group-hover:scale-110 ${activeModal === 'sectors' ? '' : 'grayscale opacity-50'}`}>🗂️</span>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${activeModal === 'sectors' ? 'text-[#00f260]' : 'text-slate-500'}`}>SEKTÖR</span>
          </button>

          <div className="relative flex justify-center w-full px-2 z-20">
            <button onClick={() => setActiveModal('ilan')} className="group flex flex-col items-center outline-none relative -top-6">
              <div className="absolute inset-0 bg-[#00f260] rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-[72px] h-[72px] bg-[#050505] rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-[0_10px_30px_rgba(0,242,96,0.3)] group-hover:border-[#00f260]/50 transition-all duration-300">
                <span className="text-3xl text-[#00f260] drop-shadow-[0_0_8px_rgba(0,242,96,0.8)] group-hover:scale-110 transition-transform duration-300">⚡</span>
              </div>
              <span className="absolute -bottom-5 text-[10px] font-black text-[#00f260] tracking-widest whitespace-nowrap drop-shadow-md">AT TAKASA</span>
            </button>
          </div>

          <Link href={session ? "/mesajlar" : "/giris"} onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <div className="relative mb-1.5 transition-transform group-hover:scale-110">
              <span className={`text-2xl ${pathname.startsWith('/mesajlar') ? '' : 'grayscale opacity-50'}`}>💬</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f260] rounded-full border-2 border-[#0a0a0a] animate-pulse"></span>
            </div>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${pathname.startsWith('/mesajlar') ? 'text-[#00f260]' : 'text-slate-500'}`}>MESAJ</span>
          </Link>

          <Link href={session ? "/panel" : "/giris"} onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1 group">
            <span className={`text-2xl mb-1.5 transition-transform group-hover:scale-110 ${pathname.startsWith('/panel') ? '' : 'grayscale opacity-50'}`}>👤</span>
            <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${pathname.startsWith('/panel') ? 'text-[#00f260]' : 'text-slate-500'}`}>PANEL</span>
          </Link>
          
        </div>
      </nav>
    </React.Fragment>
  );
}
