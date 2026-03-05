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
        <div className="fixed inset-0 z-[600] bg-[#050505]/
