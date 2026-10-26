"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MedyaYukle from "@/components/MedyaYukle";
import { KATEGORILER } from "@/lib/kategoriler";
import { ILLER } from "@/lib/iller";

export default function IlanVer() {
  const { status } = useSession();
  const router = useRouter();
  const [f, setF] = useState({ baslik: "", aciklama: "", takasIstegi: "", kategori: "", sehir: "", ilce: "" });
  const [resimler, setResimler] = useState<string[]>([]);
  const [videolar, setVideolar] = useState<string[]>([]);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.replace("/giris?callbackUrl=/ilan-ver"); }, [status, router]);

  async function gonder(e: React.FormEvent) {
    e.preventDefault(); setHata("");
    if (resimler.length < 1) { setHata("En az 1 fotoğraf ekleyin."); return; }
    setYukleniyor(true);
    try {
      const r = await fetch("/api/ilanlar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, resimler, videolar }) });
      const j = await r.json();
      if (!r.ok) { setHata(j.error || "İlan yayınlanamadı."); return; }
      router.push(`/varlik/${j.slug || j.id}`);
    } catch { setHata("Bağlantı hatası, tekrar deneyin."); } finally { setYukleniyor(false); }
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  if (status === "loading") return <p className="py-10 text-center text-slate-500">Yükleniyor…</p>;
  if (status === "unauthenticated") return <p className="py-10 text-center">Giriş sayfasına yönlendiriliyorsunuz… <Link href="/giris" className="text-teal-700">Giriş yap</Link></p>;

  return (
    <form onSubmit={gonder} className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold">Ücretsiz takas ilanı ver</h1>
      <p className="mt-1 text-sm text-slate-600">Kullanmadığın bir ürünü ekle, karşılığında ne istediğini yaz.</p>
      <div className="card mt-4 space-y-4 p-4">
        <div><label className="label">Fotoğraf ve video *</label><MedyaYukle resimler={resimler} videolar={videolar} onResimler={setResimler} onVideolar={setVideolar} /></div>
        <div><label className="label" htmlFor="baslik">Ürün adı *</label><input id="baslik" required minLength={3} maxLength={100} value={f.baslik} onChange={set("baslik")} className="input" placeholder="Örn: Az kullanılmış bisiklet" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="kategori">Kategori *</label><select id="kategori" required value={f.kategori} onChange={set("kategori")} className="input"><option value="">Seçin</option>{KATEGORILER.map((k) => <option key={k.slug} value={k.slug}>{k.ad}</option>)}</select></div>
          <div><label className="label" htmlFor="sehir">Şehir *</label><select id="sehir" required value={f.sehir} onChange={set("sehir")} className="input"><option value="">Seçin</option>{ILLER.map((i) => <option key={i.slug} value={i.slug}>{i.ad}</option>)}</select></div>
        </div>
        <div><label className="label" htmlFor="ilce">İlçe</label><input id="ilce" maxLength={60} value={f.ilce} onChange={set("ilce")} className="input" /></div>
        <div><label className="label" htmlFor="aciklama">Açıklama</label><textarea id="aciklama" rows={4} maxLength={2000} value={f.aciklama} onChange={set("aciklama")} className="input" placeholder="Durumu, markası, boyutu, kullanım süresi…" /></div>
        <div><label className="label" htmlFor="istek">Karşılığında ne istiyorsun?</label><input id="istek" maxLength={300} value={f.takasIstegi} onChange={set("takasIstegi")} className="input" placeholder="Örn: Kitap, çocuk bisikleti, tost makinesi…" /></div>
      </div>
      {hata && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{hata}</p>}
      <button disabled={yukleniyor} className="btn btn-primary mt-4 w-full">{yukleniyor ? "Yayınlanıyor…" : "İlanı yayınla"}</button>
    </form>
  );
}
