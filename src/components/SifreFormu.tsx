"use client";
import { useState } from "react";

export default function SifreFormu({ token }: { token?: string }) {
  const [v, setV] = useState("");
  const [msg, setMsg] = useState("");
  const [bekle, setBekle] = useState(false);
  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setBekle(true); setMsg("");
    const res = await fetch(token ? "/api/auth/sifre-yenile" : "/api/auth/sifre-unuttum", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(token ? { token, yeniSifre: v } : { email: v }),
    });
    const j = await res.json().catch(() => ({}));
    setMsg(j.mesaj || j.hata || "Bir hata oluştu."); setBekle(false);
  }
  return (
    <form onSubmit={gonder} className="kart mx-auto max-w-md space-y-3 p-6">
      <h1 className="text-2xl font-bold">{token ? "Yeni şifre belirle" : "Şifremi unuttum"}</h1>
      <input className="girdi" type={token ? "password" : "email"} minLength={token ? 8 : undefined} placeholder={token ? "Yeni şifre (en az 8 karakter)" : "E-posta adresiniz"} value={v} onChange={(e) => setV(e.target.value)} required />
      <button className="btn w-full" disabled={bekle}>{bekle ? "..." : "Gönder"}</button>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </form>
  );
}
