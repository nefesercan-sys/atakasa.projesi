"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onizleme } from "@/lib/medya";

type Ilan = { _id: string; baslik: string; slug: string; durum: string; resimler: string[]; teklifSayisi: number };
type Ozet = { _id?: unknown; baslik?: string; slug?: string; resimler?: string[] };
export type PanelTeklif = {
  id: string; yon: "gelen" | "gonderilen"; durum: string; mesaj?: string; benOnayladim: boolean; karsiOnayladi: boolean;
  hedefIlan: Ozet; teklifIlan: Ozet; karsiTaraf: { ad: string; telefon?: string; email?: string };
};

const DURUM: Record<string, string> = { bekliyor: "⏳ Bekliyor", kabul: "🤝 Kabul edildi", tamamlandi: "✅ Tamamlandı", red: "❌ Reddedildi", iptal: "🚫 İptal", aktif: "Yayında", pasif: "Durduruldu", takasta: "Takasta", takas_oldu: "Takas edildi" };

export default function PanelClient({ ilanlar, teklifler }: { ilanlar: Ilan[]; teklifler: PanelTeklif[] }) {
  const r = useRouter();
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState("");

  async function cagir(url: string, yontem: string, body?: unknown, onay?: string) {
    if (onay && !confirm(onay)) return;
    setHata(""); setBekle(url);
    const res = await fetch(url, { method: yontem, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await res.json().catch(() => ({}));
    setBekle("");
    if (!res.ok) setHata(j.hata || "İşlem başarısız.");
    r.refresh();
  }

  const gelen = teklifler.filter((t) => t.yon === "gelen");
  const giden = teklifler.filter((t) => t.yon === "gonderilen");

  const TeklifSatiri = ({ t }: { t: PanelTeklif }) => {
    const url = `/api/teklifler/${t.id}`;
    const islem = (islem: string, onay?: string) => cagir(url, "PATCH", { islem }, onay);
    const ben = t.yon === "gelen" ? t.hedefIlan : t.teklifIlan; // benim ilanım
    const onlar = t.yon === "gelen" ? t.teklifIlan : t.hedefIlan; // karşı tarafın ilanı
    return (
      <div className="kart space-y-2 p-3">
        <div className="flex items-center gap-3 text-sm">
          {[ben, onlar].map((x, k) => (
            <div key={k} className="flex min-w-0 flex-1 items-center gap-2">
              {x.resimler?.[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={onizleme(x.resimler[0], 120)} alt="" className="h-12 w-12 rounded object-cover" />}
              <div className="min-w-0"><p className="text-xs text-gray-500">{k ? `${t.karsiTaraf.ad} verir` : "Sen verirsin"}</p><Link href={`/ilan/${x.slug}`} className="line-clamp-1 font-medium underline">{x.baslik}</Link></div>
              {k === 0 && <span className="text-lg">🔁</span>}
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold">{DURUM[t.durum] || t.durum}</p>
        {t.mesaj && <p className="rounded bg-gray-50 p-2 text-sm">“{t.mesaj}”</p>}
        {(t.durum === "kabul" || t.durum === "tamamlandi") && (
          <p className="rounded bg-marka-acik p-2 text-sm">📞 {t.karsiTaraf.ad}: {t.karsiTaraf.telefon || "telefon girilmemiş"} · {t.karsiTaraf.email}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {t.durum === "bekliyor" && t.yon === "gelen" && (<><button className="btn !py-1.5" disabled={!!bekle} onClick={() => islem("kabul")}>Kabul et</button><button className="btn-ikinci !py-1.5" disabled={!!bekle} onClick={() => islem("red")}>Reddet</button></>)}
          {t.durum === "bekliyor" && t.yon === "gonderilen" && <button className="btn-ikinci !py-1.5" disabled={!!bekle} onClick={() => islem("iptal", "Teklifi geri çekmek istiyor musun?")}>Geri çek</button>}
          {t.durum === "kabul" && (
            <>
              {t.benOnayladim ? <span className="text-sm text-gray-600">Onayın alındı{t.karsiOnayladi ? "" : ", karşı tarafın onayı bekleniyor"}.</span> : <button className="btn !py-1.5" disabled={!!bekle} onClick={() => islem("onayla", "Eşyaları teslim aldın/verdin mi? 'Takas gerçekleşti' onayı geri alınamaz.")}>✅ Takas gerçekleşti</button>}
              <button className="btn-ikinci !py-1.5" disabled={!!bekle} onClick={() => islem("iptal", "Takastan vazgeçmek istiyor musun? İlanlar yeniden yayına alınır.")}>Vazgeç</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {hata && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{hata}</p>}

      <section>
        <h2 className="mb-2 text-lg font-bold">Gelen teklifler ({gelen.length})</h2>
        <div className="space-y-3">{gelen.length ? gelen.map((t) => <TeklifSatiri key={t.id} t={t} />) : <p className="text-sm text-gray-500">Henüz teklif yok.</p>}</div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Gönderdiğim teklifler ({giden.length})</h2>
        <div className="space-y-3">{giden.length ? giden.map((t) => <TeklifSatiri key={t.id} t={t} />) : <p className="text-sm text-gray-500">Henüz teklif göndermedin. <Link href="/" className="underline">İlanlara göz at</Link></p>}</div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-bold">İlanlarım ({ilanlar.length})</h2><Link href="/ilan-ver" className="btn !py-1.5">+ İlan ver</Link></div>
        <div className="space-y-2">
          {ilanlar.map((i) => (
            <div key={i._id} className="kart flex items-center gap-3 p-3">
              {i.resimler[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={onizleme(i.resimler[0], 120)} alt="" className="h-14 w-14 rounded object-cover" />}
              <div className="min-w-0 flex-1"><Link href={`/ilan/${i.slug}`} className="line-clamp-1 font-medium underline">{i.baslik}</Link><p className="text-xs text-gray-500">{DURUM[i.durum] || i.durum} · {i.teklifSayisi} teklif</p></div>
              {(i.durum === "aktif" || i.durum === "pasif") && (
                <button className="btn-ikinci !py-1.5" disabled={!!bekle} onClick={() => cagir(`/api/ilanlar/${i._id}`, "PATCH", { durum: i.durum === "aktif" ? "pasif" : "aktif" })}>{i.durum === "aktif" ? "Durdur" : "Yayınla"}</button>
              )}
              {i.durum !== "takasta" && <button className="text-sm text-red-600" disabled={!!bekle} onClick={() => cagir(`/api/ilanlar/${i._id}`, "DELETE", undefined, "İlan silinsin mi?")}>Sil</button>}
            </div>
          ))}
          {!ilanlar.length && <p className="text-sm text-gray-500">Henüz ilanın yok.</p>}
        </div>
      </section>
    </div>
  );
}
