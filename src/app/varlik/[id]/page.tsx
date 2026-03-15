"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap, MessageCircle, Play, Star, ChevronLeft, ArrowRightLeft, ShoppingCart, Info, MapPin, Tag } from "lucide-react";

// 🚀 İŞTE SİBER KİLİT! Vercel'in önbelleğini iptal eder, veriyi her seferinde canlı çeker.
export const dynamic = "force-dynamic";

export default function ProfesyonelVarlikTerminali({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baslangicSekmesi = searchParams?.get("islem") || "incele";

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState(baslangicSekmesi);
  const [aktifMedyaIndex, setAktifMedyaIndex] = useState(0);
  const [videoAcik, setVideoAcik] = useState(false);

  const [benzerIlanlar, setBenzerIlanlar] = useState<any[]>([]);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");

  // 🚨 DÜZELTME 1: Sözleşme Onayları İkiye Ayrıldı!
  const [siparisForm, setSiparisForm] = useState({
    adSoyad: "", telefon: "", adres: "",
    siparisNotu: "", odemeYontemi: "kredi_karti", 
    sozlesmeOnay1: false, // Mesafeli Satış
    sozlesmeOnay2: false  // Ön Bilgilendirme
  });

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

  const fetchBenzerIlanlar = async (kategori: string, suankiId: string) => {
    try {
      const res = await fetch(`/api/varliklar?kategori=${encodeURIComponent(kategori)}`);
      if (res.ok) {
        const data = await res.json();
        const liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
        const filtrelenmis = liste.filter((i: any) => i._id !== suankiId).slice(0, 6);
        setBenzerIlanlar(filtrelenmis);
      }
    } catch (err) { console.error("Öneri motoru koptu."); }
  };

  const fetchIlanDetay = async () => {
    try {
      const res = await fetch(`/api/varliklar?id=${resolvedParams.id}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const ilanVerisi = Array.isArray(data) ? data[0] : data;
        if (ilanVerisi) {
          setIlan(ilanVerisi);
          // 🚨 YORUM DÜZELTMESİ: E-posta bulunamazsa "sistem" olarak ata
          const saticiMail = ilanVerisi.satici?.email || ilanVerisi.sellerEmail || ilanVerisi.userId || "sistem@atakasa.com";
          fetchSaticiYorumlari(saticiMail);
          if (ilanVerisi.kategori) fetchBenzerIlanlar(ilanVerisi.kategori, ilanVerisi._id);
        } else {
          setIlan(null);
        }
      } else { setIlan(null); }
    } catch (error) { console.error("Varlık çekilemedi:", error); setIlan(null); }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/varliklar`);
      if (res.ok) {
        const data = await res.json();
        const liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
        const benimkiler = liste.filter((i: any) => {
          const sEmail = (i.satici?.email || i.satici || "").toString().toLowerCase();
          return sEmail === session?.user?.email?.toLowerCase();
        });
        setBenimIlanlarim(benimkiler);
      }
    } catch { console.error("Varlıklar çekilemedi."); }
  };

  const fetchSaticiYorumlari = async (saticiEmail: string) => {
    try {
      const res = await fetch(`/api/yorumlar?satici=${saticiEmail}`);
      if (res.ok) {
        const data = await res.json();
        setYorumlar(data.yorumlar || []);
        setOrtalamaPuan(data.ortalama || 0);
      }
    } catch { console.error("Yorum radarı koptu."); }
  };

  const handleYorumGonder = async () => {
    if (!yeniYorumMetni.trim()) return alert("Değerlendirme metni boş olamaz!");
    try {
      // 🚨 YORUM DÜZELTMESİ: E-posta koruması
      const saticiMail = ilan.satici?.email || ilan.sellerEmail || ilan.userId || "sistem@atakasa.com";
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saticiEmail: saticiMail, ilanId: ilan._id, puan: yeniPuan, icerik: yeniYorumMetni })
      });
      const result = await res.json();
      if (res.ok) { alert("✅ Değerlendirmeniz kaydedildi."); setYeniYorumMetni(""); fetchSaticiYorumlari(saticiMail); }
      else { alert(`❌ Hata: ${result.error}`); }
    } catch { alert("Yorum motoru yanıt vermiyor."); }
  };

  const iletisimBilgisiIceriyorMu = (metin: string) => {
    const telefonRegex = /(\b(05|5)\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}\b)/;
    const mailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    return telefonRegex.test(metin) || mailRegex.test(metin);
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return alert("Lütfen vereceğiniz ilanı seçin!");
    if (iletisimBilgisiIceriyorMu(takasMesaji)) return alert("🚨 Güvenlik İhlali: İletişim bilgisi paylaşılamaz!");
    const [teklifIlanId, teklifIlanBaslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: ilan.satici?.email || ilan.sellerEmail || ilan.userId || "sistem@atakasa.com",
          hedefIlanId: ilan._id,
          hedefIlanBaslik: ilan.baslik,
          hedefIlanFiyat: ilan.fiyat || 0,
          teklifEdilenIlanId: teklifIlanId,
          teklifEdilenIlanBaslik: teklifIlanBaslik,
          eklenenNakit: eklenecekNakit || 0,
        })
      });
      if (res.ok) { alert("✅ Takas teklifiniz satıcıya iletildi!"); router.push("/panel"); }
      else { const err = await res.json(); alert(`Hata: ${err.error}`); }
    } catch { alert("Takas motoru yanıt vermiyor."); }
  };

  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.telefon || !siparisForm.adres) return alert("Lütfen teslimat bilgilerini eksiksiz doldurun!");
    // 🚨 DÜZELTME: İki sözleşme de kontrol ediliyor
    if (!siparisForm.sozlesmeOnay1 || !siparisForm.sozlesmeOnay2) return alert("Lütfen her iki sözleşmeyi de (Mesafeli Satış ve Ön Bilgilendirme) onaylayın!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id,
          sellerEmail: ilan.satici?.email || ilan.sellerEmail || ilan.userId || "sistem@atakasa.com",
          adSoyad: siparisForm.adSoyad, telefon: siparisForm.telefon,
          adres: siparisForm.adres, siparisNotu: siparisForm.siparisNotu,
          odemeYontemi: siparisForm.odemeYontemi, fiyat: ilan.fiyat
        })
      });
      if (res.ok) { alert("📦 Siparişiniz başarıyla oluşturuldu!"); router.push("/panel"); }
      else { alert("Sipariş oluşturulamadı."); }
    } catch { alert("Sipariş ağına ulaşılamadı."); }
  };

  const isVideo = (url: string) =>
    !!url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video'));

  // 🚀 KUSURSUZ GÖRSEL DEDEKTÖRÜ (Beyaz Tema İçin Uyarlandı)
  const getTumMedya = (ilan: any): string[] => {
    return ilan?.resimler?.length ? ilan.resimler :
      ilan?.images?.length ? ilan.images :
      ilan?.image ? [ilan.image] :
      ["https://placehold.co/600x400/f3f4f6/4f46e5?text=Görsel+Yok"];
  };

  const renderYildizlar = (puan: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={14} className={star <= Math.round(puan) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
        ))}
      </div>
    );
  };

  const ilaninSahibiyim = session?.user?.email?.toLowerCase() ===
    (ilan?.satici?.email || ilan?.sellerEmail || ilan?.userId)?.toLowerCase();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-indigo-600 font-bold tracking-wide animate-pulse">
      <Zap size={40} className="mb-4" /> İlan Yükleniyor...
    </div>
  );

  if (!ilan) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <p className="text-gray-500 font-semibold text-lg">İlan yayından kaldırılmış veya bulunamıyor.</p>
      <button onClick={() => router.push("/")} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors">
        Ana Sayfaya Dön
      </button>
    </div>
  );

  const tumMedya = getTumMedya(ilan);
  const aktifMedya = tumMedya[aktifMedyaIndex];
  const aktifMedyaVideo = isVideo(aktifMedya);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-4 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">

      {/* SEO Zırhı */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org/", "@type": "Product",
          "name": ilan.baslik || "İsimsiz İlan", "image": tumMedya[0],
          "description": ilan.aciklama || "Atakasa platformunda bir ilan",
          "offers": { "@type": "Offer", "priceCurrency": "TRY", "price": ilan.fiyat || "0" }
        })
      }} />

      <div className="max-w-6xl mx-auto mb-6">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-semibold text-sm transition-colors w-fit">
          <ChevronLeft size={16} /> Vitrine Dön
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col lg:flex-row relative z-10">

        {/* 📸 SOL PANEL (GÖRSELLER VE YORUMLAR) */}
        <div className="w-full lg:w-1/2 bg-gray-50/50 border-r border-gray-100 p-6 md:p-8 flex flex-col">

          {/* Ana Görsel */}
          <div className="relative group rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 mb-4 cursor-pointer aspect-video md:aspect-[4/3] flex items-center justify-center shadow-inner" onClick={() => aktifMedyaVideo && setVideoAcik(true)}>
            {aktifMedyaVideo ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video src={`${aktifMedya}#t=0.001`} className="w-full h-full object-cover opacity-70" muted playsInline preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            ) : (
              <img src={aktifMedya} alt={ilan.baslik} className="w-full h-full object-contain mix-blend-multiply" />
            )}
          </div>

          {/* Küçük Görseller (Thumbnail) */}
          {tumMedya.length > 1 && (
            <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
              {tumMedya.map((medya, idx) => (
                <div key={idx} onClick={() => setAktifMedyaIndex(idx)} className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${aktifMedyaIndex === idx ? 'border-indigo-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  {isVideo(medya) ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Play size={18} className="text-gray-400" fill="currentColor" /></div>
                  ) : (
                    <img src={medya} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Satıcı Güven Kartı ve Yorumlar */}
          <div className="mt-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-600"/> Satıcı Güven Puanı</h3>
              <div className="flex items-center gap-2">
                {ortalamaPuan > 0 ? renderYildizlar(ortalamaPuan) : <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">YENİ ÜYE</span>}
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {yorumlar.length === 0 ? (
                <p className="text-gray-400 text-xs font-medium text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">Satıcı için henüz bir değerlendirme yapılmamış.</p>
              ) : (
                yorumlar.map((yorum: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      {renderYildizlar(yorum.puan)}
                      <span className="text-gray-400 text-[10px] font-semibold">{new Date(yorum.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">"{yorum.icerik}"</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase">- {yorum.gonderenAd}</p>
                  </div>
                ))
              )}
            </div>

            {session?.user && !ilaninSahibiyim && (
              <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                <p className="text-indigo-900 text-xs font-bold mb-3">Bu satıcıyla işlem yaptınız mı?</p>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setYeniPuan(star)} className={`transition-all ${yeniPuan >= star ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'}`}><Star size={20} className={yeniPuan >= star ? "fill-amber-400" : ""} /></button>
                  ))}
                </div>
                <textarea value={yeniYorumMetni} onChange={(e) => setYeniYorumMetni(e.target.value)} placeholder="Deneyiminizi kısaca paylaşın..." className="w-full bg-white text-gray-900 text-sm p-3 rounded-lg border border-gray-200 focus:border-indigo-500 transition-colors h-20 resize-none mb-3 outline-none" />
                <button onClick={handleYorumGonder} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">Değerlendirmeyi Gönder</button>
              </div>
            )}
          </div>
        </div>

        {/* 📝 SAĞ PANEL (İLAN BİLGİLERİ VE AKSİYONLAR) */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">

          {/* Aksiyon Sekmeleri */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 border border-gray-200">
            <button onClick={() => setAktifSekme("incele")} className={`flex-1 py-3 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${aktifSekme === "incele" ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Info size={14}/> İncele
            </button>
            {!ilaninSahibiyim && (
              <>
                <button onClick={() => setAktifSekme("takas")} className={`flex-1 py-3 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${aktifSekme === "takas" ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <ArrowRightLeft size={14}/> Takas Et
                </button>
                <button onClick={() => setAktifSekme("satinal")} className={`flex-1 py-3 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${aktifSekme === "satinal" ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                  <ShoppingCart size={14}/> Satın Al
                </button>
              </>
            )}
          </div>

          {/* 🔍 SEKME: İNCELE */}
          {aktifSekme === "incele" && (
            <div className="flex flex-col h-full">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="flex items-center gap-1 text-indigo-700 text-[10px] font-bold uppercase bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-md"><Tag size={12}/> {ilan.kategori || "Genel"}</span>
                {ilan.sehir && <span className="flex items-center gap-1 text-gray-600 text-[10px] font-bold uppercase bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md"><MapPin size={12}/> {ilan.sehir}</span>}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug mb-4">{ilan.baslik || "İlan Başlığı"}</h1>
              
              <div className="text-indigo-600 font-black text-4xl mb-6 pb-6 border-b border-gray-100">
                {Number(ilan.fiyat || 0).toLocaleString()} <span className="text-2xl text-gray-400 font-medium">₺</span>
              </div>
              
              {ilan.takasIstegi && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6">
                  <p className="text-emerald-800 text-xs font-bold uppercase mb-1.5 flex items-center gap-1.5"><ArrowRightLeft size={14}/> Takas Tercihi</p>
                  <p className="text-emerald-900 text-sm font-medium">{ilan.takasIstegi}</p>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-gray-900 font-bold mb-2">Açıklama</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {ilan.aciklama || "Bu ilan için bir açıklama girilmemiş."}
                </p>
              </div>

              {!ilaninSahibiyim && (
                // 🚨 DÜZELTME 4: Mesaj gönderme URL'si paneldeki mesajlaşma odasına doğrudan entegre edildi!
                <Link href={`/panel?tab=mesajlar&yeniSohbet=${ilan._id}`}
                  className="w-full bg-white text-gray-700 py-4 rounded-xl border-2 border-gray-200 font-bold text-[13px] hover:border-indigo-600 hover:text-indigo-600 transition-colors flex justify-center items-center gap-2 mt-auto shadow-sm">
                  <MessageCircle size={18} /> 💬 Satıcıya Mesaj Gönder
                </Link>
              )}
              
              {ilaninSahibiyim && (
                <div className="mt-auto bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-blue-700 text-xs font-bold">Bu sizin kendi ilanınızdır.</p>
                </div>
              )}
            </div>
          )}

          {/* 🔄 SEKME: TAKAS TEKLİFİ */}
          {aktifSekme === "takas" && (
            <div className="flex flex-col h-full">
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl mb-6">
                <h3 className="text-lg font-bold text-indigo-900 mb-1">Takas Teklifi Oluştur</h3>
                <p className="text-indigo-700 text-xs">Satıcıya kendi ürünlerinizden birini teklif edin.</p>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="text-gray-700 text-xs font-bold block mb-2">1. Vereceğiniz Ürünü Seçin</label>
                  <select onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
                    <option value="">-- Yayındaki İlanlarınızdan Seçin --</option>
                    {benimIlanlarim.map(bIlan => <option key={bIlan._id} value={`${bIlan._id}|${bIlan.baslik}`}>{bIlan.baslik}</option>)}
                  </select>
                </div>

                {benimIlanlarim.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-amber-800 text-xs font-bold mb-2">Takas yapabilmek için önce sisteme bir ürün eklemelisiniz.</p>
                    <button onClick={() => router.push('/ilan-ver')} className="text-indigo-600 text-xs font-bold underline">Hemen İlan Ver</button>
                  </div>
                )}

                <div>
                  <label className="text-gray-700 text-xs font-bold block mb-2">2. Üste Nakit Eklenecek mi? (Opsiyonel)</label>
                  <div className="relative">
                    <input type="number" placeholder="0" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 pr-10 rounded-xl outline-none focus:border-indigo-500 transition-shadow" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 text-xs font-bold block mb-2">3. Teklif Notu (Opsiyonel)</label>
                  <textarea value={takasMesaji} onChange={(e) => setTakasMesaji(e.target.value)} placeholder="Ürünüm temizdir, üste nakit verebilirim. (İletişim bilgisi girmek yasaktır)" className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 transition-shadow h-24 resize-none" />
                </div>
              </div>

              <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim || benimIlanlarim.length === 0} className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-bold text-[13px] hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2">
                <ArrowRightLeft size={16}/> Takas Teklifini Gönder
              </button>
            </div>
          )}

          {/* 💳 SEKME: GÜVENLİ SATIN ALMA */}
          {aktifSekme === "satinal" && (
            <div className="flex flex-col h-full">
              
              <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
                  <img src={aktifMedya} className="w-full h-full object-cover" alt="Ürün" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm line-clamp-1 mb-1">{ilan.baslik}</h3>
                  <div className="text-indigo-600 font-black text-lg">{Number(ilan.fiyat || 0).toLocaleString()} ₺</div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <input type="text" placeholder="Teslim Alacak Ad Soyad" value={siparisForm.adSoyad} onChange={(e) => setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500" />
                <input type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon} onChange={(e) => setSiparisForm({...siparisForm, telefon: e.target.value})} className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500" />
                <textarea placeholder="Açık Teslimat Adresi" value={siparisForm.adres} onChange={(e) => setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 h-20 resize-none"></textarea>
                
                {/* 🚨 DÜZELTME 2: KAPIDA ÖDEME SEÇENEĞİ EKLENDİ */}
                <select value={siparisForm.odemeYontemi} onChange={(e) => setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="w-full bg-white border border-gray-300 text-gray-900 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 cursor-pointer font-semibold text-indigo-900">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz Ödemesi)</option>
                  <option value="havale">🏦 Havale / EFT ile Ödeme</option>
                  <option value="kapida_odeme">🚚 Kapıda Ödeme (Nakit / Kredi Kartı)</option>
                </select>
              </div>

              <div className="mt-6 bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3">
                {/* 🚨 DÜZELTME 3: İKİ AYRI SÖZLEŞME ONAYI EKLENDİ */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={siparisForm.sozlesmeOnay1} onChange={(e) => setSiparisForm({...siparisForm, sozlesmeOnay1: e.target.checked})} className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer" />
                  <p className="text-xs text-gray-600 font-medium">Mesafeli Satış Sözleşmesi'ni okudum, onaylıyorum.</p>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={siparisForm.sozlesmeOnay2} onChange={(e) => setSiparisForm({...siparisForm, sozlesmeOnay2: e.target.checked})} className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer" />
                  <p className="text-xs text-gray-600 font-medium">Ön Bilgilendirme Formu'nu okudum, onaylıyorum.</p>
                </label>

                <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 font-medium">
                    <strong className="text-gray-900">Alıcı Koruması:</strong> Ürün size ulaşıp onay verene kadar ödemeniz güvenli havuz hesabımızda tutulur. Satıcıya aktarılmaz.
                  </p>
                </div>
              </div>

              <button onClick={handleSiparisTamamla} className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold text-[14px] hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                <ShieldCheck size={18}/> Güvenli Ödemeye Geç
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VİDEO MODAL */}
      {videoAcik && aktifMedyaVideo && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVideoAcik(false)}>
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setVideoAcik(false)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors z-10">✕</button>
            <video src={`${aktifMedya}#t=0.001`} controls autoPlay className="w-full h-auto max-h-[80vh]" />
          </div>
        </div>
      )}

      {/* BENZER İLANLAR */}
      {benzerIlanlar.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16 mb-24">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-gray-900">Benzer İlanlar</h2>
            <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Tümünü Gör →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {benzerIlanlar.map((bIlan) => (
              <Link key={bIlan._id} href={`/varlik/${bIlan._id}`} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all shadow-sm hover:shadow-md flex flex-col">
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img
                    src={bIlan.resimler?.[0] || bIlan.image || "https://placehold.co/200x200/f3f4f6/4f46e5?text=İlan"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                    alt={bIlan.baslik}
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1 leading-tight">{bIlan.baslik}</h3>
                  <p className="text-indigo-600 text-sm font-extrabold mt-auto">{Number(bIlan.fiyat || 0).toLocaleString()} ₺</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
