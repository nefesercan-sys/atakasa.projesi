"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Benim = { _id: string; baslik: string };

export default function TeklifFormu({ hedefId, benimIlanlar, girisli }: { hedefId: string; benimIlanlar: Benim[]; girisli: boolean }) {
  const r = useRouter();
  const [secim, setSecim] = useState(benimIlanlar[0]?._id || "");
  const [mesaj, setMesaj] = useState("");
  const [sonuc, setSonuc] = useState<{ ok: boolean; m: string } | null>(null);
  const [bekle, setBekle] = useState(false);

  if (!girisli) return <Link href="/giris" className="btn w-full">Takas teklif etmek için giriş yap</Link>;
  if (!benimIlanlar.length) return <Link href="/ilan-ver" className="btn w-full">Önce takas edeceğin bir ilan ver</Link>;

  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setBekle(true); setSonuc(null);
    const res = await fetch("/api/teklifler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hedefIlan: hedefId, teklifIlan: secim, mesaj }) });
    const j = await res.json().catch(() => ({}));
    setBekle(false);
    if (res.ok) { setSonuc({ ok: true, m: "Teklifin gönderildi! Panelinden takip edebilirsin." }); r.refresh(); }
    else setSonuc({ ok: false, m: j.hata || "Teklif gönderilemedi." });
  }

  return (
    <form onSubmit={gonder} className="space-y-2">
      <label className="text-sm font-semibold">Karşılığında hangi ilanını öneriyorsun?</label>
      <select className="girdi" value={secim} onChange={(e) => setSecim(e.target.value)}>
        {benimIlanlar.map((i) => <option key={i._id} value={i._id}>{i.baslik}</option>)}
      </select>
      <textarea className="girdi" rows={2} placeholder="Mesaj (isteğe bağlı)" maxLength={500} value={mesaj} onChange={(e) => setMesaj(e.target.value)} />
      <button className="btn w-full" disabled={bekle}>{bekle ? "..." : "🔁 Takas teklif et"}</button>
      {sonuc && <p className={`text-sm ${sonuc.ok ? "text-marka-koyu" : "text-red-600"}`}>{sonuc.m}</p>}
    </form>
  );
}
