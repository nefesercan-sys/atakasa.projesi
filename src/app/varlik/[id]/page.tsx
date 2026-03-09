"use client";
import React, { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 📊 SİBER GRAFİK MOTORU
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

// 🛡️ TYPESCRIPT ARAYÜZLERİ
interface VarlikTuru {
  _id?: string;
  id?: string;
  title?: string;
  baslik?: string;
  price?: number;
  fiyat?: number;
  description?: string;
  aciklama?: string;
  kategori?: string;
  category?: string;
  resimler?: string[];
  images?: string[];
  sellerEmail?: string;
  satici?: any;
  userId?: string;
  degisimYuzdesi?: number;
  eskiFiyat?: number;
}

export default function SiberVarlikTerminali({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 14+ için params'ı güvenli şekilde çözüyoruz
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const baslangicSekmesi = searchParams.get("islem") || "incele";

  const [ilan, setIlan] = useState<VarlikTuru | null>(null);
  const [loading, setLoading] = useState(true);
  const [aktifSekme, setAktifSekme] = useState(baslangicSekmesi);

  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");
  const [takasMesaji, setTakasMesaji] = useState("");

  const [siparisForm, setSiparisForm] = useState({ adSoyad: "", telefon: "", adres: "", not: "", odemeYontemi: "kredi_karti" });
  const [kabulSozlesme, setKabulSozlesme] = useState(false);
  const [kabulYasalZirh, setKabulYasalZirh] = useState(false);

  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [ortalamaPuan, setOrtalamaPuan] = useState(0);
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yeniYorumMetni, setYeniYorumMetni] = useState("");

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchIlanDetay();
      if (session?.user?.email) fetchBenimIlanlarim();
    }
  }, [resolvedParams.id, session]);

  // 📡 İLAN DETAY ÇEKME (TYPESCRIPT VE HIZ OPTİMİZE 🚀)
  const fetchIlanDetay = async () => {
    try {
      const res = await fetch(`/api/varliklar?id=${resolvedParams.id}`); 
      const data = await res.json();
      const liste: VarlikTuru[] = Array.isArray(data) ? data : (data.data || data.ilanlar || []);
      
      const seciliIlan = liste.find((i: VarlikTuru) => 
        String(i._id || i.id) === String(resolvedParams.id)
      ) || (liste.length > 0 ? liste[0] : null);
      
      setIlan(seciliIlan);
      
      if (seciliIlan) {
        const saticiMail = seciliIlan.sellerEmail || seciliIlan.satici?.email || seciliIlan.userId || (typeof seciliIlan.satici === 'string' ? seciliIlan.satici : "");
        if (saticiMail) fetchSaticiYorumlari(saticiMail);
      }
    } catch (error) { console.error("Varlık çekilemedi:", error); }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const res = await fetch(`/api/varliklar`);
      if (res.ok) {
        const data = await res.json();
        const liste = Array.isArray(data) ? data : (data.data || data.ilanlar || []);
        const benimkiler = liste.filter((i: any) => {
           const sEmail = String(i.sellerEmail || i.userId || i.satici?.email || "").toLowerCase();
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
        setYorumlar(data.yorumlar || []);
        setOrtalamaPuan(data.ortalama || 0);
      }
    } catch (err) { console.error("Yorum radarı koptu."); }
  };

  const getResim = (v: VarlikTuru | null) => {
    if (!v) return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    const imgArr = v.resimler || v.images || [];
    if (imgArr.length > 0) return imgArr[0];
    return "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim || !ilan) return alert("Lütfen vereceğiniz varlığı seçin!");
    const [teklifIlanId, teklifIlanBaslik] = secilenBenimIlanim.split("|");
    try {
      const saticiMail = ilan.sellerEmail || ilan.satici?.email || ilan.userId || (typeof ilan.satici === 'string' ? ilan.satici : "");
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: saticiMail,
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
      else { alert("Hata oluştu."); }
    } catch (error) { alert("Takas motoru yanıt vermiyor."); }
  };

  const handleSiparisTamamla = async () => {
    if (!ilan) return;
    if (!siparisForm.adSoyad || !siparisForm.adres || !siparisForm.telefon) return alert("Bilgileri doldurun!");
    if (!kabulSozlesme || !kabulYasalZirh) return alert("Sözleşmeleri onaylayın!");

    try {
      const saticiMail = ilan.sellerEmail || ilan.satici?.email || ilan.userId || (typeof ilan.satici === 'string' ? ilan.satici : "");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: ilan._id || ilan.id,
          sellerEmail: saticiMail,
          adSoyad: siparisForm.adSoyad,
          telefon: siparisForm.telefon,
          adres: siparisForm.adres,
          not: siparisForm.not,
          odemeYontemi: siparisForm.odemeYontemi,
          fiyat: ilan.price || ilan.fiyat,
          status: "isleme_alindi"
        })
      });
      if (res.ok) { alert("📦 SİPARİŞ ONAYLANDI!"); router.push("/panel"); } 
      else { alert("Hata!"); }
    } catch (error) { alert("Ağ hatası."); }
  };

  const generateChartData = (guncel: number, eski: number) => {
    const b = eski > 0 ? eski : guncel * 0.9;
    return {
      labels: ['6G', '5G', '4G', '3G', '2G', 'Dün', 'Canlı'],
      datasets: [{
        label: '₺',
        data: [b, b * 1.02, b * 0.98, guncel * 0.95, guncel * 1.01, guncel * 0.99, guncel],
        borderColor: '#00f260',
        backgroundColor: 'rgba(0, 242, 96, 0.05)',
        fill: true,
        tension: 0.4,
      }]
    };
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black animate-pulse">SİNYAL ÇÖZÜMLENİYOR...</div>;
  if (!ilan) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black">VARLIK YOK.</div>;

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 text-white font-sans italic">
      <div className="max-w-7xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* SOL PANEL */}
        <div className="w-full lg:w-1/2 bg-[#030712] border-r border-white/5 p-8 flex flex-col overflow-y-auto">
           <div className="relative mb-8">
              <img src={getResim(ilan)} alt="Varlık" className="w-full h-72 object-cover rounded-[2rem] border border-white/10" />
              <div className="absolute top-4 right-4 bg-[#00f260] text-black px-3 py-1 rounded-lg font-black text-[10px]">
                {ilan.degisimYuzdesi && ilan.degisimYuzdesi > 0 ? `📈 +%${ilan.degisimYuzdesi}` : '📉 AKTİF'}
              </div>
           </div>
           <div className="bg-black/40 p-5 rounded-[2rem] border border-white/5 h-56 mb-8">
             <Line data={generateChartData(Number(ilan.price || ilan.fiyat || 0), Number(ilan.eskiFiyat || 0))} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
           </div>
        </div>
        {/* SAĞ PANEL */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col">
           <div className="flex bg-black p-1 rounded-2xl mb-8 border border-white/5">
             {["incele", "takas", "satinal"].map(s => (
               <button key={s} onClick={()=>setAktifSekme(s)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${aktifSekme === s ? 'bg-[#00f260] text-black shadow-lg' : 'text-slate-500'}`}>{s}</button>
             ))}
           </div>
           {aktifSekme === "incele" && (
             <div className="flex flex-col h-full">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">{ilan.title || ilan.baslik}</h1>
                <p className="text-slate-400 text-xs mb-6 flex-1 italic">{ilan.description || ilan.aciklama}</p>
                <div className="text-[#00f260] font-black text-6xl mb-8">{Number(ilan.price || ilan.fiyat || 0).toLocaleString()} ₺</div>
                <Link href={`/mesajlar`} className="w-full bg-white/5 text-white py-5 rounded-2xl border border-white/10 font-black text-center text-[11px] uppercase tracking-widest hover:bg-white/10">💬 SOHBET BAŞLAT</Link>
             </div>
           )}
           {aktifSekme === "satinal" && (
             <div className="space-y-4">
                <input type="text" placeholder="AD SOYAD" value={siparisForm.adSoyad} onChange={(e)=>setSiparisForm({...siparisForm, adSoyad: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl" />
                <input type="tel" placeholder="TELEFON" value={siparisForm.telefon} onChange={(e)=>setSiparisForm({...siparisForm, telefon: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl" />
                <textarea placeholder="ADRES" value={siparisForm.adres} onChange={(e)=>setSiparisForm({...siparisForm, adres: e.target.value})} className="w-full bg-[#030712] border border-white/10 text-white text-[10px] p-4 rounded-xl h-20" />
                <button onClick={handleSiparisTamamla} className="w-full bg-[#00f260] text-black py-5 rounded-2xl font-black uppercase text-[12px] shadow-lg">✅ İŞLEMİ MÜHÜRLE</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
