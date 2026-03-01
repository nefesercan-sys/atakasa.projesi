'use client';

import React, { useState } from 'react';

export default function KullaniciPaneli() {
  const [activeTab, setActiveTab] = useState('ilanlar');

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#38bdf8' }}>ATAKASA KONTROL PANELİ</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {['ilanlar', 'teklifler', 'siparisler', 'cüzdan'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                backgroundColor: activeTab === tab ? '#38bdf8' : '#1e293b',
                color: activeTab === tab ? '#0f172a' : 'white',
                border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* İLANLARIM ODASI */}
      {activeTab === 'ilanlar' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', border: '1px solid #334155' }}>
            <h4>iPhone 15 Pro Max</h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Durum: Yayında | Fiyat: 75.000 TL</p>
            <button style={{ marginTop: '10px', color: '#fb7185', background: 'none', border: 'none', fontSize: '0.8rem' }}>İlanı Kaldır 🗑️</button>
          </div>
        </div>
      )}

      {/* TEKLİFLER ODASI */}
      {activeTab === 'teklifler' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '15_px', borderLeft: '4px solid #10b981' }}>
            <h4 style={{ color: '#10b981' }}>Gelen Takas Teklifi!</h4>
            <p style={{ fontSize: '0.8rem' }}>Ürün: Samsung S23 + 15.000 TL</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button style={{ backgroundColor: '#10b981', border: 'none', padding: '8px', borderRadius: '5px', color: 'white', fontSize: '0.8rem' }}>Kabul Et</button>
              <button style={{ backgroundColor: '#ef4444', border: 'none', padding: '8px', borderRadius: '5px', color: 'white', fontSize: '0.8rem' }}>Reddet</button>
            </div>
          </div>
        </div>
      )}

      {/* CÜZDAN ODASI */}
      {activeTab === 'cüzdan' && (
        <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '25px', textAlign: 'center', border: '2px solid #38bdf8' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Toplam Bakiyeniz</p>
          <h1 style={{ fontSize: '2.5rem', color: '#38bdf8' }}>12.450,00 TL</h1>
          <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
            <button style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}>Para Çek 💸</button>
            <button style={{ border: '1px solid #38bdf8', color: '#38bdf8', background: 'none', padding: '15px', borderRadius: '10px' }}>Hareketleri Gör</button>
          </div>
        </div>
      )}
    </div>
  );
}
