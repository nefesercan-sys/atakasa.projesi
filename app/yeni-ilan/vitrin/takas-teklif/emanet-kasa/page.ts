'use client';

import React, { useState } from 'react';

export default function EmanetKasa() {
  const [status, setStatus] = useState('beklemede'); // beklemede, yatirildi, kargoda, tamamlandi
  const depositAmount = 5000; // Örnek depozito bedeli
  const commission = depositAmount * 0.05;
  const refundAmount = depositAmount - commission;

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #38bdf8', paddingBottom: '10px' }}>
        <h2 style={{ color: '#38bdf8' }}>🛡️ ATAKASA EMANET SİSTEMİ</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Güvenli Takas Takip Ekranı</p>
      </header>

      {/* SÜREÇ ÇİZGİSİ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '0.7rem', textAlign: 'center' }}>
        <div style={{ color: status === 'beklemede' ? '#38bdf8' : '#10b981' }}>●<br/>Teminat</div>
        <div style={{ color: status === 'yatirildi' ? '#38bdf8' : status === 'kargoda' || status === 'tamamlandi' ? '#10b981' : '#334155' }}>●<br/>Kargo</div>
        <div style={{ color: status === 'kargoda' ? '#38bdf8' : status === 'tamamlandi' ? '#10b981' : '#334155' }}>●<br/>Onay</div>
        <div style={{ color: status === 'tamamlandi' ? '#10b981' : '#334155' }}>●<br/>İade</div>
      </div>

      {/* FİNANSAL ÖZET */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #334155' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>İşlem Özeti</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Yatırılacak Teminat:</span>
          <span style={{ fontWeight: 'bold' }}>{depositAmount.toLocaleString()} TL</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#fb7185' }}>
          <span>Atakasa Hizmet Bedeli (%5):</span>
          <span>-{commission.toLocaleString()} TL</span>
        </div>
        <hr style={{ border: '0.5px solid #334155' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <span>İade Edilecek Tutar:</span>
          <span>{refundAmount.toLocaleString()} TL</span>
        </div>
      </div>

      {/* AKSİYON BUTONLARI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {status === 'beklemede' && (
          <button onClick={() => setStatus('yatirildi')} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem' }}>
            DEPOZİTO TEMİNATI YATIR 💳
          </button>
        )}
        
        {status === 'yatirildi' && (
          <button onClick={() => setStatus('kargoda')} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold' }}>
            ÜRÜNÜ KARGOYA VERDİM / TESLİM ETTİM 📦
          </button>
        )}

        {status === 'kargoda' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStatus('tamamlandi')} style={{ flex: 2, backgroundColor: '#10b981', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold' }}>
              TESLİM ALDIM, ONAYLIYORUM ✅
            </button>
            <button style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: 'bold' }}>
              İADE ET 🚩
            </button>
          </div>
        )}

        {status === 'tamamlandi' && (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '15px', border: '1px solid #10b981' }}>
            <p style={{ color: '#10b981', fontWeight: 'bold' }}>🎉 İşlem Başarıyla Tamamlandı!</p>
            <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Teminatınız %5 komisyon kesilerek hesabınıza aktarılmıştır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
