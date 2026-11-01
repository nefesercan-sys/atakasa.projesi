export const CLOUD_ADI = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "diuamcnej";
export const MAX_MEDYA = 8;
/** Yüklemeye izin verilen biçimler (imzaya dahil edilir). */
export const IZINLI_BICIMLER = "jpg,jpeg,png,webp,gif,heic,heif,mp4,mov,webm,m4v";

/** Yalnızca kendi Cloudinary hesabımızdan gelen fotoğraf/video adreslerini kabul et. */
export const gecerliMedya = (u: unknown): u is string =>
  typeof u === "string" && u.length < 400 && !u.includes("..") &&
  new RegExp(`^https://res\\.cloudinary\\.com/${CLOUD_ADI.replace(/[^A-Za-z0-9_-]/g, "")}/(image|video)/upload/[A-Za-z0-9/_.,-]+$`).test(u);

export const videoMu = (u: string) => u.includes("/video/upload/");

/** Küçük, hızlı önizleme adresi (resim: boyutlandır, video: ilk kare). */
export function onizleme(u: string, w = 600): string {
  if (!u.includes("res.cloudinary.com")) return u;
  if (videoMu(u)) return u.replace("/video/upload/", `/video/upload/so_0,w_${w},c_fill,f_jpg,q_auto/`).replace(/\.(mp4|mov|webm|m4v|avi)(\?.*)?$/i, ".jpg");
  return u.replace("/image/upload/", `/image/upload/w_${w},c_limit,f_auto,q_auto/`);
}
