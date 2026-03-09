"use client";

import useSWR from 'swr';
import { useState } from 'react';

// SWR için veri çekme motorumuz
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SiparisYonetimi() {
  // İŞTE SİHRİN GERÇEKLEŞTİĞİ YER!
  // refreshInterval: 3000 -> SWR arka planda her 3 saniyede bir yeni sipariş var mı diye bakar. 
  // Ziyaretçi sayfayı yenilemeden sipariş anında ekrana düşer!
  const { data: orders, error, mutate } = useSWR('/api/orders', fetcher, { 
    refreshInterval: 3000 
  });

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Butona basıldığında durumu güncelleyecek fonksiyon
  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      // mutate() komutu: "Veritabanı güncellendi, ekranı sayfayı yenilemeden anında değiştir!" der.
      mutate(); 
    } catch (err) {
      console.error("Güncelleme hatası", err);
    } finally {
      setLoadingId(null);
    }
  };

  if (error) return <div className="text-red-500 p-10 text-center">Siber ağ bağlantısı koptu! 🚨</div>;
  if (!orders) return <div className="text-[#00f260] p-10 text-center animate-pulse">Siparişler Taranıyor... ⚡</div>;

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-[#00f260] tracking-wider uppercase border-b border-[#00f260]/30 pb-4">
        A-TAKASA | Canlı Sipariş Merkezi
      </h1>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 italic">Şu an aktif bir sipariş bulunmuyor...</p>
        ) : (
          orders.map((order: any) => (
            <div key={order._id} className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:border-[#00f260]/50">
              
              {/* Sipariş Detayları */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">ID: {order._id}</p>
                <p className="font-semibold text-lg">Alıcı: <span className="text-gray-300">{order.buyerEmail}</span></p>
                <p className="text-sm text-gray-400">Ürün ID: {order.productId} | Fiyat: {order.price} ₺</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#00f260]/10 text-[#00f260] border border-[#00f260]/20 uppercase tracking-widest">
                  Durum: {order.status.replace('_', ' ')}
                </div>
              </div>

              {/* Kontrol Butonları */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange(order._id, 'onaylandi')}
                  disabled={loadingId === order._id || order.status === 'onaylandi'}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Onayla
                </button>
                <button 
                  onClick={() => handleStatusChange(order._id, 'kargolandi')}
                  disabled={loadingId === order._id || order.status === 'kargolandi'}
                  className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Kargola
                </button>
                <button 
                  onClick={() => handleStatusChange(order._id, 'teslim_edildi')}
                  disabled={loadingId === order._id || order.status === 'teslim_edildi'}
                  className="bg-[#00f260] hover:bg-[#00d250] disabled:opacity-50 text-black px-4 py-2 rounded font-bold transition-colors"
                >
                  Teslim Edildi
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
