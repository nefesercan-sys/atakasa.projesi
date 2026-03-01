'use client';

import React, { useEffect, useState } from 'react';

export default function Vitrin() {
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ilanlar')
      .then(res => res.json())
      .then(result => {
        if (result.success) setIlanlar(result.data);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8' }}>ATAKASA VİTRİN</h1>
        <p style={{ opacity: 0.7 }}>Şu an yayında olan gerçek ilanlar</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Siber Veriler Yükleniyor... ⏳</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {ilanlar.map((ad: any) => (
            <div key={ad._id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden', border: '1px solid #334155' }}>
              <div style={{ height: '200px', backgroundImage: `url(${ad.resimUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{ad.baslik}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Number(ad.fiyat).toLocaleString()} TL</span>
                  <span style={{ opacity: 0.6 }}>📍 {ad.sehir}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>SATIN AL</button>
                  <button style={{ flex: 1, border: '1px solid #38bdf8', color: '#38bdf8', padding: '10px', borderRadius: '8px', background: 'none' }}>TAKAS YAP</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
