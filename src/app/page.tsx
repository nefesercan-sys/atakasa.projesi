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
  const [aktifKategori, setAktifKategori] = useState("Hepsi");
  const [aktifAltFiltre, setAktifAltFiltre] = useState("Yeni İlanlar");
  
  // 🎛️ MODAL STATE'LERİ
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", adres: "", odemeYontemi: "kredi_karti" });

  // 📂 SİBER SEKTÖRLER VE CANLI ENDEKSLER (Kategoriler)
  const sektorler = [
    { ad: "Elektronik", slug: "elektronik", degisim: "+4.2" }, { ad: "Emlak", slug: "emlak", degisim: "+1.8" },
    { ad: "Araç", slug: "arac", degisim: "-2.4" }, { ad: "2. El", slug: "ikinci-el", degisim: "+0.5" },
    { ad: "Sıfır Ürün", slug: "sifir-urun", degisim: "+6.1" }, { ad: "Mobilya", slug: "mobilya", degisim: "-1.1" },
    { ad: "Makine", slug: "makine", degisim: "+3.3" }, { ad: "Tekstil", slug: "tekstil", degisim: "-0.9" },
    { ad: "Oyuncak", slug: "oyuncak", degisim: "+1.2" }, { ad: "El Sanatları", slug: "el-sanatlari", degisim: "+12.4" },
    { ad: "Kitap", slug: "kitap", degisim: "-0.4" }, { ad: "Antika Eserler", slug: "antika", degisim: "+15.8" },
    { ad: "Kırtasiye", slug: "kirtasiye", degisim: "+0.2" }, { ad: "Doğal Ürünler", slug: "dogal-urunler", degisim: "+2.5" },
    { ad: "Kozmetik", slug: "kozmetik", degisim: "-3.2" }, { ad: "Petshop", slug: "petshop", degisim: "+1.1" },
    { ad: "Oyun/Konsol", slug: "oyun-konsol", degisim: "+8.7" }
  ];

  // 🚀 DİNAMİK SLOGAN JENERATÖRÜ
  const sloganlar = [
    "At Takasa, Daha Fazla Kazan.", "Elinde Tutma, Takasa At.", 
    "Takasa At, Değer Yarat.", "At Takasa, Hızlı Sat.", 
    "Özgürce, Güvende Takas Yap.", "Dilediğin Ürünü Bul, Takasa Gir."
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

  // 🛡️ KULLANICININ İLANLARINI ÇEKME (Takas Formu İçin)
  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kEmail = session.user.email.toLowerCase();
      setBenimIlanlarim(ilanlar.filter((i: any) => (i.sellerEmail || i.satici || "").toLowerCase() === kEmail));
    }
  }, [session, ilanlar]);

  const getResim = (ilan: any) => ilan.resimler?.[0] || ilan.images?.[0] || "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";

  // 🛠️ AKILLI FİLTRELEME (INSTAGRAM AKIŞI MANTIĞI)
  const filtrelenmisIlanlar = () => {
    let liste = [...ilanlar];
    if (searchTerm) liste = liste.filter(i => (i.title || i.baslik || "").toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (aktifKategori !== "Hepsi") {
      liste = liste.filter(i => (i.kategori || i.category) === aktifKategori);
      switch (aktifAltFiltre) {
        case "En Çok Fiyatı Düşenler": liste.sort((a, b) => (a.degisimYuzdesi || 0) - (b.degisimYuzdesi || 0)); break;
        case "En Çok Yükselenler": liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0)); break;
        case "En Çok Takas Edilenler": liste.sort((a, b) => (b.takasSayisi || 0) - (a.takasSayisi || 0)); break;
        default: liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      // 📱 Kategori seçilmediyse: Instagram Usulü Karışık & Tarihe Göre
      liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return liste;
  };

  // 🛡️ MODAL İŞLEMLERİ
  const openModal = (ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    if ((ilan.satici || ilan.sellerEmail || "").toLowerCase() === session.user?.email?.toLowerCase()) return alert("SİBER ENGEL: Kendi varlığınızla işlem yapamazsınız!");
    setSeciliIlan(ilan); setModalTuru(tur);
  };
  const closeModal = () => { setSeciliIlan(null); setModalTuru(null); };

  // 🃏 PROFESYONEL SİBER VARLIK KARTI
  const BorsaKarti = ({ ilan, yatay = false }: { ilan: any, yatay?: boolean }) => (
    <div className={`bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00f260]/40 transition-all cursor-pointer group shadow-2xl relative flex flex-col ${yatay ? 'min-w-[280px] md:min-w-[320px] snap-center' : ''}`}>
      {/* 📉 YÜZDESEL FİYAT DEĞİŞİMİ (KÖŞEDE) */}
      <div className={`absolute top-5 left-5 z-20 px-3 py-1.5 rounded-xl font-black text-[10px] backdrop-blur-md border ${
        (ilan.degisimYuzdesi || 0) >= 0 ? 'bg-[#00f260]/20 text-[#00f260] border-[#00f260]/30' : 'bg-red-500/20 text-red-500 border-red-500/30'
      }`}>
        {(ilan.degisimYuzdesi || 0) >= 0 ? '▲' : '▼'} %{Math.abs(ilan.degisimYuzdesi || 0)}
      </div>

      <div className="relative h-64 overflow-hidden" onClick={() => router.push(`/varlik/${ilan._id}`)}>
        <img src={getResim(ilan)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Varlık" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[#00f260] text-[9px] font-black uppercase tracking-widest">{ilan.kategori || "GENEL PİYASA"}</p>
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-tighter">📍 {ilan.sehir || "TÜRKİYE"}</span>
        </div>
        <h3 className="text-white font-bold text-xl mb-4 truncate italic leading-tight group-hover:text-[#00f260] transition-colors" onClick={() => router.push(`/varlik/${ilan._id}`)}>{ilan.title || ilan.baslik}</h3>
        
        <div className="flex justify-between items-end border-t border-white/5 pt-4 mb-5">
          <div>
            <p className="text-slate-500 text-[8px] font-black uppercase mb-1">Mevcut Değer</p>
            <span className="text-white font-black text-2xl tracking-tighter">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => openModal(ilan, "takas")} className="bg-[#00f260]/10 text-[#00f260] py-3 rounded-xl text-[9px] font-black uppercase text-center hover:bg-[#00f260] hover:text-black transition-all border border-[#00f260]/20">🔄 TAKAS</button>
          <button onClick={() => openModal(ilan, "satinal")} className="bg-white/5 text-white py-3 rounded-xl text-[9px] font-black uppercase text-center hover:bg-white hover:text-black transition-all border border-white/10">🛒 SATIN AL</button>
        </div>
      </div>
    </div>
  );

  // 🌊 KAYDIRILABİLİR VİTRİN BİLEŞENİ
  const KaydirilabilirVitrin = ({ baslik, renk, veri }: { baslik: string, renk: string, veri: any[] }) => (
    <div className="mb-20">
      <div className="flex justify-between items-end mb-8 px-2 border-l-4 border-white/20 pl-4 hover:border-white transition-all">
        <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase`}>{baslik.split(' ')[0]} <span className={renk}>{baslik.split(' ').slice(1).join(' ')}.</span></h2>
        <span className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em] hidden md:block animate-pulse">Sağa Kaydır →</span>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-2">
        {veri.length > 0 ? veri.map((i) => <BorsaKarti key={i._id} ilan={i} yatay={true} />) : <div className="text-slate-700 font-bold uppercase text-[10px] p-10 tracking-[0.4em]">SİNYAL BEKLENİYOR...</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans italic pb-20 selection:bg-[#00f260] selection:text-black">
      
      {/* 🌌 SANATSAL SİBER ARKA PLAN */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#00f260] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600 blur-[150px] rounded-full"></div>
      </div>

      {/* 🚀 ÜST KONTROL MERKEZİ (Arama & Kategoriler) */}
      <div className="sticky top-0 z-[100] bg-[#050505]/90 backdrop-blur-3xl border-b border-white/5 pt-12 pb-6 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none hidden md:block hover:text-[#00f260] transition-colors cursor-pointer" onClick={() => {setAktifKategori("Hepsi"); setSearchTerm("");}}>A-TAKASA<span className="text-[#00f260]">.</span></h1>
            {/* Arama Motoru */}
            <div className="relative flex-1 w-full group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00f260] to-cyan-600 rounded-[2rem] blur opacity-15 group-focus-within:opacity-40 transition duration-700"></div>
              <input 
                type="text" placeholder="Varlık borsasında ara (Ev, Araba, Antika)..." 
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] px-8 py-5 outline-none focus:border-[#00f260] text-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00f260] text-[10px] font-black tracking-widest uppercase bg-[#00f260]/10 px-3 py-1 rounded-lg">RADAR AKTİF</span>
            </div>
          </div>

          {/* 📂 KATEGORİ GURUPLARI (Yatay Kaydırmalı) */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear-right">
            <button 
              onClick={() => {setAktifKategori("Hepsi"); setAktifAltFiltre("Yeni İlanlar");}}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 shadow-lg ${aktifKategori === "Hepsi" ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' : 'bg-[#0a0a0a] text-slate-400 border border-white/5 hover:bg-white/10'}`}
            >
              🌐 TÜM PİYASA
            </button>
            {sektorler.map(s => (
              <button 
                key={s.ad} onClick={() => {setAktifKategori(s.ad); setAktifAltFiltre("Yeni İlanlar");}}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 shadow-lg ${aktifKategori === s.ad ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)] scale-105' : 'bg-[#0a0a0a] text-slate-400 border border-white/5 hover:border-[#00f260]/30'}`}
              >
                {s.ad} <span className={`text-[8px] font-bold px-2 py-1 rounded bg-black/20 ${s.degisim.startsWith('+') ? 'text-[#00f260]' : 'text-red-400'}`}>{s.degisim}%</span>
              </button>
            ))}
          </div>

          {/* ⚡ ALT SEÇENEKLER (Sadece Kategori Seçilince Belirir) */}
          {aktifKategori !== "Hepsi" && (
            <div className="flex gap-2 mt-6 animate-in slide-in-from-top duration-500 overflow-x-auto no-scrollbar">
              {["Yeni İlanlar", "En Çok Fiyatı Düşenler", "En Çok Yükselenler", "En Çok Takas Edilenler"].map(f => (
                <button 
                  key={f} onClick={() => setAktifAltFiltre(f)}
                  className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${aktifAltFiltre === f ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 bg-[#0a0a0a] hover:text-white border border-white/5'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 mt-16 relative z-10">
        
        {/* 🎭 DİNAMİK SLOGAN VE BAŞLIK EKRANI */}
        <div className="mb-20 text-center md:text-left">
          <h2 className="text-5xl md:text-[7rem] font-black uppercase tracking-tighter leading-none mb-6">
            {aktifKategori === "Hepsi" ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">BORSA AKIŞI.</span>
            ) : (
              <span className="text-[#00f260] drop-shadow-[0_0_20px_rgba(0,242,96,0.3)]">{aktifKategori}.</span>
            )}
          </h2>
          <p className="text-[#00f260] text-sm md:text-2xl font-black tracking-[0.3em] uppercase animate-pulse mb-4 h-8">
            {aktifSlogan}
          </p>
          {aktifKategori !== "Hepsi" && (
            <div className="inline-block bg-white/5 border border-white/10 px-6 py-2 rounded-full text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              Şu an {aktifKategori} sektöründeki <span className="text-white">{aktifAltFiltre.toLowerCase()}</span> listeleniyor.
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="h-[450px] bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5"></div>)}
          </div>
        ) : (
          <>
            {/* 💠 EĞER KATEGORİ SEÇİLMEDİYSE "KAYDIRILABİLİR VİTRİNLERİ" GÖSTER */}
            {aktifKategori === "Hepsi" && !searchTerm && (
              <>
                <KaydirilabilirVitrin baslik="Yeni Eklenenler" renk="text-cyan-400" veri={ilanlar.slice(0, 8)} />
                <KaydirilabilirVitrin baslik="Fiyatı Düşenler" renk="text-red-500" veri={ilanlar.filter(i => (i.degisimYuzdesi || 0) < 0)} />
                <KaydirilabilirVitrin baslik="Fiyatı Yükselenler" renk="text-[#00f260]" veri={ilanlar.filter(i => (i.degisimYuzdesi || 0) > 0)} />
                <div className="w-full h-px bg-white/10 my-20"></div>
                <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-10 pl-4 border-l-4 border-white/20">Tüm <span className="text-white">Piyasa.</span></h2>
              </>
            )}

            {/* 📸 INSTAGRAM AKIŞI (Karışık veya Filtreli Grid) */}
            {filtrelenmisIlanlar().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-1000">
                {filtrelenmisIlanlar().map((ilan) => (
                  <BorsaKarti key={ilan._id} ilan={ilan} />
                ))}
              </div>
            ) : (
              <div className="py-40 text-center bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-2xl">
                <span className="text-7xl mb-6 block grayscale opacity-20">📡</span>
                <p className="text-slate-600 font-black uppercase text-xs tracking-[0.5em]">Bu Sinyalde Henüz Varlık Tespit Edilmedi.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 🚀 SİBER MODALLAR (TAKAS / SATIN AL PENCERESİ) */}
      {seciliIlan && modalTuru && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#00f260]/30 rounded-[2.5rem] p-8 max-w-lg w-full shadow-[0_0_50px_rgba(0,242,96,0.2)] relative flex flex-col animate-in zoom-in-95">
            <button onClick={closeModal} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-colors font-black">✕</button>
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <img src={getResim(seciliIlan)} className="w-24 h-24 rounded-2xl object-cover border border-white/5" alt="Varlık" />
              <div>
                <p className="text-[#00f260] text-[10px] font-black uppercase tracking-widest mb-1">{modalTuru === 'takas' ? 'SİBER TAKAS TEKLİFİ' : 'GÜVENLİ SATIN ALMA'}</p>
                <h3 className="text-white font-bold text-lg leading-tight mb-2 pr-8">{seciliIlan.title || seciliIlan.baslik}</h3>
                <p className="text-gray-400 font-black text-xl">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</p>
              </div>
            </div>
            
            {/* TAKAS FORMU */}
            {modalTuru === "takas" ? (
              <div className="space-y-4">
                <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block">1. Vereceğiniz Varlığı Seçin</label>
                <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-5 rounded-2xl outline-none focus:border-cyan-500 transition-colors">
                  <option value="">-- Cüzdanınızdan Varlık Seçin --</option>
                  {benimIlanlarim.map(b => <option key={b._id} value={`${b._id}|${b.title || b.baslik}`}>{b.title || b.baslik}</option>)}
                </select>
                <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block pt-2">2. Üste Nakit Ekle (₺) - Opsiyonel</label>
                <input type="number" placeholder="Örn: 5000" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" />
                <button onClick={async () => {
                  try {
                    const res = await fetch("/api/takas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aliciEmail: seciliIlan.sellerEmail || seciliIlan.satici, hedefIlanId: seciliIlan._id, hedefIlanBaslik: seciliIlan.title || seciliIlan.baslik, hedefIlanFiyat: seciliIlan.price || seciliIlan.fiyat, teklifEdilenIlanId: secilenBenimIlanim.split("|")[0], teklifEdilenIlanBaslik: secilenBenimIlanim.split("|")[1], eklenenNakit: eklenecekNakit || 0 }) });
                    if (res.ok) { alert("⚡ TEKLİF İLETİLDİ!"); closeModal(); }
                  } catch (e) { alert("Sinyal koptu."); }
                }} disabled={!secilenBenimIlanim} className="w-full mt-6 bg-cyan-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] disabled:opacity-50">🚀 TEKLİFİ FIRLAT</button>
              </div>
            ) : (
            /* SATIN AL FORMU */
              <div className="space-y-4">
                <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-6 rounded-2xl mb-4 flex justify-between items-center">
                  <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">ÖDENECEK TUTAR</span>
                  <span className="text-3xl font-black text-white">{Number(seciliIlan.price || seciliIlan.fiyat).toLocaleString()} ₺</span>
                </div>
                <input type="text" placeholder="Teslim Alacak Ad Soyad" value={siparisForm.adSoyad} onChange={(e) => setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" />
                <textarea placeholder="Açık Teslimat Adresi" value={siparisForm.adres} onChange={(e) => setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-5 rounded-2xl outline-none h-24 resize-none focus:border-[#00f260] transition-colors"></textarea>
                <button onClick={async () => {
                  try {
                    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: seciliIlan._id, sellerEmail: seciliIlan.sellerEmail || seciliIlan.satici, adSoyad: siparisForm.adSoyad, adres: siparisForm.adres, odemeYontemi: siparisForm.odemeYontemi, fiyat: seciliIlan.price || seciliIlan.fiyat }) });
                    if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI!"); closeModal(); }
                  } catch (error) { alert("Sipariş ağına ulaşılamadı."); }
                }} className="w-full mt-4 bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,242,96,0.3)]">✅ GÜVENLİ ÖDEMEYİ TAMAMLA</button>
              </div>
            )}
            <p className="text-center text-gray-600 text-[9px] mt-6 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#00f260] rounded-full animate-pulse"></span> SİBER HAVUZ KORUMASI ALTINDADIR.
            </p>
          </div>
        </div>
      )}

      {/* 📱 SİBER MOBİL ALT BAR (NAVİGASYON) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-full flex gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:hidden">
         <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-lg">🏠</span><span className="text-[8px] font-black uppercase tracking-widest">VİTRİN</span></button>
         <button onClick={() => {setAktifKategori("Hepsi"); window.scrollTo({top: 0, behavior: 'smooth'});}} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-lg">📂</span><span className="text-[8px] font-black uppercase tracking-widest">SEKTÖR</span></button>
         <button onClick={() => router.push('/varlik-ekle')} className="relative -top-6 bg-gradient-to-tr from-[#00f260] to-cyan-500 text-black w-14 h-14 rounded-full font-black text-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,242,96,0.5)]">⚡</button>
         <button onClick={() => router.push('/mesajlar')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-lg">💬</span><span className="text-[8px] font-black uppercase tracking-widest">MESAJ</span></button>
         <button onClick={() => router.push('/panel')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#00f260] transition-colors"><span className="text-lg">👤</span><span className="text-[8px] font-black uppercase tracking-widest">PANEL</span></button>
      </div>
    </div>
  );
}
