"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { kucuk } from "@/lib/medya";

interface Benim { _id: string; baslik: string; resimler?: string[]; durum?: string; aktif?: boolean }

export default function TeklifButonu({ hedefId, saticiId, musait }: { hedefId: string; saticiId: string; musait: boolean }) {
  const { data: session, status } = useSession();
  const benimId = (session?.user as { id?: string } | undefined)?.id;
  const [acik, setAcik] = useState(false);
  const [liste, setListe] = useState<Benim[] | null>(null);
  const [secili, setSecili] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [bitti, setBitti] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);

  if (!musait) return <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Bu ilan şu an takasa açık değil.</p>;
  if (status === "loading") return null;
  if (!benimId) return <Link href={`/giris?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`} className="btn btn-primary w-full">Takas teklif etmek için giriş yap</Link>;
  if (benimId === saticiId) return <Link href="/panel" className="btn btn-ghost w-full">Bu sizin ilanınız · Panelde yönet</Link>;

  async function ac() {
    setAcik(true); setHata("");
    if (liste) return;
    const r = await fetch("/api/ilanlar?benim=1&limit=48");
    const j = await r.json();
    setListe(((j.liste || []) as Benim[]).filter((i) => i.aktif !== false && (!i.durum || i.durum === "aktif")));
  }
  async function gonder() {
    setHata(""); if (!secili) { setHata("Teklif edeceğiniz ürünü seçin."); return; }
    setGonderiyor(true);
    try {
      const r = await fetch("/api/takaslar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hedefIlanId: hedefId, teklifIlanId: secili, mesaj }) });
      const j = await r.json();
      if (!r.ok) setHata(j.error || "Teklif gönderilemedi."); else setBitti(true);
    } catch { setHata("Bağlantı hatası."); } finally { setGonderiyor(false); }
  }

  if (bitti) return <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">✅ Teklifiniz gönderildi. Yanıtı <Link href="/panel" className="font-semibold underline">Panelim</Link>'de görürsünüz.</p>;
  return (
    <>
      <button onClick={ac} className="btn btn-primary w-full">🔁 Takas teklif et</button>
      {acik && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setAcik(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Hangi ürününü teklif ediyorsun?</h2><button onClick={() => setAcik(false)} className="text-2xl text-slate-400" aria-label="Kapat">×</button></div>
            {liste === null ? <p className="py-6 text-center text-slate-500">Yükleniyor…</p> : liste.length === 0 ? (
              <div className="py-6 text-center"><p className="text-slate-600">Takasa açık ilanınız yok. Önce bir ilan verin.</p><Link href="/ilan-ver" className="btn btn-primary mt-3">+ İlan ver</Link></div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {liste.map((i) => (
                    <button key={i._id} type="button" onClick={() => setSecili(i._id)} className={`overflow-hidden rounded-xl border-2 text-left ${secili === i._id ? "border-teal-600" : "border-slate-200"}`}>
                      <div className="aspect-[4/3] bg-slate-100">{i.resimler?.[0] && <img src={kucuk(i.resimler[0], 300, 225)} alt="" className="h-full w-full object-cover" />}</div>
                      <p className="line-clamp-2 p-2 text-xs font-medium">{i.baslik}</p>
                    </button>
                  ))}
                </div>
                <label className="label mt-4" htmlFor="tmesaj">Mesaj (isteğe bağlı)</label>
                <textarea id="tmesaj" rows={3} maxLength={500} value={mesaj} onChange={(e) => setMesaj(e.target.value)} className="input" placeholder="Kendi ürününüzü kısaca anlatın…" />
                {hata && <p className="mt-2 text-sm text-rose-600">{hata}</p>}
                <button onClick={gonder} disabled={gonderiyor} className="btn btn-primary mt-4 w-full">{gonderiyor ? "Gönderiliyor…" : "Teklifi gönder"}</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
