'use client';

import React, { useEffect, useState } from 'react';

export default function Vitrin() {
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Siber Hafızadan (MongoDB) Verileri Çekme
  useEffect(() => {
    async function ilanlariGetir() {
      try {
        const res = await fetch('/api/ilanlar');
        const result = await res.json();
        if (result.success) {
          setIlanlar(result.data);
        }
      } catch (error) {
        console.error("Veri çekilemedi patron:", error);
      }
      setLoading(false);
    }
    ilanlariGetir();
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', letterSpacing: '2px' }}>ATAKASA CANLI VİTRİN</h1>
        <p style={{ opacity: 0.7 }}>Şu an yayında olan gerçek takas fırsatları</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ fontSize: '2rem' }}>📡</div>
          <p>Siber veritabanına bağlanılıyor...</p>
        </div>
      ) : ilanlar.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', opacity: 0.5 }}>
          <p>Henüz hiç ilan verilmemiş patron. İlk ilanı sen başlat!</p>
          <a href="/yeni-ilan" style={{ color: '#38bdf8', textDecoration: 'none' }}>+ Yeni İlan Ekle</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {ilanlar.map((ad: any) => (
            <div key={ad._id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden', border: '1px solid #334155', transition: '0.3s' }}>
              {/* Cloudinary'den Gelen Gerçek Resim */}
              <div style={{ height: '200px', backgroundImage: `url(${ad.resimUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              
              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{ad.baslik}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Number(ad.fiyat).toLocaleString()} TL</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>📍 {ad.sehir} / {ad.ilce}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>SATIN AL</button>
                  <button onClick={() => window.location.href=`/takas-teklif?id=${ad._id}`} style={{ flex: 1, border: '1px solid #38bdf8', color: '#38bdf8', background: 'none', padding: '10px', borderRadius: '8px' }}>TAKAS YAP</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
