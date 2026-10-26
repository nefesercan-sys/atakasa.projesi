"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Kayit() {
  const [f, setF] = useState({ name: "", email: "", telefon: "", password: "" });
  const [hata, setHata] = useState(""); const [yuk, setYuk] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setHata(""); setYuk(true);
    try {
      const r = await fetch("/api/kayit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok) { setHata(j.error || "Kayıt yapılamadı."); return; }
      const g = await signIn("credentials", { email: f.email, password: f.password, redirect: false });
      window.location.href = g?.ok ? "/ilan-ver" : "/giris";
    } catch { setHata("Bağlantı hatası."); } finally { setYuk(false); }
  }
  return (
    <form onSubmit={gonder} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-extrabold">Ücretsiz üye ol</h1>
      <div><label className="label" htmlFor="n">Ad Soyad</label><input id="n" required minLength={2} maxLength={80} autoComplete="name" value={f.name} onChange={set("name")} className="input" /></div>
      <div><label className="label" htmlFor="e">E-posta</label><input id="e" type="email" required autoComplete="email" value={f.email} onChange={set("email")} className="input" /></div>
      <div><label className="label" htmlFor="t">Telefon (isteğe bağlı)</label><input id="t" type="tel" maxLength={20} autoComplete="tel" value={f.telefon} onChange={set("telefon")} className="input" placeholder="Yalnızca takas kabul edilince karşı tarafa görünür" /></div>
      <div><label className="label" htmlFor="p">Şifre (en az 8 karakter)</label><input id="p" type="password" required minLength={8} maxLength={100} autoComplete="new-password" value={f.password} onChange={set("password")} className="input" /></div>
      {hata && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{hata}</p>}
      <button disabled={yuk} className="btn btn-primary w-full">{yuk ? "Kaydediliyor…" : "Üye ol"}</button>
      <p className="text-xs text-slate-500">Üye olarak <Link href="/sozlesme" className="underline">kullanım şartlarını</Link> kabul edersiniz.</p>
      <p className="text-center text-sm">Zaten üye misiniz? <Link href="/giris" className="font-semibold text-teal-700">Giriş yap</Link></p>
    </form>
  );
}
