"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MedyaYukle from "./MedyaYukle";
import { KATEGORILER } from "@/lib/kategoriler";
import { ILLER } from "@/lib/iller";

export default function IlanFormu() {
  const r = useRouter();
  const [f, setF] = useState({ baslik: "", aciklama: "", kategori: "", sehir: "", ilce: "", takasIstegi: "" });
  const [resimler, setResimler] = useState<string[]>([]);
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setHata(""); setBekle(true);
    const res = await fetch("/api/ilanlar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, resimler }) });
    const j = await res.json().catch(() => ({}));
    setBekle(false);
    if (res.status === 401) { r.push("/giris"); return; }
    if (!res.ok) { setHata(j.hata || "İlan yayınlanamadı."); return; }
    r.push(`/ilan/${j.slug}`);
  }

  return (
    <form onSubmit={gonder} className="kart mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Takas ilanı ver</h1>
      <p className="text-sm text-gray-600">İhtiyacın olmayan eşyanı ekle. Ücretsiz, satış yok: sadece takas.</p>
      <MedyaYukle deger={resimler} onDegis={setResimler} />
      <input className="girdi" placeholder="Başlık (ör. Çocuk bisikleti 16 jant)" value={f.baslik} onChange={set("baslik")} maxLength={100} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="girdi" value={f.kategori} onChange={set("kategori")} required>
          <option value="">Kategori</option>
          {KATEGORILER.map((k) => <option key={k.slug} value={k.slug}>{k.emoji} {k.ad}</option>)}
        </select>
        <select className="girdi" value={f.sehir} onChange={set("sehir")} required>
          <option value="">Şehir</option>
          {ILLER.map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>
      <input className="girdi" placeholder="İlçe (isteğe bağlı)" value={f.ilce} onChange={set("ilce")} maxLength={40} />
      <textarea className="girdi" rows={4} placeholder="Açıklama: durumu, kullanım süresi, kusurları..." value={f.aciklama} onChange={set("aciklama")} maxLength={2000} />
      <input className="girdi" placeholder="Karşılığında ne istiyorsun? (ör. Kitap, küçük ev aletleri)" value={f.takasIstegi} onChange={set("takasIstegi")} maxLength={300} />
      {hata && <p className="text-sm text-red-600">{hata}</p>}
      <button className="btn w-full" disabled={bekle || resimler.length === 0}>{bekle ? "Yayınlanıyor..." : "İlanı yayınla"}</button>
    </form>
  );
}
