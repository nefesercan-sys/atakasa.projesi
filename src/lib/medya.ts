// Foto/video yükleme sabitleri ve doğrulama. Yükleme tarayıcıdan doğrudan Cloudinary'ye yapılır (Vercel gövde sınırına takılmaz).
// Cloudinary hesabında "nexus_preset" adlı UNSIGNED bir upload preset bulunmalı (resim + video kabul etmeli).
export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "diuamcnej";
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nexus_preset";

export const MAX_RESIM = 8;
export const MAX_VIDEO = 2;
export const MAX_RESIM_MB = 10;
export const MAX_VIDEO_MB = 60;

/** Yalnızca kendi Cloudinary hesabımızdaki https adreslerini kabul et (rastgele URL/izleme pikseli sokulmasın). */
export function gecerliMedyaUrl(u: unknown, tur: "image" | "video"): u is string {
  return typeof u === "string" && u.length < 500 && u.startsWith(`https://res.cloudinary.com/${CLOUD_NAME}/${tur}/upload/`);
}
export function medyaListesi(v: unknown, tur: "image" | "video", max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => gecerliMedyaUrl(x, tur)).slice(0, max);
}
/** Video için kapak görseli (Cloudinary dönüşümü: ilk kare). */
export const videoKapak = (url: string): string => url.replace("/video/upload/", "/video/upload/so_0,w_600,h_450,c_fill,f_jpg/").replace(/\.(mp4|mov|webm|m4v)$/i, ".jpg");

/** Liste/kart için küçük, hızlı görsel (Cloudinary dönüşümü). Başka kaynaklı eski URL'ler olduğu gibi döner. */
export const kucuk = (url: string, w = 600, h = 450): string =>
  url.includes("/image/upload/") ? url.replace("/image/upload/", `/image/upload/c_fill,w_${w},h_${h},q_auto,f_auto/`) : url;
