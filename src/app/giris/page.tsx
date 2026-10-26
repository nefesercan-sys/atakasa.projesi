"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Form() {
  const sp = useSearchParams();
  const hedefHam = sp.get("callbackUrl") || "/panel";
  const hedef = hedefHam.startsWith("/") && !hedefHam.startsWith("//") ? hedefHam : "/panel"; // açık yönlendirme engeli
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [hata, setHata] = useState(""); const [yuk, setYuk] = useState(false);
  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setHata(""); setYuk(true);
    const r = await signIn("credentials", { email, password, redirect: false });
    setYuk(false);
    if (r?.ok) window.location.href = hedef; else setHata("E-posta veya şifre hatalı.");
  }
  return (
    <form onSubmit={gonder} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-extrabold">Giriş yap</h1>
      <div><label className="label" htmlFor="e">E-posta</label><input id="e" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></div>
      <div><label className="label" htmlFor="p">Şifre</label><input id="p" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></div>
      {hata && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{hata}</p>}
      <button disabled={yuk} className="btn btn-primary w-full">{yuk ? "Giriş yapılıyor…" : "Giriş yap"}</button>
      <div className="flex justify-between text-sm"><Link href="/sifremi-unuttum" className="text-slate-600 hover:underline">Şifremi unuttum</Link><Link href="/kayit" className="font-semibold text-teal-700">Üye ol</Link></div>
    </form>
  );
}
export default function Giris() { return <Suspense fallback={null}><Form /></Suspense>; }
