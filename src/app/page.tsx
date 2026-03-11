"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Play, Share2, ShoppingCart, ArrowRightLeft, Search, Filter, MapPin, Tag, ShieldCheck, TrendingUp } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [aktifKategori, setAktifKategori] = useState("Hepsi");
  const [aktifSehir, setAktifSehir] = useState("Tüm Şehirler");
  const [filtreMenusuAcik, setFiltreMenusuAcik] = useState(false);
  const sehirler = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya"];
  
  const [seciliIlan, setSeciliIlan] = useState<any>(null);
  const [modalTuru, setModalTuru] = useState<"takas" | "satinal" | null>(null);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);
  
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [videoModalBaslik, setVideoModalBaslik] = useState("");

  const sektorler = [
    { ad: "Elektronik", icon: "📱" }, { ad: "Emlak", icon: "🏠" },
    { ad: "Araç", icon: "🚗" }, { ad: "Moda", icon: "👕" },
    { ad: "Mobilya", icon: "🛋️" }, { ad: "Hobi", icon: "🎸" },
    { ad: "Makine", icon: "⚙️" }, { ad: "Antika", icon: "🏺" },
    { ad: "Petshop", icon: "🐾" }, { ad: "Oyun", icon: "🎮" }
  ];

  useEffect(() => {
    const veriCek = async () => {
      try {
        const res = await fetch("/api/varliklar?limit=50");
        const data = await res.json();
        const liste = Array.isArray(data) ? data : data.data || [];
        setIlanlar(liste);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    veriCek();
  }, []);

  useEffect(() => {
    if (session?.user?.email && ilanlar.length > 0) {
      const kEmail = session.user.email.toLowerCase();
      setBenimIlanlarim(ilanlar.filter((i: any) => {
        const sEmail = (i.satici?.email || i.satici || "").toString().toLowerCase();
        return sEmail === kEmail;
      }));
    }
  }, [session, ilanlar]);

  const isVideo = useCallback((url: string) => !!url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm')), []);
  
  const getGorsel = useCallback((ilan: any) => {
    const url = ilan.resimler?.[0] || ilan.images?.[0] || ilan.image || "";
    if (isVideo(url) && url.includes("cloudinary.com")) {
      return url.replace(/\.(mp4|webm|mov)$/i, ".jpg");
    }
    return url || "https://placehold.co/600x400/eeeeee/999999?text=Gorsel+Yok";
  }, [isVideo]);

  const filtrelenmisIlanlar = useMemo(() => {
    let liste = [...ilanlar];
    if (searchTerm) liste = liste.filter(i => i.baslik?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (aktifKategori !== "Hepsi") liste = liste.filter(i => i.kategori === aktifKategori);
    if (aktifSehir !== "Tüm Şehirler") liste = liste.filter(i => i.sehir === aktifSehir);
    return liste;
  }, [ilanlar, searchTerm, aktifKategori, aktifSehir]);

  const openModal = (ilan: any, tur: "takas" | "satinal") => {
    if (!session) return router.push("/giris");
    setSeciliIlan(ilan); setModalTuru(tur);
  };

  const handleSepeteEkle = (e: any, ilan: any) => {
    e.stopPropagation();
    alert("Ürün sepetinize eklendi! 🛒");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── ÜST NAVİGASYON (GÜVEN VEREN BAR) ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="text-2xl font-black text-blue-600 tracking-tighter flex items-center gap-1 cursor-pointer shrink-0" onClick={() => router.push('/')}>
            AT<span className="text-gray-900">TAKASA</span>
          </div>
          
          <div className="flex-1 relative max-w-2xl hidden md:block">
            <input 
              type="text" 
              placeholder="Marka, ürün veya kategori ara..." 
              className="w-full bg-gray-100 border-transparent rounded-2xl py-3 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => router.push('/sepet')} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors relative group">
              <ShoppingCart size={22} className="text-gray-700 group-hover:text-blue-600" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">0</span>
            </button>
            <button 
              onClick={() => session ? router.push('/ilan-ver') : router.push('/giris')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 whitespace-nowrap"
            >
              + İlan Ver
            </button>
          </div>
        </div>
      </header>

      {/* ── KATEGORİ REHBERİ ── */}
      <nav className="bg-white border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3">
          <button 
            onClick={() => setAktifKategori("Hepsi")}
            className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${aktifKategori === "Hepsi" ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            🔥 Tüm Fırsatlar
          </button>
          {sektorler.map(s => (
            <button 
              key={s.ad} 
              onClick={() => setAktifKategori(s.ad)}
              className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 uppercase tracking-wider ${aktifKategori === s.ad ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              <span>{s.icon}</span> {s.ad}
            </button>
          ))}
        </div>
      </nav>

      {/* ── ANA VİTRİN ── */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 🚀 ÖZEL BANNER (İştah Açıcı) */}
        <div className="mb-12 relative rounded-[2.5rem] overflow-hidden bg-[#0F172A] text-white min-h-[350px] flex items-center shadow-2xl">
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-xs font-black mb-6 border border-blue-500/30 uppercase tracking-widest">
              <TrendingUp size={14} /> Türkiye'nin En Büyük Takas Ağı
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 italic tracking-tighter">
              ZARARINA SATMA, <br/> <span className="text-blue-500">DEĞERİNDE TAKASLA!</span>
            </h1>
            <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">Ürününü nakit paraya hapsetme. İhtiyacın olanla hemen takasla, güvenli ticaretin keyfini sür.</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform">Hemen Keşfet</button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all">Sistem Nasıl Çalışır?</button>
            </div>
          </div>
          <div className="absolute right-[-5%] bottom-[-10%] opacity-10 text-[25rem] font-black italic select-none">AT</div>
        </div>

        {/* BAŞLIK VE FİLTRE PANELİ */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {aktifKategori === "Hepsi" ? "Bugünün Fırsatları" : aktifKategori}
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </h2>
            <p className="text-gray-500 font-medium mt-1">İlgini çekebilecek {filtrelenmisIlanlar.length} ilan bulundu.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                <select 
                  value={aktifSehir} 
                  onChange={(e) => setAktifSehir(e.target.value)}
                  className="bg-white border border-gray-200 text-sm font-bold pl-11 pr-8 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer shadow-sm w-full"
                >
                  {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
            <button onClick={() => setFiltreMenusuAcik(!filtreMenusuAcik)} className="bg-white border border-gray-200 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm text-gray-700">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* ÜRÜN KARTLARI (PREMIUM GRID) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} className="h-[450px] bg-white rounded-[2.5rem] border border-gray-100 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filtrelenmisIlanlar.map((ilan) => (
              <div 
                key={ilan._id}
                onClick={() => router.push(`/varlik/${ilan._id}`)}
                className="group bg-white rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer flex flex-col relative border border-gray-100"
              >
                {/* Ürün Görseli */}
                <div className="relative h-72 overflow-hidden bg-gray-50">
                  <img 
                    src={getGorsel(ilan)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={ilan.baslik}
                  />
                  
                  {/* Etiketler */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-800 shadow-xl flex items-center gap-1 uppercase tracking-tighter">
                      <ShieldCheck size={12} className="text-green-500" /> Onaylı Ürün
                    </span>
                  </div>

                  {isVideo(ilan.resimler?.[0]) && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-2.5 rounded-full shadow-lg">
                      <Play size={14} fill="currentColor" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Ürün Detayı */}
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.15em] bg-blue-50 px-3 py-1 rounded-lg">
                      {ilan.kategori || "Genel"}
                    </span>
                    <span className="text-gray-400 text-[10px] font-bold flex items-center gap-1">
                      <MapPin size={10} /> {ilan.sehir || "Türkiye"}
                    </span>
                  </div>
                  
                  <h3 className="text-gray-900 font-bold text-xl mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors italic">
                    {ilan.baslik}
                  </h3>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">
                        {Number(ilan.fiyat).toLocaleString()}
                      </span>
                      <span className="text-lg font-black text-blue-600 italic">₺</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(ilan, "takas") }}
                        className="bg-gray-50 text-gray-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
                      >
                        <ArrowRightLeft size={14} /> Takasla
                      </button>
                      <button 
                        onClick={(e) => handleSepeteEkle(e, ilan)}
                        className="bg-gray-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                      >
                        <ShoppingCart size={14} /> Satın Al
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hızlı Aksiyonlar */}
                <button 
                  onClick={(e) => { e.stopPropagation(); alert("İlan bağlantısı kopyalandı!"); }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white transform translate-y-2 group-hover:translate-y-0"
                >
                  <Share2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BOŞ DURUM MESAJI */}
        {!loading && filtrelenmisIlanlar.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">🔍</div>
            <h3 className="text-2xl font-black text-gray-900 uppercase">Aradığın Ürünü Bulamadık</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">Farklı bir anahtar kelime deneyebilir veya kategorileri gezebilirsin.</p>
            <button onClick={() => {setAktifKategori("Hepsi"); setSearchTerm("");}} className="mt-8 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all">Tüm İlanlara Dön</button>
          </div>
        )}
      </main>

      {/* ── FOOTER (PROFESYONEL BİTİŞ) ── */}
      <footer className="bg-white border-t border-gray-200 mt-24 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-3xl font-black text-blue-600 mb-10 tracking-tighter">AT<span className="text-gray-900">TAKASA</span></div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-16 text-sm font-black text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Kurumsal</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Güvenli Ticaret</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Sözleşmeler</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Yardım Merkezi</a>
            <a href="#" className="hover:text-blue-600 transition-colors">İletişim</a>
          </div>
          <div className="flex justify-center gap-4 mb-10">
            <div className="w-12 h-8 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center font-bold text-[8px] text-gray-400">VISA</div>
            <div className="w-12 h-8 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center font-bold text-[8px] text-gray-400">MASTER</div>
            <div className="w-12 h-8 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center font-bold text-[8px] text-gray-400">TROY</div>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 ATTAKASA.COM - Değerinde Takasın Adresi</p>
        </div>
      </footer>

      {/* VİDEO MODAL (SİBER ŞIKLIK) */}
      {videoModalUrl && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setVideoModalUrl(null)}>
          <div className="relative w-full max-w-4xl bg-black rounded-[2.5rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setVideoModalUrl(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10 bg-white/10 p-2 rounded-full backdrop-blur-md">✕</button>
            <video src={`${videoModalUrl}#t=0.1`} controls autoPlay className="w-full aspect-video" />
            <div className="p-8 bg-black">
              <p className="text-white font-black text-xl italic uppercase tracking-tight">{videoModalBaslik}</p>
              <button
                onClick={() => {
                  const ilan = ilanlar.find(i => getGorsel(i).includes(videoModalUrl!.split('.').slice(0, -1).join('.')));
                  if (ilan) { setVideoModalUrl(null); router.push(`/varlik/${ilan._id}`); }
                }}
                className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest w-full"
              >
                Ürünü İncele
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
