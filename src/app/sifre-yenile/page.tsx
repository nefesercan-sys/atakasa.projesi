"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SifreYenileForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [yeniSifre, setYeniSifre] = useState<string>("");
  const [tekrarSifre, setTekrarSifre] = useState<string>("");
  const [hata, setHata] = useState<string>("");
  const [mesaj, setMesaj] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [tamamlandi, setTamamlandi] = useState<boolean>(false);
  const [goster1, setGoster1] = useState<boolean>(false);
  const [goster2, setGoster2] = useState<boolean>(false);

  useEffect(() => {
    if (!token || !email) {
      setHata("Geçersiz şifre sıfırlama bağlantısı.");
    }
  }, [token, email]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setHata("");
    setMesaj("");

    if (yeniSifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (yeniSifre !== tekrarSifre) {
      setHata("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sifre-yenile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, yeniSifre }),
      });
      const data = await res.json();

      if (res.ok) {
        setTamamlandi(true);
        setMesaj(data.message);
        setTimeout(() => router.push("/giris"), 3000);
      } else {
        setHata(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setHata("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const sifreGucuHesapla = (
    sifre: string
  ): { guc: number; renk: string; label: string } => {
    let guc = 0;
    if (sifre.length >= 6) guc++;
    if (sifre.length >= 10) guc++;
    if (/[A-Z]/.test(sifre)) guc++;
    if (/[0-9]/.test(sifre)) guc++;
    if (/[^A-Za-z0-9]/.test(sifre)) guc++;
    if (guc <= 1) return { guc, renk: "#EF4444", label: "Zayıf" };
    if (guc <= 3) return { guc, renk: "#F59E0B", label: "Orta" };
    return { guc, renk: "#2C5F2E", label: "Güçlü" };
  };

  const sifreGuc = sifreGucuHesapla(yeniSifre);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C8A96E]/10" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#2C5F2E]/10" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">
              A-TAKASA
            </h1>
            <p className="text-[#C8A96E] text-sm font-semibold tracking-[0.25em] uppercase mt-1">
              Takas Platformu
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#2C5F2E] via-[#C8A96E] to-[#2C5F2E]" />

          <div className="p-8 pt-10">
            {!tamamlandi ? (
              <>
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5F0E8] flex items-center justify-center mb-5 text-2xl">
                    🔒
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] leading-tight">
                    Yeni Şifre Belirle
                  </h2>
                  <p className="text-[#6B6B6B] mt-2 text-sm leading-relaxed">
                    {email && (
                      <span>
                        <strong className="text-[#1A1A1A]">{email}</strong>{" "}
                        hesabı için yeni şifrenizi belirleyin.
                      </span>
                    )}
                  </p>
                </div>

                {hata && (
                  <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                    <span className="mt-0.5">⚠️</span>
                    <span>{hata}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Yeni Şifre */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <input
                        type={goster1 ? "text" : "password"}
                        value={yeniSifre}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setYeniSifre(e.target.value)
                        }
                        placeholder="En az 6 karakter"
                        required
                        className="w-full bg-[#F8F6F2] border border-black/10 rounded-xl px-4 py-3.5 pr-12 text-[#1A1A1A] text-sm placeholder:text-[#ABABAB] outline-none focus:border-[#C8A96E] focus:ring-2 focus:ring-[#C8A96E]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setGoster1(!goster1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#1A1A1A] transition-colors text-lg"
                      >
                        {goster1 ? "🙈" : "👁️"}
                      </button>
                    </div>

                    {/* Şifre güç göstergesi */}
                    {yeniSifre.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background:
