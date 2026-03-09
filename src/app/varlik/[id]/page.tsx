"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; 
// 🚨 SİBER MAYIN İMHA EDİLDİ: useSearchParams Next.js'i çökertiyordu, kaldırıldı!
import Link from "next/link";

export default function SiberVarlikTerminali({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState("incele"); // Çökmez varsayılan state

  // 🔄 TAKAS STATE'LERİ
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");

  // 🛒 SİPARİŞ STATE'LERİ
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", adres: "", odemeYontemi: "kredi_karti" });

  // ⭐ CANLI YORUM VE PUAN STATE'LERİ
  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [ortalamaPuan, setOrtalamaPuan] = useState(0);
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yeniYorumMetni, setYeniYorumMetni] = useState("");

  const [resolvedParams, setResolvedParams] = useState<any>(null);

  useEffect(() => {
    // 🛡️ SİBER ZIRH: Next.js'i çökertmeden URL parametresini güvenlice okuma
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const islemParam = urlParams.get("islem");
      if (islemParam) setAktifSekme(islemParam);
    }

    const unwrapParams = async () => { const p = await params; setResolvedParams(p); };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchIlanDetay();
      if (session?.user?.email) fetchBenimIlanlarim();
    }
  }, [resolvedParams, session]);

  const fetchIlanDetay = async () => {
    try {
      // Not: Ana sayfada /api/varliklar kullanıyorsun, detayda /api/listings. Eğer hata alırsan burayı /api/varliklar yap!
      const res = await fetch(`/api/listings`); 
      const data = await res.json();
      let liste = Array.isArray(data) ? data : data.data || data.ilanlar || data.varliklar || [];
      const seciliIlan = liste.find((i: any) => i._id === resolvedParams.id || i.id === resolvedParams.id);
      setIlan(seciliIlan);
      
      // İlanı bulduğumuz an, satıcının canlı puanlarını çekmek için siber radarı çalıştır!
      if (seciliIlan) {
        const saticiMail = seciliIlan.sellerEmail || seciliIlan.satici?.email || seciliIlan.userId || seciliIlan.satici;
        if (typeof saticiMail === 'string') fetchSaticiYorumlari(saticiMail);
      }
    } catch (error) { console.error("Varlık çekilemedi:", error); }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/listings`);
      if (res.ok) {
        const data = await res.json();
        let liste = Array.isArray(data) ? data : data.data || data.ilanlar || data.varliklar || [];
        const benimkiler = liste.filter((i: any) => {
           const sEmail = (typeof i.userId === 'string' ? i.userId : i.satici?.email || i.satici || "").toLowerCase();
           return sEmail === session?.user?.email?.toLowerCase();
        });
        setBenimIlanlarim(benimkiler);
      }
    } catch (error) { console.error("Varlıklar çekilemedi."); }
  };

  // 📡 SATICI PUANLARINI ÇEKEN RADAR
  const fetchSaticiYorumlari = async (saticiEmail: string) => {
    try {
      const res = await fetch(`/api/yorumlar?satici=${saticiEmail}`);
      if (res.ok) {
        const data = await res.json();
        setYorumlar(data.yorumlar);
        setOrtalamaPuan(data.ortalama);
      }
    } catch (err) { console.error("Yorum radarı koptu."); }
  };

  // 🚀 YORUM FIRLATMA MOTORU
  const handleYorumGonder = async () => {
    if (!yeniYorumMetni.trim()) return alert("Boş sinyal gönderilemez!");
    try {
      const saticiMail = ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici;
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saticiEmail: saticiMail,
          ilanId: ilan._id || ilan.id,
          puan: yeniPuan,
          icerik: yeniYorumMetni
        })
      });
      const result = await res.json();
      if (res.ok) {
        alert("⚡ YILDIZLAR MÜHÜRLENDİ!");
        setYeniYorumMetni("");
        fetchSaticiYorumlari(saticiMail); // Ekrani anında güncelle
      } else {
        alert(`❌ Siber Kalkan: ${result.error}`);
      }
    } catch (error) { alert("Yorum motoru yanıt vermiyor."); }
  };

  // Siber İletişim Engelleyici
  const iletisimBilgisiIceriyorMu = (metin: string) => {
    const telefonRegex = /(\b(05|5)\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}\b)/;
    const mailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    return telefonRegex.test(metin) || mailRegex.test(metin);
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen vereceğiniz varlığı seçin!");
    if (iletisimBilgisiIceriyorMu(takasMesaji)) return alert("🚨 SİBER İHLAL: İletişim bilgisi paylaşılamaz!");

    const [teklifIlanId, teklifIlanBaslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici,
          hedefIlanId: ilan._id || ilan.id,
          hedefIlanBaslik: ilan.title || ilan.baslik,
          hedefIlanFiyat: ilan.price || ilan.fiyat || 0,
          teklifEdilenIlanId: teklifIlanId,
          teklifEdilenIlanBaslik: teklifIlanBaslik,
          eklenenNakit: eklenecekNakit || 0,
        })
      });
      if (res.ok) { alert("⚡ SİBER TEKLİF İLETİLDİ!"); router.push("/panel"); } 
      else { const err = await res.json(); alert(`Hata: ${err.error}`); }
    } catch (error) { alert("Takas motoru yanıt vermiyor."); }
  };

  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres) return alert("Lütfen teslimat bilgilerini doldurun!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id || ilan.id,
          sellerEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici,
          adSoyad: siparisForm.adSoyad,
          adres: siparisForm.adres,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: ilan.price || ilan.fiyat
        })
      });
      if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI!"); router.push("/panel"); } 
      else { alert("Sipariş oluşturulamadı."); }
    } catch (error) { alert("Sipariş ağına ulaşılamadı."); }
  };

  const getResim = (ilan: any) => {
    if (ilan?.media?.images?.[0]) return ilan.media.images[0];
    if (ilan?.images?.[0]) return ilan.images[0];
    if (typeof ilan?.image === 'string' && ilan.image) return ilan.image;
    return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  // Yıldız Çizme Algoritması
  const renderYildizlar = (puan: number) => {
    return "⭐".repeat(Math.round(puan)) + "☆".repeat(5 - Math.round(puan));
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black animate-pulse">VARLIK ÇÖZÜMLENİYOR...</div>;
  if (!ilan) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black">VARLIK BULUNAMADI.</div>;

  // 🛡️ SİBER ZIRH: Eğer veri eksik gelirse sayfanın çökmesini engelleyen güvenli kontrol
  const saticiMaili = ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici;
  const ilaninSahibiyim = session?.user?.email && saticiMaili && typeof saticiMaili === 'string' && session.user.email.toLowerCase() === saticiMaili.toLowerCase();

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 text-white font-sans">
      <div className="max-w-6xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* SOL PANEL: GÖRSEL VE YORUMLAR */}
        <div className="w-full lg:w-1/2 bg-[#030712] border-r border-white/5 p-8 flex flex-col relative">
           <img src={getResim(ilan)} alt={ilan.title || ilan.baslik} className="w-full h-auto object-cover rounded-3xl border border-white/10 shadow-lg mb-8" />
           
           {/* ⭐ CANLI YORUM VE PUAN SİSTEMİ */}
           <div className="mt-auto bg-white/[0.02] p-6 rounded-2xl border border-white/5 max-h-80 overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
               <h3 className="text-cyan-400 font-black text-[10px] uppercase tracking-widest">
                 Satıcı Güven Puanı
               </h3>
               <span className="text-amber-400 text-lg font-black tracking-widest">
                 {ortalamaPuan > 0 ? `${renderYildizlar(ortalamaPuan)} (${ortalamaPuan})` : "DEĞERLENDİRME YOK"}
               </span>
             </div>
             
             {/* Yorumlar Listesi */}
             <div className="space-y-3 mb-6">
               {yorumlar.length === 0 ? (
                 <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center py-4">Henüz yorum yapılmamış.</p>
               ) : (
                 yorumlar.map((yorum: any, idx: number) => (
                   <div key={idx} className="bg-black/40 p-3 rounded-xl border border-white/5">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-amber-400 text-[10px]">{renderYildizlar(yorum.puan)}</span>
                       <span className="text-slate-500 text-[8px] font-bold">{new Date(yorum.createdAt).toLocaleDateString("tr-TR")}</span>
                     </div>
                     <p className="text-white text-xs font-bold mb-1">"{yorum.icerik}"</p>
                     <p className="text-cyan-400/50 text-[8px] uppercase tracking-widest">- {yorum.gonderenAd}</p>
                   </div>
                 ))
               )}
             </div>

             {/* 🚀 YENİ YORUM FORMU (Sadece Giriş Yapan ve Satıcı Olmayanlar Görebilir) */}
             {session?.user && !ilaninSahibiyim && (
               <div className="bg-black/50 p-4 rounded-xl border border-cyan-500/20">
                 <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-2">Satıcıyı Değerlendir</p>
                 <div className="flex gap-2 mb-3">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button key={star} onClick={() => setYeniPuan(star)} className={`text-2xl transition-all ${yeniPuan >= star ? 'text-amber-400 scale-110' : 'text-slate-600 hover:text-amber-400/50'}`}>★</button>
                   ))}
                 </div>
                 <textarea 
                   value={yeniYorumMetni} 
                   onChange={(e) => setYeniYorumMetni(e.target.value)} 
                   placeholder="İşlem nasıldı? Güvenilir miydi? Yorumunuzu bırakın..."
                   className="w-full bg-[#050505] text-white text-xs p-3 rounded-lg border border-white/10 focus:border-cyan-500 transition-colors h-16 resize-none mb-2"
                 />
                 <button onClick={handleYorumGonder} className="w-full bg-cyan-500/20 text-cyan-400 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
                   YORUMU GÖNDER
                 </button>
               </div>
             )}
           </div>
        </div>

        {/* SAĞ PANEL: TERMİNAL SEKMELERİ */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col">
           <div className="flex bg-black p-1 rounded-2xl mb-8 border border-white/5 shadow-inner">
             <button onClick={()=>setAktifSekme("incele")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "incele" ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>🔍 İncele</button>
             {!ilaninSahibiyim && (
               <>
                 <button onClick={()=>setAktifSekme("takas")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "takas" ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-500 hover:text-white'}`}>🔄 Takas Yap</button>
                 <button onClick={()=>setAktifSekme("satinal")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "satinal" ? 'bg-[#00f260] text-black shadow-[0_0_15px_rgba(0,242,96,0.3)]' : 'text-slate-500 hover:text-white'}`}>🛒 Satın Al</button>
               </>
             )}
           </div>

           {/* 1. İNCELE EKRANI */}
           {aktifSekme === "incele" && (
             <div className="flex flex-col h-full animate-fade-in">
                <div className="inline-block bg-[#00f260]/10 text-[#00f260] text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest border border-[#00f260]/20 mb-4 w-max">
                  {ilan.category || ilan.kategori || "Kategori Yok"}
                </div>
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4 text-white">
                  {ilan.title || ilan.baslik || "İsimsiz Varlık"}
                </h1>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1">
                  {ilan.description || ilan.aciklama || "Açıklama belirtilmemiş."}
                </p>
                <div className="text-[#00f260] font-black text-5xl mb-8 border-t border-white/5 pt-6">
                  {Number(ilan.price || ilan.fiyat || 0).toLocaleString()} <span className="text-2xl text-white">₺</span>
                </div>

                {!ilaninSahibiyim ? (
                  <div className="flex flex-col gap-3">
                    <Link href={`/mesajlar?satici=${ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici}&ilan=${ilan._id || ilan.id}`} className="w-full bg-white/5 text-white py-4 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all text-center">
                      💬 SATICIYA MESAJ GÖNDER
                    </Link>
                    <div className="flex gap-3">
                      <button onClick={()=>setAktifSekme("takas")} className="flex-1 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all">🔄 TAKAS TEKLİF ET</button>
                      <button onClick={()=>setAktifSekme("satinal")} className="flex-1 bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all">🛒 HEMEN SATIN AL</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center bg-white/5 border border-white/10 p-4 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest">BU SİZİN VARLIĞINIZ</div>
                )}
             </div>
           )}

           {/* 2. TAKAS YAP EKRANI */}
           {aktifSekme === "takas" && (
             <div className="flex flex-col h-full animate-fade-in">
                <h3 className="text-xl font-black text-white italic uppercase mb-6 border-b border-white/5 pb-4">SİBER <span className="text-cyan-400">TAKAS</span> KONSOLU</h3>
                <label className="text-cyan-400 text-[9px] font-black uppercase tracking-widest block mb-2">1. Vereceğiniz Varlığı Seçin:</label>
                <select onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors mb-6">
                  <option value="">-- Kendi İlanlarınızdan Birini Seçin --</option>
                  {benimIlanlarim.map(bIlan => (<option key={bIlan._id} value={`${bIlan._id}|${bIlan.title || bIlan.baslik}`}>{bIlan.title || bIlan.baslik}</option>))}
                </select>
                <label className="text-[#00f260] text-[9px] font-black uppercase tracking-widest block mb-2">2. Üstüne Eklenecek Nakit (₺) - Opsiyonel:</label>
                <input type="number" placeholder="Örn: 500" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-[#00f260] transition-colors mb-6" />
                <label className="text-white text-[9px] font-black uppercase tracking-widest block mb-2">3. Teklif Notu (Kısa Mesaj):</label>
                <textarea value={takasMesaji} onChange={(e) => setTakasMesaji(e.target.value)} placeholder="Ürünüm temizdir. (Telefon/Mail yasaktır)" className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-white/30 transition-colors mb-auto h-24 resize-none"></textarea>
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim || benimIlanlarim.length === 0} className="w-full mt-6 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  🚀 TAKAS TEKLİFİNİ FIRLAT
                </button>
             </div>
           )}

           {/* 3. SATIN AL EKRANI */}
           {aktifSekme === "satinal" && (
             <div className="flex flex-col h-full animate-fade-in">
                <h3 className="text-xl font-black text-white italic uppercase mb-6 border-b border-white/5 pb-4">GÜVENLİ <span className="text-[#00f260]">SİPARİŞ</span> FORMU</h3>
                <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-4 rounded-xl mb-6 flex justify-between items-center">
                  <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">ÖDENECEK TUTAR:</span>
                  <span className="text-2xl font-black text-white">{Number(ilan.price || ilan.fiyat || 0).toLocaleString()} ₺</span>
                </div>
                <input type="text" placeholder="Ad Soyad" value={siparisForm.adSoyad} onChange={(e)=>setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-[#00f260] transition-colors mb-4" />
                <textarea placeholder="Açık Teslimat Adresi" value={siparisForm.adres} onChange={(e)=>setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-[#00f260] transition-colors mb-4 h-24 resize-none"></textarea>
                <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest block mb-2">Ödeme Yöntemi Seçin:</label>
                <select value={siparisForm.odemeYontemi} onChange={(e)=>setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-[#00f260] transition-colors mb-auto">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                  <option value="kapida_odeme">📦 Kapıda Ödeme</option>
                </select>
                <button onClick={handleSiparisTamamla} className="w-full mt-6 bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.4)]">
                  ✅ SİPARİŞİ TAMAMLA
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
