"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function VarlikDetay({ params }: { params: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 TAKAS STATE'LERİ
  const [takasModalAcik, setTakasModalAcik] = useState(false);
  const [benimIlanlarim, setBenimIlanlarim] = useState<any[]>([]);
  const [secilenBenimIlanim, setSecilenBenimIlanim] = useState("");
  const [eklenecekNakit, setEklenecekNakit] = useState("");

  // 💬 MESAJ STATE'LERİ
  const [mesajModalAcik, setMesajModalAcik] = useState(false);
  const [mesajIcerik, setMesajIcerik] = useState("");
  const [mesajGonderiliyor, setMesajGonderiliyor] = useState(false);

  const [resolvedParams, setResolvedParams] = useState<any>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const p = await params;
      setResolvedParams(p);
    };
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
    } catch (error) {
      console.error("Varlık çekilemedi:", error);
    }
    setLoading(false);
  };

  const fetchBenimIlanlarim = async () => {
    try {
      const aktifEmail = session?.user?.email?.toLowerCase() || "";
      const res = await fetch(`/api/listings`);
      if (res.ok) {
        const data = await res.json();
        let liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
        const benimkiler = liste.filter((i: any) => {
           const sEmail = (typeof i.userId === 'string' ? i.userId : i.satici?.email || i.satici || "").toLowerCase();
           return sEmail === aktifEmail;
        });
        setBenimIlanlarim(benimkiler);
      }
    } catch (error) {
      console.error("Varlıklar çekilemedi.");
    }
  };

  const handleTakasGonder = async () => {
    if (!secilenBenimIlanim) return;
    const [teklifIlanId, teklifIlanBaslik] = secilenBenimIlanim.split("|");
    try {
      const res = await fetch("/api/takas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId,
          hedefIlanId: ilan._id || ilan.id,
          hedefIlanBaslik: ilan.title || ilan.baslik,
          teklifEdilenIlanId: teklifIlanId,
          teklifEdilenIlanBaslik: teklifIlanBaslik,
          eklenenNakit: eklenecekNakit || 0
        })
      });
      if (res.ok) {
        alert("⚡ TAKAS TEKLİFİ İLETİLDİ!");
        setTakasModalAcik(false);
      } else {
        const err = await res.json();
        alert(`Hata: ${err.error}`);
      }
    } catch (error) {
      alert("Takas motoru yanıt vermiyor.");
    }
  };

  // 🚀 YENİ: SİBER MESAJ GÖNDERME MOTORU
  const handleMesajGonder = async () => {
    if (!mesajIcerik.trim()) return;
    setMesajGonderiliyor(true);
    try {
      const res = await fetch("/api/mesajlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aliciEmail: ilan.sellerEmail || ilan.satici?.email || ilan.userId,
          icerik: mesajIcerik,
          ilanId: ilan._id || ilan.id
        })
      });
      if (res.ok) {
        alert("💬 Sinyal satıcıya başarıyla ulaştı!");
        setMesajIcerik("");
        setMesajModalAcik(false);
      } else {
        const err = await res.json();
        alert(`Hata: ${err.error}`);
      }
    } catch (error) {
      alert("Haberleşme ağına ulaşılamadı.");
    } finally {
      setMesajGonderiliyor(false);
    }
  };

  const getResim = (ilan: any) => {
    const p = "https://placehold.co/600x400/030712/00f260?text=GORSEL+YOK";
    if (!ilan) return p;
    if (ilan.media?.images?.[0]) return ilan.media.images[0];
    if (ilan.images?.[0]) return ilan.images[0];
    if (typeof ilan.image === 'string' && ilan.image) return ilan.image;
    return p;
  };

  if (loading) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-[#00f260] font-black animate-pulse">SİBER AĞ TARANIYOR...</div>;
  if (!ilan) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-red-500 font-black">VARLIK BULUNAMADI.</div>;

  return (
    <div className="min-h-screen bg-[#030712] py-24 px-4 text-white">
      <div className="max-w-4xl mx-auto bg-[#0b0f19] border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#030712]">
             <img src={getResim(ilan)} alt={ilan.title} className="w-full h-auto object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="inline-block bg-[#00f260]/10 text-[#00f260] text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest border border-[#00f260]/20 mb-4 w-max">
              {ilan.category || "Kategori Yok"}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">{ilan.title || ilan.baslik || "İsimsiz Varlık"}</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{ilan.description || ilan.aciklama || "Açıklama belirtilmemiş."}</p>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-8 border-b border-white/5 pb-6">
              📍 Konum: {ilan.location || "Belirtilmemiş"}
            </div>

            <div className="mt-auto">
              <p className="text-[#00f260] font-black text-4xl mb-6">{Number(ilan.price || ilan.fiyat || 0).toLocaleString()} <span className="text-xl">₺</span></p>

              {session?.user?.email !== (ilan.sellerEmail || ilan.satici?.email || ilan.userId) ? (
                <div className="flex flex-col gap-3">
                  <button className="w-full bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                    SATIN AL
                  </button>
                  <button 
                    onClick={() => {
                      if (!session) return router.push("/login");
                      setTakasModalAcik(true);
                    }} 
                    className="w-full bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    🔄 TAKAS TEKLİF ET
                  </button>
                  {/* 🚀 YENİ: MESAJ BUTONU */}
                  <button 
                    onClick={() => {
                      if (!session) return router.push("/login");
                      setMesajModalAcik(true);
                    }} 
                    className="w-full bg-white/5 text-white py-4 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all">
                    💬 SATICIYA MESAJ GÖNDER
                  </button>
                </div>
              ) : (
                <div className="text-center bg-white/5 border border-white/10 p-4 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest">Bu Varlık Zaten Size Ait</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MESAJ GÖNDERME MODALI */}
      {mesajModalAcik && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/20 p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-white italic uppercase mb-2">💬 SİBER <span className="text-[#00f260]">HABERLEŞME</span></h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
              "{ilan.title || ilan.baslik}" İLANININ SAHİBİNE MESAJ YAZIN
            </p>

            <textarea 
              value={mesajIcerik}
              onChange={(e) => setMesajIcerik(e.target.value)}
              placeholder="Merhaba, ürün hala satılık mı? Takas düşünür müsünüz?"
              className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-[#00f260] transition-colors mb-6 h-32 resize-none"
            ></textarea>

            <div className="flex gap-3">
              <button 
                onClick={() => setMesajModalAcik(false)}
                className="flex-1 bg-white/5 text-white py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white/10 transition-colors">
                İPTAL
              </button>
              <button 
                onClick={handleMesajGonder}
                disabled={!mesajIcerik.trim() || mesajGonderiliyor}
                className="flex-1 bg-[#00f260] text-black py-4 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(0,242,96,0.4)]">
                {mesajGonderiliyor ? "GÖNDERİLİYOR..." : "🚀 SİNYALİ İLET"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 TAKAS MODALI (Aynı kalıyor) */}
      {takasModalAcik && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/50 p-6 rounded-3xl w-full max-w-md shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <h3 className="text-xl font-black text-white italic uppercase mb-2">SİBER <span className="text-cyan-400">TAKAS</span> EKRANI</h3>
            <div className="mb-4 mt-6">
              <select onChange={(e) => setSecilenBenimIlanim(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors">
                <option value="">-- Vereceğiniz Varlığı Seçin --</option>
                {benimIlanlarim.map(bIlan => (<option key={bIlan._id} value={`${bIlan._id}|${bIlan.title || bIlan.baslik}`}>{bIlan.title || bIlan.baslik}</option>))}
              </select>
            </div>
            <div className="mb-8">
              <input type="number" placeholder="Üstüne Eklenecek Nakit (₺) - Opsiyonel" value={eklenecekNakit} onChange={(e) => setEklenecekNakit(e.target.value)} className="w-full bg-[#030712] border border-white/10 text-white text-xs p-4 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setTakasModalAcik(false)} className="flex-1 bg-white/5 text-white py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white/10 transition-colors">İPTAL ET</button>
              <button onClick={handleTakasGonder} disabled={!secilenBenimIlanim || benimIlanlarim.length === 0} className="flex-1 bg-cyan-500 text-black py-4 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all disabled:opacity-50">🚀 TEKLİFİ FIRLAT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
