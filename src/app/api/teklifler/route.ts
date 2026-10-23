import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Teklif from "@/models/Teklif";
import "@/models/User";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";
import { hizSiniri } from "@/lib/ratelimit";
import { iletisimAcik, type TeklifDurum } from "@/lib/teklif-akis";

type KisiDoc = { _id: unknown; name?: string; telefon?: string; email?: string };
type IlanOzet = { _id: unknown; baslik?: string; slug?: string; resimler?: string[]; durum?: string };

// Üyenin gönderdiği ve aldığı teklifler. İletişim bilgisi yalnızca kabul/tamamlanmış takasta döner.
export async function GET() {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapın.", 401);
  await connectMongoDB();
  const liste = await Teklif.find({ $or: [{ gonderen: o.id }, { alici: o.id }] })
    .sort({ updatedAt: -1 }).limit(200)
    .populate("hedefIlan", "baslik slug resimler durum")
    .populate("teklifIlan", "baslik slug resimler durum")
    .populate("gonderen", "name telefon email")
    .populate("alici", "name telefon email")
    .lean();

  const cikti = liste.map((t) => {
    const benGonderen = String((t.gonderen as unknown as KisiDoc)._id) === o.id;
    const karsi = (benGonderen ? t.alici : t.gonderen) as unknown as KisiDoc;
    const acik = iletisimAcik(t.durum as TeklifDurum);
    return {
      id: String(t._id),
      yon: benGonderen ? "gonderilen" : "gelen",
      durum: t.durum,
      mesaj: t.mesaj,
      benOnayladim: benGonderen ? t.gonderenOnay : t.aliciOnay,
      karsiOnayladi: benGonderen ? t.aliciOnay : t.gonderenOnay,
      hedefIlan: t.hedefIlan as unknown as IlanOzet,
      teklifIlan: t.teklifIlan as unknown as IlanOzet,
      karsiTaraf: { ad: karsi?.name || "Üye", telefon: acik ? karsi?.telefon || "" : undefined, email: acik ? karsi?.email || "" : undefined },
      tarih: t.updatedAt,
    };
  });
  return tamam({ teklifler: cikti });
}

// Takas teklifi gönder: başkasının ilanı için KENDİ ilanımı öneririm.
export async function POST(req: Request) {
  const o = await oturumAl();
  if (!o) return hata("Teklif için giriş yapın.", 401);
  if (!hizSiniri(`teklif:${o.id}`, 30, 60 * 60_000)) return hata("Saatlik teklif sınırına ulaştınız.", 429);

  const b = await req.json().catch(() => null);
  const hedefId = String(b?.hedefIlan || "");
  const teklifId = String(b?.teklifIlan || "");
  const mesaj = String(b?.mesaj || "").trim().slice(0, 500);
  if (!mongoose.isValidObjectId(hedefId) || !mongoose.isValidObjectId(teklifId)) return hata("İlan seçin.");
  if (hedefId === teklifId) return hata("Aynı ilanı kendisiyle takas edemezsiniz.");

  await connectMongoDB();
  const [hedef, benim] = await Promise.all([Varlik.findById(hedefId), Varlik.findById(teklifId)]);
  if (!hedef || hedef.durum !== "aktif") return hata("İstediğiniz ilan artık takasa açık değil.", 409);
  if (!benim || benim.durum !== "aktif") return hata("Önerdiğiniz ilan aktif değil.", 409);
  if (String(benim.satici) !== o.id) return hata("Yalnızca kendi ilanınızı önerebilirsiniz.", 403);
  if (String(hedef.satici) === o.id) return hata("Kendi ilanınıza teklif veremezsiniz.", 403);

  const var_ = await Teklif.exists({ hedefIlan: hedef._id, teklifIlan: benim._id, durum: { $in: ["bekliyor", "kabul"] } });
  if (var_) return hata("Bu iki ilan için zaten açık bir teklifiniz var.", 409);

  const t = await Teklif.create({ hedefIlan: hedef._id, teklifIlan: benim._id, gonderen: o.id, alici: hedef.satici, mesaj });
  await Varlik.updateOne({ _id: hedef._id }, { $inc: { teklifSayisi: 1 } });
  return tamam({ id: String(t._id) }, 201);
}
