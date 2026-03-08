'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: '⚡ Şifre sıfırlama sinyali e-postanıza gönderildi!', type: 'success' });
        setEmail('');
      } else {
        setMessage({ text: data.error || 'Bir hata oluştu.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Sinyal koptu, lütfen tekrar deneyin.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#00f260] selection:text-black">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-[#00f260] blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,242,96,0.1)] relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
            <span className="text-white">ŞİFREMİ</span> <span className="text-[#00f260]">UNUTTUM.</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">Siber Kurtarma Protokolü</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block mb-2">Kayıtlı E-Posta Adresiniz</label>
            <input 
              type="email" 
              placeholder="ornek@atakasa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#030712] border border-white/10 text-white p-4 rounded-2xl outline-none focus:border-[#00f260] transition-colors"
            />
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-[#00f260]/10 text-[#00f260] border-[#00f260]/20'}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'SİNYAL GÖNDERİLİYOR...' : 'KURTARMA BAĞLANTISI GÖNDER 🚀'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <Link href="/giris" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            ← Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
