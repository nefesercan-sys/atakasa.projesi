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
  const [aktifFiltre, setAktifFiltre] = useState("Hepsi");

  // 🎛️ MODAL VE FORM STATE'LERİ
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  
  // Takas Formu
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  
  // Satın Al Formu
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", adres: "", odemeYontemi: "kredi_karti" });

  // 📡 SİBER VERİ ÇEKME
  useEffect(() => {
    setIsLoaded(true);
    const piyasaVerisiCek = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        const gelenIlanlar = Array.isArray(data) ? data : [];
        setIlanlar(gelenIlanlar);

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

  // 🛡️ KULLANICININ KENDİ İLANLARINI AYIKLAMA (Takas için)
  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kullaniciEmail = session.user.email.toLowerCase();
      const benimkiler = ilanlar.filter((i: any) => {
        const satici = (i.sellerEmail || i.satici || "").toLowerCase();
        return satici === kullaniciEmail;
      });
      setBenimIlanlarim(benimkiler);
    }
  }, [session, ilanlar]);

  const getResim = (ilan: any) => {
    if (!ilan) return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    return ilan.resimler?.[0] || ilan.images?.[0] || ilan.media?.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const handleArama = () => router.push(`/kesfet?ara=${searchTerm}`);
  const handleKategoriGit = (slug: string) => router.push(`/kategori/${slug}`);

  // 🛡️ MODAL AÇMA KONTROLÜ
  const openModal = (ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    const kullaniciEmail = session.user?.email?.toLowerCase();
    const saticiEmail = (ilan.satici || ilan.sellerEmail || "").toLowerCase();
    
    if (kullaniciEmail === saticiEmail) {
      return alert("SİBER ENGEL: Kendi varlığınızla işlem yapamazsınız!");
    }
    setSeciliIlan(ilan);
    setModalTuru(tur);
  };

  const closeModal = () => {
    setSeciliIlan(null);
    setModalTuru(null);
    setSecilenBenimIlanim("");
    setEklenecekNakit("");
    setSiparisForm({ adSoyad: "", adres: "", odemeYontemi: "kredi_karti" });
  };

  // 🚀 TAKAS API BAĞLANTISI
  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen vereceğiniz varlığı seçin!");
    
    const [teklifIlanId, teklifIlanBaslik] = secilenBenimIlanim.split("|");
    
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: seciliIlan.sellerEmail || seciliIlan.satici,
          hedefIlanId: seciliIlan._id || seciliIlan.id,
          hedefIlanBaslik: seciliIlan.title || seciliIlan.baslik,
          hedefIlanFiyat: seciliIlan.price || seciliIlan.fiyat || 0,
          teklifEdilenIlanId: teklifIlanId,
          teklifEdilenIlanBaslik: teklifIlanBaslik,
          eklenenNakit: eklenecekNakit || 0,
        })
      });
      if (res.ok) { 
        alert("⚡ SİBER TEKLİF BAŞARIYLA İLETİLDİ!"); 
        closeModal(); 
      } else { 
        const err = await res.json(); 
        alert(`Hata: ${err.error}`); 
      }
    } catch (error) { alert("Takas motoru yanıt vermiyor."); }
  };

  // 🛒 SATIN ALMA API BAĞLANTISI
  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres) return alert("Lütfen teslimat bilgilerini eksiksiz doldurun!");
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: seciliIlan._id || seciliIlan.id,
          sellerEmail: seciliIlan.sellerEmail || seciliIlan.satici,
          adSoyad: siparisForm.adSoyad,
          adres: siparisForm.adres,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: seciliIlan.price || seciliIlan.fiyat
        })
      });
      if (res.ok) { 
        alert("📦 SATIN ALMA İŞLEMİ ONAYLANDI!"); 
        closeModal(); 
      } else { 
        alert("Sipariş oluşturulamadı."); 
      }
    } catch (error) { alert("Sipariş ağına ulaşılamadı."); }
  };

  // 🃏 YENİ NESİL VARLIK KARTI BİLEŞENİ
  const BorsaKarti = ({ ilan }: { ilan: any }) => (
    <div className="bg-[#0f0f0f] border border-gray-800/80 rounded-2xl overflow-hidden group hover:border-[#00f260]/50 hover:-translate-y-1 transition-all duration-300 shadow-lg flex flex-col snap-center min-w-[280px] md:min-w-[0]">
      <div className="relative h-48 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => router.push(`/varlik/${ilan._id}`)}>
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg z-10 uppercase tracking-widest">
          {ilan.kategori || "VARLIK"}
        </div>
        <div className="absolute top-3 right-3 bg-[#00f260]/20 backdrop-blur-md border border-[#00f260]/50 text-[#00f260] text-[10px] font-bold px-2 py-1 rounded-md z-10">
          {ilan.degisimYuzdesi > 0 ? `▲ %${ilan.degisimYuzdesi}` : ilan.degisimYuzdesi < 0 ? `▼ %${Math.abs(ilan.degisimYuzdesi)}` : "STABİL"}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent z-0 opacity-80"></div>
        <img src={getResim(ilan)} alt={ilan.baslik} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-bold text-lg mb-1 truncate cursor-pointer hover:text-[#00f260]" onClick={() => router.push(`/varlik/${ilan._id}`)}>
          {ilan.title || ilan.baslik}
        </h3>
        <div className="flex justify-between items-end mb-5">
          <div className="text-[#00f260] text-xl font-black">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</div>
          <div className="text-gray-500 text-[9px] uppercase tracking-widest flex items-center gap-1 font-bold">
            <span className="text-red-500 text-sm">📍</span> {ilan.sehir || "TÜRKİYE"}
          </div>
        </div>
        
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => openModal(ilan, "takas")} className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/30 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00f260] hover:text-black transition-all">
            🔄 TAKAS
          </button>
          <button onClick={() => openModal(ilan, "satinal")} className="bg-transparent border border-gray-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            🛒 SATIN AL
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans pb-20">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#00f260] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      {/* 📟 CANLI BORSA BANDI */}
      <div className="relative z-50 bg-black/50 backdrop-blur-md border-b border-[#00f260]/20 py-2.5 flex items-center shadow-lg">
        <div className="flex whitespace-nowrap gap-12 text-[10px] font-black tracking-[0.2em] uppercase w-full overflow-hidden">
          <div className="animate-[marquee_30s_linear_infinite] flex gap-12 items-center">
            {borsaVerisi?.enCokDusenler?.map((v: any) => (
              <span key={v._id} className="flex items-center gap-2">
                <span className="text-gray-500">{v.baslik}</span>
                <span className="text-red-500">▼ %{v.degisimYuzdesi}</span>
                <span className="text-[#00f260]">{v.fiyat.toLocaleString()} ₺</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 relative z-10">
        
        {/* 🚀 HERO BÖLÜMÜ */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter mb-4 italic leading-none">
            <span className="text-white">A</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f260] to-emerald-400 drop-shadow-[0_0_20px_rgba(0,242,96,0.4)]">TAKASA.</span>
          </h1>
          <p className="text-gray-400 tracking-[0.3em] text-xs md:text-sm font-bold uppercase mb-10">
            Sıradan ilanlar değil, <span className="text-white">Varlık Borsası.</span>
          </p>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f260] to-green-900 rounded-full blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#111] border border-gray-800 rounded-full p-2 backdrop-blur-xl">
              <span className="pl-6 text-[#00f260] text-xl">✨</span>
              <input 
                type="text" 
                placeholder="Piyasada varlık ara (iPhone, Tarla, BMW)..." 
                className="w-full bg-transparent border-none text-white px-4 py-3 outline-none placeholder-gray-600 text-sm md:text-base font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArama()}
              />
              <button onClick={handleArama} className="hidden md:block bg-white text-black font-black tracking-widest px-8 py-4 rounded-full hover:bg-[#00f260] hover:scale-105 transition-all duration-300 uppercase text-xs">
                VARLIĞI BUL
              </button>
            </div>
          </div>
        </div>

        {/* 📊 İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {borsaVerisi?.sektorEndeksleri?.slice(0, 4).map((stat: any, idx: number) => (
            <div key={idx} onClick={() => handleKategoriGit(stat._id.toLowerCase())} className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 hover:border-[#00f260]/40 transition-all duration-300 group cursor-pointer shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider">{stat._id}</span>
                <span className="text-[#00f260] text-[10px] font-bold bg-[#00f260]/10 px-2 py-1 rounded-md">📈 TREND</span>
              </div>
              <div className="text-2xl font-black text-white group-hover:text-[#00f260] transition-colors">{Math.round(stat.ortalamaFiyat).toLocaleString()} ₺</div>
              <div className="text-gray-600 text-[9px] mt-2 font-bold uppercase">{stat.toplamVarlik} Aktif Emir</div>
            </div>
          ))}
        </div>

        {/* 💠 YATAY KAYDIRMALI BÖLÜMLER */}
        {borsaVerisi?.enCokDusenler?.length > 0 && (
           <div className="mb-16">
             <div className="flex justify-between items-end mb-6">
               <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Dibe <span className="text-red-500">Vuranlar.</span></h2>
             </div>
             <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
               {borsaVerisi.enCokDusenler.map((ilan: any) => <BorsaKarti key={ilan._id} ilan={ilan} />)}
             </div>
           </div>
        )}

        <div className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Taze <span className="text-[#00f260]">Kanlar.</span></h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
            {ilanlar.slice(0, 8).map((ilan: any) => <BorsaKarti key={ilan._id} ilan={ilan} />)}
          </div>
        </div>

        {/* 💠 TÜM PİYASA (GRID) */}
        <div className="border-t border-gray-800 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tight uppercase">Tüm <span className="text-white">Piyasa.</span></h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
              {["Hepsi", "Araç", "Elektronik", "Emlak"].map((f) => (
                <button key={f} onClick={() => setAktifFiltre(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${aktifFiltre === f ? 'bg-white text-black' : 'bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
             <div className="h-40 flex items-center justify-center text-[#00f260] animate-pulse font-black tracking-widest">SİBER AĞ TARANIYOR...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {ilanlar.map((ilan) => <BorsaKarti key={ilan._id} ilan={ilan} />)}
            </div>
          )}
        </div>
      </main>

      {/* 🚀 SİBER MODAL (TAKAS / SATIN AL PENCERESİ) YENİ NESİL API BAĞLANTILI */}
      {seciliIlan && modalTuru && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-lg w-full shadow-[0_0_50px_rgba(0,242,96,0.2)] relative flex flex-col animate-in zoom-in-95 duration-300">
            
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">✕</button>
            
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <img src={getResim(seciliIlan)} className="w-20 h-20 rounded-2xl object-cover border border-white/5" alt="Varlık" />
              <div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-1">{modalTuru === 'takas' ? 'SİBER TAKAS TEKLİFİ' : 'GÜVENLİ SATIN ALMA'}</p>
                <h3 className="text-white font-bold text-lg leading-tight mb-1">{seciliIlan.title || seciliIlan.baslik}</h3>
                <p className="text-gray-400 font-black">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</p>
              </div>
            </div>

            {/* İÇERİK: TAKAS MODU */}
            {modalTuru === "takas" ? (
              <div className="space-y-4">
                <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block">1. Vereceğiniz Varlığı Seçin</label>
                <select 
                  value={secilenBenimIlanim}
                  onChange={(e) => setSecilenBenimIlanim(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none focus:border-cyan-500"
                >
                  <option value="">-- Cüzdanınızdan Seçin --</option>
                  {benimIlanlarim.map(bIlan => (
                    <option key={bIlan._id} value={`${bIlan._id}|${bIlan.title || bIlan.baslik}`}>
                      {bIlan.title || bIlan.baslik}
                    </option>
                  ))}
                </select>
                
                {benimIlanlarim.length === 0 && (
                  <p className="text-red-500 text-[10px] font-bold uppercase mt-1">Siber cüzdanınızda takas edilecek varlık bulunamadı!</p>
                )}

                <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block pt-2">2. Nakit Ekle (₺) - Opsiyonel</label>
                <input 
                  type="number" 
                  placeholder="Örn: 5000" 
                  value={eklenecekNakit}
                  onChange={(e) => setEklenecekNakit(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none focus:border-[#00f260]" 
                />
                
                <button 
                  onClick={handleTakasGonder} 
                  disabled={!secilenBenimIlanim || benimIlanlarim.length === 0}
                  className="w-full mt-6 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  🚀 TEKLİFİ FIRLAT
                </button>
              </div>
            ) : (
            /* İÇERİK: SATIN AL MODU */
              <div className="space-y-4">
                 <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-5 rounded-2xl mb-4 flex justify-between items-center">
                    <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">ÖDENECEK TUTAR</span>
                    <span className="text-3xl font-black text-white">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</span>
                 </div>
                 <input 
                    type="text" 
                    placeholder="Ad Soyad" 
                    value={siparisForm.adSoyad}
                    onChange={(e) => setSiparisForm({...siparisForm, adSoyad: e.target.value})}
                    className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none focus:border-[#00f260]" 
                 />
                 <textarea 
                    placeholder="Teslimat Adresi" 
                    value={siparisForm.adres}
                    onChange={(e) => setSiparisForm({...siparisForm, adres: e.target.value})}
                    className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none h-20 resize-none focus:border-[#00f260]"
                 ></textarea>
                 <select 
                    value={siparisForm.odemeYontemi}
                    onChange={(e) => setSiparisForm({...siparisForm, odemeYontemi: e.target.value})}
                    className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl outline-none focus:border-[#00f260]"
                 >
                    <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                    <option value="havale">🏦 Havale / EFT</option>
                 </select>
                 <button onClick={handleSiparisTamamla} className="w-full mt-4 bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.4)]">
                  ✅ GÜVENLİ ÖDEMEYİ TAMAMLA
                 </button>
              </div>
            )}
            
            <p className="text-center text-gray-600 text-[9px] mt-6 uppercase font-bold tracking-widest">Siber Havuz Koruması Altındadır.</p>
          </div>
        </div>
      )}

    </div>
  );
}
