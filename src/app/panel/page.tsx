"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SiberPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeRole, setActiveRole] = useState("alici");
  const [activeTab, setActiveTab] = useState("siparislerim");
  
  // 📡 VERİ STATE'LERİ
  const [ilanlarim, setIlanlarim] = useState([]);
  const [alimSiparisleri, setAlimSiparisleri] = useState([]); // Alıcı olduğum
  const [satisSiparisleri, setSatisSiparisleri] = useState([]); // Satıcı olduğum
  const [loading, setLoading] = useState(true);

  // 💰 YENİ: SİBER CÜZDAN STATE'LERİ
  const [bakiye, setBakiye] = useState(0); 
  const [bakiyeYukleniyor, setBakiyeYukleniyor] = useState(false);

  useEffect(() => {
    if (status === "authenticated") fetchSiberData();
    else if (status === "unauthenticated") router.push("/login");
  }, [status]);

  // 📡 GERÇEK ZAMANLI VERİ ÇEKME MOTORU
  const fetchSiberData = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const aktifEmail = session.user.email.toLowerCase();
    
    try {
      // 💰 0. SİBER BAKİYEYİ ÇEK
      const resWallet = await fetch(`/api/wallet`, { cache: "no-store" });
      if (resWallet.ok) {
         const wData = await resWallet.json();
         setBakiye(wData.balance || 0);
      }

      // 1. İLANLARI ÇEK (Satıcı Paneli İçin)
      const resListings = await fetch(`/api/listings`, { cache: "no-store" });
      if (resListings.ok) {
        const dataListings = await resListings.json();
        const benimIlanlar = dataListings.filter(i => {
           const sEmail = (typeof i.userId === 'string' ? i.userId : i.satici?.email || i.satici || "").toLowerCase();
           return sEmail === aktifEmail;
        });
        setIlanlarim(benimIlanlar);
      }

      // 2. SİPARİŞLERİ ÇEK (Tüm lojistik ağ)
      const resOrders = await fetch(`/api/orders?email=${aktifEmail}`, { cache: "no-store" });
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setAlimSiparisleri(dataOrders.filter(o => (o.buyerEmail || "").toLowerCase() === aktifEmail));
        setSatisSiparisleri(dataOrders.filter(o => (o.sellerEmail || "").toLowerCase() === aktifEmail));
      }
    } catch (err) { 
      console.error("Veri Çekme Hatası:", err); 
    }
    setLoading(false);
  };

  // 🔄 DURUM GÜNCELLEME MOTORU (Tetikleyici)
  const handleUpdateStatus = async (id, yeniDurum) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, yeniDurum })
      });
      if (res.ok) fetchSiberData(); 
    } catch (error) {
      alert("Sinyal iletilemedi!");
    }
  };

  // 💰 SİBER BAKİYE YÜKLEME MOTORU
  const handleBakiyeYukle = async () => {
    const miktar = prompt("Siber Kasaya yüklenecek tutarı girin (₺):");
    if (!miktar || isNaN(miktar) || Number(miktar) <= 0) return;

    setBakiyeYukleniyor(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ miktar: Number(miktar) })
      });
      if (res.ok) {
        const data = await res.json();
        setBakiye(data.balance);
        alert(`⚡ MÜHÜRLENDİ: Kasaya ${miktar} ₺ eklendi!`);
      } else {
        alert("Banka API'sine ulaşılamadı.");
      }
    } catch (err) {
      alert("Siber bağlantı koptu.");
    } finally {
      setBakiyeYukleniyor(false);
    }
  };

  // 🎛️ SEKMELERE GÖRE VERİ FİLTRELEME MANTIĞI
  const getFilteredData = () => {
    if (activeRole === "alici") {
      if (activeTab === "sepetim") return []; 
      if (activeTab === "siparislerim") return alimSiparisleri.filter(o => o.status === "pending" || o.status === "approved");
      if (activeTab === "kargoda") return alimSiparisleri.filter(o => o.status === "shipped");
      if (activeTab === "teslim_aldiklarim") return alimSiparisleri.filter(o => o.status === "delivered");
      if (activeTab === "iptal") return alimSiparisleri.filter(o => o.status === "canceled");
    } else {
      if (activeTab === "ilanlarim") return ilanlarim;
      if (activeTab === "onay_bekleyen") return satisSiparisleri.filter(o => o.status === "pending" || !o.status);
      if (activeTab === "onayladiklarim") return satisSiparisleri.filter(o => o.status === "approved");
      if (activeTab === "kargoda") return satisSiparisleri.filter(o => o.status === "shipped");
      if (activeTab === "teslim_edilenler") return satisSiparisleri.filter(o => o.status === "delivered");
      if (activeTab === "iptal") return satisSiparisleri.filter(o => o.status === "canceled");
    }
    return [];
  };

  const currentData = getFilteredData();

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveTab(role === "alici" ? "siparislerim" : "ilanlarim");
  };

  if (loading) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-[#00f260] font-black animate-pulse tracking-[0.2em]">LOJİSTİK AĞ TARANIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#030712] py-24 px-4 max-w-7xl mx-auto italic">
      
      {/* 💰 SİBER CÜZDAN EKRANI */}
      <div className="bg-white/[0.02] border border-[#00f260]/20 p-6 rounded-3xl mb-8 flex items-center justify-between gap-8 shadow-[0_0_20px_rgba(0,242,96,0.05)]">
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">SİBER KASA BAKİYESİ</p>
          <p className="text-3xl md:text-4xl font-black text-[#00f260]">
            {bakiye.toLocaleString("tr-TR")} <span className="text-xl text-white">₺</span>
          </p>
        </div>
        <button 
          onClick={handleBakiyeYukle}
          disabled={bakiyeYukleniyor}
          className={`text-black w-14 h-14 rounded-full flex items-center justify-center font-black text-3xl transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] ${bakiyeYukleniyor ? 'bg-slate-500 animate-spin' : 'bg-[#00f260] hover:scale-110'}`}
          title="Bakiye Yükle"
        >
          {bakiyeYukleniyor ? "⚙️" : "+"}
        </button>
      </div>

      {/* 🔄 ROL DEĞİŞTİRİCİ */}
      <div className="flex bg-[#0b0f19] p-1 rounded-2xl mb-12 border border-white/5 shadow-2xl">
        <button onClick={()=>handleRoleChange("alici")} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeRole === "alici" ? 'bg-[#00f260] text-black shadow-[0_0_20px_rgba(0,242,96,0.3)]' : 'text-slate-500 hover:text-white'}`}>🛡️ ALICI PANELİ</button>
        <button onClick={()=>handleRoleChange("satici")} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${activeRole === "satici" ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-slate-500 hover:text-white'}`}>🏪 SATICI PANELİ</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 🎛️ SOL MENÜ */}
        <div className="lg:col-span-1 space-y-2">
          {activeRole === "alici" ? (
            <>
              <TabButton id="sepetim" label="Sepetim" active={activeTab} set={setActiveTab} color="text-[#00f260]" border="border-[#00f260]" />
              <TabButton id="siparislerim" label={`Siparişlerim (${alimSiparisleri.filter(o=>o.status==='pending'||o.status==='approved').length})`} active={activeTab} set={setActiveTab} color="text-[#00f260]" border="border-[#00f260]" />
              <TabButton id="kargoda" label={`Kargoda Olanlar (${alimSiparisleri.filter(o=>o.status==='shipped').length})`} active={activeTab} set={setActiveTab} color="text-[#00f260]" border="border-[#00f260]" />
              <TabButton id="teslim_aldiklarim" label={`Teslim Aldıklarım (${alimSiparisleri.filter(o=>o.status==='delivered').length})`} active={activeTab} set={setActiveTab} color="text-[#00f260]" border="border-[#00f260]" />
              <TabButton id="iptal" label={`İptal Edilenler (${alimSiparisleri.filter(o=>o.status==='canceled').length})`} active={activeTab} set={setActiveTab} color="text-red-500" border="border-red-500" />
            </>
          ) : (
            <>
              <TabButton id="ilanlarim" label={`İlanlarım (${ilanlarim.length})`} active={activeTab} set={setActiveTab} color="text-amber-500" border="border-amber-500" />
              <TabButton id="onay_bekleyen" label={`Onay Bekleyenler (${satisSiparisleri.filter(o=>o.status==='pending'||!o.status).length})`} active={activeTab} set={setActiveTab} color="text-amber-500" border="border-amber-500" />
              <TabButton id="onayladiklarim" label={`Onayladıklarım (${satisSiparisleri.filter(o=>o.status==='approved').length})`} active={activeTab} set={setActiveTab} color="text-amber-500" border="border-amber-500" />
              <TabButton id="kargoda" label={`Kargoda (${satisSiparisleri.filter(o=>o.status==='shipped').length})`} active={activeTab} set={setActiveTab} color="text-amber-500" border="border-amber-500" />
              <TabButton id="teslim_edilenler" label={`Teslim Edilenler (${satisSiparisleri.filter(o=>o.status==='delivered').length})`} active={activeTab} set={setActiveTab} color="text-amber-500" border="border-amber-500" />
              <TabButton id="iptal" label={`İptal (${satisSiparisleri.filter(o=>o.status==='canceled').length})`} active={activeTab} set={setActiveTab} color="text-red-500" border="border-red-500" />
            </>
          )}
        </div>

        {/* 💠 SAĞ İÇERİK ALANI */}
        <div className="lg:col-span-3">
          <div className="bg-[#0b0f19] border border-white/5 rounded-[2.5rem] p-6 min-h-[500px]">
            {currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-32 opacity-20">
                <span className="text-6xl mb-4 grayscale">📦</span>
                <p className="font-black text-xs text-white uppercase tracking-[0.2em]">BU BÖLÜMDE KAYIT YOK.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.map((item, idx) => (
                  <div key={idx} className="bg-[#030712] border border-white/5 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-white/20 transition-all">
                    <img src={item.media?.images?.[0] || item.resimUrl || "https://placehold.co/100"} className="w-20 h-20 rounded-2xl object-cover border border-white/5" alt="Ürün" />
                    
                    <div className="flex-1">
                       <h4 className="text-white font-black uppercase text-sm mb-1">{item.title || item.baslik || "SİPARİŞ EDİLEN VARLIK"}</h4>
                       <p className="text-slate-400 font-bold text-[10px] mb-2 uppercase tracking-widest">
                         {activeRole === "satici" ? `Alıcı: ${item.buyerEmail || "Bilinmiyor"}` : `Satıcı: ${item.sellerEmail || "Bilinmiyor"}`}
                       </p>
                       <p className="text-[#00f260] font-black text-sm italic">{Number(item.price || item.fiyat || item.totalAmount || 0).toLocaleString()} ₺</p>
                    </div>

                    {/* 🚀 AKSİYON BUTONLARI */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
                      
                      {activeRole === "alici" && activeTab === "siparislerim" && item.status === "pending" && (
                        <button onClick={()=>handleUpdateStatus(item._id, "canceled")} className="flex-1 md:flex-none bg-red-500/10 text-red-500 p-3 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">İptal Et</button>
                      )}
                      {activeRole === "alici" && activeTab === "kargoda" && (
                        <button onClick={()=>handleUpdateStatus(item._id, "delivered")} className="flex-1 md:flex-none bg-[#00f260] text-black p-3 rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-lg">Teslim Aldım</button>
                      )}

                      {activeRole === "satici" && activeTab === "onay_bekleyen" && (
                        <>
                          <button onClick={()=>handleUpdateStatus(item._id, "approved")} className="flex-1 md:flex-none bg-[#00f260] text-black px-5 py-3 rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-lg">Siparişi Onayla</button>
                          <button onClick={()=>handleUpdateStatus(item._id, "canceled")} className="flex-1 md:flex-none bg-red-500/10 text-red-500 px-5 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reddet</button>
                        </>
                      )}
                      {activeRole === "satici" && activeTab === "onayladiklarim" && (
                        <button onClick={()=>handleUpdateStatus(item._id, "shipped")} className="flex-1 md:flex-none bg-blue-500 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]">Kargoya Verildi</button>
                      )}
                      
                      {activeTab === "ilanlarim" && (
                        <Link href={`/ilan-duzenle/${item._id}`} className="flex-1 md:flex-none bg-amber-500 text-black px-5 py-3 rounded-xl text-[9px] font-black uppercase text-center hover:scale-105 transition-all">Düzenle</Link>
                      )}
                      {/* ⚡ İŞTE DÜZELTİLEN KUSURSUZ İNCELE ROTASI */}
                      <Link href={`/ilanlar/${item.listingId || item._id}`} className="flex-1 md:flex-none bg-white/5 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase border border-white/10 text-center hover:bg-white/10 transition-all">İncele</Link>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎨 YARDIMCI BİLEŞEN
function TabButton({ id, label, active, set, color, border }) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => set(id)} 
      className={`w-full p-4 rounded-xl text-[9px] font-black uppercase border transition-all ${isActive ? `${border} ${color} bg-white/[0.02] shadow-sm` : "border-white/5 text-slate-500 bg-[#0b0f19] hover:bg-white/5"}`}
    >
      {label}
    </button>
  );
}
