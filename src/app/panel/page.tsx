"use client";
import React, { useState } from "react";

// SİBER SİMÜLASYON VERİLERİ (Gerçekte veritabanından gelecek)
const mockGelenTeklifler = [
  { id: 1, teklifEden: "Siber Kullanıcı #402", kendiUrunu: "iPhone 13 Pro (25.000 ₺)", hedefUrun: "Oyun Bilgisayarı (30.000 ₺)", durum: "bekliyor" }
];

const mockAktifTakaslar = [
  { id: 2, karsiTaraf: "Ahmet Y.", urun: "Samsung TV", durum: "teminat_bekleniyor", tutar: 15000 }
];

export default function SiberPanel() {
  const [aktifSekme, setAktifSekme] = useState<"teklifler" | "takaslar">("teklifler");
  const [teklifler, setTeklifler] = useState(mockGelenTeklifler);
  const [takaslar, setTakaslar] = useState(mockAktifTakaslar);
  const [loading, setLoading] = useState(false);

  // 1. TEKLİF KABUL SİSTEMİ
  const handleTeklifKabul = (id: number) => {
    alert("Siber Teklif Kabul Edildi! Varlıklar Emanet Kasa Aşamasına Geçiyor.");
    setTeklifler(teklifler.filter(t => t.id !== id));
    // Yeni bir aktif takas oluştur
    setTakaslar([...takaslar, { id: 99, karsiTaraf: "Siber Kullanıcı #402", urun: "iPhone 13 Pro", durum: "teminat_bekleniyor", tutar: 25000 }]);
  };

  // 2. TEMİNAT YATIRMA MOTORU (Yazdığın API'ye bağlanır)
  const handleTeminatYatir = async (takasId: number, tutar: number) => {
    setLoading(true);
    try {
      // Senin yazdığın emanet kasa API'sine istek atar
      /* await fetch('/api/takas/emanet', {
        method: 'POST',
        body: JSON.stringify({ ilanId: takasId, action: 'YATIR', tutar: tutar })
      });
      */
      setTimeout(() => {
        alert(`${tutar.toLocaleString("tr-TR")} ₺ Teminat Siber Havuza Kilitlendi!`);
        setTakaslar(takaslar.map(t => t.id === takasId ? { ...t, durum: "kargoda" } : t));
        setLoading(false);
      }, 1000);
    } catch (err) {
      alert("Kasa Bağlantı Hatası!");
      setLoading(false);
    }
  };

  // 3. TESLİM ALDIM VE KOMİSYON KESİNTİ ONAYI
  const handleTeslimAldim = async (takasId: number) => {
    const onay = window.confirm("Ürünü sorunsuz teslim aldığınızı onaylıyor musunuz? (%5 Siber Hizmet Bedeli kesilerek teminatınız iade edilecektir.)");
    if (!onay) return;

    setLoading(true);
    setTimeout(() => {
      alert("✅ İŞLEM TAMAMLANDI! %5 Komisyon kesildi, kalan bakiye cüzdanınıza aktarıldı.");
      setTakaslar(takaslar.filter(t => t.id !== takasId));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030712] p-6 pt-24 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase border-l-4 border-[#38bdf8] pl-4 mb-2">SİBER KOMUTA MERKEZİ</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] pl-5">Varlıklarınızı ve Kontratlarınızı Yönetin</p>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <span className="text-[10px] text-[#38bdf8] font-black uppercase tracking-widest block mb-1">Cüzdan Bakiyesi</span>
            <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">0.00 ₺</span>
          </div>
        </div>

        {/* SEKME KONTROLLERİ */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setAktifSekme("teklifler")} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${aktifSekme === "teklifler" ? "bg-[#38bdf8] text-black shadow-[0_0_20px_rgba(56,189,248,0.3)]" : "bg-[#0b0f19] border border-white/10 hover:border-[#38bdf8]/50 text-slate-300"}`}>
            Gelen Teklifler ({teklifler.length})
          </button>
          <button onClick={() => setAktifSekme("takaslar")} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${aktifSekme === "takaslar" ? "bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]" : "bg-[#0b0f19] border border-white/10 hover:border-[#00f260]/50 text-slate-300"}`}>
            Aktif Takaslar / Kargo ({takaslar.length})
          </button>
        </div>

        {/* İÇERİK: GELEN TEKLİFLER */}
        {aktifSekme === "teklifler" && (
          <div className="space-y-4">
            {teklifler.length === 0 ? (
              <div className="bg-[#0b0f19] border border-white/5 p-10 rounded-[2rem] text-center text-slate-500 font-bold uppercase text-xs">Bekleyen yeni siber teklif yok.</div>
            ) : (
              teklifler.map((teklif) => (
                <div key={teklif.id} className="bg-[#0b0f19] border border-[#38bdf8]/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-[#38bdf8]/5 transition-all">
                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-[#38bdf8] font-black uppercase tracking-widest bg-[#38bdf8]/10 px-3 py-1 rounded-lg">YENİ TEKLİF</span>
                    <h3 className="text-lg font-bold mt-3 text-white">Sizin: {teklif.hedefUrun}</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1">Teklif Edilen: <span className="text-[#38bdf8]">{teklif.kendiUrunu}</span></p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => setTeklifler(teklifler.filter(t => t.id !== teklif.id))} className="flex-1 md:flex-none px-6 py-4 rounded-xl border border-red-500/50 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reddet</button>
                    <button onClick={() => handleTeklifKabul(teklif.id)} className="flex-1 md:flex-none px-8 py-4 rounded-xl bg-[#38bdf8] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#38bdf8]/20">Kabul Et</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* İÇERİK: AKTİF TAKASLAR & EMANET SİSTEMİ */}
        {aktifSekme === "takaslar" && (
          <div className="space-y-4">
            {takaslar.length === 0 ? (
              <div className="bg-[#0b0f19] border border-white/5 p-10 rounded-[2rem] text-center text-slate-500 font-bold uppercase text-xs">Devam eden siber kontrat bulunmuyor.</div>
            ) : (
              takaslar.map((takas) => (
                <div key={takas.id} className="bg-[#0b0f19] border border-[#00f260]/30 p-8 rounded-[2rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#00f260]/20 text-[#00f260] px-4 py-2 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest border-b border-l border-[#00f260]/30">
                    AKILLI KONTRAT: DEVAM EDİYOR
                  </div>
                  
                  <div className="mb-6 mt-4">
                    <h3 className="text-xl font-bold text-white mb-1">Takas Edilen: {takas.urun}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Karşı Taraf: {takas.karsiTaraf}</p>
                  </div>

                  {takas.durum === "teminat_bekleniyor" && (
                    <div className="bg-[#030712] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Yatırılacak Güvence Bedeli</span>
                        <span className="text-2xl font-black text-[#00f260]">{takas.tutar.toLocaleString("tr-TR")} ₺</span>
                      </div>
                      <button disabled={loading} onClick={() => handleTeminatYatir(takas.id, takas.tutar)} className="w-full md:w-auto bg-[#00f260] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50">
                        {loading ? "SİBER AĞA BAĞLANILIYOR..." : "TEMİNAT YATIR"}
                      </button>
                    </div>
                  )}

                  {takas.durum === "kargoda" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl animate-bounce">📦</span>
                        <div>
                          <h4 className="text-yellow-500 font-black uppercase tracking-widest text-sm">Ürün Kargoya Verildi</h4>
                          <p className="text-slate-300 text-[10px] mt-1">Emanet havuzunda güvence altındadır. Ürünü teslim aldığınızda onaylayın.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button className="flex-1 py-4 border border-red-500/30 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500/10 transition-all">İade Başlat</button>
                        <button disabled={loading} onClick={() => handleTeslimAldim(takas.id)} className="flex-1 py-4 bg-yellow-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                           {loading ? "ONAYLANIYOR..." : "TESLİM ALDIM (ONAYLA)"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
