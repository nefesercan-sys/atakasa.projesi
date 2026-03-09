"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShoppingCart, ArrowLeftRight, MessageCircle, Star, Zap } from "lucide-react";

export default function SiberVarlikTerminali({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baslangicSekmesi = searchParams?.get("islem") || "incele";

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState(baslangicSekmesi);

  // 🔄 TAKAS STATE'LERİ
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");

  // 🛒 SİPARİŞ STATE'LERİ
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", odemeYontemi: "kredi_karti", sozlesmeOnay: false });

  // ⭐ CANLI YORUM VE PUAN STATE'LERİ
  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [ortalamaPuan, setOrtalamaPuan] = useState(0);
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yeniYorumMetni, setYeniYorumMetni] = useState("");

  const [resolvedParams, setResolvedParams] = useState<any>(null);

  useEffect(() => {
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
      const res = await fetch(`/api/listings`); 
      const data = await res.json();
      let liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
      const seciliIlan = liste.find((i: any) => i._id === resolvedParams.id || i.id === resolvedParams.id);
      setIlan(seciliIlan);
      
      if (seciliIlan) {
        const saticiMail = seciliIlan.sellerEmail || seciliIlan.satici?.email || seciliIlan.userId;
        fetchSaticiYorumlari(saticiMail);
      }
    } catch (error) { console.error("Varlık çekilemedi:", error); }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/listings`);
      if (res.ok) {
        const data = await res.json();
        let liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
        const benimkiler = liste.filter((i: any) => {
           const sEmail = (typeof i.userId === 'string' ? i.userId : i.satici?.email || i.satici || "").toLowerCase();
           return sEmail === session?.user?.email?.toLowerCase();
        });
        setBenimIlanlarim(benimkiler);
      }
    } catch (error) { console.error("Varlıklar çekilemedi."); }
  };

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

  const handleYorumGonder = async () => {
    if (!yeniYorumMetni.trim()) return alert("Boş sinyal gönderilemez!");
    try {
      const saticiMail = ilan.sellerEmail || ilan.satici?.email || ilan.userId;
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
        fetchSaticiYorumlari(saticiMail);
      } else {
        alert(`❌ Siber Kalkan: ${result.error}`);
      }
    } catch (error) { alert("Yorum motoru yanıt vermiyor."); }
  };

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
          aliciEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId,
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
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon) return alert("Lütfen teslimat bilgilerini eksiksiz doldurun!");
    if (!siparisForm.sozlesmeOnay) return alert("Sözleşmeyi onaylamanız gerekmektedir!");
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id || ilan.id,
          sellerEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId,
          adSoyad: siparisForm.adSoyad,
          adres: siparisForm.adres,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: ilan.price || ilan.fiyat
        })
      });
      if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI! Siber havuza aktarıldı."); router.push("/panel"); } 
      else { alert("Sipariş oluşturulamadı."); }
    } catch (error) { alert("Sipariş ağına ulaşılamadı."); }
  };

  const getResim = (ilan: any) => {
    if (ilan?.media?.images?.[0]) return ilan.media.images[0];
    if (ilan?.images?.[0]) return ilan.images[0];
    if (typeof ilan?.image === 'string' && ilan.image) return ilan.image;
    return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const renderYildizlar = (puan: number) => {
    return "⭐".repeat(Math.round(puan)) + "☆".repeat(5 - Math.round(puan));
  };

  if (loading) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse"><Zap size={40} className="mb-4" /> VARLIK ÇÖZÜMLENİYOR...</div>;
  if (!ilan) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-black tracking-widest">VARLIK BULUNAMADI.</div>;

  const ilaninSahibiyim = session?.user?.email?.toLowerCase() === (ilan.sellerEmail || ilan.satici?.email || ilan.userId)?.toLowerCase();

  return (
    <div className="min-h-screen bg-black py-8 md:py-24 px-4 text-white font-sans selection:bg-[#00f260] selection:text-black">
      
      {/* 🌌 SİBER ARKA PLAN */}
      <div className="fixed top-0 left-0 w-full h-full bg-[#00f260]/5 blur-[150px] pointer-events-none -z-10"></div>

      <div className="max-w-[1400px] mx-auto bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* ========================================================= */}
        {/* SOL PANEL: GÖRSEL VE YORUMLAR                             */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[45%] bg-[#020202] border-r border-white/5 p-6 md:p-10 flex flex-col relative">
           <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8 bg-zinc-950">
             <img src={getResim(ilan)} alt={ilan.title} className="w-full h-auto max-h-[500px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
             <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
               <Zap size={12} className="text-[#00f260]" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Aktif Varlık</span>
             </div>
           </div>
           
           {/* ⭐ CANLI YORUM VE PUAN SİSTEMİ */}
           <div className="mt-auto bg-white/5 p-6 rounded-3xl border border-white/5 max-h-96 overflow-y-auto scrollbar-hide">
             <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
               <h3 className="text-cyan-400 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={16} /> Satıcı Güven Puanı
               </h3>
               <span className="text-amber-400 text-lg font-black tracking-widest">
                 {ortalamaPuan > 0 ? `${renderYildizlar(ortalamaPuan)}` : "YENİ"}
               </span>
             </div>
             
             {/* Yorumlar Listesi */}
             <div className="space-y-4 mb-6">
               {yorumlar.length === 0 ? (
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center py-4 bg-black/40 rounded-xl">Henüz değerlendirme yok.</p>
               ) : (
                 yorumlar.map((yorum: any, idx: number) => (
                   <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-amber-400 text-xs">{renderYildizlar(yorum.puan)}</span>
                       <span className="text-slate-500 text-[9px] font-bold">{new Date(yorum.createdAt).toLocaleDateString("tr-TR")}</span>
                     </div>
                     <p className="text-zinc-300 text-xs font-medium mb-2 leading-relaxed">"{yorum.icerik}"</p>
                     <p className="text-cyan-400/50 text-[9px] font-black uppercase tracking-widest">- {yorum.gonderenAd}</p>
                   </div>
                 ))
               )}
             </div>

             {/* YENİ YORUM FORMU */}
             {session?.user && !ilaninSahibiyim && (
               <div className="bg-[#000000] p-5 rounded-2xl border border-cyan-500/20">
                 <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3">Deneyimini Paylaş</p>
                 <div className="flex gap-2 mb-4">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button key={star} onClick={() => setYeniPuan(star)} className={`text-3xl transition-all ${yeniPuan >= star ? 'text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-zinc-700 hover:text-amber-400/50'}`}>★</button>
                   ))}
                 </div>
                 <textarea 
                   value={yeniYorumMetni} 
                   onChange={(e) => setYeniYorumMetni(e.target.value)} 
                   placeholder="İşlem nasıldı? Satıcı güvenilir miydi?"
                   className="w-full bg-[#050505] text-white text-xs p-4 rounded-xl border border-white/10 focus:border-cyan-500 transition-colors h-20 resize-none mb-3 outline-none"
                 />
                 <button onClick={handleYorumGonder} className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
                   YORUMU GÖNDER
                 </button>
               </div>
             )}
           </div>
        </div>

        {/* ========================================================= */}
        {/* SAĞ PANEL: TERMİNAL SEKMELERİ                             */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[55%] p-6 md:p-10 flex flex-col">
           
           {/* SEKMELER BAŞLIYOR */}
           <div className="flex bg-[#020202] p-1.5 rounded-2xl mb-8 border border-white/10 shadow-inner">
             <button onClick={()=>setAktifSekme("incele")} className={`flex-1 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${aktifSekme === "incele" ? 'bg-white/10 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
               🔍 İncele
             </button>
             {!ilaninSahibiyim && (
               <>
                 <button onClick={()=>setAktifSekme("takas")} className={`flex-1 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${aktifSekme === "takas" ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'}`}>
                   <ArrowLeftRight size={14} /> Takas
                 </button>
                 <button onClick={()=>setAktifSekme("satinal")} className={`flex-1 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${aktifSekme === "satinal" ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.4)]' : 'text-slate-500 hover:text-white'}`}>
                   <ShoppingCart size={14} /> Satın Al
                 </button>
               </>
             )}
           </div>

           {/* 1. İNCELE EKRANI */}
           {aktifSekme === "incele" && (
             <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-block bg-[#00f260]/10 text-[#00f260] text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest border border-[#00f260]/20 mb-6 w-max">
                  {ilan.category || "Kategori Yok"}
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 text-white leading-none">
                  {ilan.title || ilan.baslik || "İsimsiz Varlık"}
                </h1>
                <p className="text-zinc-400 text-sm md:text-base mb-8 leading-relaxed flex-1 font-medium">
                  {ilan.description || ilan.aciklama || "Açıklama belirtilmemiş."}
                </p>
                <div className="text-[#00f260] font-black text-5xl md:text-6xl mb-10 border-t border-white/5 pt-8">
                  {Number(ilan.price || ilan.fiyat || 0).toLocaleString()} <span className="text-3xl text-zinc-500 italic">₺</span>
                </div>

                {!ilaninSahibiyim ? (
                  <div className="flex flex-col gap-4 mt-auto">
                    <Link href={`/mesajlar?satici=${ilan.sellerEmail || ilan.satici?.email || ilan.userId}&ilan=${ilan._id || ilan.id}`} className="w-full bg-white/5 text-white py-5 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex justify-center items-center gap-2">
                      <MessageCircle size={18} /> SATICIYA MESAJ GÖNDER
                    </Link>
                  </div>
                ) : (
                  <div className="mt-auto text-center bg-[#00f260]/10 border border-[#00f260]/30 p-5 rounded-2xl text-[#00f260] text-xs font-black uppercase tracking-widest">
                    <ShieldCheck size={20} className="inline-block mr-2" /> BU SİZİN VARLIĞINIZ
                  </div>
                )}
             </div>
           )}

           {/* 2. TAKAS YAP EKRANI */}
           {aktifSekme === "takas" && (
             <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-black text-white italic uppercase mb-8 border-b border-white/5 pb-4">SİBER <span className="text-cyan-400">TAKAS</span> KONSOLU</h3>
                
                <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block mb-2">1. Vereceğiniz Varlığı Seçin:</label>
                <select onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-cyan-500 transition-colors mb-6 appearance-none">
                  <option value="">-- Kendi İlanlarınızdan Birini Seçin --</option>
                  {benimIlanlarim.map(bIlan => (<option key={bIlan._id} value={`${bIlan._id}|${bIlan.title || bIlan.baslik}`}>{bIlan.title || bIlan.baslik}</option>))}
                </select>

                <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block mb-2">2. Üstüne Eklenecek Nakit (₺) - Opsiyonel:</label>
                <input type="number" placeholder="Örn: 500" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors mb-6" />
                
                <label className="text-white text-[10px] font-black uppercase tracking-widest block mb-2">3. Teklif Notu (Kısa Mesaj):</label>
                <textarea value={takasMesaji} onChange={(e) => setTakasMesaji(e.target.value)} placeholder="Ürünüm temizdir. (Telefon/Mail yasaktır)" className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-cyan-500 transition-colors mb-auto h-28 resize-none"></textarea>
                
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim || benimIlanlarim.length === 0} className="w-full mt-8 bg-cyan-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2">
                  <ArrowLeftRight size={18} /> TAKAS TEKLİFİNİ FIRLAT
                </button>
             </div>
           )}

           {/* 3. LÜKS SATIN AL EKRANI */}
           {aktifSekme === "satinal" && (
             <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-black text-white italic uppercase mb-6 border-b border-white/5 pb-4">GÜVENLİ <span className="text-[#00f260]">SİPARİŞ</span> MERKEZİ</h3>
                
                {/* Fiyat Göstergesi */}
                <div className="flex justify-between items-center border border-[#00f260]/30 bg-[#00f260]/5 rounded-2xl p-6 mb-8">
                  <span className="text-[#00f260] font-black text-[11px] uppercase tracking-widest">ÖDENECEK TUTAR</span>
                  <span className="text-4xl font-black text-white italic">{Number(ilan.price || ilan.fiyat || 0).toLocaleString()} ₺</span>
                </div>

                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="Teslim Alacak Ad Soyad" value={siparisForm.adSoyad} onChange={(e)=>setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" />
                  <input type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon} onChange={(e)=>setSiparisForm({...siparisForm, telefon: e.target.value})} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors" />
                  <textarea placeholder="Açık Teslimat Adresi" value={siparisForm.adres} onChange={(e)=>setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors h-24 resize-none"></textarea>
                </div>

                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Ödeme Yöntemi:</label>
                <select value={siparisForm.odemeYontemi} onChange={(e)=>setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors mb-6 appearance-none cursor-pointer">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                  <option value="kapida_odeme">📦 Kapıda Ödeme</option>
                </select>

                {/* Hukuki Siber Zırh */}
                <div className="space-y-4 mb-8 mt-auto">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input type="checkbox" checked={siparisForm.sozlesmeOnay} onChange={(e)=>setSiparisForm({...siparisForm, sozlesmeOnay: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-[#00f260] checked:border-[#00f260] transition-colors cursor-pointer" />
                      <ShieldCheck size={12} className="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold tracking-widest group-hover:text-zinc-300 transition-colors">
                      Mesafeli Satış Sözleşmesi'ni okudum ve onaylıyorum.
                    </p>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input type="checkbox" checked={true} readOnly className="appearance-none w-5 h-5 border-2 border-[#00f260] bg-[#00f260] rounded-md transition-colors" />
                      <ShieldCheck size={12} className="absolute text-black pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold tracking-widest">
                      <span className="text-[#00f260]">🛡️ SİBER KALKAN:</span> BU İŞLEM GÜVENCE ALTINDADIR.
                    </p>
                  </label>
                </div>

                <button onClick={handleSiparisTamamla} className="w-full bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,242,96,0.3)] flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> SİPARİŞİ MÜHÜRLE
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
