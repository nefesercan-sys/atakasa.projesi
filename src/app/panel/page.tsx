"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SiberBorsaPaneli() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 🎛️ PANEL KONTROLLERİ
  const [aktifSekme, setAktifSekme] = useState("gelen_teklifler");
  const [altFiltre, setAltFiltre] = useState("hepsi");

  // 📡 VERİ MERKEZİ
  const [bakiye, setBakiye] = useState(0);
  const [ilanlarim, setIlanlarim] = useState<any[]>([]);
  const [gelenTakaslar, setGelenTakaslar] = useState<any[]>([]);
  const [gidenTakaslar, setGidenTakaslar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchBorsaVerileri();
    else if (status === "unauthenticated") router.push("/login");
  }, [status]);

  const fetchBorsaVerileri = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const aktifEmail = session.user.email.toLowerCase();
    
    try {
      // 1. Cüzdan Bakiyesi
      const resWallet = await fetch(`/api/wallet`, { cache: "no-store" });
      if (resWallet.ok) {
         const wData = await resWallet.json();
         setBakiye(wData.balance || 0);
      }

      // 2. Kendi İlanlarım
      const resListings = await fetch(`/api/listings`, { cache: "no-store" });
      if (resListings.ok) {
        const dataListings = await resListings.json();
        setIlanlarim(dataListings.filter((i: any) => (i.sellerEmail || i.userId || "").toLowerCase() === aktifEmail));
      }

      // 3. Takas (Borsa) Emirleri
      const resTakas = await fetch(`/api/takas`, { cache: "no-store" });
      if (resTakas.ok) {
        const dataTakas = await resTakas.json();
        setGelenTakaslar(dataTakas.filter((t: any) => t.aliciEmail === aktifEmail));
        setGidenTakaslar(dataTakas.filter((t: any) => t.gonderenEmail === aktifEmail));
      }
    } catch (err) { 
      console.error("Siber Ağ Hatası:", err); 
    }
    setLoading(false);
  };

  // 💰 SİBER TEMİNAT ÖDEME MOTORU
  const handleTeminatOde = async (takasId: string) => {
    if (!confirm("Siber Kasanızdan teminat çekilecektir. Onaylıyor musunuz?")) return;
    try {
      const res = await fetch("/api/takas/teminat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ takasId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`⚡ BAŞARILI: ${data.message}`);
        fetchBorsaVerileri();
      } else {
        alert(`❌ HATA: ${data.error}`);
      }
    } catch (error) {
      alert("Tahsilat motoruna ulaşılamadı.");
    }
  };

  // 🔄 DURUM GÜNCELLEME MOTORU (Kabul, Red, Kargo, İptal)
  const handleDurumGuncelle = async (takasId: string, yeniDurum: string) => {
    if (!confirm(`İşlem durumunu '${yeniDurum}' olarak güncelliyorsunuz. Emin misiniz?`)) return;
    try {
      const res = await fetch("/api/takas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ takasId, yeniDurum })
      });
      if (res.ok) fetchBorsaVerileri();
      else alert("Güncelleme reddedildi!");
    } catch (error) {
      alert("Sinyal koptu.");
    }
  };

  // 📊 BORSA İSTATİSTİKLERİ HESAPLAMA
  const toplamVarlikDegeri = ilanlarim.reduce((acc, ilan) => acc + Number(ilan.price || ilan.fiyat || 0), 0);
  const toplamYaptigimTeklifDegeri = gidenTakaslar.reduce((acc, t) => acc + Number(t.hedefIlanFiyat || 0), 0);

  // 🔍 FİLTRELEME MANTIĞI
  const getGosterilecekVeri = () => {
    let veri = aktifSekme === "gelen_teklifler" ? gelenTakaslar : gidenTakaslar;
    if (altFiltre !== "hepsi") {
      veri = veri.filter(t => t.durum === altFiltre);
    }
    return veri;
  };

  const gosterilenVeri = getGosterilecekVeri();

  // 🎨 DURUM RENKLENDİRİCİ
  const getDurumRozeti = (durum: string) => {
    switch (durum) {
      case "bekliyor": return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded text-[9px] uppercase font-black">⏳ Onay Bekliyor</span>;
      case "kabul": return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded text-[9px] uppercase font-black">💳 Teminat Bekleniyor</span>;
      case "teminat_odendi": return <span className="bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20 px-3 py-1 rounded text-[9px] uppercase font-black">📦 Kargolanacak</span>;
      case "kargoda": return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded text-[9px] uppercase font-black">🚚 Yolda</span>;
      case "teslim_edildi": return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded text-[9px] uppercase font-black">✅ Tamamlandı</span>;
      case "iptal_istendi": return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded text-[9px] uppercase font-black">⚠️ İptal Sürecinde</span>;
      case "iptal_onaylandi": return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded text-[9px] uppercase font-black">❌ İptal Edildi</span>;
      case "red": return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded text-[9px] uppercase font-black">⛔ Reddedildi</span>;
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00f260] font-black tracking-widest animate-pulse">BORSA VERİLERİ ÇEKİLİYOR...</div>;

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
            A-TAKASA <span className="text-[#00f260]">TERMİNAL.</span>
          </h1>
        </div>

        {/* 📊 SİBER İSTATİSTİK PANOLARI (WIDGETS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f260]/5 blur-[50px] rounded-full"></div>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">SİBER KASA BAKİYESİ</p>
             <p className="text-4xl font-black text-[#00f260]">{bakiye.toLocaleString()} ₺</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl shadow-lg">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">VİTRİNDEKİ VARLIK DEĞERİM</p>
             <p className="text-3xl font-black text-white">{toplamVarlikDegeri.toLocaleString()} ₺</p>
             <p className="text-cyan-400 text-xs font-bold mt-2">{ilanlarim.length} Aktif İlan</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl shadow-lg">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">YAPTIĞIM TEKLİFLERİN HACMİ</p>
             <p className="text-3xl font-black text-white">{toplamYaptigimTeklifDegeri.toLocaleString()} ₺</p>
             <p className="text-amber-500 text-xs font-bold mt-2">{gidenTakaslar.length} Açık Teklif</p>
          </div>
        </div>

        {/* 🎛️ ANA SEKMELER */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => {setAktifSekme("gelen_teklifler"); setAltFiltre("hepsi");}} className={`flex-1 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${aktifSekme === "gelen_teklifler" ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.2)]' : 'bg-[#0a0a0a] text-slate-400 border border-white/5 hover:bg-white/5'}`}>
            Bana Gelen Teklifler ({gelenTakaslar.length})
          </button>
          <button onClick={() => {setAktifSekme("giden_teklifler"); setAltFiltre("hepsi");}} className={`flex-1 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${aktifSekme === "giden_teklifler" ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-[#0a0a0a] text-slate-400 border border-white/5 hover:bg-white/5'}`}>
            Yaptığım Teklifler ({gidenTakaslar.length})
          </button>
        </div>

        {/* 🔍 ALT FİLTRELER (Duruma Göre Süzme) */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[#0a0a0a] p-2 rounded-xl border border-white/5">
          {["hepsi", "bekliyor", "kabul", "teminat_odendi", "kargoda", "teslim_edildi", "iptal_istendi"].map(durum => (
            <button key={durum} onClick={() => setAltFiltre(durum)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${altFiltre === durum ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'}`}>
              {durum.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* 📟 BORSA TAHTASI (Emirler Listesi) */}
        <div className="space-y-4">
          {gosterilenVeri.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl py-24 text-center">
              <p className="text-slate-600 font-black tracking-[0.3em] uppercase text-xs">Bu kategoride işlem yok.</p>
            </div>
          ) : (
            gosterilenVeri.map((islem: any) => {
              const benimRolum = islem.gonderenEmail === session?.user?.email?.toLowerCase() ? "gonderen" : "alici";
              const teminatOdedimMi = benimRolum === "gonderen" ? islem.gonderenTeminatOdediMi : islem.aliciTeminatOdediMi;

              return (
                <div key={islem._id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl flex flex-col hover:border-white/20 transition-all shadow-xl">
                  
                  {/* Üst Bilgi Satırı */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded">ID: {islem._id.slice(-6)}</span>
                      {getDurumRozeti(islem.durum)}
                    </div>
                    <span className="text-slate-500 text-[9px] font-bold">{new Date(islem.createdAt).toLocaleString("tr-TR")}</span>
                  </div>

                  {/* Takas Özeti Kartı */}
                  <div className="flex flex-col md:flex-row items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 mb-6">
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Benim Varlığım</p>
                      <p className="text-white font-bold text-sm uppercase">{benimRolum === "alici" ? islem.hedefIlanBaslik : islem.teklifEdilenIlanBaslik}</p>
                    </div>
                    
                    <div className="text-cyan-400 text-2xl font-black rotate-90 md:rotate-0">⇄</div>
                    
                    <div className="flex-1 text-center md:text-right">
                      <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-1">Karşı Tarafın Varlığı</p>
                      <p className="text-white font-bold text-sm uppercase">{benimRolum === "alici" ? islem.teklifEdilenIlanBaslik : islem.hedefIlanBaslik}</p>
                      {islem.eklenenNakit > 0 && <p className="text-[#00f260] text-[10px] font-black mt-1">+ {islem.eklenenNakit.toLocaleString()} ₺ Nakit Eklendi</p>}
                    </div>
                  </div>

                  {/* 🚀 BORSA AKSİYON BUTONLARI (Duruma Göre Değişir) */}
                  <div className="flex flex-wrap gap-3 mt-auto">
                    
                    {/* 1. Bekliyor Aşaması */}
                    {islem.durum === "bekliyor" && benimRolum === "alici" && (
                      <>
                        <button onClick={()=>handleDurumGuncelle(islem._id, "kabul")} className="flex-1 bg-[#00f260] text-black py-3 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg">✅ Teklifi Kabul Et</button>
                        <button onClick={()=>handleDurumGuncelle(islem._id, "red")} className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">❌ Reddet</button>
                      </>
                    )}
                    {islem.durum === "bekliyor" && benimRolum === "gonderen" && (
                      <button onClick={()=>handleDurumGuncelle(islem._id, "iptal")} className="w-full md:w-auto px-6 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Teklifi Geri Çek</button>
                    )}

                    {/* 2. Kabul Edildi -> Teminat Bekleniyor */}
                    {islem.durum === "kabul" && !teminatOdedimMi && (
                      <button onClick={()=>handleTeminatOde(islem._id)} className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-pulse">
                        💳 TEMİNAT YATIR (GÜVENLİ İŞLEM)
                      </button>
                    )}
                    {islem.durum === "kabul" && teminatOdedimMi && (
                      <div className="flex-1 bg-white/5 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase text-center border border-white/5">
                        ⏳ Karşı Tarafın Teminatı Bekleniyor...
                      </div>
                    )}

                    {/* 3. Teminatlar Ödendi -> Kargo Aşaması */}
                    {islem.durum === "teminat_odendi" && (
                      <button onClick={()=>handleDurumGuncelle(islem._id, "kargoda")} className="flex-1 bg-purple-500 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        📦 KARGOYA VERDİM
                      </button>
                    )}

                    {/* 4. Kargoda -> Teslim Onayı */}
                    {islem.durum === "kargoda" && (
                      <button onClick={()=>handleDurumGuncelle(islem._id, "teslim_edildi")} className="flex-1 bg-[#00f260] text-black py-3 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,242,96,0.4)]">
                        ✅ ÜRÜNÜ TESLİM ALDIM (ONAYLA)
                      </button>
                    )}

                    {/* İptal İsteği */}
                    {["kabul", "teminat_odendi", "kargoda"].includes(islem.durum) && (
                      <button onClick={()=>handleDurumGuncelle(islem._id, "iptal_istendi")} className="px-6 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                        İPTAL TALEP ET
                      </button>
                    )}

                    {/* 💬 Mesajlaşma Sabit Butonu */}
                    <Link href={`/mesajlar?satici=${benimRolum === "alici" ? islem.gonderenEmail : islem.aliciEmail}`} className="px-6 bg-white/5 text-cyan-400 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center">
                      💬 MESAJ AT
                    </Link>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
