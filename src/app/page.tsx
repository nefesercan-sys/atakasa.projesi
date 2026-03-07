"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // 📡 ANA STATE'LER
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [ilanlar, setIlanlar] = useState<any[]>([]); 
  const [borsaVerisi, setBorsaVerisi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🎛️ MODAL VE FORM STATE'LERİ
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", adres: "", odemeYontemi: "kredi_karti" });

  // 📂 TÜM SEKTÖRLER VE SİMÜLE EDİLMİŞ BORSA VERİLERİ (İstediğin Kategoriler)
  const sektorler = [
    { ad: "Elektronik", slug: "elektronik", degisim: "+4.2", renk: "text-[#00f260]" },
    { ad: "Emlak", slug: "emlak", degisim: "+1.8", renk: "text-[#00f260]" },
    { ad: "Araç", slug: "arac", degisim: "-2.4", renk: "text-red-500" },
    { ad: "2. El", slug: "ikinci-el", degisim: "+0.5", renk: "text-white" },
    { ad: "Sıfır Ürün", slug: "sifir-urun", degisim: "+6.1", renk: "text-[#00f260]" },
    { ad: "Mobilya", slug: "mobilya", degisim: "-1.1", renk: "text-red-500" },
    { ad: "Makine", slug: "makine", degisim: "+3.3", renk: "text-[#00f260]" },
    { ad: "Tekstil", slug: "tekstil", degisim: "-0.9", renk: "text-red-500" },
    { ad: "Oyuncak", slug: "oyuncak", degisim: "+0.0", renk: "text-slate-500" },
    { ad: "El Sanatları", slug: "el-sanatlari", degisim: "+12.4", renk: "text-[#00f260]" },
    { ad: "Kitap", slug: "kitap", degisim: "-0.4", renk: "text-red-500" },
    { ad: "Antika", slug: "antika", degisim: "+15.8", renk: "text-[#00f260]" },
    { ad: "Kırtasiye", slug: "kirtasiye", degisim: "+0.2", renk: "text-white" },
    { ad: "Doğal Ürün", slug: "dogal-urun", degisim: "+2.5", renk: "text-[#00f260]" },
    { ad: "Kozmetik", slug: "kozmetik", degisim: "-3.2", renk: "text-red-500" },
    { ad: "Petshop", slug: "petshop", degisim: "+1.1", renk: "text-white" },
    { ad: "Oyun/Konsol", slug: "oyun-konsol", degisim: "+8.7", renk: "text-[#00f260]" },
  ];

  // 📡 SİBER VERİ ÇEKME
  useEffect(() => {
    setIsLoaded(true);
    const piyasaVerisiCek = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        setIlanlar(Array.isArray(data) ? data : []);

        const borsaRes = await fetch("/api/borsa/analiz");
        if (borsaRes.ok) {
          const bData = await borsaRes.json();
          setBorsaVerisi(bData);
        }
      } catch (err) { console.error("Sinyal koptu:", err); } 
      finally { setLoading(false); }
    };
    piyasaVerisiCek();
  }, []);

  // 🛡️ KULLANICININ KENDİ İLANLARINI AYIKLAMA
  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kullaniciEmail = session.user.email.toLowerCase();
      const benimkiler = ilanlar.filter((i: any) => (i.sellerEmail || i.satici || "").toLowerCase() === kullaniciEmail);
      setBenimIlanlarim(benimkiler);
    }
  }, [session, ilanlar]);

  const getResim = (ilan: any) => {
    if (!ilan) return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    return ilan.resimler?.[0] || ilan.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const openModal = (ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    if ((ilan.satici || ilan.sellerEmail || "").toLowerCase() === session.user?.email?.toLowerCase()) return alert("Kendi varlığınızla işlem yapamazsınız!");
    setSeciliIlan(ilan);
    setModalTuru(tur);
  };

  const closeModal = () => { setSeciliIlan(null); setModalTuru(null); };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen vereceğiniz varlığı seçin!");
    const [id, baslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: seciliIlan.sellerEmail || seciliIlan.satici,
          hedefIlanId: seciliIlan._id,
          hedefIlanBaslik: seciliIlan.title || seciliIlan.baslik,
          hedefIlanFiyat: seciliIlan.price || seciliIlan.fiyat,
          teklifEdilenIlanId: id,
          teklifEdilenIlanBaslik: baslik,
          eklenenNakit: eklenecekNakit || 0,
        })
      });
      if (res.ok) { alert("⚡ TEKLİF İLETİLDİ!"); closeModal(); }
    } catch (e) { alert("Sinyal koptu."); }
  };

  // 🃏 REUSABLE VARLIK KARTI
  const BorsaKarti = ({ ilan }: { ilan: any }) => (
    <div className="min-w-[280px] md:min-w-[320px] bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00f260]/50 transition-all duration-500 shadow-2xl group flex flex-col snap-center">
      <div className="relative h-48 w-full overflow-hidden bg-[#030712]" onClick={() => router.push(`/varlik/${ilan._id}`)}>
        <img src={getResim(ilan)} alt={ilan.baslik} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">{ilan.kategori || "VARLIK"}</div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-black uppercase text-sm mb-1 truncate group-hover:text-[#00f260] transition-colors cursor-pointer" onClick={() => router.push(`/varlik/${ilan._id}`)}>{ilan.title || ilan.baslik}</h3>
        <div className="flex justify-between items-end mb-4">
          <p className="text-[#00f260] font-black text-xl italic">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</p>
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">📍 {ilan.sehir || "TÜRKİYE"}</p>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => openModal(ilan, "takas")} className="bg-[#00f260]/10 text-[#00f260] py-2.5 rounded-xl text-[9px] font-black uppercase text-center hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">🔄 TAKAS</button>
          <button onClick={() => openModal(ilan, "satinal")} className="bg-white/5 text-white py-2.5 rounded-xl text-[9px] font-black uppercase text-center hover:bg-white hover:text-black transition-all border border-white/10">🛒 SATIN AL</button>
        </div>
      </div>
    </div>
  );

  // 🌊 KAYDIRILABİLİR VİTRİN BİLEŞENİ
  const KaydirilabilirVitrin = ({ baslik, renk, veri }: { baslik: string, renk: string, veri: any[] }) => (
    <div className="mb-16">
      <div className="flex justify-between items-end mb-6 px-2">
        <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase`}>{baslik.split(' ')[0]} <span className={renk}>{baslik.split(' ').slice(1).join(' ')}.</span></h2>
        <span className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em] hidden md:block animate-pulse">Sağa Kaydır →</span>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-2">
        {veri.length > 0 ? veri.map((i) => <BorsaKarti key={i._id} ilan={i} />) : <div className="text-slate-700 font-bold uppercase text-[10px] p-10 tracking-[0.4em]">SİNYAL BEKLENİYOR...</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic pb-20 overflow-x-hidden selection:bg-[#00f260] selection:text-black">
      
      {/* 🌌 SİBER KATMANLAR */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600 blur-[150px] rounded-full"></div>
      </div>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 pt-20">
        
        {/* 🚀 HERO: MARKA VE SLOGAN */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter uppercase leading-none mb-4">
            <span className="text-white">A</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-cyan-500 drop-shadow-[0_0_40px_rgba(0,242,96,0.4)]">TAKASA</span>
            <span className="text-white">.</span>
          </h1>
          <p className="text-slate-500 tracking-[0.5em] text-xs md:text-sm font-bold uppercase mb-12">
            Sıradan İlanlar Değil, <span className="text-white">Varlık Borsası.</span>
          </p>

          {/* Gelişmiş Arama */}
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f260] to-cyan-600 rounded-[3rem] blur opacity-15 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-2 shadow-2xl transition-all">
              <input 
                type="text" placeholder="Borsada varlık ara (iPhone, Tarla, BMW)..."
                className="w-full bg-transparent border-none px-8 py-5 text-white text-base outline-none placeholder:text-slate-600 font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArama()}
              />
              <button onClick={handleArama} className="hidden md:block bg-white text-black font-black tracking-widest px-10 py-5 rounded-[2.5rem] hover:bg-[#00f260] transition-colors uppercase text-[10px]">RADARI ÇALIŞTIR</button>
            </div>
          </div>
        </div>

        {/* 💠 ÜST BÖLÜM: DİNAMİK KAYDIRILABİLİR VİTRİNLER */}
        <KaydirilabilirVitrin baslik="Yeni Eklenenler" renk="text-cyan-400" veri={ilanlar.slice(0, 8)} />
        <KaydirilabilirVitrin baslik="Fiyatı Düşenler" renk="text-red-500" veri={ilanlar.filter(i => i.degisimYuzdesi < 0)} />
        <KaydirilabilirVitrin baslik="Fiyatı Yükselenler" renk="text-[#00f260]" veri={ilanlar.filter(i => i.degisimYuzdesi > 0)} />
        <KaydirilabilirVitrin baslik="En Çok Takaslar" renk="text-amber-400" veri={ilanlar.slice().reverse().slice(0, 8)} />

        {/* 🏢 TÜM PİYASA VE KATEGORİ VİTRİNLERİ */}
        <div className="pt-20 border-t border-white/5 space-y-32">
          <h2 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase text-center mb-20 opacity-20">Piyasa <span className="text-white">Endeksleri.</span></h2>
          
          {sektorler.map((s) => (
            <div key={s.slug} className="group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-l-4 border-[#00f260] pl-6">
                <div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">{s.ad} <span className="text-white opacity-20">Endeksi.</span></h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 ${s.renk} text-[10px] font-black tracking-widest uppercase`}>
                      Ortalama Değişim: {s.degisim}% {s.degisim.startsWith('+') ? '▲' : '▼'}
                    </span>
                    <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Canlı Piyasa Verisi</span>
                  </div>
                </div>
                <button onClick={() => router.push(`/kategori/${s.slug}`)} className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] transition-all">Tümünü İncele</button>
              </div>
              
              <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-2">
                {ilanlar.filter(i => i.kategori === s.ad).length > 0 ? (
                  ilanlar.filter(i => i.kategori === s.ad).map((i) => <BorsaKarti key={i._id} ilan={i} />)
                ) : (
                  <div className="w-full bg-[#0a0a0a] border border-white/[0.03] rounded-[3rem] py-20 text-center flex flex-col items-center justify-center">
                    <span className="text-4xl mb-4 grayscale opacity-20">📉</span>
                    <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.3em]">Bu Sektörde Henüz Aktif Emir Yok.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 🚀 MODALLAR (TAKAS / SATIN AL) */}
      {seciliIlan && modalTuru && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-lg w-full shadow-[0_0_50px_rgba(0,242,96,0.2)] relative flex flex-col animate-in zoom-in-95">
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">✕</button>
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <img src={getResim(seciliIlan)} className="w-20 h-20 rounded-2xl object-cover border border-white/5" alt="Varlık" />
              <div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-1">{modalTuru === 'takas' ? 'SİBER TAKAS TEKLİFİ' : 'GÜVENLİ SATIN ALMA'}</p>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">{seciliIlan.title || seciliIlan.baslik}</h3>
                <p className="text-gray-400 font-black">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</p>
              </div>
            </div>
            {modalTuru === "takas" ? (
              <div className="space-y-4">
                <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block">1. Vereceğiniz Varlığı Seçin</label>
                <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none focus:border-cyan-500">
                  <option value="">-- Cüzdanınızdan Seçin --</option>
                  {benimIlanlarim.map(b => <option key={b._id} value={`${b._id}|${b.title || b.baslik}`}>{b.title || b.baslik}</option>)}
                </select>
                <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block pt-2">2. Nakit Ekle (₺) - Opsiyonel</label>
                <input type="number" placeholder="Örn: 5000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none focus:border-[#00f260]" />
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim} className="w-full mt-6 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50">🚀 TEKLİFİ FIRLAT</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-5 rounded-2xl mb-4 flex justify-between items-center">
                  <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">ÖDENECEK TUTAR</span>
                  <span className="text-3xl font-black text-white">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</span>
                </div>
                <input type="text" placeholder="Ad Soyad" className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none" />
                <textarea placeholder="Teslimat Adresi" className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none h-20 resize-none"></textarea>
                <button className="w-full mt-4 bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)]">✅ ÖDEMEYİ TAMAMLA</button>
              </div>
            )}
            <p className="text-center text-gray-600 text-[9px] mt-6 uppercase font-bold tracking-widest">Siber Havuz Koruması Altındadır.</p>
          </div>
        </div>
      )}

    </div>
  );
}  );

  return (
    <div className="min-h-screen bg-[#030507] text-white font-sans italic pb-24 overflow-x-hidden selection:bg-[#00f260] selection:text-black">
      
      {/* 🌌 SİBER KATMANLAR (Arkaplan Işıkları) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 pt-16 md:pt-24">
        
        {/* 🚀 HERO BÖLÜMÜ */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase leading-none mb-2 md:mb-6">
            <span className="text-white">A</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-cyan-500 drop-shadow-[0_0_40px_rgba(0,242,96,0.3)]">-TAKASA</span>
            <span className="text-[#00f260]">.</span>
          </h1>
          
          {/* DİNAMİK SLOGAN ALANI */}
          <div className="h-8 md:h-12 flex items-center justify-center mb-10">
             <p key={aktifSlogan} className="text-[#00f260] tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-lg font-black uppercase animate-in slide-in-from-bottom-5 fade-in duration-500">
               {SLOGANLAR[aktifSlogan]}
             </p>
          </div>

          {/* Gelişmiş Arama */}
          <div className="max-w-4xl mx-auto relative group z-30">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f260] to-cyan-600 rounded-[3rem] blur opacity-20 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-2 shadow-2xl transition-all">
              <span className="pl-6 text-xl">🔍</span>
              <input 
                type="text" placeholder="Borsada varlık ara (iPhone, Tarla, BMW)..."
                className="w-full bg-transparent border-none px-4 py-4 md:py-5 text-white text-sm md:text-base outline-none placeholder:text-slate-600 font-medium not-italic"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArama()}
              />
              <button onClick={handleArama} className="hidden md:block bg-gradient-to-r from-[#00f260] to-[#00c550] text-black font-black tracking-widest px-10 py-5 rounded-[2.5rem] hover:scale-105 transition-transform uppercase text-[10px] shadow-[0_0_20px_rgba(0,242,96,0.4)]">RADARI ÇALIŞTIR</button>
            </div>
          </div>
        </div>

        {/* 📊 KATEGORİ ENDEKSLERİ (Arama Motorunun Hemen Altında) */}
        <div className="mb-12">
          <div className="flex overflow-x-auto gap-3 pb-4 snap-x [&::-webkit-scrollbar]:hidden px-2 hide-scroll">
            {sektorler.map((s) => (
              <button 
                key={s.slug}
                onClick={() => { setSeciliKategori(s.ad); setAltFiltre("yeni"); }}
                className={`snap-center shrink-0 flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-300 ${seciliKategori === s.ad ? 'bg-white text-black border-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-[#0a0a0a]/80 text-white border-white/5 hover:border-white/20 hover:bg-white/5'}`}
              >
                <span className="font-black uppercase tracking-wider text-xs md:text-sm">{s.ad}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-black/20 ${seciliKategori === s.ad ? 'text-black' : s.renk}`}>
                  {s.degisim}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 💠 ALT FİLTRELER (Sadece Kategori Seçiliyse Görünür) */}
        {seciliKategori !== "Hepsi" && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-in fade-in slide-in-from-top-4">
            {[
              { id: "yeni", etiket: "🆕 Yeni İlanlar" },
              { id: "dusen", etiket: "📉 En Çok Fiyatı Düşenler" },
              { id: "yukselen", etiket: "📈 En Çok Yükselenler" },
              { id: "takas", etiket: "🔥 En Çok Takas Edilenler" },
            ].map(filtre => (
              <button
                key={filtre.id}
                onClick={() => setAltFiltre(filtre.id)}
                className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${altFiltre === filtre.id ? 'bg-[#00f260] text-black shadow-[0_0_15px_rgba(0,242,96,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
              >
                {filtre.etiket}
              </button>
            ))}
          </div>
        )}

        {/* 🏆 ANA VİTRİNLER (Sadece "Hepsi" Seçiliyken Üstte Çıkar) */}
        {seciliKategori === "Hepsi" && (
          <div className="space-y-6 mb-20 animate-in fade-in duration-700">
            <KaydirilabilirVitrin baslik="Yeni Piyasaya" renk="Sürülenler." veri={ilanlar.slice(0, 8)} />
            <KaydirilabilirVitrin baslik="Fırsat:" renk="Düşüştekiler." veri={ilanlar.filter(i => (i.degisimYuzdesi || 0) < 0).slice(0, 8)} />
            <KaydirilabilirVitrin baslik="Trend:" renk="Yükselenler." veri={ilanlar.filter(i => (i.degisimYuzdesi || 0) > 0).slice(0, 8)} />
            <KaydirilabilirVitrin baslik="Ağır" renk="Takaslananlar." veri={ilanlar.slice().reverse().slice(0, 8)} />
          </div>
        )}

        {/* 📱 INSTAGRAM TARZI KARIŞIK AKIŞ / KATEGORİ GÖRÜNÜMÜ */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              {seciliKategori === "Hepsi" ? "TÜM PİYASA " : `${seciliKategori} `}
              <span className="text-white/20">AKIŞI.</span>
            </h2>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-full hidden md:block">Canlı Veri</span>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <div key={n} className="h-96 bg-white/5 rounded-[2rem] animate-pulse border border-white/5"></div>
                ))}
             </div>
          ) : filtrelenmisIlanlar.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filtrelenmisIlanlar.map((ilan) => (
                <BorsaKarti key={ilan._id} ilan={ilan} />
              ))}
            </div>
          ) : (
            <div className="w-full bg-[#0a0a0a]/50 backdrop-blur-md border border-white/5 rounded-[3rem] py-32 text-center flex flex-col items-center justify-center shadow-2xl">
              <span className="text-6xl mb-6 grayscale opacity-30">📭</span>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Kayıt Bulunamadı</h3>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em] max-w-md">Bu endekste veya filtrede henüz radara takılan bir varlık yok.</p>
              <button onClick={() => {setSeciliKategori("Hepsi"); setAltFiltre("yeni");}} className="mt-8 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Tüm Piyasaya Dön</button>
            </div>
          )}
        </div>

      </main>

      {/* 🚀 MODALLAR (TAKAS / SATIN AL) */}
      {seciliIlan && modalTuru && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-[#050505] border border-[#00f260]/30 rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full shadow-[0_0_80px_rgba(0,242,96,0.15)] relative flex flex-col animate-in zoom-in-95">
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors text-xl">✕</button>
            <div className="flex items-center gap-5 border-b border-white/10 pb-6 mb-6">
              <img src={getResim(seciliIlan)} className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-lg" alt="Varlık" />
              <div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-2 bg-[#00f260]/10 inline-block px-3 py-1 rounded-md">{modalTuru === 'takas' ? 'SİBER TAKAS TEKLİFİ' : 'GÜVENLİ SATIN ALMA'}</p>
                <h3 className="text-white font-black text-xl leading-tight mb-2 not-italic">{seciliIlan.title || seciliIlan.baslik}</h3>
                <p className="text-[#00f260] font-black text-2xl">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</p>
              </div>
            </div>
            
            {modalTuru === "takas" ? (
              <div className="space-y-5">
                <div>
                  <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block mb-2">1. Vereceğiniz Varlığı Seçin</label>
                  <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm p-4 rounded-2xl outline-none focus:border-cyan-500 appearance-none not-italic transition-colors hover:border-white/30">
                    <option value="">-- Cüzdanınızdan Seçin --</option>
                    {benimIlanlarim.map(b => <option key={b._id} value={`${b._id}|${b.title || b.baslik}`}>{b.title || b.baslik}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block mb-2">2. Üste Nakit Ekle (₺) - İsteğe Bağlı</label>
                  <input type="number" placeholder="Örn: 5000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm p-4 rounded-2xl outline-none focus:border-[#00f260] not-italic transition-colors hover:border-white/30" />
                </div>
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                  <span className="text-lg">🚀</span> TEKLİFİ FIRLAT
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#00f260]/10 to-transparent border border-[#00f260]/30 p-6 rounded-2xl mb-6 flex justify-between items-center">
                  <span className="text-[#00f260] text-[11px] font-black uppercase tracking-widest">ÖDENECEK TUTAR</span>
                  <span className="text-4xl font-black text-white">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</span>
                </div>
                <input type="text" placeholder="Ad Soyad" className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm p-4 rounded-2xl outline-none not-italic focus:border-[#00f260] transition-colors" />
                <textarea placeholder="Teslimat Adresi" className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm p-4 rounded-2xl outline-none h-24 resize-none not-italic focus:border-[#00f260] transition-colors"></textarea>
                <button className="w-full mt-2 bg-gradient-to-r from-[#00f260] to-[#00c550] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(0,242,96,0.3)] flex items-center justify-center gap-2">
                  <span className="text-lg">✅</span> ÖDEMEYİ TAMAMLA
                </button>
              </div>
            )}
            <p className="text-center text-slate-500 text-[9px] mt-6 uppercase font-bold tracking-[0.3em] flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#00f260] rounded-full animate-pulse"></span> Siber Havuz Koruması Altındadır.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
