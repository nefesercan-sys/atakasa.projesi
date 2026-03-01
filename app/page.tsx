import React from 'react';

export default function AtakasaHome() {
  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
      <div style={{ border: '2px solid #38bdf8', padding: '40px', borderRadius: '20px', backgroundColor: '#1e293b', boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: '#38bdf8' }}>ATAKASA</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>Güvenli Teminatlı Takas Sistemi</p>
        
        <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', borderLeft: '4px solid #38bdf8' }}>
          🛡️ 256-bit SSL ve Akıllı Kontrat Güvencesiyle Korunmaktadır.
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <input type="checkbox" id="legal" />
          <label htmlFor="legal" style={{ fontSize: '0.8rem' }}>Kullanım Koşullarını ve Gizlilik Sözleşmesini kabul ediyorum.</label>
        </div>

        <button style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          SİSTEME GİRİŞ YAP
        </button>
      </div>

      <footer style={{ marginTop: '50px', fontSize: '0.7rem', opacity: 0.5 }}>
        © 2026 ATAKASA. Tüm Hakları Saklıdır. İzinsiz kopyalanamaz ve ticari amaçla kullanılamaz.
      </footer>
    </div>
  );
}
