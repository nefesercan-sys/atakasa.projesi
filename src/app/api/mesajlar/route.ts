export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { connectMongoDB } from "../../../lib/mongodb"; 

// 🛡️ SİBER MESAJ ŞEMASI
const MesajSchema = new mongoose.Schema({
  gonderen: { type: String, required: true },
  alici: { type: String, required: true },
  mesaj: { type: String, required: true },
  ilanId: { type: String, required: true },
  ilanBaslik: { type: String, default: "İlan" },
  okundu: { type: Boolean, default: false }
}, { timestamps: true });

const Mesaj = mongoose.models.Mesaj || mongoose.model("Mesaj", MesajSchema);

// 📥 MESAJLARI ÇEKME VE LİSTELEME
export async function GET(req: Request) {
  try {
    await connectMongoDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json([], { status: 401 });

    const email = session.user.email.toLowerCase();
    const { searchParams } = new URL(req.url);
    const withUser = searchParams.get("with");
    const ilanId = searchParams.get("ilanId");

    // 1. İki kişi arasındaki belirli bir ilanın sohbetini çek
    if (withUser) {
      const query: any = {
        $or: [
          { gonderen: email, alici: withUser.toLowerCase() },
          { gonderen: withUser.toLowerCase(), alici: email }
        ]
      };
      if (ilanId) query.ilanId = ilanId;

      const mesajlar = await Mesaj.find(query).sort({ createdAt: 1 });

      // Karşıdan gelen mesajları "Okundu" olarak işaretle
      await Mesaj.updateMany(
        { gonderen: withUser.toLowerCase(), alici: email, okundu: false },
        { $set: { okundu: true } }
      );

      return NextResponse.json(mesajlar);
    }

    // 2. Panelin sol tarafındaki genel "Sohbetler" listesini çek
    const tumMesajlar = await Mesaj.find({
      $or: [{ gonderen: email }, { alici: email }]
    }).sort({ createdAt: -1 });

    const map = new Map();
    for (const m of tumMesajlar) {
      const karsiTaraf = m.gonderen === email ? m.alici : m.gonderen;
      const key = `${karsiTaraf}_${m.ilanId}`;
      if (!map.has(key)) {
        map.set(key, {
          _id: key,
          karsiTaraf,
          ilanId: m.ilanId,
          ilanBaslik: m.ilanBaslik,
          sonMesaj: m.mesaj,
          okunmamis: m.alici === email && !m.okundu ? 1 : 0,
          createdAt: m.createdAt
        });
      } else {
        if (m.alici === email && !m.okundu) map.get(key).okunmamis++;
      }
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (err) {
    console.error("Mesaj Get Hata:", err);
    return NextResponse.json({ error: "Siber mesaj ağına ulaşılamadı" }, { status: 500 });
  }
}

// 📤 YENİ MESAJ GÖNDERME
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const body = await req.json();
    
    // Mesajı Veritabanına Yaz
    const yeniMesaj = await Mesaj.create({
      gonderen: session.user.email.toLowerCase(),
      alici: body.alici.toLowerCase(),
      mesaj: body.mesaj,
      ilanId: body.ilanId,
      ilanBaslik: body.ilanBaslik || "İlan Görüşmesi",
      okundu: false
    });

    return NextResponse.json({ success: true, mesaj: yeniMesaj });
  } catch (err) {
    console.error("Mesaj Post Hata:", err);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}
