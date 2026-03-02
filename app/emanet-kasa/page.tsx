"use client";
import React from 'react';

export default function EmanetKasaPage() {
  return (
    // Yarım kalan 12. satır düzeltildi ve etiket kapatıldı
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>ATAKASA EMANET KASA</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>Takas işlemleriniz siber ağda güvende.</p>
      </header>

      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
        <h3 style={{ color: '#cbd5e1', fontSize: '1.25rem', marginBottom: '1rem' }}>Güvenli Takas Alanı</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
          Ürünler her iki taraftan da kargoya verilip onaylanana kadar, paranız ve ürününüz Atakasa güvencesi altındadır.
        </p>
      </div>

    </div>
  );
}
