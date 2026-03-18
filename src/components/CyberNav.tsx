/** @jsxImportSource react */
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "loading" | "success">("idle");
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [lastPublishedId, setLastPublishedId] = useState<string | null>(null);
  const [images, setImages] = useState<Array<string | null>>(Array(5).fill(null));
  const [formData, setFormData] = useState({
    sektor: "",
    baslik: "",
    fiyat: "",
    ulke: "Turkiye",
    sehir: "Istanbul",
    ilce: "",
    aciklama: "",
  });

  const CLOUD_NAME = "diuamcnej";
  const UPLOAD_PRESET = "atakasa_hizli";

  const sectors = [
    { name: "URUN SATIS",    icon: "💰", slug: "urun-satis" },
    { name: "HIZMET AL",     icon: "🛠️", slug: "hizmet" },
    { name: "TAKAS YAP",     icon: "🔄", slug: "takas" },
    { name: "KIRALAMA",      icon: "🏢", slug: "kiralama" },
    { name: "2. EL PIYASA",  icon: "♻️", slug: "ikinci-el" },
    { name: "REZERVASYON",   icon: "📅", slug: "rezervasyon" },
    { name: "BAGIS YAP",     icon: "❤️", slug: "bagis" },
    { name: "OYUNCAK",       icon: "🧸", slug: "oyuncak" },
    { name: "KITAP",         icon: "📚", slug: "kitap" },
    { name: "PETSHOP",       icon: "🐾", slug: "petshop" },
    { name: "EGITIM",        icon: "🎓", slug: "egitim" },
    { name: "KISISEL BAKIM", icon: "💄", slug: "bakim" },
    { name: "GIYIM & MODA",  icon: "👗", slug: "moda" },
    { name: "DOGAL URUN",    icon: "🌿", slug: "dogal" },
    { name: "ANTIKA",        icon: "🏺", slug: "antika" },
    { name: "EL SANATLARI",  icon: "🎨", slug: "sanat" },
  ];

  const uploadToCloudinary = async (file: File | string) => {
    setIsCloudLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/auto/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.secure_url) {
        addImageToState(json.secure_url);
      } else {
        alert("Bulut reddetti: " + (json.error?.message || "Bilinmeyen Hata"));
      }
    } catch {
      alert("Baglanti hatasi!");
    } finally {
      setIsCloudLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Kamera izni reddedildi!");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        uploadToCloudinary(canvas.toDataURL("image/png"));
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 100 * 1024 * 1024) return alert("Dosya 100MB sinirini asiyor!");
      uploadToCloudinary(file);
    });
  };

  const addImageToState = (url: string) => {
    setImages((prev) => {
      const next = [...prev];
      const idx = next.findIndex((img) => img === null);
      if (idx !== -1) next[idx] = url;
      return next;
    });
  };

  const handlePublish = async () => {
    if (!session) return alert("Once giris yapmaniz gerekiyor!");
    if (!formData.baslik || !formData.fiyat || !formData.sektor || !formData.sehir) {
      return alert("Lutfen tum zorunlu alanlari doldurun!");
    }
    setPublishStatus("loading");
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
          resimler: images.filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastPublishedId(data.id);
        setPublishStatus("success");
        stopCamera();
        try {
          await fetch("/api/seo/ping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://atakasa.com/varlik/" + data.id }),
          });
        } catch {}
      } else {
        const data = await res.json();
        alert(data.message || "Hata olustu.");
        setPublishStatus("idle");
      }
    } catch {
      alert("Sistem baglantisi koptu.");
      setPublishStatus("idle");
    }
  };

  const handleShare = async () => {
    const shareUrl = lastPublishedId
      ? "https://atakasa.com/varlik/" + lastPublishedId
      : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.baslik || "A-TAKASA Ilani",
          text: formData.baslik + " - atakasa.com",
          url: shareUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Baglanti kopyalandi!");
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setShowForm(false);
    stopCamera();
    setPublishStatus("idle");
    setLastPublishedId(null);
    setImages(Array(5).fill(null));
    setFormData({ sektor: "", baslik: "", fiyat: "", ulke: "Turkiye", sehir: "Istanbul", ilce: "", aciklama: "" });
  };

  if (pathname?.startsWith("/panel")) return null;

  return (
    <React.Fragment>
      {activeModal === "sectors" && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl p-6 overflow-y-auto pb-32">
          <div className="flex justify-between items-center mb-8 border-b border-white/[0.05] pb-4 mt-4">
            <h2 className="text-white font-black uppercase tracking-tighter text-2xl">
              A-TAKASA<span className="text-[#00f260]">.com</span>
            </h2>
            <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl">X</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {sectors.map((s, idx) => (
              <a
                key={idx}
                href={"/kategori/" + s.slug}
                onClick={(e) => { e.preventDefault(); router.push("/kategori/" + s.slug); closeModal(); }}
                className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-[#00f260]/50 transition-all shadow-lg no-underline"
              >
                <span className="text-4xl">{s.icon}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{s.name}</span>
              </a>
            ))}
          </div>
          <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-white/[0.04]">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Populer Aramalar</p>
            <div className="flex flex-wrap gap-2">
              {["iPhone takas","MacBook satis","arac takas","ikinci el telefon","sifir urun sat","guvenli takas","Istanbul takas","Ankara ikinci el"].map((tag) => (
                <a
                  key={tag}
                  href={"/kesfet?q=" + encodeURIComponent(tag)}
                  onClick={(e) => { e.preventDefault(); router.push("/kesfet?q=" + encodeURIComponent(tag)); closeModal(); }}
                  className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[10px] text-slate-400 hover:text-[#00f260] transition-all no-underline"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModal === "ilan" && (
        <div className="fixed inset-0 z-[600] bg-[#050505]/98 backdrop-blur-3xl p-6 overflow-y-auto pb-32">
          <div className="max-w-xl mx-auto mt-4">
            <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-4">
              <h2 className="text-white font-black uppercase tracking-tighter text-3xl italic">
                AT <span className="text-[#00f260]">TAKASA.</span>
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl">X</button>
            </div>
            {publishStatus === "success" ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-24 h-24 bg-[#00f260]/10 rounded-full flex items-center justify-center border border-[#00f260]/30 mb-6">
                  <span className="text-5xl text-[#00f260]">✓</span>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Ilan Yayinda!</h3>
                <p className="text-slate-500 text-xs mb-6">Ister sat, ister takas et.</p>
                <button onClick={handleShare} className="w-full mb-4 py-5 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest">
                  Ilani Paylas
                </button>
                <button onClick={closeModal} className="w-full py-5 bg-white/[0.05] text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs border border-white/10">
                  Kapat
                </button>
              </div>
            ) : (
              <div>
                <div className="aspect-video bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] mb-6 overflow-hidden relative">
                  {!cameraActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
                      {isCloudLoading && (
                        <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-10 h-10 text-[#00f260] animate-spin" />
                          <span className="text-[#00f260] font-black text-[10px] tracking-widest uppercase">Yukleniyor...</span>
                        </div>
                      )}
                      <div className="flex gap-4 w-full px-4">
                        <button onClick={startCamera} className="flex-1 flex flex-col items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl hover:bg-white/[0.05] transition-all">
                          <span className="text-4xl">📸</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kamerayi Ac</span>
                        </button>
                        <div className="flex-1 relative">
                          <input type="file" accept="image/*,video/*" multiple className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" ref={fileInputRef} onChange={handleFileUpload} />
                          <div className="h-full flex flex-col items-center justify-center gap-3 bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl">
                            <span className="text-4xl">🖼️</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Galeriden Yukle</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <button onClick={takePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-black/30 rounded-full border-4 border-[#00f260] flex items-center justify-center z-20">
                        <div className="w-10 h-10 bg-[#00f260] rounded-full" />
                      </button>
                      <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center z-20">X</button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="grid grid-cols-5 gap-3 mb-8">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square bg-[#0a0a0a] border border-white/[0.04] rounded-2xl flex items-center justify-center overflow-hidden relative">
                      {img ? (
                        <div className="w-full h-full relative">
                          {img.includes(".mp4") || img.includes(".mov") || img.includes(".webm") ? (
                            <video src={img} className="w-full h-full object-cover" />
                          ) : (
                            <img src={img} className="w-full h-full object-cover" alt={"Medya " + (i + 1)} />
                          )}
                          <button
                            onClick={() => { const n = [...images]; n[i] = null; setImages(n); }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-black"
                          >X</button>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[8px] font-black tracking-widest">MEDYA {i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                {!showForm ? (
                  <button onClick={() => setShowForm(true)} className="w-full py-5 bg-white/[0.02] border border-[#00f260]/20 text-[#00f260] rounded-3xl font-bold uppercase text-xs tracking-widest hover:bg-[#00f260]/10 transition-all">
                    Detaylari Gir ve Yayinla
                  </button>
                ) : (
                  <div className="space-y-4 pb-10">
                    <select
                      className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-slate-300 outline-none appearance-none text-sm font-bold uppercase tracking-wide"
                      value={formData.sektor}
                      onChange={(e) => setFormData({ ...formData, sektor: e.target.value })}
                    >
                      <option value="" disabled>SEKTOR SECINIZ...</option>
                      <optgroup label="EMLAK">
                        <option value="Emlak - Konut">Konut / Ev</option>
                        <option value="Emlak - Isyeri">Isyeri / Dukkan / Magaza</option>
                        <option value="Emlak - Arsa">Arsa / Tarla</option>
                      </optgroup>
                      <optgroup label="VASITA">
                        <option value="Vasita - Otomobil">Otomobil</option>
                        <option value="Vasita - Motosiklet">Motosiklet / Bisiklet</option>
                        <option value="Vasita - Deniz">Deniz Araclari</option>
                        <option value="Vasita - Yedek Parca">Yedek Parca</option>
                      </optgroup>
                      <optgroup label="ELEKTRONIK">
                        <option value="Elektronik - Telefon">Cep Telefonu</option>
                        <option value="Elektronik - Bilgisayar">Bilgisayar / Donanim</option>
                        <option value="Elektronik - TV">Televizyon / Ses</option>
                        <option value="Elektronik - Oyun">Oyun Konsolu</option>
                      </optgroup>
                      <optgroup label="EV YASAM">
                        <option value="Ev - Mobilya">Mobilya / Tekstil</option>
                        <option value="Ev - Beyaz Esya">Beyaz Esya</option>
                        <option value="Ev - Dekorasyon">Dekorasyon</option>
                      </optgroup>
                      <optgroup label="MODA">
                        <option value="Moda - Giyim">Giyim</option>
                        <option value="Moda - Saat">Saat / Taki</option>
                        <option value="Kozmetik">Kozmetik</option>
                      </optgroup>
                      <optgroup label="SANAT HOBI">
                        <option value="Sanat - Antika">Antika / El Sanatlari</option>
                        <option value="Sanat - Tasarim">Ozel Tasarimlar</option>
                        <option value="Hobi - Oyuncak">Oyuncak / Kitap</option>
                      </optgroup>
                      <optgroup label="DIGER">
                        <option value="Sanayi - Makine">Makine / Nalbur</option>
                        <option value="Petshop">Petshop</option>
                        <option value="Gida">Gida / Icecek</option>
                        <option value="Diger">Diger</option>
                      </optgroup>
                    </select>
                    <input
                      type="text"
                      placeholder="Ilan Basligi"
                      className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none font-bold"
                      value={formData.baslik}
                      onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Fiyat (TL)"
                      className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-[#00f260] font-black outline-none"
                      value={formData.fiyat}
                      onChange={(e) => setFormData({ ...formData, fiyat: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Sehir"
                        className="w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none text-sm"
                        value={formData.sehir}
                        onChange={(e) => setFormData({ ...formData, sehir: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Ilce"
                        className="w-full bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-xl text-white outline-none text-sm"
                        value={formData.ilce}
                        onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                      />
                    </div>
                    <textarea
                      placeholder="Aciklama..."
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-white/[0.05] p-5 rounded-2xl text-white outline-none text-sm resize-none"
                      value={formData.aciklama}
                      onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                    />
                    <button
                      onClick={handlePublish}
                      disabled={publishStatus === "loading" || isCloudLoading}
                      className="w-full mt-6 py-6 bg-[#00f260] text-black rounded-[2rem] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,242,96,0.3)] transition-all flex items-center justify-center"
                    >
                      {publishStatus === "loading" ? "YAYINLANIYOR..." : "AT TAKASA - ILAN VER"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 z-[500] w-full md:hidden">
        <div className="absolute bottom-0 w-full h-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.04]" />
        <div className="relative flex justify-between items-end px-4 pb-3 h-24">
          <Link href="/" onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1">
            <span className={"text-2xl mb-1.5 " + (pathname === "/" && !activeModal ? "" : "grayscale opacity-50")}>🏠</span>
            <span className={"text-[9px] font-bold tracking-widest uppercase " + (pathname === "/" && !activeModal ? "text-[#00f260]" : "text-slate-500")}>VITRIN</span>
          </Link>
          <button onClick={() => setActiveModal("sectors")} className="flex flex-col items-center justify-end w-full h-full pb-1">
            <span className={"text-2xl mb-1.5 " + (activeModal === "sectors" ? "" : "grayscale opacity-50")}>🗂️</span>
            <span className={"text-[9px] font-bold tracking-widest uppercase " + (activeModal === "sectors" ? "text-[#00f260]" : "text-slate-500")}>SEKTOR</span>
          </button>
          <div className="relative flex justify-center w-full px-2 z-20">
            <button onClick={() => setActiveModal("ilan")} className="flex flex-col items-center outline-none relative -top-6">
              <div className="absolute inset-0 bg-[#00f260] rounded-full blur-xl opacity-30" />
              <div className="relative w-[72px] h-[72px] bg-[#050505] rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-[0_10px_30px_rgba(0,242,96,0.3)]">
                <span className="text-3xl text-[#00f260]">⚡</span>
              </div>
              <span className="absolute -bottom-5 text-[10px] font-black text-[#00f260] tracking-widest whitespace-nowrap">AT TAKASA</span>
            </button>
          </div>
          <Link href={session ? "/mesajlar" : "/giris"} onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1">
            <div className="relative mb-1.5">
              <span className={"text-2xl " + (pathname.startsWith("/mesajlar") ? "" : "grayscale opacity-50")}>💬</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f260] rounded-full border-2 border-[#0a0a0a] animate-pulse" />
            </div>
            <span className={"text-[9px] font-bold tracking-widest uppercase " + (pathname.startsWith("/mesajlar") ? "text-[#00f260]" : "text-slate-500")}>MESAJ</span>
          </Link>
          <Link href={session ? "/panel" : "/giris"} onClick={closeModal} className="flex flex-col items-center justify-end w-full h-full pb-1">
            <span className={"text-2xl mb-1.5 " + (pathname.startsWith("/panel") ? "" : "grayscale opacity-50")}>👤</span>
            <span className={"text-[9px] font-bold tracking-widest uppercase " + (pathname.startsWith("/panel") ? "text-[#00f260]" : "text-slate-500")}>PANEL</span>
          </Link>
        </div>
      </nav>
    </React.Fragment>
  );
}
