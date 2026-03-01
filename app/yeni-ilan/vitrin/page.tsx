'use client';

import React, { useState } from 'react';

export default function Vitrin() {
  const [filter, setFilter] = useState({ category: 'Hepsi', city: 'Hepsi', maxPrice: 100000 });

  // Örnek İlan Verileri (Veritabanı bağlandığında burası otomatik dolacak)
  const dummyAds = [
    { id: 1, title: 'iPhone 15 Pro Max', price: 75000, category: 'Elektronik', city: 'İstanbul', image: '📱' },
    { id: 2, title: 'L Köşe Koltuk Takımı', price: 25000, category: 'Mobilya', city: 'İzmir', image: '🛋️' },
    { id: 3, title: 'Akülü Çocuk Arabası', price: 8000, category: 'Oyuncak', city: 'Ankara', image: '🏎️' },
    { id: 4, title: 'Samsung 4K Smart TV', price: 32000, category: 'Elektronik', city: 'Bursa', image: '📺' },
  ];

  const filteredAds = dummyAds.filter(ad => 
    (filter.category === 'Hepsi' || ad.category === filter.category) &&
    (filter.city === 'Hepsi' || ad.city === filter.city) &&
    (ad.price <= filter.maxPrice)
  );

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', letterSpacing: '2px' }}>ATAKASA VİTRİN</h1>
        <p style={{ opacity: 0.7 }}>Güvenli Takasın Vitrini</p>
      </header>

      {/* FİLTRELEME PANELİ */}
      <section style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <select onChange={(e) => setFilter({...filter, category: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none' }}>
          <option value="Hepsi">Tüm Kategoriler</option>
          <option value="Elektronik">Elektronik</option>
          <option value="Mobilya">Mobilya</option>
          <option value="Oyuncak">Oyuncak</option>
        </select>
        <select onChange={(e) => setFilter({...filter, city: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none' }}>
          <option value="Hepsi">Tüm Şehirler</option>
          <option value="İstanbul">İstanbul</option>
          <option value="Ankara">Ankara</option>
          <option value="İzmir">İzmir</option>
        </select>
        <div style={{ flex: '1 1 100%', marginTop: '10px' }}>
          <label style={{ fontSize: '0.8rem' }}>Maksimum Fiyat: {filter.maxPrice} TL</label>
          <input type="range" min="1000" max="100000" step="1000" style={{ width: '100%' }} onChange={(e) => setFilter({...filter, maxPrice: parseInt(e.target.value)})} />
        </div>
      </section>

      {/* ÜRÜN LİSTESİ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredAds.map(ad => (
          <div key={ad.id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{ height: '200px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
              {ad.image}
            </div>
            <div style={{ padding: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{ad.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{ad.price.toLocaleString()} TL</span>
                <span style={{ opacity: 0.6 }}>📍 {ad.city}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>SATIN AL</button>
                <button style={{ flex: 1, border: '1px solid #38bdf8', color: '#38bdf8', backgroundColor: 'transparent', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>TAKAS YAP</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
