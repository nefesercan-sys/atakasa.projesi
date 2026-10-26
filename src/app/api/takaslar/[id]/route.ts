import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import TakasTeklif from "@/models/TakasTeklif";
import { oturumKullanici } from "@/lib/session";
import { hata, tamam, idGecerli, ilanMusait } from "@/lib/yardimci";

export const dynamic = "force-dynamic";

/**
 * PATCH { islem }  — durum geçişleri sunucuda, YETKİ KONTROLLÜ ve tek yönlüdür (istemci durumu doğrudan yazamaz).
 *  kabul   : yalnızca ilan sahibi (alici), bekliyor → kabul.  İki ilan "takasta" olur, bu ilanlara gelen diğer bekleyen teklifler reddedilir.
 *  red     : yalnızca alici, bekliyor → red
 *  iptal   : gonderen (bekliyor iken) ya da iki taraftan biri (kabul iken) → iptal; ilanlar yeniden "aktif"
 *  tamamla : kabul edilmiş takasta taraf "takas gerçekleşti" der; İKİ taraf da onaylayınca tamamlandi, ilanlar "takasEdildi"
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const k = await oturumKullanici();
    if (!k) return hata("Giriş yapmalısınız.", 401);
    if (!idGecerli(params.id)) return hata("Teklif bulunamadı.", 404);
    const b = await req.json().catch(() => ({}));
    const islem = b.islem as string;
    await connectMongoDB();
    const t = await TakasTeklif.findById(params.id);
    if (!t) return hata("Teklif bulunamadı.", 404);
    const gonderenMi = String(t.gonderen) === k.id;
    const aliciMi = String(t.alici) === k.id;
    if (!gonderenMi && !aliciMi) return hata("Bu teklif size ait değil.", 403);

    if (islem === "kabul") {
      if (!aliciMi) return hata("Teklifi yalnızca ilan sahibi kabul edebilir.", 403);
      const [hedef, teklif] = await Promise.all([Varlik.findById(t.hedefIlan), Varlik.findById(t.teklifIlan)]);
      if (!ilanMusait(hedef) || !ilanMusait(teklif)) return hata("İlanlardan biri artık takasa açık değil.", 409);
      const g = await TakasTeklif.findOneAndUpdate({ _id: t._id, alici: k.id, durum: "bekliyor" }, { $set: { durum: "kabul" } }, { new: true });
      if (!g) return hata("Bu teklif artık beklemede değil.", 409);
      await Varlik.updateMany({ _id: { $in: [t.hedefIlan, t.teklifIlan] } }, { $set: { durum: "takasta" } });
      await TakasTeklif.updateMany(
        { _id: { $ne: t._id }, durum: "bekliyor", $or: [{ hedefIlan: { $in: [t.hedefIlan, t.teklifIlan] } }, { teklifIlan: { $in: [t.hedefIlan, t.teklifIlan] } }] },
        { $set: { durum: "red" } }
      );
      return tamam({ durum: "kabul" });
    }

    if (islem === "red") {
      if (!aliciMi) return hata("Teklifi yalnızca ilan sahibi reddedebilir.", 403);
      const g = await TakasTeklif.findOneAndUpdate({ _id: t._id, alici: k.id, durum: "bekliyor" }, { $set: { durum: "red" } }, { new: true });
      return g ? tamam({ durum: "red" }) : hata("Bu teklif artık beklemede değil.", 409);
    }

    if (islem === "iptal") {
      const kosul = gonderenMi
        ? { _id: t._id, $or: [{ durum: "bekliyor" }, { durum: "kabul" }] }
        : { _id: t._id, durum: "kabul" }; // ilan sahibi yalnızca kabul ettiği takası geri alabilir (bekleyeni "red" eder)
      const g = await TakasTeklif.findOneAndUpdate(kosul, { $set: { durum: "iptal", gonderenOnay: false, aliciOnay: false } }, { new: false });
      if (!g) return hata("Bu teklif artık iptal edilemez.", 409);
      if (g.durum === "kabul") await Varlik.updateMany({ _id: { $in: [t.hedefIlan, t.teklifIlan] }, durum: "takasta" }, { $set: { durum: "aktif" } });
      return tamam({ durum: "iptal" });
    }

    if (islem === "tamamla") {
      const alan = gonderenMi ? "gonderenOnay" : "aliciOnay";
      const g = await TakasTeklif.findOneAndUpdate({ _id: t._id, durum: "kabul" }, { $set: { [alan]: true } }, { new: true });
      if (!g) return hata("Takas henüz kabul edilmemiş ya da kapanmış.", 409);
      if (g.gonderenOnay && g.aliciOnay) {
        const son = await TakasTeklif.findOneAndUpdate({ _id: t._id, durum: "kabul", gonderenOnay: true, aliciOnay: true }, { $set: { durum: "tamamlandi" } }, { new: true });
        if (son) await Varlik.updateMany({ _id: { $in: [t.hedefIlan, t.teklifIlan] } }, { $set: { durum: "takasEdildi", aktif: false } });
        return tamam({ durum: "tamamlandi" });
      }
      return tamam({ durum: "kabul", beklenen: "Karşı tarafın onayı bekleniyor." });
    }

    return hata("Geçersiz işlem.");
  } catch (e) {
    console.error("takas PATCH:", e);
    return hata("İşlem yapılamadı.", 500);
  }
}
