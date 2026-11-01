import { v2 as cloudinary } from "cloudinary";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";
import { hizSiniri } from "@/lib/ratelimit";
import { CLOUD_ADI, IZINLI_BICIMLER } from "@/lib/medya";

// Giriş yapmış üyeye, tek seferlik imzalı Cloudinary yükleme parametreleri verir.
// Güvenlik: yalnızca fotoğraf/video biçimlerine izin verilir (allowed_formats imzaya dahildir, istemci değiştiremez).
// İmza yapılandırılmamışsa yükleme KAPALIDIR (açık "unsigned" preset'e geri dönülmez).
export async function POST() {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapmalısınız.", 401);
  if (!(await hizSiniri(`imza:${o.id}`, 60, 60 * 60_000))) return hata("Saatlik yükleme sınırına ulaştınız.", 429);

  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!key || !secret) return hata("İmzalı yükleme yapılandırılmamış.", 503);

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "atakasa/ilanlar";
  const allowed_formats = IZINLI_BICIMLER;
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder, allowed_formats }, secret);
  return tamam({ cloudName: CLOUD_ADI, apiKey: key, timestamp, folder, allowed_formats, signature });
}
