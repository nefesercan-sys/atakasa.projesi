"use client";
import { useRef, useState } from "react";
import { CLOUD_NAME, UPLOAD_PRESET, MAX_RESIM, MAX_VIDEO, MAX_RESIM_MB, MAX_VIDEO_MB, gecerliMedyaUrl, kucuk, videoKapak } from "@/lib/medya";

interface Props { resimler: string[]; videolar: string[]; onResimler: (v: string[]) => void; onVideolar: (v: string[]) => void }

function yukle(dosya: File, tur: "image" | "video", ilerle: (y: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", dosya);
    fd.append("upload_preset", UPLOAD_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${tur}/upload`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) ilerle(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      try {
        const j = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && gecerliMedyaUrl(j.secure_url, tur)) resolve(j.secure_url);
        else reject(new Error(j?.error?.message || "Yükleme başarısız"));
      } catch { reject(new Error("Yükleme başarısız")); }
    };
    xhr.onerror = () => reject(new Error("Bağlantı hatası"));
    xhr.send(fd);
  });
}

export default function MedyaYukle({ resimler, videolar, onResimler, onVideolar }: Props) {
  const resimRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [yuzde, setYuzde] = useState<number | null>(null);
  const [mesaj, setMesaj] = useState("");

  async function dosyalar(liste: FileList | null, tur: "image" | "video") {
    if (!liste || liste.length === 0) return;
    setMesaj("");
    const mevcut = tur === "image" ? resimler : videolar;
    const max = tur === "image" ? MAX_RESIM : MAX_VIDEO;
    const mb = tur === "image" ? MAX_RESIM_MB : MAX_VIDEO_MB;
    const secilen = Array.from(liste).slice(0, Math.max(0, max - mevcut.length));
    if (secilen.length === 0) { setMesaj(`En fazla ${max} ${tur === "image" ? "fotoğraf" : "video"} ekleyebilirsiniz.`); return; }
    const yeni: string[] = [];
    for (const d of secilen) {
      if (d.size > mb * 1024 * 1024) { setMesaj(`"${d.name}" ${mb} MB'tan büyük, atlandı.`); continue; }
      if (!d.type.startsWith(tur + "/")) { setMesaj(`"${d.name}" desteklenmeyen dosya türü.`); continue; }
      try { setYuzde(0); yeni.push(await yukle(d, tur, setYuzde)); }
      catch (e) { setMesaj(e instanceof Error ? e.message : "Yükleme başarısız"); }
    }
    setYuzde(null);
    if (yeni.length) (tur === "image" ? onResimler : onVideolar)([...mevcut, ...yeni]);
    if (resimRef.current) resimRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {resimler.map((u, i) => (
          <div key={u} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img src={kucuk(u, 300, 300)} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-bold text-white">Kapak</span>}
            <button type="button" onClick={() => onResimler(resimler.filter((x) => x !== u))} className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-sm text-white" aria-label="Fotoğrafı kaldır">×</button>
          </div>
        ))}
        {videolar.map((u) => (
          <div key={u} className="relative aspect-square overflow-hidden rounded-xl bg-slate-900">
            <img src={videoKapak(u)} alt="" className="h-full w-full object-cover opacity-80" />
            <span className="absolute inset-0 flex items-center justify-center text-3xl text-white">▶</span>
            <button type="button" onClick={() => onVideolar(videolar.filter((x) => x !== u))} className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-sm text-white" aria-label="Videoyu kaldır">×</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={yuzde !== null || resimler.length >= MAX_RESIM} onClick={() => resimRef.current?.click()} className="btn btn-ghost">📷 Fotoğraf ekle ({resimler.length}/{MAX_RESIM})</button>
        <button type="button" disabled={yuzde !== null || videolar.length >= MAX_VIDEO} onClick={() => videoRef.current?.click()} className="btn btn-ghost">🎥 Video ekle ({videolar.length}/{MAX_VIDEO})</button>
      </div>
      <input ref={resimRef} type="file" accept="image/*" multiple hidden onChange={(e) => dosyalar(e.target.files, "image")} />
      <input ref={videoRef} type="file" accept="video/*" hidden onChange={(e) => dosyalar(e.target.files, "video")} />
      {yuzde !== null && <div className="mt-3"><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-teal-600 transition-all" style={{ width: `${yuzde}%` }} /></div><p className="mt-1 text-xs text-slate-500">Yükleniyor… %{yuzde}</p></div>}
      {mesaj && <p className="mt-2 text-sm text-rose-600">{mesaj}</p>}
      <p className="mt-2 text-xs text-slate-500">En fazla {MAX_RESIM} fotoğraf (her biri {MAX_RESIM_MB} MB) ve {MAX_VIDEO} video (her biri {MAX_VIDEO_MB} MB).</p>
    </div>
  );
}
