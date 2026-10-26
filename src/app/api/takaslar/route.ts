import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import User from "@/models/User";
import TakasTeklif from "@/models/TakasTeklif";
import { oturumKullanici } from "@/lib/session";
import { hata, tamam, temizMetin, idGecerli, ilanMusait } from "@/lib/yardimci";

export const dynamic = "force-dynamic";

// GET: benim gelen / giden tekliflerim. Karşı tarafın iletişim bilgisi YALNIZCA teklif kabul edildikten sonra görünür.
export async function GET() {
  try {
    const k = await oturumKullanici();
    if (!k) return hata("Giriş yapmalısınız.", 401);
    await connectMongoDB();
    const me = new mongoose.Types.ObjectId(k.id);
    const liste = await TakasTeklif.find({ $or: [{ gonderen: me }, { alici: me }] }).sort({ updatedAt: -1 }).limit(200).lean();

    const karsiIdler = Array.from(new Set(liste.map((t) => String(String(t.gonderen) === k.id ? t.alici : t.gonderen))));
    const kullanicilar = await User.find({ _id: { $in: karsiIdler } }).select("name telefon email").lean();
    const harita = new Map(kullanicilar.map((u) => [String(u._id), u]));

    const sonuc = liste.map((t) => {
      const benGonderen = String(t.gonderen) === k.id;
      const karsi = harita.get(String(benGonderen ? t.alici : t.gonderen));
      const acik = t.durum === "kabul" || t.durum === "tamamlandi";
      return {
        _id: String(t._id), yon: benGonderen ? "giden" : "gelen", durum: t.durum, mesaj: t.mesaj || "",
        hedefIlan: String(t.hedefIlan), teklifIlan: String(t.teklifIlan),
        hedefBaslik: t.hedefBaslik, hedefResim: t.hedefResim, teklifBaslik: t.teklifBaslik, teklifResim: t.teklifResim,
        benOnayladim: benGonderen ? t.gonderenOnay : t.aliciOnay, karsiOnayladi: benGonderen ? t.aliciOnay : t.gonderenOnay,
        karsiAd: karsi?.name || "Üye",
        karsiIletisim: acik ? { telefon: karsi?.telefon || "", email: karsi?.email || "" } : null,
        createdAt: t.createdAt, updatedAt: t.updatedAt,
      };
    });
    return tamam(sonuc);
  } catch (e) {
    console.error("takaslar GET:", e);
    return hata("Teklifler alınamadı.", 500);
  }
}

// POST: takas teklif et { hedefIlanId, teklifIlanId, mesaj }
export async function POST(req: Request) {
  try {
    const k = await oturumKullanici();
    if (!k) return hata("Takas teklifi için giriş yapın.", 401);
    const b = await req.json().catch(() => ({}));
    if (!idGecerli(b.hedefIlanId) || !idGecerli(b.teklifIlanId)) return hata("İlan seçimi geçersiz.");
    if (b.hedefIlanId === b.teklifIlanId) return hata("Bir ilan kendisiyle takas edilemez.");
    const mesaj = temizMetin(b.mesaj, 500);

    await connectMongoDB();
    const [hedef, teklif] = await Promise.all([Varlik.findById(b.hedefIlanId), Varlik.findById(b.teklifIlanId)]);
    if (!hedef || !ilanMusait(hedef)) return hata("Bu ilan artık takasa açık değil.", 409);
    if (!teklif || !ilanMusait(teklif)) return hata("Teklif ettiğiniz ilan takasa açık değil.", 409);
    if (String(hedef.satici) === k.id) return hata("Kendi ilanınıza teklif veremezsiniz.", 400);
    if (String(teklif.satici) !== k.id) return hata("Yalnızca kendi ilanınızı teklif edebilirsiniz.", 403);

    const var_ = await TakasTeklif.findOne({ hedefIlan: hedef._id, teklifIlan: teklif._id, durum: { $in: ["bekliyor", "kabul"] } }).select("_id").lean();
    if (var_) return hata("Bu iki ilan için zaten bir teklifiniz var.", 409);
    const bekleyen = await TakasTeklif.countDocuments({ gonderen: k.id, durum: "bekliyor" });
    if (bekleyen >= 20) return hata("Aynı anda en fazla 20 bekleyen teklifiniz olabilir.", 429);

    const t = await TakasTeklif.create({
      hedefIlan: hedef._id, teklifIlan: teklif._id,
      gonderen: new mongoose.Types.ObjectId(k.id), alici: hedef.satici, mesaj,
      hedefBaslik: hedef.baslik, hedefResim: hedef.resimler?.[0], teklifBaslik: teklif.baslik, teklifResim: teklif.resimler?.[0],
    });
    await Varlik.updateOne({ _id: hedef._id }, { $inc: { takasTeklifSayisi: 1 } });
    return tamam({ id: String(t._id) }, 201);
  } catch (e) {
    console.error("takaslar POST:", e);
    return hata("Teklif gönderilemedi.", 500);
  }
}
