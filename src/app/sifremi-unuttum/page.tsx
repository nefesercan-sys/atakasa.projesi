"use client";
import { useState } from "react";
import Link from "next/link";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState(""); const [mesaj, setMesaj] = useState(""); const [yuk, setYuk] = useState(false);
  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setYuk(true); setMesaj("");
    try {
      const r = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json(); setMesaj(j.message || j.error || "");
    } catch { setMesaj("Bağlantı hatası."); } finally { setYuk(false); }
  }
  return (
    <form onSubmit={gonder} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-extrabold">Şifremi unuttum</h1>
      <p className="text-sm text-slate-600">E-postanızı yazın, şifre yenileme bağlantısı gönderelim.</p>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="E-posta" autoComplete="email" />
      {mesaj && <p className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{mesaj}</p>}
      <button disabled={yuk} className="btn btn-primary w-full">{yuk ? "Gönderiliyor…" : "Bağlantı gönder"}</button>
      <p className="text-center text-sm"><Link href="/giris" className="text-slate-600 hover:underline">← Girişe dön</Link></p>
    </form>
  );
}
