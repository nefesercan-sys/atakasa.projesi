"use client";
import { useState } from "react";
import { CLOUD_ADI, MAX_MEDYA, onizleme, videoMu } from "@/lib/medya";

const MAX_MB = 50;

export default function MedyaYukle({ deger, onDegis }: { deger: string[]; onDegis: (v: string[]) => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function yukle(dosyalar: FileList | null) {
    if (!dosyalar?.length) return;
    setHata("");
    const kalan = MAX_MEDYA - deger.length;
    const secilen = Array.from(dosyalar).slice(0, kalan);
    setYukleniyor(true);
    const yeni: string[] = [];
    try {
      const imza = await fetch("/api/upload/imza", { method: "POST" }).then((r) => (r.ok ? r.json() : null));
      for (const d of secilen) {
        if (!/^(image|video)\//.test(d.type)) { setHata("Yalnızca fotoğraf veya video yükleyin."); continue; }
        if (d.size > MAX_MB * 1024 * 1024) { setHata(`Dosya en fazla ${MAX_MB} MB olabilir.`); continue; }
        const f = new FormData();
        f.append("file", d);
        if (imza) {
          f.append("api_key", imza.apiKey); f.append("timestamp", String(imza.timestamp));
          f.append("folder", imza.folder); f.append("signature", imza.signature);
        } else {
          f.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "atakasa_unsigned");
        }
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_ADI}/auto/upload`, { method: "POST", body: f });
        const j = await r.json();
        if (j.secure_url) yeni.push(j.secure_url);
        else setHata("Yükleme başarısız oldu, tekrar deneyin.");
      }
    } catch {
      setHata("Bağlantı hatası. Tekrar deneyin.");
    }
    setYukleniyor(false);
    if (yeni.length) onDegis([...deger, ...yeni]);
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {deger.map((u, k) => (
          <div key={u} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={onizleme(u, 300)} alt="" className="h-full w-full object-cover" />
            {videoMu(u) && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">▶</span>}
            <button type="button" onClick={() => onDegis(deger.filter((_, x) => x !== k))} className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-white" aria-label="Kaldır">×</button>
          </div>
        ))}
        {deger.length < MAX_MEDYA && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-marka hover:text-marka">
            <span className="text-2xl">{yukleniyor ? "⏳" : "📷"}</span>
            <span>{yukleniyor ? "Yükleniyor" : "Foto / Video"}</span>
            <input type="file" accept="image/*,video/*" multiple className="hidden" disabled={yukleniyor} onChange={(e) => { yukle(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">En fazla {MAX_MEDYA} dosya, her biri {MAX_MB} MB'a kadar. İlk dosya kapak olur.</p>
      {hata && <p className="mt-1 text-sm text-red-600">{hata}</p>}
    </div>
  );
}
