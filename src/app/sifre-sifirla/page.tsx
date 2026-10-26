"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Form() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState(""); const [mesaj, setMesaj] = useState(""); const [ok, setOk] = useState(false); const [yuk, setYuk] = useState(false);
  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setYuk(true); setMesaj("");
    try {
      const r = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const j = await r.json(); setOk(r.ok); setMesaj(j.message || j.error || "");
    } catch { setMesaj("Bağlantı hatası."); } finally { setYuk(false); }
  }
  return (
    <form onSubmit={gonder} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-extrabold">Yeni şifre belirle</h1>
      <input type="password" required minLength={8} maxLength={100} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Yeni şifre (en az 8 karakter)" autoComplete="new-password" />
      {mesaj && <p className={`rounded-xl p-3 text-sm ${ok ? "bg-teal-50 text-teal-800" : "bg-rose-50 text-rose-700"}`}>{mesaj}</p>}
      {ok ? <Link href="/giris" className="btn btn-primary w-full">Giriş yap</Link> : <button disabled={yuk || !token} className="btn btn-primary w-full">{yuk ? "Kaydediliyor…" : "Şifreyi güncelle"}</button>}
    </form>
  );
}
export default function SifreSifirla() { return <Suspense fallback={null}><Form /></Suspense>; }
