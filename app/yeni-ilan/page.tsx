'use client';

import React, { useState } from 'react';

export default function YeniIlan() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    baslik: '', fiyat: '', kategori: '', altKategori: '', sehir: '', ilce: '', image: ''
  });

  const categories = [
    { id: 'elektronik', name: 'Elektronik Eşya', subs: ['Cep Telefonu', 'Televizyon', 'Bilgisayar'] },
    { id: 'mobilya', name: 'Mobilya', subs: ['Koltuk Takımı', 'Yatak Odası', 'Mutfak'] },
    { id: 'emlak', name: 'Emlak', subs: ['Konut', 'İş Yeri', 'Arsa'] },
    { id: 'oto', name: 'Otomobil', subs: ['Binek', 'Ticari', 'Motosiklet'] }
  ];

  // Fotoğrafı Base64 formatına çevirme (Cloudinary için)
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ilanlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert("🎉 İlanınız Başarıyla Yayında!");
        window.location.href = '/vitrin';
      }
    } catch (error) {
      alert("⚠️ Bir hata oluştu patron!");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#38bdf8' }}>ATAKASA İLAN MERKEZİ</h2>
        <p>Adım {step} / 4</p>
      </header>

      {/* ADIM 1: FOTOĞRAF ÇEKME */}
      {step === 1 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '2px dashed #38bdf8', borderRadius: '15px', padding: '40px', marginBottom: '20px' }}>
            <label style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '3rem' }}>📸</span>
              <p>{formData.image ? "Fotoğraf Hazır ✅" : "Kamerayı Aç ve Ürünü Çek"}</p>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>
          {formData.image && <button onClick={() => setStep(2)} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '10px', width: '100%', fontWeight: 'bold' }}>DEVAM ET</button>}
        </div>
      )}

      {/* ADIM 2: KATEGORİ */}
      {step === 2 && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => { setFormData({...formData, kategori: cat.id}); setStep(3); }}
              style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #38bdf8', padding: '15px', borderRadius: '10px' }}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ADIM 3: DETAYLAR */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <select onChange={(e) => setFormData({...formData, altKategori: e.target.value})} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white' }}>
            <option>Alt Kategori</option>
            {categories.find(c => c.id === formData.kategori)?.subs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input placeholder="İlan Başlığı" onChange={(e) => setFormData({...formData, baslik: e.target.value})} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white' }} />
          <input placeholder="Fiyat (TL)" type="number" onChange={(e) => setFormData({...formData, fiyat: e.target.value})} style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="İl" onChange={(e) => setFormData({...formData, sehir: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white' }} />
            <input placeholder="İlçe" onChange={(e) => setFormData({...formData, ilce: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', color: 'white' }} />
          </div>
          <button onClick={() => setStep(4)} style={{ backgroundColor: '#38bdf8', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}>SON ADIM</button>
        </div>
      )}

      {/* ADIM 4: ONAY VE MÜHÜR */}
      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
          <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '20px' }}>
            <input type="checkbox" required /> Mesafeli Satış Sözleşmesi'ni kabul ediyorum.
          </label>
          <button 
            disabled={loading}
            onClick={handleSubmit} 
            style={{ backgroundColor: loading ? '#334155' : '#10b981', color: 'white', border: 'none', padding: '20px', borderRadius: '10px', fontWeight: 'bold', width: '100%' }}>
            {loading ? "Siber İşlem Yapılıyor..." : "İLANIMI YAYINLA 🚀"}
          </button>
        </div>
      )}
    </div>
  );
}
