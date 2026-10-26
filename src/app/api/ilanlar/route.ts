import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { oturumKullanici } from "@/lib/session";
import { kategoriGecerli } from "@/lib/kategoriler";
import { ilGecerli } from "@/lib/iller";
import { medyaListesi, MAX_RESIM, MAX_VIDEO } from "@/lib/medya";
import { hata, tamam, temizMetin, slugla, regexKacis, MUSAIT_FILTRE } from "@/lib/yardimci";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/ilanlar?sehir=&kategori=&q=&sayfa=&benim=1
export async function GET(req: Request) {
  try {
    await connectMongoDB();
    const sp = new URL(req.url).searchParams;
    const sayfa = Math.max(1, parseInt(sp.get("sayfa") || "1", 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(sp.get("limit") || "24", 10) || 24));
    const filtre: Record<string, unknown> = {};

    if (sp.get("benim") === "1") {
      const k = await oturumKullanici();
      if (!k) return hata("Giriş yapmalısınız.", 401);
      filtre.satici = new mongoose.Types.ObjectId(k.id);
    } else {
      Object.assign(filtre, MUSAIT_FILTRE);
    }
    const sehir = (sp.get("sehir") || "").toLowerCase();
    const kategori = sp.get("kategori") || "";
    const q = temizMetin(sp.get("q"), 60);
    if (sehir && ilGecerli(sehir)) filtre.sehir = sehir;
    if (kategori && kategoriGecerli(kategori)) filtre.kategori = kategori;
    if (q) { const r = new RegExp(regexKacis(q), "i"); filtre.$or = [{ baslik: r }, { aciklama: r }, { takasIstegi: r }]; }

    const [liste, toplam] = await Promise.all([
      Varlik.find(filtre).sort({ createdAt: -1 }).skip((sayfa - 1) * limit).limit(limit)
        .select("baslik slug resimler videolar sehir ilce kategori takasIstegi durum aktif createdAt satici").lean(),
      Varlik.countDocuments(filtre),
    ]);
    return tamam({ liste, toplam, sayfa, sayfaSayisi: Math.max(1, Math.ceil(toplam / limit)) });
  } catch (e) {
    console.error("ilanlar GET:", e);
    return hata("İlanlar alınamadı.", 500);
  }
}

// POST /api/ilanlar  — ilan yayınla (üyelik şart)
export async function POST(req: Request) {
  try {
    const k = await oturumKullanici();
    if (!k) return hata("İlan vermek için giriş yapın.", 401);
    const b = await req.json().catch(() => ({}));
    const baslik = temizMetin(b.baslik, 100);
    const aciklama = temizMetin(b.aciklama, 2000);
    const takasIstegi = temizMetin(b.takasIstegi, 300);
    const ilce = temizMetin(b.ilce, 60);
    const resimler = medyaListesi(b.resimler, "image", MAX_RESIM);
    const videolar = medyaListesi(b.videolar, "video", MAX_VIDEO);
    if (baslik.length < 3) return hata("Ürün adını yazın (en az 3 karakter).");
    if (!kategoriGecerli(b.kategori)) return hata("Kategori seçin.");
    if (!ilGecerli(b.sehir)) return hata("Şehir seçin.");
    if (resimler.length < 1) return hata("En az 1 fotoğraf ekleyin.");

    await connectMongoDB();
    const aktifSayi = await Varlik.countDocuments({ satici: k.id, ...MUSAIT_FILTRE });
    if (aktifSayi >= 50) return hata("En fazla 50 aktif ilanınız olabilir.", 429);

    const slug = `${slugla(baslik)}-${Math.random().toString(36).slice(2, 8)}`;
    const ilan = await Varlik.create({
      baslik, aciklama, takasIstegi, kategori: b.kategori, sehir: b.sehir, ilce, resimler, videolar,
      satici: new mongoose.Types.ObjectId(k.id), slug, aktif: true, durum: "aktif",
    });
    return tamam({ id: String(ilan._id), slug: ilan.slug }, 201);
  } catch (e) {
    console.error("ilanlar POST:", e);
    return hata("İlan yayınlanamadı.", 500);
  }
}
