import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectMongoDB } from "@/lib/mongodb";
import Uyelik from "@/models/Uyelik";
import { PLANLAR, PlanTipi } from "@/lib/planlar";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
    }

    const { plan, odemeModeli } = await req.json() as {
      plan: PlanTipi;
      odemeModeli: "aylik" | "yillik";
    };

    if (!PLANLAR[plan]) {
      return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
    }

    await connectMongoDB();

    const secilenPlan = PLANLAR[plan];
    const tutar = odemeModeli === "yillik"
      ? secilenPlan.fiyatYillik
      : secilenPlan.fiyatAylik;

    // Bitiş tarihi hesapla
    const bitisTarihi = new Date();
    if (odemeModeli === "yillik") {
      bitisTarihi.setFullYear(bitisTarihi.getFullYear() + 1);
    } else {
      bitisTarihi.setMonth(bitisTarihi.getMonth() + 1);
    }

    // Üyeliği güncelle
    const uyelik = await Uyelik.findOneAndUpdate(
      { kullaniciEmail: session.user.email },
      {
        $set: {
          plan,
          odemeModeli,
          aktif: true,
          baslangicTarihi: new Date(),
          bitisTarihi,
        },
        $push: {
          odemeGecmisi: {
            tarih: new Date(),
            tutar,
            plan,
            durum: "tamamlandi",
          },
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      basarili: true,
      plan,
      odemeModeli,
      tutar,
      bitisTarihi,
    });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
