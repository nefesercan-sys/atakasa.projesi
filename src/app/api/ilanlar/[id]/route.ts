import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import TakasTeklif from "@/models/TakasTeklif";
import User from "@/models/User";
import { oturumKullanici } from "@/lib/session";
import { kategoriGecerli } from "@/lib/kategoriler";
import { ilGecerli } from "@/lib/iller";
import { medyaListesi, MAX_RESIM, MAX_VIDEO } from "@/lib/medya";
import { hata, tamam, temizMetin, idGecerli } from "@/lib/yardimci";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

async function bul(idVeSlug: string) {
  return idGecerli(idVeSlug) ? Varlik.findById(idVeSlug) : Varlik.findOne({ slug: idVeSlug });
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectMongoDB();
    const ilan = await bul(params.id);
    if (!ilan) return hata("İlan bulunamadı.", 404);
    const satici = await User.findById(ilan.satici).select("name").lean() as { name?: string } | null;
    const o = ilan.toObject();
    return tamam({ ...o, satici: String(o.satici), saticiAd: satici?.name || "Üye" });
  } catch (e) {
    console.error("ilan GET:", e);
    return hata("İlan alınamadı.", 500);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const k = await oturumKullanici();
    if (!k) return hata("Giriş yapmalısınız.", 401);
    await connectMongoDB();
    const ilan = await bul(params.id);
    if (!ilan) return hata("İlan bulunamadı.", 404);
    if (String(ilan.satici) !== k.id) return hata("Bu ilan size ait değil.", 403);
    if (ilan.durum === "takasta" || ilan.durum === "takasEdildi") return hata("Takas sürecindeki ilan düzenlenemez.", 409);

    const b = await req.json().catch(() => ({}));
    if (b.baslik !== undefined) { const t = temizMetin(b.baslik, 100); if (t.length < 3) return hata("Başlık çok kısa."); ilan.baslik = t; }
    if (b.aciklama !== undefined) ilan.aciklama = temizMetin(b.aciklama, 2000);
    if (b.takasIstegi !== undefined) ilan.takasIstegi = temizMetin(b.takasIstegi, 300);
    if (b.ilce !== undefined) ilan.ilce = temizMetin(b.ilce, 60);
    if (b.kategori !== undefined) { if (!kategoriGecerli(b.kategori)) return hata("Kategori geçersiz."); ilan.kategori = b.kategori; }
    if (b.sehir !== undefined) { if (!ilGecerli(b.sehir)) return hata("Şehir geçersiz."); ilan.sehir = b.sehir; }
    if (b.resimler !== undefined) { const r = medyaListesi(b.resimler, "image", MAX_RESIM); if (r.length < 1) return hata("En az 1 fotoğraf kalmalı."); ilan.resimler = r; }
    if (b.videolar !== undefined) ilan.videolar = medyaListesi(b.videolar, "video", MAX_VIDEO);
    if (typeof b.aktif === "boolean") ilan.aktif = b.aktif; // yayından kaldır / tekrar yayınla
    await ilan.save();
    return tamam({ ok: true });
  } catch (e) {
    console.error("ilan PATCH:", e);
    return hata("İlan güncellenemedi.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const k = await oturumKullanici();
    if (!k) return hata("Giriş yapmalısınız.", 401);
    await connectMongoDB();
    const ilan = await bul(params.id);
    if (!ilan) return hata("İlan bulunamadı.", 404);
    if (String(ilan.satici) !== k.id) return hata("Bu ilan size ait değil.", 403);
    if (ilan.durum === "takasta") return hata("Takas sürecindeki ilan silinemez; önce takası iptal edin.", 409);
    await TakasTeklif.updateMany({ durum: "bekliyor", $or: [{ hedefIlan: ilan._id }, { teklifIlan: ilan._id }] }, { $set: { durum: "iptal" } });
    await ilan.deleteOne();
    return tamam({ ok: true });
  } catch (e) {
    console.error("ilan DELETE:", e);
    return hata("İlan silinemedi.", 500);
  }
}
