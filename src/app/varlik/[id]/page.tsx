"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 📊 SİBER GRAFİK MOTORU İMPORTLARI
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function SiberVarlikTerminali({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baslangicSekmesi = searchParams.get("islem") || "incele";

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState(baslangicSekmesi);

  // 🔄 TAKAS STATE'LERİ
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");

  // 🛒 YENİLENMİŞ SİPARİŞ STATE'LERİ VE YASAL ZIRH
  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);

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

  // 📡 İLAN VE YORUM ÇEKME
  const fetchIlanDetay = async () => {
    try {
      const res = await fetch(`/api/varliklar`); 
      const data = await res.json();
      let liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
      const seciliIlan = liste.find((i: any) => i._id === resolvedParams.id || i.id === resolvedParams.id);
      setIlan(seciliIlan);
      
      if (seciliIlan) {
        const saticiMail = seciliIlan.sellerEmail || seciliIlan.satici?.email || seciliIlan.userId || seciliIlan.satici;
        fetchSaticiYorumlari(saticiMail);
      }
    } catch (error) { console.error("Varlık çekilemedi:", error); }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/varliklar`);
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

  // 📸 SİBER GÖRSEL YAKALAMA RADARI
  const getResim = (ilan: any) => {
    if (!ilan) return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    if (ilan.resimler && ilan.resimler.length > 0) return ilan.resimler[0];
    if (ilan.images && ilan.images.length > 0) return ilan.images[0];
    if (ilan.media?.images && ilan.media.images.length > 0) return ilan.media.images[0];
    if (typeof ilan.resim === 'string' && ilan.resim) return ilan.resim;
    if (typeof ilan.image === 'string' && ilan.image) return ilan.image;
    if (typeof ilan.gorsel === 'string' && ilan.gorsel) return ilan.gorsel;
    return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  // 🛡️ SİBER KALKAN: İLETİŞİM BİLGİSİ ENGELLEYİCİ
  const iletisimBilgisiIceriyorMu = (metin: string) => {
    const telefonRegex = /(\b(05|5)\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}\b)/;
    const mailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    return telefonRegex.test(metin) || mailRegex.test(metin);
  };

  // 🚀 TAKAS FIRLATMA MOTORU
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
          mesaj: takasMesaji 
        })
      });
      if (res.ok) { alert("⚡ SİBER TEKLİF İLETİLDİ!"); router.push("/panel"); } 
      else { const err = await res.json(); alert(`Hata: ${err.error}`); }
    } catch (error) { alert("Takas motoru yanıt vermiyor."); }
  };

  // 🚀 YORUM MOTORU
  const handleYorumGonder = async () => {
    if (!yeniYorumMetni.trim()) return alert("Boş sinyal gönderilemez!");
    try {
      const saticiMail = ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici;
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saticiEmail: saticiMail, ilanId: ilan._id || ilan.id, puan: yeniPuan, icerik: yeniYorumMetni })
      });
      if (res.ok) { alert("⚡ YILDIZLAR MÜHÜRLENDİ!"); setYeniYorumMetni(""); fetchSaticiYorumlari(saticiMail); }
    } catch (error) { alert("Yorum motoru yanıt vermiyor."); }
  };

  // 🚀 SİPARİŞ MOTORU (YENİLENDİ: Yasal Kontroller Eklendi)
  const handleSiparisTamamla = async () => {
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon) return alert("Lütfen teslimat ve iletişim bilgilerini eksiksiz doldurun!");
    if (!kabulSozlesme || !kabulYasalZirh) return alert("🚨 İşleme devam etmek için Yasal Zırh ve Mesafeli Satış Sözleşmesini onaylamalısınız!");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id || ilan.id,
          sellerEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici,
          adSoyad: siparisForm.adSoyad,
          telefon: siparisForm.telefon,
          adres: siparisForm.adres,
          not: siparisForm.not,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: ilan.price || ilan.fiyat,
          durum: "bekliyor" // Panele düşmesi için
        })
      });
      if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI!"); router.push("/panel"); } 
      else { alert("Sipariş oluşturulamadı."); }
    } catch (error) { alert("Sipariş ağına ulaşılamadı."); }
  };

  // 📈 SİBER GRAFİK (Fiyat Dalgalanması Algoritması)
  const generateChartData = (guncelFiyat: number, eskiFiyat: number) => {
    const baslangic = eskiFiyat > 0 ? eskiFiyat : guncelFiyat * 0.85;
    return {
      labels: ['6 Gün Önce', '5 Gün Önce', '4 Gün Önce', '3 Gün Önce', '2 Gün Önce', 'Dün', 'Canlı'],
      datasets: [
        {
          label: 'Piyasa Değeri (₺)',
          data: [ baslangic, baslangic * 1.05, baslangic * 0.98, guncelFiyat * 0.90, guncelFiyat * 1.02, guncelFiyat * 0.99, guncelFiyat ],
          borderColor: '#00f260',
          backgroundColor: 'rgba(0, 242, 96, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#00f260',
          pointBorderColor: '#0a0a0a',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0a0a0a', titleColor: '#00f260', bodyColor: '#fff', borderColor: 'rgba(0, 242, 96, 0.3)', borderWidth: 1, padding: 12, displayColors: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 9 } } },
    },
  };

  const renderYildizlar = (puan: number) => "⭐".repeat(Math.round(puan)) + "☆".repeat(5 - Math.round(puan));

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black animate-pulse tracking-[0.2em]">SİBER VERİ ÇÖZÜMLENİYOR...</div>;
  if (!ilan) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black">VARLIK BULUNAMADI.</div>;

  const ilaninSahibiyim = session?.user?.email?.toLowerCase() === (ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici)?.toLowerCase();

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 text-white font-sans italic">
      <div className="max-w-7xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* SOL PANEL: GÖRSEL, İTİBAR ENDEKSİ VE 📈 BORSA GRAFİĞİ */}
        <div className="w-full lg:w-1/2 bg-[#030712] border-r border-white/5 p-8 flex flex-col relative overflow-y-auto">
           <div className="relative group mb-8">
              <img src={getResim(ilan)} alt={ilan.title} className="w-full h-72 object-cover rounded-[2rem] border border-white/10 shadow-lg group-hover:scale-[1.02] transition-transform duration-500" />
              {/* 🟢 BORSA ORANI */}
              <div className="absolute top-4 right-4 bg-[#00f260]/90 backdrop-blur-md text-black px-4 py-2 rounded-xl font-black text-xs shadow-[0_0_20px_rgba(0,242,96,0.5)]">
                {ilan.degisimYuzdesi ? (ilan.degisimYuzdesi > 0 ? `📈 +%${ilan.degisimYuzdesi}` : `📉 %${ilan.degisimYuzdesi}`) : '📈 AKTİF İŞLEM'}
              </div>
           </div>

           {/* 📊 SİBER FİYAT GEÇMİŞİ GRAFİĞİ (CHART.JS) */}
           <div className="bg-black/40 p-5 rounded-[2rem] border border-white/5 h-56 relative overflow-hidden mb-8">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Siber Fiyat Endeksi (7 Gün)</h3>
               <span className="text-[#00f260] text-[10px] font-black animate-pulse">● CANLI YAYIN</span>
             </div>
             <div className="w-full h-36">
               <Line data={generateChartData(Number(ilan.price || ilan.fiyat), Number(ilan.eskiFiyat || 0))} options={chartOptions} />
             </div>
           </div>
           
           {/* ⭐ SİBER İTİBAR ENDEKSİ (YORUMLAR) */}
           <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
               <h3 className="text-cyan-400 font-black text-[10px] uppercase tracking-widest">SİBER İTİBAR ENDEKSİ</h3>
               <span className="text-amber-400 text-sm font-black">{ortalamaPuan > 0 ? `${renderYildizlar(ortalamaPuan)} (${ortalamaPuan})` : "YENİ VARLIK"}</span>
             </div>
             <div className="space-y-3 mb-6 max-h-40 overflow-y-auto no-scrollbar">
               {yorumlar.length === 0 ? <p className="text-slate-600 text-[10px] text-center py-4">HENÜZ ANALİZ EDİLMEMİŞ.</p> :
                 yorumlar.map((y: any, i: number) => (
                   <div key={i} className="bg-black/40 p-3 rounded-xl border border-white/5">
                     <p className="text-white text-xs font-bold">"{y.icerik}"</p>
                     <p className="text-cyan-400/50 text-[8px] mt-1 uppercase">- {y.gonderenAd}</p>
                   </div>
                 ))
               }
             </div>
             {!ilaninSahibiyim && session?.user && (
               <div className="bg-black/50 p-4 rounded-xl border border-cyan-500/20">
                 <div className="flex gap-2 mb-3">
                   {[1,2,3,4,5].map(s => <button key={s} onClick={()=>setYeniPuan(s)} className={`text-xl ${yeniPuan >= s ? 'text-amber-400' : 'text-slate-700'}`}>★</button>)}
                 </div>
                 <textarea value={yeniYorumMetni} onChange={(e)=>setYeniYorumMetni(e.target.value)} placeholder="Deneyiminizi raporlayın..." className="w-full bg-[#050505] text-white text-[10px] p-3 rounded-lg border border-white/10 h-16 resize-none mb-2 focus:border-cyan-500 outline-none" />
                 <button onClick={handleYorumGonder} className="w-full bg-cyan-500/20 text-cyan-400 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-cyan-500 hover:text-black transition-all">ANALİZİ GÖNDER</button>
               </div>
             )}
           </div>
        </div>

        {/* SAĞ PANEL: TERMİNAL OPERASYONLARI */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col">
           <div className="flex bg-black p-1 rounded-2xl mb-8 border border-white/5 shadow-inner">
             <button onClick={()=>setAktifSekme("incele")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${aktifSekme === "incele" ? 'bg-white/10 text-white' : 'text-slate-500'}`}>🔍 İNCELE</button>
             <button onClick={()=>setAktifSekme("takas")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${aktifSekme === "takas" ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-500'}`}>🔄 TAKAS YAP</button>
             <button onClick={()=>setAktifSekme("satinal")} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${aktifSekme === "satinal" ? 'bg-[#00f260] text-black shadow-lg' : 'text-slate-500'}`}>🛒 SATIN AL</button>
           </div>

           {/* SEKMELER */}
           {aktifSekme === "incele" && (
             <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="inline-block bg-[#00f260]/10 text-[#00f260] text-[9px] font-black px-3 py-1 rounded-md uppercase mb-4 border border-[#00f260]/20 w-max">{ilan.category || ilan.kategori || "GENEL"}</div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-white leading-none">{ilan.title || ilan.baslik}</h1>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed flex-1 font-sans not-italic">{ilan.description || ilan.aciklama}</p>
                <div className="text-[#00f260] font-black text-6xl mb-8 border-t border-white/5 pt-6">{Number(ilan.price || ilan.fiyat).toLocaleString()} <span className="text-3xl text-white">₺</span></div>
                
                {!ilaninSahibiyim ? (
                  <Link href={`/mesajlar?satici=${ilan.sellerEmail || ilan.satici?.email || ilan.userId || ilan.satici}&ilan=${ilan._id || ilan.id}`} className="w-full bg-white/5 text-white py-5 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all text-center mb-3 shadow-lg">
                    💬 SİBER SOHBET BAŞLAT
                  </Link>
                ) : (
                  <div className="w-full bg-[#00f260]/10 text-[#00f260] py-5 rounded-2xl border border-[#00f260]/20 font-black uppercase tracking-widest text-[11px] text-center mb-3">
                    🛡️ BU SİZİN VARLIĞINIZ
                  </div>
                )}
             </div>
           )}

           {aktifSekme === "takas" && (
             <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
                <h3 className="text-xl font-black text-white italic uppercase mb-6 border-b border-white/5 pb-4">SİBER <span className="text-cyan-400">TAKAS</span> KONSOLU</h3>
                <label className="text-cyan-400 text-[9px] font-black uppercase mb-2">1. TAKAS EDİLECEK VARLIĞINIZ:</label>
                <select value={secilenBenimIlanim} onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl mb-6 outline-none focus:border-cyan-500 appearance-none">
                  <option value="">-- VARLIK SEÇİN --</option>
                  {benimIlanlarim.map(b => <option key={b._id} value={`${b._id}|${b.title || b.baslik}`}>{b.title || b.baslik}</option>)}
                </select>
                <label className="text-[#00f260] text-[9px] font-black uppercase mb-2">2. NAKİT DESTEĞİ (₺):</label>
                <input type="number" placeholder="Örn: 1000" value={eklenecekNakit} onChange={(e)=>setEklenecekNakit(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl mb-6 outline-none focus:border-[#00f260]" />
                <textarea value={takasMesaji} onChange={(e)=>setTakasMesaji(e.target.value)} placeholder="Teklif notunuzu girin... (İletişim bilgisi yasaktır)" className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl h-24 resize-none mb-6 outline-none focus:border-[#00f260]" />
                <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim || benimIlanlarim.length === 0} className="w-full mt-auto bg-cyan-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50">
                  🚀 TAKAS TEKLİFİNİ FIRLAT
                </button>
             </div>
           )}

           {/* 🛒 SİPARİŞ SEKME İÇERİĞİ (GÜNCELLENDİ) */}
           {aktifSekme === "satinal" && (
             <div className="flex flex-col h-full animate-in slide-in-from-bottom duration-500">
                <h3 className="text-xl font-black text-white italic uppercase mb-6 border-b border-white/5 pb-4">GÜVENLİ <span className="text-[#00f260]">SATIN ALMA</span> KASASI</h3>
                
                <div className="bg-[#00f260]/5 border border-[#00f260]/20 p-6 rounded-2xl mb-6 flex justify-between items-center shadow-inner">
                   <span className="text-[#00f260] text-[10px] font-black uppercase tracking-widest">VARLIK BEDELİ:</span>
                   <span className="text-3xl font-black text-white">{Number(ilan.price || ilan.fiyat).toLocaleString()} ₺</span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <input type="text" placeholder="AD SOYAD" value={siparisForm.adSoyad} onChange={(e)=>setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl outline-none focus:border-[#00f260]" />
                  <input type="tel" placeholder="TELEFON NUMARASI" value={siparisForm.telefon} onChange={(e)=>setSiparisForm({...siparisForm, telefon: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl outline-none focus:border-[#00f260]" />
                  <textarea placeholder="TESLİMAT ADRESİ" value={siparisForm.adres} onChange={(e)=>setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl h-20 outline-none focus:border-[#00f260] resize-none" />
                  <textarea placeholder="SİPARİŞ NOTU (İsteğe Bağlı)" value={siparisForm.not} onChange={(e)=>setSiparisForm({...siparisForm, not: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl h-16 outline-none focus:border-[#00f260] resize-none" />
                  
                  <select value={siparisForm.odemeYontemi} onChange={(e)=>setSiparisForm({...siparisForm, odemeYontemi: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl outline-none focus:border-[#00f260] appearance-none">
                     <option value="kredi_karti">💳 KREDİ KARTI (SİBER HAVUZ)</option>
                     <option value="havale">🏦 HAVALE / EFT</option>
                     <option value="kapida_odeme">📦 KAPIDA ÖDEME</option>
                  </select>
                </div>

                {/* HUKUKİ ONAY KUTUCUKLARI */}
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={kabulSozlesme} onChange={(e) => setKabulSozlesme(e.target.checked)} className="mt-1 accent-[#00f260] w-4 h-4 shrink-0" />
                    <span className="text-slate-400 text-[9px] uppercase leading-tight group-hover:text-white transition-colors">Mesafeli Satış Sözleşmesi'ni okudum, anladım ve kabul ediyorum. Tüm sorumluluk tarafıma aittir.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={kabulYasalZirh} onChange={(e) => setKabulYasalZirh(e.target.checked)} className="mt-1 accent-[#00f260] w-4 h-4 shrink-0" />
                    <span className="text-slate-400 text-[9px] uppercase leading-tight group-hover:text-white transition-colors"><span className="text-[#00f260] font-bold">🛡️ Yasal Zırh:</span> Bu işlem siber kalkan güvencesindedir. Teslimat tamamlanana kadar para havuza aktarılır. Onaylıyorum.</span>
                  </label>
                </div>

                <button onClick={handleSiparisTamamla} className="w-full mt-auto bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,242,96,0.3)]">
                  ✅ İŞLEMİ MÜHÜRLE VE SATIN AL
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
