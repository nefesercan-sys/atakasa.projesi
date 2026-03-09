"use client";

import { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState<string>("");
  const [hata, setHata] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [gonderildi, setGonderildi] = useState<boolean>(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setHata("");
    setLoading(true);
    try {
      const res = await fetch("/api/sifre-islemleri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setGonderildi(true);
      } else {
        setHata(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setHata("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">A-TAKASA</h1>
            <p className="text-[#C8A96E] text-sm font-semibold tracking-[0.25em] uppercase mt-1">Takas Platformu</p>
          </Link>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#2C5F2E] via-[#C8A96E] to-[#2C5F2E]" />
          <div className="p-8 pt-10">
            {!gonderildi ? (
              <>
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5F0E8] flex items-center justify-center mb-5 text-2xl">🔑</div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">Şifreni mi unuttun?</h2>
                  <p className="text-[#6B6B6B] mt-2 text-sm">E-posta adresini gir, sıfırlama bağlantısı gönderelim.</p>
                </div>
                {hata && (
                  <div className="mb-5 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">⚠️ {hata}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">E-posta Adresi</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      required
                      className="w-full bg-[#F8F6F2] border border-black/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2C5F2E] hover:bg-[#234D25] text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-5">✉️</div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">E-posta Gönderildi!</h2>
                <p className="text-[#6B6B6B] text-sm mb-2"><strong>{email}</strong> adresine bağlantı gönderildi.</p>
                <p className="text-[#ABABAB] text-xs mb-8">Spam klasörünü de kontrol et!</p>
                <button onClick={() => { setGonderildi(false); setEmail(""); }} className="text-[#C8A96E] text-sm font-semibold hover:underline">
                  Farklı e-posta dene
                </button>
              </div>
            )}
          </div>
          <div className="px-8 pb-8 flex items-center justify-between">
            <Link href="/giris" className="text-[#6B6B6B] text-sm hover:text-[#1A1A1A]">← Giriş Yap</Link>
            <Link href="/kayit" className="text-[#C8A96E] text-sm font-semibold hover:underline">Hesap Oluştur</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
