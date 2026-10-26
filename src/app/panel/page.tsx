"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { kucuk, videoKapak } from "@/lib/medya";

interface Ilan { _id: string; baslik: string; slug?: string; resimler?: string[]; videolar?: string[]; durum?: string; aktif?: boolean }
interface Teklif {
  _id: string; yon: "gelen" | "giden"; durum: "bekliyor" | "kabul" | "red" | "iptal" | "tamamlandi"; mesaj: string;
  hedefBaslik?: string; hedefResim?: string; teklifBaslik?: string; teklifResim?: string; hedefIlan: string; teklifIlan: string;
  benOnayladim: boolean; karsiOnayladi: boolean; karsiAd: string; karsiIletisim: { telefon: string; email: string } | null;
}
const DURUM: Record<string, { ad: string; renk: string }> = {
  bekliyor: { ad: "Yanıt bekliyor", renk: "bg-amber-100 text-amber-800" }, kabul: { ad: "Kabul edildi", renk: "bg-teal-100 text-teal-800" },
  red: { ad: "Reddedildi", renk: "bg-rose-100 text-rose-700" }, iptal: { ad: "İptal edildi", renk: "bg-slate-200 text-slate-700" }, tamamlandi: { ad: "Takas tamamlandı", renk: "bg-emerald-100 text-emerald-800" },
};
const kapakOf = (i: Ilan) => (i.resimler?.[0] ? kucuk(i.resimler[0], 200, 150) : i.videolar?.[0] ? videoKapak(i.videolar[0]) : "");

export default function Panel() {
  const { status } = useSession();
  const router = useRouter();
  const [sekme, setSekme] = useState<"ilanlar" | "gelen" | "giden">("gelen");
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [yuk, setYuk] = useState(true);
  const [hata, setHata] = useState("");

  const yenile = useCallback(async () => {
    const [a, b] = await Promise.all([fetch("/api/ilanlar?benim=1&limit=48"), fetch("/api/takaslar")]);
    if (a.ok) setIlanlar((await a.json()).liste || []);
    if (b.ok) setTeklifler(await b.json());
    setYuk(false);
  }, []);
  useEffect(() => { if (status === "unauthenticated") router.replace("/giris?callbackUrl=/panel"); if (status === "authenticated") yenile(); }, [status, router, yenile]);

  async function islem(id: string, islem: string, onay?: string) {
    if (onay && !confirm(onay)) return;
    setHata("");
    const r = await fetch(`/api/takaslar/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ islem }) });
    if (!r.ok) setHata((await r.json()).error || "İşlem yapılamadı.");
    yenile();
  }
  async function ilanAktif(i: Ilan, aktif: boolean) {
    const r = await fetch(`/api/ilanlar/${i._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aktif }) });
    if (!r.ok) setHata((await r.json()).error || "İşlem yapılamadı."); yenile();
  }
  async function ilanSil(i: Ilan) {
    if (!confirm(`"${i.baslik}" silinsin mi?`)) return;
    const r = await fetch(`/api/ilanlar/${i._id}`, { method: "DELETE" });
    if (!r.ok) setHata((await r.json()).error || "Silinemedi."); yenile();
  }

  if (status === "loading" || (status === "authenticated" && yuk)) return <p className="py-10 text-center text-slate-500">Yükleniyor…</p>;
  const gelen = teklifler.filter((t) => t.yon === "gelen"); const giden = teklifler.filter((t) => t.yon === "giden");
  const bekleyenGelen = gelen.filter((t) => t.durum === "bekliyor").length;
  const liste = sekme === "gelen" ? gelen : giden;

  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Panelim</h1><Link href="/ilan-ver" className="btn btn-primary !py-2">+ İlan ver</Link></div>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {([["gelen", `Gelen teklifler${bekleyenGelen ? ` (${bekleyenGelen})` : ""}`], ["giden", "Giden tekliflerim"], ["ilanlar", `İlanlarım (${ilanlar.length})`]] as const).map(([k, ad]) => (
          <button key={k} onClick={() => setSekme(k)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${sekme === k ? "bg-teal-700 text-white" : "bg-white text-slate-700 border border-slate-300"}`}>{ad}</button>
        ))}
      </div>
      {hata && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{hata}</p>}

      {sekme === "ilanlar" ? (
        <div className="mt-4 space-y-3">
          {ilanlar.length === 0 && <div className="card p-6 text-center text-slate-600">Henüz ilanınız yok. <Link href="/ilan-ver" className="font-semibold text-teal-700">İlk ilanını ver →</Link></div>}
          {ilanlar.map((i) => (
            <div key={i._id} className="card flex gap-3 p-3">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">{kapakOf(i) && <img src={kapakOf(i)} alt="" className="h-full w-full object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <Link href={`/varlik/${i.slug || i._id}`} className="line-clamp-2 font-semibold hover:underline">{i.baslik}</Link>
                <p className="mt-1 text-xs text-slate-500">{i.durum === "takasta" ? "🔁 Takas sürecinde" : i.durum === "takasEdildi" ? "✅ Takas edildi" : i.aktif === false ? "⏸ Yayında değil" : "🟢 Yayında"}</p>
                {(!i.durum || i.durum === "aktif") && (
                  <div className="mt-2 flex gap-2 text-xs">
                    <button onClick={() => ilanAktif(i, i.aktif === false)} className="rounded-lg border border-slate-300 px-3 py-1.5">{i.aktif === false ? "Yayınla" : "Yayından kaldır"}</button>
                    <button onClick={() => ilanSil(i)} className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700">Sil</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {liste.length === 0 && <div className="card p-6 text-center text-slate-600">{sekme === "gelen" ? "Henüz size gelen teklif yok." : <>Henüz teklif vermediniz. <Link href="/ilanlar" className="font-semibold text-teal-700">İlanlara göz at →</Link></>}</div>}
          {liste.map((t) => {
            const d = DURUM[t.durum];
            const benimUrun = t.yon === "gelen" ? { b: t.hedefBaslik, r: t.hedefResim } : { b: t.teklifBaslik, r: t.teklifResim };
            const karsiUrun = t.yon === "gelen" ? { b: t.teklifBaslik, r: t.teklifResim } : { b: t.hedefBaslik, r: t.hedefResim };
            return (
              <div key={t._id} className="card p-3">
                <div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${d.renk}`}>{d.ad}</span><span className="text-xs text-slate-500">{t.karsiAd}</span></div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  {[benimUrun, karsiUrun].map((u, idx) => (
                    <div key={idx} className={idx === 1 ? "order-3" : ""}>
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">{u.r && <img src={kucuk(u.r, 300, 225)} alt="" className="h-full w-full object-cover" />}</div>
                      <p className="mt-1 line-clamp-2 text-xs font-medium">{idx === 0 ? "Sizin: " : "Karşı taraf: "}{u.b}</p>
                    </div>
                  ))}
                  <span className="order-2 text-xl">🔁</span>
                </div>
                {t.mesaj && <p className="mt-3 rounded-xl bg-slate-50 p-2 text-sm text-slate-700">💬 {t.mesaj}</p>}
                {t.karsiIletisim && (
                  <div className="mt-3 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">
                    <p className="font-semibold">İletişim: {t.karsiAd}</p>
                    {t.karsiIletisim.telefon && <p>📞 <a href={`tel:${t.karsiIletisim.telefon}`} className="underline">{t.karsiIletisim.telefon}</a></p>}
                    <p>✉️ <a href={`mailto:${t.karsiIletisim.email}`} className="underline">{t.karsiIletisim.email}</a></p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.durum === "bekliyor" && t.yon === "gelen" && (<><button onClick={() => islem(t._id, "kabul")} className="btn btn-primary !py-2">Kabul et</button><button onClick={() => islem(t._id, "red", "Teklif reddedilsin mi?")} className="btn btn-ghost !py-2">Reddet</button></>)}
                  {t.durum === "bekliyor" && t.yon === "giden" && <button onClick={() => islem(t._id, "iptal", "Teklif geri çekilsin mi?")} className="btn btn-ghost !py-2">Teklifi geri çek</button>}
                  {t.durum === "kabul" && (
                    <>
                      {t.benOnayladim ? <span className="self-center text-sm text-slate-600">{t.karsiOnayladi ? "" : "Karşı tarafın onayı bekleniyor…"}</span> : <button onClick={() => islem(t._id, "tamamla", "Takası gerçekten yaptınız mı? Onayınız karşı tarafa bildirilir.")} className="btn btn-primary !py-2">✅ Takas yapıldı</button>}
                      <button onClick={() => islem(t._id, "iptal", "Takas iptal edilsin mi? İlanlar yeniden yayına döner.")} className="btn btn-ghost !py-2">Takası iptal et</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
