'use client';

import React, { useState } from 'react';

export default function TakasTeklif() {
  const [targetPrice] = useState(10000); // Örnek: Alınmak istenen ürün 10.000 TL
  const [myOfferPrice, setMyOfferPrice] = useState(0);
  const [hasListing] = useState(true); // Kullanıcının ilanı var mı kontrolü

  const priceDiff = ((targetPrice - myOfferPrice) / targetPrice) * 100;
  const isTooLow = priceDiff > 30;

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#38bdf8' }}>TAKAS TEKLİF MERKEZİ</h2>
        <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px', marginTop: '10px' }}>
          🎯 Hedef Ürün Fiyatı: <span style={{ fontWeight: 'bold' }}>{targetPrice.toLocaleString()} TL</span>
        </div>
      </header>

      {!hasListing ? (
        <div style={{ textAlign: 'center', border: '2px solid #ef4444', padding: '30px', borderRadius: '20px' }}>
          <p>⚠️ Takas teklifi göndermek için aktif bir ilanınız olmalıdır!</p>
          <button style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', marginTop: '15px' }}>HEMEN İLAN VER</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: isTooLow ? '1px solid #ef4444' : '1px solid #10b981' }}>
            <h3>Senin Teklifin</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Lütfen takas edeceğiniz ürünün fiyatını girin:</p>
            <input 
              type="number" 
              placeholder="Ürününüzün Fiyatı" 
              onChange={(e) => setMyOfferPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '15px', borderRadius: '10px', marginTop: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155' }}
            />
            
            {myOfferPrice > 0 && (
              <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: isTooLow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                {isTooLow ? (
                  <p style={{ color: '#ef4444' }}>🚨 Uyarı: Teklifiniz hedef üründen %{priceDiff.toFixed(0)} ucuz. En fazla %30 fark olabilir!</p>
                ) : (
                  <p style={{ color: '#10b981' }}>✅ Şartlar Uygun: Fiyat farkı %{priceDiff.toFixed(0)}. Teklif gönderilebilir.</p>
                )}
              </div>
            )}
          </div>

          <button 
            disabled={isTooLow || myOfferPrice === 0}
            style={{ 
              backgroundColor: isTooLow ? '#334155' : '#38bdf8', 
              color: '#0f172a', 
              border: 'none', 
              padding: '20px', 
              borderRadius: '15px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              cursor: isTooLow ? 'not-allowed' : 'pointer'
            }}
          >
            TAKAS TEKLİFİNİ GÖNDER 🚀
          </button>
        </div>
      )}
    </div>
  );
}
