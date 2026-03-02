"use client";
import React, { useState } from 'react';

export default function TakasTeklifPage() {
  const [fiyatFarki, setFiyatFarki] = useState('');
  const [mesaj, setMesaj] = useState('');

  const handleTeklifGonder = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Takas teklifiniz sisteme iletildi!');
  };

  return (
    // Vercel'de hata veren 14. satırdaki yarım kalan kod düzeltildi ve kapatıldı
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>TAKAS TEKLİFİ</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>İki ürün arasındaki takas şartlarını belirleyin.</p>
      </header>

      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
        <form onSubmit={handleTeklifGonder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 'bold' }}>
              Fiyat Farkı (₺) - Üste Verilecek/Alınacak
            </label>
            <input 
              type="number" 
              value={fiyatFarki}
              onChange={(e) => setFiyatFarki(e.target.value)}
              placeholder="Örn: 2500"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 'bold' }}>
              Takas Mesajınız
            </label>
            <textarea 
              value={mesaj}
              onChange={(e) => setMesaj(e.target.value)}
              placeholder="Merhaba, ürününüzle birlikte kendi cihazımı takas etmek istiyorum..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none', resize: 'vertical' }}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '1rem', borderRadius: '0.5rem', fontWeight: '900', cursor: 'pointer', border: 'none', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Teklifi Gönder
          </button>

        </form>
      </div>
    </div>
  );
}
