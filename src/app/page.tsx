"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

// 🛠️ PERFORMANS: BorsaKarti dışarı alındı ve React.memo ile sarmalandı
const BorsaKarti = React.memo(({ ilan, router, handleSepeteEkle, openModal }: any) => {
  const getResim = (ilan: any) => ilan.resimler?.[0] || ilan.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=A-TAKASA";

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl flex flex-col h-full relative neon-glow transition-all duration-300">
      {/* ▲ % DEĞİŞİM */}
      <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl font-black text-[11px] backdrop-blur-md border shadow-lg ${
        (ilan.degisimYuzdesi || 0) >= 0 ? 'bg-[#00f260]/20 text-[#00f260] border-[#00f260]/30' : 'bg-red-500/20 text-red-500 border-red-500/30'
      }`}>
        {(ilan.degisimYuzdesi || 0) >= 0 ? '▲' : '▼'} %{Math.abs(ilan.degisimYuzdesi || 0)}
      </div>

      {/* GÖRSEL */}
      <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => router.push(`/varlik/${ilan._id}`)}>
        <img src={getResim(ilan)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Varlık" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90"></div>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-300 border border-white/10">
          📍 {ilan.sehir || "TÜRKİYE"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-[#00f260] text-[9px] font-black uppercase tracking-widest mb-1">{ilan.kategori || "PİYASA"}</p>
        <h3 className="text-white font-bold text-lg mb-4 truncate italic leading-tight group-hover:text-[#00f260] transition-colors cursor-pointer" onClick={() => router.push(`/varlik/${ilan._id}`)}>
          {ilan.title || ilan.baslik}
        </h3>
        
        {/* NEON FİYAT */}
        <div className="flex items-end justify-between mb-6">
          <span className="text-white font-black text-3xl tracking-tighter neon-price">
            {Number(ilan.price || ilan.fiyat).toLocaleString()} <span className="text-xl text-[#00f260]">₺</span>
          </span>
        </div>

        {/* 4'LÜ OPERASYON BUTONLARI */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => router.push(`/varlik/${ilan._id}`)} className="bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-white/10">🔍 İNCELE</button>
          <button onClick={() => handleSepeteEkle(ilan)} className="bg-cyan-500/10 text-cyan-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/20">🛒 SEPETE AT</button>
          <button onClick={() => openModal(ilan, "takas")} className="bg-[#00f260]/10 text-[#00f260] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">🔄 TAKAS YAP</button>
          <button onClick={() => openModal(ilan, "satinal")} className="bg-[#00f260] text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,242,96,0.3)]">💳 SATIN AL</button>
        </div>
      </div>
    </div>
  );
});

BorsaKarti.displayName = 'BorsaKarti';

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
  
  // 🟢 RADAR FİLTRELERİ
  const [aktifSehir, setAktifSehir] = useState("Tüm Şehirler");
  const [minFiyat, setMinFiyat] = useState("");
  const [maxFiyat, setMaxFiyat] = useState("");
  const [sadeceTakaslik, setSadeceTakaslik] = useState(false);
  const [filtreMenusuAcik, setFiltreMenusuAcik] = useState(false); 

  const sehirler = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya"];
  
  // 🛡️ MODAL STATE'LERİ
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  
  // Takas Formu
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  
  // 🛒 SİPARİŞ STATE'LERİ
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);

  // 📂 SİBER SEKTÖRLER
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
  }, [sloganlar]);

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

  // 🛠️ PERFORMANS: Gelişmiş Filtreleme Motoru useMemo ile optimize edildi
  const filtrelenmisIlanlar = useMemo(() => {
    let liste = [...ilanlar];
    
    if (searchTerm) liste = liste.filter(i => (i.title || i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()) || (i.description || i.aciklama || "").toLowerCase().includes(searchTerm.toLowerCase()));
    if (aktifKategori !== "Hepsi") liste = liste.filter(i => (i.kategori || i.category) === aktifKategori);
    if (aktifSehir !== "Tüm Şehirler") liste = liste.filter(i => (i.sehir || i.city || "TÜRKİYE").toUpperCase() === aktifSehir.toUpperCase());
    if (minFiyat) liste = liste.filter(i => Number(i.price || i.fiyat) >= Number(minFiyat));
    if (maxFiyat) liste = liste.filter(i => Number(i.price || i.fiyat) <= Number(maxFiyat));

    switch (aktifAltFiltre) {
      case "En Çok Fiyatı Düşenler": liste.sort((a, b) => (a.degisimYuzdesi || 0) - (b.degisimYuzdesi || 0)); break;
      case "En Çok Yükselenler": liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0)); break;
      case "En Çok Takas Edilenler": liste.sort((a, b) => (b.takasSayisi || 0) - (a.takasSayisi || 0)); break;
      default: liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return liste;
  }, [ilanlar, searchTerm, aktifKategori, aktifSehir, minFiyat, maxFiyat, aktifAltFiltre]);

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

  // 🚀 SİBER TASARIM STİLLERİ
  const siberStiller = (
    <style jsx global>{`
      .bg-dot-pattern {
        background-image: radial-gradient(#ffffff11 1px, transparent 1px);
        background-size: 20px 20px;
      }
      .glass-panel {
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(15px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .neon-glow {
        box-shadow: 0 0 15px rgba(0, 242, 96, 0.2);
        border: 1px solid rgba(0, 242, 96, 0.1);
      }
      .neon-price {
        text-shadow: 0 0 10px rgba(0, 242, 96, 0.5);
        color: #00f260;
      }
      .neon-button-strong {
        box-shadow: 0 0 20px rgba(0, 242, 96, 0.4);
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #00f260;
        border-radius: 10px;
      }
    `}</style>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic pb-24 selection:bg-[#00f260] selection:text-black bg-dot-pattern relative">
      {siberStiller}
      
      {/* 🚀 ÜST KONTROL PANELİ (GLASS) */}
      <div className="sticky top-0 z-[100] glass-panel pt-8 pb-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4 cursor-pointer mr-auto" onClick={() => router.push('/')}>
               <div className="w-14 h-14 bg-gradient-to-br from-[#00f260] to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,242,96,0.4)] border-2 border-white/10">
                  <span className="text-3xl font-black text-black italic leading-none">A<span className="text-white">⇄</span></span>
               </div>
               <div className="flex flex-col">
                 <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">A-TAKASA<span className="text-[#00f260]">.</span></h1>
                 <p className="text-[#00f260] text-[9px] font-black tracking-[0.2em] uppercase mt-1 animate-pulse">{aktifSlogan}</p>
               </div>
            </div>

            <div className="flex w-full md:w-auto gap-2 max-w-xl flex-1 relative">
               <div className="absolute -top-6 left-0 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Piyasa Akışı</div>
               <input type="text" placeholder="Varlık veya kelime ara..." value={searchTerm} className="w-full bg-[#0a0a0a] border border-white/10 rounded-full px-8 py-4 outline-none focus:border-[#00f260] text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
               <button onClick={() => setFiltreMenusuAcik(!filtreMenusuAcik)} className={`px-6 py-4 rounded-full font-black text-[10px] uppercase border transition-all ${filtreMenusuAcik ? 'bg-[#00f260] text-black border-[#00f260]' : 'bg-[#0a0a0a] text-white border-white/10'}`}>🛠️ RADAR</button>
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-12 flex flex-col lg:flex-row gap-10">
        
        {/* 🏛️ SOL PANEL: SİBER SEKTÖRLER (GÖRSELDEKİ GİBİ) */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 neon-glow">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Siber Sektörler</h3>
            <div className="space-y-3">
              <button onClick={() => setAktifKategori("Hepsi")} className={`w-full py-4 rounded-full text-[10px] font-black uppercase transition-all ${aktifKategori === "Hepsi" ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🌐 KARIŞIK AKIŞ</button>
              {sektorler.map(s => (
                <button key={s.ad} onClick={() => setAktifKategori(s.ad)} className={`w-full py-4 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${aktifKategori === s.ad ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                  {s.ad} <span className={`text-[8px] ${s.degisim.startsWith('+') ? 'text-[#00f260]' : 'text-red-500'}`}>{s.degisim}%</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 border border-white/5 p-3 rounded-xl uppercase">🛡️ SEO Korumalı</div>
            <div className="flex items-center gap-2 text-[9px] font-black text-[#00f260] border border-[#00f260]/20 p-3 rounded-xl uppercase">🛡️ Siber Güvenlik</div>
          </div>
        </aside>

        {/* 📡 SAĞ PANEL: İLAN AKIŞI */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{aktifKategori === "Hepsi" ? "Piyasa Akışı." : `${aktifKategori}.`}</h2>
            
            {/* Alt Filtreler (Sol menüden çıkarılan) */}
            {aktifKategori !== "Hepsi" && (
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {["Yeni İlanlar", "En Çok Fiyatı Düşenler", "En Çok Yükselenler", "En Çok Takas Edilenler"].map(f => (
                  <button key={f} onClick={() => setAktifAltFiltre(f)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${aktifAltFiltre === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 bg-transparent hover:text-white'}`}>{f}</button>
                ))}
              </div>
            )}
          </div>

          {/* 🟢 RADAR MENÜSÜ (Açılır kapanır) */}
          {filtreMenusuAcik && (
            <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-3xl p-6 mb-6 animate-in slide-in-from-top duration-300 shadow-[0_0_30px_rgba(0,242,96,0.1)]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <label className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-2">BÖLGE / ŞEHİR</label>
                  <select value={aktifSehir} onChange={(e) => setAktifSehir(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-cyan-500">
                    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[#00f260] text-[9px] font-black uppercase tracking-widest mb-2">MİN TAVAN (₺)</label>
                  <input type="number" placeholder="Örn: 1000" value={minFiyat} onChange={(e) => setMinFiyat(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-[#00f260]" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[#00f260] text-[9px] font-black uppercase tracking-widest mb-2">MAX TABAN (₺)</label>
                  <input type="number" placeholder="Örn: 50000" value={maxFiyat} onChange={(e) => setMaxFiyat(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-[#00f260]" />
                </div>
                <div className="flex items-end">
                   <button onClick={() => setSadeceTakaslik(!sadeceTakaslik)} className={`w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${sadeceTakaslik ? 'bg-amber-500/20 text-amber-500 border-amber-500' : 'bg-[#050505] text-slate-500 border-white/10 hover:border-amber-500/50'}`}>
                     {sadeceTakaslik ? '🔄 SADECE TAKASA AÇIK' : '🔄 TAKAS DURUMU FARK ETMEZ'}
                   </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-3">
                 <button onClick={() => {setAktifSehir("Tüm Şehirler"); setMinFiyat(""); setMaxFiyat(""); setSadeceTakaslik(false);}} className="px-6 py-2 rounded-lg text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors">Sıfırla</button>
                 <button onClick={() => setFiltreMenusuAcik(false)} className="px-8 py-2 bg-[#00f260] text-black rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,242,96,0.4)]">Taramayı Başlat</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(n => <div key={n} className="h-96 bg-white/5 rounded-[2.5rem] animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {filtrelenmisIlanlar.map((ilan) => (
                <BorsaKarti key={ilan._id} ilan={ilan} router={router} handleSepeteEkle={handleSepeteEkle} openModal={openModal} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 📱 SİBER MOBİL ALT BAR (TASARIM GÜNCELLENDİ) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[200] bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex justify-between items-center md:hidden shadow-2xl">
         <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-xl">🏠</span><span className="text-[7px] font-black uppercase tracking-widest leading-none">VİTRİN</span></button>
         <button onClick={() => setAktifKategori("Hepsi")} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-xl">📂</span><span className="text-[7px] font-black uppercase tracking-widest leading-none">SEKTÖR</span></button>
         <div className="relative -top-6"><button onClick={() => router.push('/varlik-ekle')} className="bg-gradient-to-tr from-[#00f260] to-cyan-500 text-black w-14 h-14 rounded-full font-black text-2xl flex items-center justify-center border-4 border-[#050505] shadow-[0_0_15px_#00f260] transition-transform hover:scale-110">⚡</button></div>
         <button onClick={() => router.push('/mesajlar')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-xl">💬</span><span className="text-[7px] font-black uppercase tracking-widest leading-none">MESAJ</span></button>
         <button onClick={() => router.push('/panel')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-xl">👤</span><span className="text-[7px] font-black uppercase tracking-widest leading-none">PANEL</span></button>
      </div>

      {/* 🚀 MODALLAR (TAKAS / SATIN AL) */}
      {seciliIlan && modalTuru && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-lg w-full neon-glow relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-colors font-black">✕</button>
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <img src={seciliIlan.resimler?.[0] || seciliIlan.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=A-TAKASA"} className="w-24 h-24 rounded-2xl object-cover border border-white/5" alt="Varlık" />
              <div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-1">{modalTuru === 'takas' ? 'SİBER TAKAS TEKLİFİ' : 'GÜVENLİ SATIN ALMA'}</p>
                <h3 className="text-white font-bold text-lg leading-tight mb-2 pr-8">{seciliIlan.title || seciliIlan.baslik}</h3>
                <p className="neon-price font-black text-xl">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</p>
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
              <div className="space-y-4">
                <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-6 rounded-2xl mb-4 flex justify-between items-center">
                  <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">ÖDENECEK TUTAR</span>
                  <span className="text-3xl font-black neon-price">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</span>
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

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={kabulSozlesme} onChange={(e) => setKabulSozlesme(e.target.checked)} className="mt-1 accent-[#00f260] w-4 h-4 shrink-0" />
                    <span className="text-slate-400 text-[9px] uppercase leading-tight group-hover:text-white transition-colors">Mesafeli Satış Sözleşmesi'ni okudum, anladım ve kabul ediyorum.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={kabulYasalZirh} onChange={(e) => setKabulYasalZirh(e.target.checked)} className="mt-1 accent-[#00f260] w-4 h-4 shrink-0" />
                    <span className="text-slate-400 text-[9px] uppercase leading-tight group-hover:text-white transition-colors"><span className="text-[#00f260] font-bold">🛡️ Yasal Zırh:</span> Bu işlem siber kalkan güvencesindedir. Teslimat tamamlanana kadar para havuza aktarılır.</span>
                  </label>
                </div>

                <button onClick={handleSiparisTamamla} className="w-full mt-2 bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all neon-button-strong">✅ GÜVENLİ ÖDEMEYİ TAMAMLA</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
