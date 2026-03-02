"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GirisEkrani() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleGiris = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Siber Erişim Reddedildi!");
    else router.push("/panel");
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b0f19] border border-[#38bdf8]/20 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(56,189,248,0.1)]">
        <h1 className="text-4xl font-black text-center text-white italic mb-2 uppercase">ATAKASA</h1>
        <p className="text-[#38bdf8] text-[10px] text-center font-bold tracking-[0.3em] mb-10 uppercase">Güvenli Teminatlı Takas Sistemi</p>
        <form onSubmit={handleGiris} className="space-y-6">
          <input required type="email" placeholder="SİBER E-POSTA" className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-[#38bdf8]" onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="ŞİFRE" className="w-full bg-[#030712] border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-[#38bdf8]" onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
          <button type="submit" className="w-full bg-[#38bdf8] text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">SİSTEME GİRİŞ YAP</button>
        </form>
      </div>
    </div>
  );
}
