'use client';

import React, { useState } from 'react';

export default function YeniIlan() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  
  const categories = [
    { id: 'elektronik', name: 'Elektronik Eşya', subs: ['Cep Telefonu', 'Televizyon', 'Bilgisayar'] },
    { id: 'mobilya', name: 'Mobilya', subs: ['Koltuk Takımı', 'Yatak Odası', 'Mutfak'] },
    { id: 'oyuncak', name: 'Oyuncak', subs: ['Eğitici', 'Figür', 'Dış Mekan'] },
    { id: 'emlak', name: 'Emlak', subs: ['Konut', 'İş Yeri', 'Arsa'] },
    { id: 'oto', name: 'Otomobil', subs: ['Binek', 'Ticari', 'Motosiklet'] }
  ];

  const handleNext = () => setStep(step + 1);

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
        <h2 style={{ color: '#38bdf8' }}>ATAKASA İLAN MERKEZİ</h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Adım {step} / 4</p>
      </header>

      {/* ADIM 1: KAMERA VE MEDYA */}
      {step === 1 && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px' }}>Ürün Fotoğrafı ve Videosu</h3>
          <div style={{ border: '2px dashed #38bdf8', borderRadius: '15px', padding: '40px', marginBottom: '20px' }}>
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <span style={{ fontSize: '3rem' }}>📸</span>
              <p>Kamerayı Aç ve Çek (Resim/Video)</p>
              <input type="file" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} />
            </label>
          </div>
          <button onClick={handleNext} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold', width: '100%' }}>DEVAM ET</button>
        </div>
      )}

      {/* ADIM 2: KATEGORİ SEÇİMİ */}
      {step === 2 && (
        <div>
          <h3>Kategori Seçin</h3>
          <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); handleNext(); }}
                style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #38bdf8', padding: '15px', borderRadius: '10px', textAlign: 'left' }}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ADIM 3: AKILLI FORM (KATEGORİYE ÖZEL) */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Ürün Detayları</h3>
          <select style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }}>
            <option>Alt Kategori Seçin</option>
            {categories.find(c => c.id === category)?.subs.map(s => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="İlan Başlığı" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
          {(category === 'elektronik' || category === 'oto') && (
            <>
              <input placeholder="Marka" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
              <input placeholder="Model" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
              <input placeholder="Yıl" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
            </>
          )}
          <input placeholder="Takas/Satış Fiyatı (TL)" type="number" style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="İl" style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
            <input placeholder="İlçe" style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }} />
          </div>
          <button onClick={handleNext} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}>SON ADIMA GEÇ</button>
        </div>
      )}

      {/* ADIM 4: TESLİMAT VE YAYINLA */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>İşlem ve Teslimat Ayarları</h3>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px' }}>
            <p>İşlem Tipi:</p>
            <label><input type="checkbox" defaultChecked /> Takas </label>
            <label style={{ marginLeft: '10px' }}><input type="checkbox" defaultChecked /> Satış</label>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px' }}>
            <p>Teslimat:</p>
            <label><input type="checkbox" defaultChecked /> Gel-Al </label>
            <label style={{ marginLeft: '10px' }}><input type="checkbox" defaultChecked /> Kargo</label>
          </div>
          <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            <input type="checkbox" /> Mesafeli Satış Sözleşmesi'ni okudum, kabul ediyorum.
          </label>
          <button style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>İLANIMI YAYINLA 🚀</button>
        </div>
      )}
    </div>
  );
}
