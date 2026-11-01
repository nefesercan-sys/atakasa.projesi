import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Teklif from "@/models/Teklif";
import User from "@/models/User";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";
import { gecis, type Islem, type Rol, type TeklifDurum } from "@/lib/teklif-akis";

const ISLEMLER: Islem[] = ["kabul", "red", "iptal", "onayla"];

// Teklif üzerinde işlem: { islem: "kabul" | "red" | "iptal" | "onayla" }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapın.", 401);
  if (!mongoose.isValidObjectId(params.id)) return hata("Teklif bulunamadı.", 404);
  const b = await req.json().catch(() => null);
  const islem = b?.islem as Islem;
  if (!ISLEMLER.includes(islem)) return hata("Geçersiz işlem.");

  await connectMongoDB();
  const t = await Teklif.findById(params.id);
  if (!t) return hata("Teklif bulunamadı.", 404);

  const rol: Rol | null = String(t.gonderen) === o.id ? "gonderen" : String(t.alici) === o.id ? "alici" : null;
  if (!rol) return hata("Bu teklif size ait değil.", 403);

  const s = gecis({ durum: t.durum as TeklifDurum, gonderenOnay: t.gonderenOnay, aliciOnay: t.aliciOnay }, islem, rol);
  if (!s.ok) return hata(s.hata, 409);

  // Teklif belgesini ATOMİK olarak "sahiplen": yalnızca okuduğumuz durumdayken yeni duruma geçer.
  // Aynı anda gelen ikinci istek (çift tıklama, iki tarafın eşzamanlı onayı) bu koşulu sağlayamaz → 409.
  const onceki = { _id: t._id, durum: t.durum, gonderenOnay: t.gonderenOnay, aliciOnay: t.aliciOnay };
  const yeniAlanlar = { durum: s.yeni.durum, gonderenOnay: s.yeni.gonderenOnay, aliciOnay: s.yeni.aliciOnay };
  const CAKISMA = "Teklif başka bir işlemle güncellendi; sayfayı yenileyip tekrar deneyin.";

  if (islem === "kabul") {
    // Kabulde iki ilan da hâlâ aktif olmalı; "aktif → takasta" geçişi koşullu (yarış durumuna karşı).
    const a = await Varlik.updateOne({ _id: t.hedefIlan, durum: "aktif" }, { durum: "takasta" });
    if (a.modifiedCount !== 1) return hata("İlanınız artık aktif değil.", 409);
    const c = await Varlik.updateOne({ _id: t.teklifIlan, durum: "aktif" }, { durum: "takasta" });
    if (c.modifiedCount !== 1) {
      await Varlik.updateOne({ _id: t.hedefIlan, durum: "takasta" }, { durum: "aktif" });
      await Teklif.updateOne({ _id: t._id, durum: "bekliyor" }, { durum: "iptal" });
      return hata("Teklif edilen ilan artık uygun değil; teklif iptal edildi.", 409);
    }
    const k = await Teklif.findOneAndUpdate(onceki, yeniAlanlar, { new: true });
    if (!k) {
      // Teklif başka bir istek tarafından değiştirildi: bu isteğin takasa aldığı ilanları geri aç.
      await Varlik.updateMany({ _id: { $in: [t.hedefIlan, t.teklifIlan] }, durum: "takasta" }, { durum: "aktif" });
      return hata(CAKISMA, 409);
    }
  } else {
    const k = await Teklif.findOneAndUpdate(onceki, yeniAlanlar, { new: true });
    if (!k) return hata(CAKISMA, 409);
    // Buradan sonrası yalnızca geçişi KAZANAN istekte çalışır (sayaç çift artmaz).
    if (s.ilanlar === "aktif") {
      // İptal: yalnızca hâlâ "takasta" olan ilanları geri aç (silinen/pasif olanlara dokunma).
      await Varlik.updateMany({ _id: { $in: [t.hedefIlan, t.teklifIlan] }, durum: "takasta" }, { durum: "aktif" });
    } else if (s.ilanlar === "takas_oldu") {
      await Varlik.updateMany({ _id: { $in: [t.hedefIlan, t.teklifIlan] } }, { durum: "takas_oldu" });
      await User.updateMany({ _id: { $in: [t.gonderen, t.alici] } }, { $inc: { tamamlananTakas: 1 } });
    }
  }

  if (s.digerTeklifleriIptalEt) {
    await Teklif.updateMany(
      { _id: { $ne: t._id }, durum: "bekliyor", $or: [{ hedefIlan: { $in: [t.hedefIlan, t.teklifIlan] } }, { teklifIlan: { $in: [t.hedefIlan, t.teklifIlan] } }] },
      { durum: "iptal" }
    );
  }

  return tamam({ durum: s.yeni.durum, gonderenOnay: s.yeni.gonderenOnay, aliciOnay: s.yeni.aliciOnay });
}
