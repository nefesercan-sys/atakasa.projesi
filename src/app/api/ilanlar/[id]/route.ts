import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Teklif from "@/models/Teklif";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";
import { gecerliMedya, MAX_MEDYA } from "@/lib/medya";

type Ctx = { params: { id: string } };
const gecerliId = (id: string) => mongoose.isValidObjectId(id);

// Sahibi: düzenle (başlık, açıklama, takasIstegi, resimler) veya durum değiştir (aktif <-> pasif)
export async function PATCH(req: Request, { params }: Ctx) {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapın.", 401);
  if (!gecerliId(params.id)) return hata("Geçersiz ilan.", 404);
  const b = await req.json().catch(() => null);
  await connectMongoDB();
  const ilan = await Varlik.findById(params.id);
  if (!ilan || ilan.durum === "silindi") return hata("İlan bulunamadı.", 404);
  if (String(ilan.satici) !== o.id && !o.admin) return hata("Bu ilan size ait değil.", 403);

  if (b?.durum !== undefined) {
    if (!["aktif", "pasif"].includes(b.durum)) return hata("Geçersiz durum.");
    if (!["aktif", "pasif"].includes(ilan.durum)) return hata("Takastaki veya tamamlanmış ilanın durumu değiştirilemez.");
    ilan.durum = b.durum;
  }
  if (b?.baslik !== undefined) {
    const t = String(b.baslik).trim();
    if (t.length < 3 || t.length > 100) return hata("Başlık 3-100 karakter olmalı.");
    ilan.baslik = t;
  }
  if (b?.aciklama !== undefined) ilan.aciklama = String(b.aciklama).trim().slice(0, 2000);
  if (b?.takasIstegi !== undefined) ilan.takasIstegi = String(b.takasIstegi).trim().slice(0, 300);
  if (b?.resimler !== undefined) {
    const r: unknown[] = Array.isArray(b.resimler) ? b.resimler : [];
    if (r.length < 1 || r.length > MAX_MEDYA || !r.every(gecerliMedya)) return hata("Medya listesi geçersiz.");
    ilan.resimler = r as string[];
  }
  await ilan.save();
  return tamam();
}

// Sahibi: sil (yumuşak silme). Bekleyen teklifler iptal edilir; kabul edilmiş takası olan ilan silinemez.
export async function DELETE(_req: Request, { params }: Ctx) {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapın.", 401);
  if (!gecerliId(params.id)) return hata("Geçersiz ilan.", 404);
  await connectMongoDB();
  const ilan = await Varlik.findById(params.id);
  if (!ilan || ilan.durum === "silindi") return hata("İlan bulunamadı.", 404);
  if (String(ilan.satici) !== o.id && !o.admin) return hata("Bu ilan size ait değil.", 403);
  if (ilan.durum === "takasta") return hata("Kabul edilmiş bir takas var. Önce takası iptal edin.", 409);

  await Teklif.updateMany({ durum: "bekliyor", $or: [{ hedefIlan: ilan._id }, { teklifIlan: ilan._id }] }, { durum: "iptal" });
  ilan.durum = "silindi";
  await ilan.save();
  return tamam();
}
