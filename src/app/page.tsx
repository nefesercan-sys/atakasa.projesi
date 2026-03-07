"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // 📡 ANA STATE'LER
  const [ilanlar, setIlanlar] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🎛️ KATEGORİ VE FİLTRE STATE'LERİ
  const [aktifKategori, setAktifKategori] = useState("Hepsi");
  const [aktifAltFiltre, setAktifAltFiltre] = useState("Yeni İlanlar");
  
  // 🛡️ MODAL STATE'LERİ
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  
  // Takas Formu
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  
  // 🛒 YENİLENMİŞ SİPARİŞ STATE'LERİ (Telefon, Not ve Sözleşmeler)
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);

  // 📂 SİBER SEKTÖRLER (Kategoriler)
  const sektorler = [
    { ad: "Elektronik", degisim: "+4.2" }, { ad: "Emlak", degisim: "+1.8" },
    { ad: "Araç", degisim: "-2.4" }, { ad: "2. El", degisim: "+0.5" },
    { ad: "Sıfır Ürünler", degisim: "+6.1" }, { ad: "Mobilya", degisim: "-1.1" },
    { ad: "Makine", degisim: "+3.3" }, { ad: "Tekstil", degisim: "-0.9" },
    { ad: "Oyuncak", degisim: "+1.2" }, { ad: "El Sanatları", degisim: "+12.4" },
    { ad: "Kitap", degisim: "-0.4" }, { ad: "Antika Eserler", degisim: "+15.8" },
    { ad: "Kırtasiye", degisim: "+0.2" }, { ad: "Doğal Ürünler", degisim: "+2.5" },
    { ad: "Kozmetik", degisim: "-3.2" }, { ad: "Petshop", degisim: "+1.1" },
    { ad: "Oyun/Konsol", degisim: "+8.7" }
  ];

  // 🚀 DİNAMİK SLOGAN JENERATÖRÜ
  const sloganlar = [
    "At Takasa, Daha Fazla Kazan.", 
    "Elinde Tutma, Takasa At.", 
    "Takasa At, Değer Yarat.", 
    "At Takasa, Hızlı Sat.", 
    "Özgürce, Güvende Takas Yap.", 
    "Dilediğin Ürünü Bul, Takasa Gir."
  ];
  const [aktifSlogan, setAktifSlogan] = useState(sloganlar[0]);

  useEffect(() => {
    const sId = setInterval(() => setAktifSlogan(sloganlar[Math.floor(Math.random() * sloganlar.length)]), 4000);
    return () => clearInterval(sId);
  }, []);

  // 📡 SİBER VERİ ÇEKME
  useEffect(() => {
    const veriCek = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        setIlanlar(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Sinyal koptu:", err); } 
      finally { setLoading(false); }
    };
    veriCek();
  }, []);

  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kEmail = session.user.email.toLowerCase();
      setBenimIlanlarim(ilanlar.filter((i: any) => (i.sellerEmail || i.satici || "").toLowerCase() === kEmail));
    }
  }, [session, ilanlar]);

  const getResim = (ilan: any) => ilan.resimler?.[0] || ilan.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=A-TAKASA";

  // 🛠️ AKILLI FİLTRELEME (INSTAGRAM AKIŞI MANTIĞI)
  const filtrelenmisIlanlar = () => {
    let liste = [...ilanlar];
    if (searchTerm) liste = liste.filter(i => (i.title || i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (aktifKategori === "Hepsi") {
      liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      liste = liste.filter(i => (i.kategori || i.category) === aktifKategori);
      switch (aktifAltFiltre) {
        case "En Çok Fiyatı Düşenler": liste.sort((a, b) => (a.degisimYuzdesi || 0) - (b.degisimYuzdesi || 0)); break;
        case "En Çok Yükselenler": liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0)); break;
        case "En Çok Takas Edilenler": liste.sort((a, b) => (b.takasSayisi || 0) - (a.takasSayisi || 0)); break;
        default: liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
    return liste;
  };

  // 🛡️ MODAL VE İŞLEM MOTORLARI
  const openModal = (ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    if ((ilan.satici || ilan.sellerEmail || "").toLowerCase() === session.user?.email?.toLowerCase()) return alert("SİBER ENGEL: Kendi varlığınızla işlem yapamazsınız!");
    setSeciliIlan(ilan); setModalTuru(tur);
    setKabulSozlesme(false); setKabulYasalZirh(false);
  };
  
  const closeModal = () => { setSeciliIlan(null); setModalTuru(null); setSecilenBenimIlanim(""); setEklenecekNakit(""); };

  const handleSepeteEkle = (ilan: any) => {
    const sepet = JSON.parse(localStorage.getItem('siber_sepet') || '[]');
    sepet.push(ilan);
    localStorage.setItem('siber_sepet', JSON.stringify(sepet));
    alert("🛒 Varlık siber sepete eklendi!");
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen takas edeceğiniz kendi varlığınızı seçin!");
    const [id, baslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aliciEmail: seciliIlan.sellerEmail || seciliIlan.satici, 
          hedefIlanId: seciliIlan._id, 
          hedefIlanBaslik: seciliIlan.title || seciliIlan.baslik, 
          hedefIlanFiyat: seciliIlan.price || seciliIlan.fiyat, 
          teklifEdilenIlanId: id, 
          teklifEdilenIlanBaslik: baslik, 
          eklenenNakit: eklenecekNakit || 0,
          durum: "bekliyor" 
        })
      });
      if (res.ok) { alert("⚡ TAKAS TEKLİFİ BAŞARIYLA İLETİLDİ!"); closeModal(); }
      else { const err = await res.json(); alert(`İhlal: ${err.error}`); }
    } catch (e) { alert("Sinyal koptu."); }
  };

  // 🛒 YENİLENMİŞ SİPARİŞ MOTORU
  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon) return alert("Lütfen teslimat ve iletişim bilgilerini eksiksiz doldurun!");
    if (!kabulSozlesme || !kabulYasalZirh) return alert("🚨 İşleme devam etmek için sözleşmeleri onaylamalısınız!");
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          listingId: seciliIlan._id, 
          sellerEmail: seciliIlan.sellerEmail || seciliIlan.satici, 
          adSoyad: siparisForm.adSoyad, 
          telefon: siparisForm.telefon,
          adres: siparisForm.adres, 
          not: siparisForm.not,
          odemeYontemi: siparisForm.odemeYontemi, 
          fiyat: seciliIlan.price || seciliIlan.fiyat,
          durum: "bekliyor"
        })
      });
      if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI! Panelinizden takip edebilirsiniz."); closeModal(); }
      else { alert("Sipariş ağına ulaşılamadı."); }
    } catch (error) { alert("Bağlantı hatası."); }
  };

  const BorsaKarti = ({ ilan }: { ilan: any }) => (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00f260]/40 transition-all group shadow-2xl flex flex-col h-full relative">
      <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl font-black text-[11px] backdrop-blur-md border shadow-lg ${
        (ilan.degisimYuzdesi || 0) >= 0 ? 'bg-[#00f260]/20 text-[#00f260] border-[#00f260]/30' : 'bg-red-500/20 text-red-500 border-red-500/30'
      }`}>
        {(ilan.degisimYuzdesi || 0) >= 0 ? '▲' : '▼'} %{Math.abs(ilan.degisimYuzdesi || 0)}
      </div>

      <div className="relative h-80 overflow-hidden cursor-pointer" onClick={() => router.push(`/varlik/${ilan._id}`)}>
        <img src={getResim(ilan)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Varlık" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90"></div>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-300 border border-white/10">
          📍 {ilan.sehir || "TÜRKİYE"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-[#00f260] text-[9px] font-black uppercase tracking-widest mb-1">{ilan.kategori || "PİYASA"}</p>
        <h3 className="text-white font-bold text-xl mb-4 truncate italic leading-tight group-hover:text-[#00f260] transition-colors cursor-pointer" onClick={() => router.push(`/varlik/${ilan._id}`)}>{ilan.title || ilan.baslik}</h3>
        
        <div className="flex items-end justify-between mb-6">
          <span className="text-white font-black text-3xl tracking-tighter">{Number(ilan.price || ilan.fiyat).toLocaleString()} <span className="text-xl text-[#00f260]">₺</span></span>
          <span className="text-slate-500 text-[10px] font-bold">{new Date(ilan.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => router.push(`/varlik/${ilan._id}`)} className="bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-white/10">🔍 İNCELE</button>
          <button onClick={() => handleSepeteEkle(ilan)} className="bg-cyan-500/10 text-cyan-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/20">🛒 SEPETE AT</button>
          <button onClick={() => openModal(ilan, "takas")} className="bg-[#00f260]/10 text-[#00f260] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">🔄 TAKAS YAP</button>
          <button onClick={() => openModal(ilan, "satinal")} className="bg-[#00f260] text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,242,96,0.3)]">💳 SATIN AL</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic pb-24 selection:bg-[#00f260] selection:text-black">
      
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] blur-[150px] rounded-full"></div>
      </div>

      {/* 🚀 ÜST KONTROL PANELİ VE SİBER LOGO */}
      <div className="sticky top-0 z-[100] bg-[#050505]/95 backdrop-blur-3xl border-b border-white/5 pt-8 pb-4 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {/* 💎 MARKA LOGOSU VE SLOGAN */}
            <div className="flex items-center gap-4 cursor-pointer mr-auto" onClick={() => {setAktifKategori("Hepsi"); setSearchTerm("");}}>
               <div className="w-14 h-14 bg-gradient-to-br from-[#00f260] to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,242,96,0.4)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                  <span className="text-3xl font-black text-black relative z-10 italic">A<span className="text-white drop-shadow-md">⇄</span></span>
               </div>
               <div className="flex flex-col">
                 <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none hover:text-[#00f260] transition-colors">A-TAKASA<span className="text-[#00f260]">.</span></h1>
                 <p className="text-[#00f260] text-[9px] font-black tracking-[0.2em] uppercase mt-1 animate-pulse">{aktifSlogan}</p>
               </div>
            </div>

            {/* Arama Motoru */}
            <div className="relative flex-1 w-full group max-w-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00f260] to-cyan-600 rounded-[2rem] blur opacity-15 group-focus-within:opacity-40 transition duration-700"></div>
              <input type="text" placeholder="Borsada varlık ara..." className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] px-6 py-4 outline-none focus:border-[#00f260] text-sm transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00f260] text-[10px] font-black tracking-widest uppercase animate-pulse">RADAR</span>
            </div>
          </div>

          {/* Kategoriler */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-right">
            <button onClick={() => {setAktifKategori("Hepsi"); setAktifAltFiltre("Yeni İlanlar");}} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${aktifKategori === "Hepsi" ? 'bg-[#00f260] text-black shadow-[0_0_15px_rgba(0,242,96,0.3)]' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}>
              🌐 KARIŞIK AKIŞ
            </button>
            {sektorler.map(s => (
              <button key={s.ad} onClick={() => {setAktifKategori(s.ad); setAktifAltFiltre("Yeni İlanlar");}} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${aktifKategori === s.ad ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}>
                {s.ad} <span className="opacity-50 text-[8px]">{s.degisim}%</span>
              </button>
            ))}
          </div>

          {/* Alt Filtreler */}
          {aktifKategori !== "Hepsi" && (
            <div className="flex gap-2 mt-3 animate-in slide-in-from-top duration-300 overflow-x-auto no-scrollbar">
              {["Yeni İlanlar", "En Çok Fiyatı Düşenler", "En Çok Yükselenler", "En Çok Takas Edilenler"].map(f => (
                <button key={f} onClick={() => setAktifAltFiltre(f)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${aktifAltFiltre === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 bg-transparent hover:text-white'}`}>{f}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <div className="mb-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
            {aktifKategori === "Hepsi" ? "Piyasa Akışı." : `${aktifKategori}.`}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase">
            {aktifKategori === "Hepsi" ? "Tüm siber ağ en yeniden eskiye listeleniyor." : `Şu an ${aktifKategori} sektöründeki ${aktifAltFiltre.toLowerCase()} listeleniyor.`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="h-[450px] bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5"></div>)}
          </div>
        ) : (
          <>
            {filtrelenmisIlanlar().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-1000">
                {filtrelenmisIlanlar().map((ilan) => <BorsaKarti key={ilan._id} ilan={ilan} />)}
              </div>
            ) : (
              <div className="py-32 text-center bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-2xl">
                <span className="text-6xl mb-6 block grayscale opacity-20">📡</span>
                <p className="text-slate-600 font-black uppercase text-xs tracking-[0.5em]">Bu Kriterlerde Varlık Bulunamadı.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 🚀 MODALLAR (TAKAS / SATIN AL) */}
      {seciliIlan && modalTuru && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-lg w-full shadow-[0_0_50px_rgba(0,242,96,0.2)] relative flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 no-scrollbar">
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-colors font-black">✕</button>
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <img src={getResim(seciliIlan)} className="w-24 h-24 rounded-2xl object-cover border border-white/5" alt="Varlık" />
              <div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-1">{modalTuru === 'takas' ? 'SİBER TAKAS TEKLİFİ' : 'GÜVENLİ SATIN ALMA'}</p>
                <h3 className="text-white font-bold text-lg leading-tight mb-2 pr-8">{seciliIlan.title || seciliIlan.baslik}</h3>
                <p className="text-gray-400 font-black text-xl">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</p>
              </div>
            </div>
            
            {modalTuru === "takas" ? (
              <div className="space-y-4">
                <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block">1. Vereceğiniz Varlığı Seçin</label>
                <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-5 rounded-2xl outline-none focus:border-cyan-500 transition-colors">
                  <option value="">-- Cüzdanınızdan Varlık Seçin --</option>
                  {benimIlanlarim.map(b => <option key={b._id} value={`${b._id}|${b.title || b.baslik}`}>{b.title || b.baslik}</option>)}
                </select>
                <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block pt-2">2. Üste Nakit Ekle (₺) - Opsiyonel</label>
                <input type="number" placeholder="Örn: 5000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" />
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim} className="w-full mt-6 bg-cyan-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] disabled:opacity-50">🚀 TEKLİFİ FIRLAT</button>
              </div>
            ) : (
            /* SATIN AL FORMU (EKSİKSİZ) */
              <div className="space-y-4">
                <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-6 rounded-2xl mb-4 flex justify-between items-center">
                  <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">ÖDENECEK TUTAR</span>
                  <span className="text-3xl font-black text-white">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</span>
                </div>
                <input type="text" placeholder="Teslim Alacak Ad Soyad" value={siparisForm.adSoyad} onChange={(e) => setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-2xl outline-none focus:border-[#00f260]" />
                <input type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon} onChange={(e) => setSiparisForm({...siparisForm, telefon: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-2xl outline-none focus:border-[#00f260]" />
                <textarea placeholder="Açık Teslimat Adresi" value={siparisForm.adres} onChange={(e) => setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-2xl outline-none h-20 resize-none focus:border-[#00f260]"></textarea>
                <textarea placeholder="Sipariş Notu (İsteğe Bağlı)" value={siparisForm.not} onChange={(e) => setSiparisForm({...siparisForm, not: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-2xl outline-none h-16 resize-none focus:border-[#00f260]"></textarea>
                
                <select value={siparisForm.odemeYontemi} onChange={(e) => setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-2xl outline-none focus:border-[#00f260]">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                  <option value="kapida_odeme">📦 Kapıda Ödeme</option>
                </select>

                {/* HUKUKİ ONAY KUTUCUKLARI */}
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={kabulSozlesme} onChange={(e) => setKabulSozlesme(e.target.checked)} className="mt-1 accent-[#00f260] w-4 h-4 shrink-0" />
                    <span className="text-slate-400 text-[9px] uppercase leading-tight group-hover:text-white transition-colors">Mesafeli Satış Sözleşmesi'ni okudum, anladım ve kabul ediyorum. Tüm sorumluluk tarafıma aittir.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={kabulYasalZirh} onChange={(e) => setKabulYasalZirh(e.target.checked)} className="mt-1 accent-[#00f260] w-4 h-4 shrink-0" />
                    <span className="text-slate-400 text-[9px] uppercase leading-tight group-hover:text-white transition-colors"><span className="text-[#00f260] font-bold">🛡️ Yasal Zırh:</span> Bu işlem siber kalkan güvencesindedir. Teslimat tamamlanana kadar para havuza aktarılır. Onaylıyorum.</span>
                  </label>
                </div>

                <button onClick={handleSiparisTamamla} className="w-full mt-2 bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,242,96,0.3)]">✅ GÜVENLİ ÖDEMEYİ TAMAMLA</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📱 SİBER MOBİL ALT BAR (NAVİGASYON) - Yansıma Sorunu Kesin Çözüm */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[200] bg-[#050505] border border-white/10 px-6 py-3 rounded-full flex justify-between items-center md:hidden">
         <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors w-12">
           <span className="text-xl">🏠</span><span className="text-[7px] font-black uppercase tracking-widest text-center leading-none">VİTRİN</span>
         </button>
         <button onClick={() => {setAktifKategori("Hepsi"); window.scrollTo({top: 0, behavior: 'smooth'});}} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors w-12">
           <span className="text-xl">📂</span><span className="text-[7px] font-black uppercase tracking-widest text-center leading-none">SEKTÖR</span>
         </button>
         
         {/* ANA BUTON (⚡) - Yukarı kaldırıldı, parlama sadece butona özel yapıldı */}
         <div className="relative -top-6">
            <button onClick={() => router.push('/varlik-ekle')} className="bg-gradient-to-tr from-[#00f260] to-cyan-500 text-black w-14 h-14 rounded-full font-black text-2xl flex items-center justify-center shadow-[0_0_15px_#00f260] border-4 border-[#050505]">
              ⚡
            </button>
         </div>
         
         <button onClick={() => router.push('/mesajlar')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors w-12">
           <span className="text-xl">💬</span><span className="text-[7px] font-black uppercase tracking-widest text-center leading-none">MESAJ</span>
         </button>
         <button onClick={() => router.push('/panel')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors w-12">
           <span className="text-xl">👤</span><span className="text-[7px] font-black uppercase tracking-widest text-center leading-none">PANEL</span>
         </button>
      </div>
    </div>
  );
}
