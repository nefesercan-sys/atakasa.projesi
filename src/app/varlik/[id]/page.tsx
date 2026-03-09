"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap, MessageCircle } from "lucide-react";

export default function SiberVarlikTerminali({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baslangicSekmesi = searchParams?.get("islem") || "incele";

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState(baslangicSekmesi);

  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");

  const [siparisForm, setSiparisForm] = useState({
    adSoyad: "",
    telefon: "",
    adres: "",
    siparisNotu: "",
    odemeYontemi: "kredi_karti",
    sozlesmeOnay: false
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

  const fetchIlanDetay = async () => {
    try {
      const res = await fetch(`/api/varliklar/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setIlan(data);
        if (data) {
          const saticiMail = data.satici?.email || data.sellerEmail || data.userId;
          fetchSaticiYorumlari(saticiMail);
        }
      } else {
        setIlan(null);
      }
    } catch (error) {
      console.error("Varlık çekilemedi:", error);
      setIlan(null);
    }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/varliklar`);
      if (res.ok) {
        const data = await res.json();
        let liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
        const benimkiler = liste.filter((i: any) => {
          const sEmail = (i.satici?.email || i.satici || "").toString().toLowerCase();
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
      const saticiMail = ilan.satici?.email || ilan.sellerEmail || ilan.userId;
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saticiEmail: saticiMail,
          ilanId: ilan._id,
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
          aliciEmail: ilan.satici?.email || ilan.sellerEmail || ilan.userId,
          hedefIlanId: ilan._id,
          hedefIlanBaslik: ilan.baslik || ilan.title,
          hedefIlanFiyat: ilan.fiyat || ilan.price || 0,
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
    if (!siparisForm.adSoyad || !siparisForm.telefon || !siparisForm.adres) return alert("Lütfen teslimat bilgilerini eksiksiz doldurun!");
    if (!siparisForm.sozlesmeOnay) return alert("Mesafeli Satış Sözleşmesini onaylamanız gerekmektedir!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id,
          sellerEmail: ilan.satici?.email || ilan.sellerEmail || ilan.userId,
          adSoyad: siparisForm.adSoyad,
          telefon: siparisForm.telefon,
          adres: siparisForm.adres,
          siparisNotu: siparisForm.siparisNotu,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: ilan.fiyat || ilan.price
        })
      });
      if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI!"); router.push("/panel"); }
      else { alert("Sipariş oluşturulamadı."); }
    } catch (error) { alert("Sipariş ağına ulaşılamadı."); }
  };

  const getResim = (ilan: any) => {
    if (ilan?.resimler?.[0]) return ilan.resimler[0];
    if (ilan?.media?.images?.[0]) return ilan.media.images[0];
    if (ilan?.images?.[0]) return ilan.images[0];
    if (typeof ilan?.image === 'string' && ilan.image) return ilan.image;
    return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const renderYildizlar = (puan: number) => "⭐".repeat(Math.round(puan)) + "☆".repeat(5 - Math.round(puan));

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse">
      <Zap size={40} className="mb-4" /> VARLIK ÇÖZÜMLENİYOR...
    </div>
  );

  if (!ilan) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center text-red-500 font-black tracking-widest">
      VARLIK BULUNAMADI.
    </div>
  );

  const ilaninSahibiyim = session?.user?.email?.toLowerCase() === (ilan.satici?.email || ilan.sellerEmail || ilan.userId)?.toLowerCase();

  return (
    <div className="min-h-screen bg-[#020202] py-8 md:py-24 px-4 text-white font-sans selection:bg-[#00f260] selection:text-black">
      <div className="max-w-6xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10">

        {/* SOL PANEL */}
        <div className="w-full lg:w-1/2 bg-[#030712] border-r border-white/5 p-6 md:p-8 flex flex-col relative">
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl mb-8 bg-zinc-950">
            <img src={getResim(ilan)} alt={ilan.baslik || ilan.title} className="w-full h-auto max-h-[450px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
          </div>

          <div className="mt-auto bg-white/5 p-6 rounded-3xl border border-white/5 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-cyan-400 font-black text-[10px] uppercase tracking-widest">Satıcı Güven Puanı</h3>
              <span className="text-amber-400 text-lg font-black tracking-widest">
                {ortalamaPuan > 0 ? renderYildizlar(ortalamaPuan) : "YENİ"}
              </span>
            </div>
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
            {session?.user && !ilaninSahibiyim && (
              <div className="bg-[#000000] p-5 rounded-2xl border border-cyan-500/20">
                <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3">Satıcıyı Değerlendir</p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setYeniPuan(star)} className={`text-3xl transition-all ${yeniPuan >= star ? 'text-amber-400 scale-110' : 'text-zinc-700 hover:text-amber-400/50'}`}>★</button>
                  ))}
                </div>
                <textarea value={yeniYorumMetni} onChange={(e) => setYeniYorumMetni(e.target.value)} placeholder="İşlem nasıldı? Güvenilir miydi?" className="w-full bg-[#050505] text-white text-xs p-4 rounded-xl border border-white/10 focus:border-cyan-500 transition-colors h-20 resize-none mb-3 outline-none" />
                <button onClick={handleYorumGonder} className="w-full bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-900/50 transition-all">
                  YORUMU GÖNDER
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex bg-[#000000] p-1.5 rounded-2xl mb-8 border border-white/5 shadow-inner">
            <button onClick={() => setAktifSekme("incele")} className={`flex-1 py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "incele" ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
              🔍 İncele
            </button>
            {!ilaninSahibiyim && (
              <>
                <button onClick={() => setAktifSekme("takas")} className={`flex-1 py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "takas" ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
                  TAKAS YAP
                </button>
                <button onClick={() => setAktifSekme("satinal")} className={`flex-1 py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${aktifSekme === "satinal" ? 'bg-[#00f260] text-black shadow-[0_0_15px_rgba(0,242,96,0.3)]' : 'text-slate-500 hover:text-white'}`}>
                  SATIN AL
                </button>
              </>
            )}
          </div>

          {/* İNCELE */}
          {aktifSekme === "incele" && (
            <div className="flex flex-col h-full">
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">
                {ilan.baslik || ilan.title || "İsimsiz Varlık"}
              </h1>
              <div className="text-[#00f260] font-black text-4xl mb-8 border-b border-white/5 pb-6">
                {Number(ilan.fiyat || ilan.price || 0).toLocaleString()} <span className="text-2xl text-zinc-500 italic">₺</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed flex-1 font-medium whitespace-pre-line">
                {ilan.aciklama || ilan.description || "Açıklama belirtilmemiş."}
              </p>
              {!ilaninSahibiyim && (
                <Link href={`/mesajlar?satici=${ilan.satici?.email || ilan.sellerEmail || ilan.userId}&ilan=${ilan._id}`} className="w-full bg-white/5 text-white py-5 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex justify-center items-center gap-2 mt-auto">
                  <MessageCircle size={18} /> SATICIYA MESAJ GÖNDER
                </Link>
              )}
            </div>
          )}

          {/* TAKAS */}
          {aktifSekme === "takas" && (
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-black text-white italic uppercase mb-8 border-b border-white/5 pb-4">SİBER <span className="text-cyan-400">TAKAS</span> KONSOLU</h3>
              <label className="text-cyan-400 text-[10px] font-black uppercase tracking-widest block mb-2">1. Vereceğiniz Varlığı Seçin:</label>
              <select onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-cyan-500 transition-colors mb-6 appearance-none">
                <option value="">-- Kendi İlanlarınızdan Birini Seçin --</option>
                {benimIlanlarim.map(bIlan => (
                  <option key={bIlan._id} value={`${bIlan._id}|${bIlan.baslik || bIlan.title}`}>{bIlan.baslik || bIlan.title}</option>
                ))}
              </select>
              <label className="text-[#00f260] text-[10px] font-black uppercase tracking-widest block mb-2">2. Üstüne Eklenecek Nakit (₺) - Opsiyonel:</label>
              <input type="number" placeholder="Örn: 500" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-[#00f260] transition-colors mb-6" />
              <label className="text-white text-[10px] font-black uppercase tracking-widest block mb-2">3. Teklif Notu:</label>
              <textarea value={takasMesaji} onChange={(e) => setTakasMesaji(e.target.value)} placeholder="Ürünüm temizdir. (Telefon/Mail yasaktır)" className="w-full bg-[#050505] border border-white/10 text-white text-sm p-5 rounded-2xl outline-none focus:border-cyan-500 transition-colors mb-auto h-28 resize-none"></textarea>
              <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim || benimIlanlarim.length === 0} className="w-full mt-8 bg-cyan-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                🚀 TAKAS TEKLİFİNİ FIRLAT
              </button>
            </div>
          )}

          {/* SATIN AL */}
          {aktifSekme === "satinal" && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                  <img src={getResim(ilan)} className="w-full h-full object-cover" alt="Urun" />
                </div>
                <div>
                  <div className="text-[#00f260] text-[9px] font-black uppercase tracking-widest mb-1">GÜVENLİ SATIN ALMA</div>
                  <h3 className="text-white font-bold text-sm line-clamp-1">{ilan.baslik || ilan.title}</h3>
                  <div className="text-white font-black text-lg">{Number(ilan.fiyat || ilan.price || 0).toLocaleString()} ₺</div>
                </div>
              </div>
              <div className="flex justify-between items-center border border-[#00f260]/30 bg-[#00f260]/5 rounded-2xl p-5 mb-6">
                <span className="text-[#00f260] font-black text-[11px] uppercase tracking-widest">ÖDENECEK TUTAR</span>
                <span className="text-3xl font-black text-white">{Number(ilan.fiyat || ilan.price || 0).toLocaleString()} ₺</span>
              </div>
              <div className="space-y-4 mb-6">
                <input type="text" placeholder="Teslim Alacak Ad Soyad" value={siparisForm.adSoyad} onChange={(e) => setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#030712] border border-white/5 text-white text-sm p-4 rounded-xl outline-none focus:border-[#00f260] transition-colors" />
                <input type="tel" placeholder="Telefon Numarası" value={siparisForm.telefon} onChange={(e) => setSiparisForm({...siparisForm, telefon: e.target.value})} className="w-full bg-[#030712] border border-white/5 text-white text-sm p-4 rounded-xl outline-none focus:border-[#00f260] transition-colors" />
                <textarea placeholder="Açık Teslimat Adresi" value={siparisForm.adres} onChange={(e) => setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#030712] border border-white/5 text-white text-sm p-4 rounded-xl outline-none focus:border-[#00f260] transition-colors h-24 resize-none"></textarea>
                <input type="text" placeholder="Sipariş Notu (İsteğe Bağlı)" value={siparisForm.siparisNotu} onChange={(e) => setSiparisForm({...siparisForm, siparisNotu: e.target.value})} className="w-full bg-[#030712] border border-white/5 text-white text-sm p-4 rounded-xl outline-none focus:border-[#00f260] transition-colors" />
              </div>
              <div className="mb-6">
                <select value={siparisForm.odemeYontemi} onChange={(e) => setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="w-full bg-[#030712] border border-white/5 text-white text-sm p-4 rounded-xl outline-none focus:border-[#00f260] transition-colors appearance-none cursor-pointer">
                  <option value="kredi_karti">💳 Kredi Kartı (Güvenli Havuz)</option>
                  <option value="havale">🏦 Havale / EFT</option>
                  <option value="kapida_odeme">📦 Kapıda Ödeme</option>
                </select>
              </div>
              <div className="space-y-4 mb-8 mt-auto border border-white/5 bg-[#030712] p-5 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input type="checkbox" checked={siparisForm.sozlesmeOnay} onChange={(e) => setSiparisForm({...siparisForm, sozlesmeOnay: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-white checked:border-white transition-colors cursor-pointer" />
                    <ShieldCheck size={12} className="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed uppercase font-black tracking-widest group-hover:text-zinc-300 transition-colors">
                    MESAFELİ SATIŞ SÖZLEŞMESİ'Nİ OKUDUM VE KABUL EDİYORUM.
                  </p>
                </label>
                <label className="flex items-start gap-3">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input type="checkbox" checked={true} readOnly className="appearance-none w-5 h-5 border-2 border-white bg-white rounded-md" />
                    <ShieldCheck size={12} className="absolute text-black pointer-events-none" />
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed uppercase font-black tracking-widest">
                    <span className="text-[#00f260]">🛡️ YASAL ZIRH:</span> TESLİMAT TAMAMLANANA KADAR PARA HAVUZA AKTARILIR.
                  </p>
                </label>
              </div>
              <button onClick={handleSiparisTamamla} className="w-full bg-[#00f260] text-black py-4 rounded-xl font-black uppercase tracking-[0.1em] text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                ✅ GÜVENLİ ÖDEMEYİ TAMAMLA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
