import { v2 as cloudinary } from "cloudinary";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";
import { hizSiniri } from "@/lib/ratelimit";
import { CLOUD_ADI } from "@/lib/medya";

// Giriş yapmış üyeye, tek seferlik imzalı Cloudinary yükleme parametreleri verir.
// (İmza yoksa istemci, Cloudinary'de tanımlı "unsigned" preset'e geri döner.)
export async function POST() {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapmalısınız.", 401);
  if (!hizSiniri(`imza:${o.id}`, 60, 60 * 60_000)) return hata("Saatlik yükleme sınırına ulaştınız.", 429);

  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!key || !secret) return hata("İmzalı yükleme yapılandırılmamış.", 503);

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "atakasa/ilanlar";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, secret);
  return tamam({ cloudName: CLOUD_ADI, apiKey: key, timestamp, folder, signature });
}
