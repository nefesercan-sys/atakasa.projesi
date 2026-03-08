'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage({ text: 'Şifreler birbiriyle eşleşmiyor!', type: 'error' });
    }
    if (password.length < 6) {
      return setMessage({ text: 'Şifre en az 6 karakter olmalıdır.', type: 'error' });
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        setMessage({ text: '⚡ Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...', type: 'success' });
        setTimeout(() => router.push('/giris'), 3000);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Geçersiz veya süresi dolmuş bağlantı.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Sinyal koptu, lütfen tekrar deneyin.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl z-10 relative">
        <h2 className="text-white font-black uppercase text-xl mb-2">Güvenlik İhlali</h2>
        <p className="text-slate-500 text-xs tracking-widest uppercase">Sıfırlama anahtarı bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,242,96,0.1)] relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
          <span className="text-white">ŞİFRE</span> <span className="text-[#00f260]">YENİLE.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block mb-2">Yeni Şifreniz</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#030712] border border-white/10 text-white p-4 rounded-2xl outline-none focus:border-[#00f260] transition-colors"
          />
        </div>
        <div>
          <label className="text-white/50 text-[10px] font-black uppercase tracking-widest block mb-2">Tekrar Yeni Şifreniz</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          className="w-full mt-4 bg-[#00f260] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,96,0.3)] disabled:opacity-50"
        >
          {loading ? 'KİLİT AÇILIYOR...' : 'KİLİDİ GÜNCELLE 🔒'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#00f260] selection:text-black">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-[#00f260] blur-[150px] rounded-full"></div>
      </div>
      <Suspense fallback={<div className="text-[#00f260] font-black uppercase tracking-widest animate-pulse z-10 relative">Sinyal Aranıyor...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
