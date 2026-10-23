"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KimlikFormu({ mod }: { mod: "giris" | "kayit" }) {
  const r = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", telefon: "" });
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata(""); setBekle(true);
    if (mod === "kayit") {
      const res = await fetch("/api/kayit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await res.json();
      if (!res.ok) { setHata(j.hata || "Kayıt başarısız."); setBekle(false); return; }
    }
    const s = await signIn("credentials", { email: f.email, password: f.password, redirect: false });
    setBekle(false);
    if (s?.error) { setHata("E-posta veya şifre hatalı."); return; }
    r.push("/panel"); r.refresh();
  }

  return (
    <form onSubmit={gonder} className="kart mx-auto max-w-md space-y-3 p-6">
      <h1 className="text-2xl font-bold">{mod === "giris" ? "Giriş yap" : "Ücretsiz üye ol"}</h1>
      {mod === "kayit" && <input className="girdi" placeholder="Adınız" value={f.name} onChange={set("name")} required />}
      <input className="girdi" type="email" placeholder="E-posta" value={f.email} onChange={set("email")} required autoComplete="email" />
      <input className="girdi" type="password" placeholder="Şifre (en az 8 karakter)" value={f.password} onChange={set("password")} required minLength={8} autoComplete={mod === "giris" ? "current-password" : "new-password"} />
      {mod === "kayit" && <input className="girdi" type="tel" placeholder="Telefon (takas kabul edilince karşı tarafa görünür)" value={f.telefon} onChange={set("telefon")} />}
      {hata && <p className="text-sm text-red-600">{hata}</p>}
      <button className="btn w-full" disabled={bekle}>{bekle ? "..." : mod === "giris" ? "Giriş yap" : "Üye ol"}</button>
      {mod === "giris" ? (
        <p className="text-center text-sm text-gray-600">
          <Link href="/sifremi-unuttum" className="underline">Şifremi unuttum</Link> · <Link href="/kayit" className="underline">Üye ol</Link>
        </p>
      ) : (
        <p className="text-center text-sm text-gray-600">Zaten üye misiniz? <Link href="/giris" className="underline">Giriş yap</Link></p>
      )}
    </form>
  );
}
