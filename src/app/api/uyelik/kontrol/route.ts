import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectMongoDB } from "@/lib/mongodb";
import Uyelik from "@/models/Uyelik";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// 10.000 üye eşiği
const UCRETLI_ESIK = 10000;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
    }

    await connectMongoDB();

    // Toplam üye sayısı
    const toplamUye = await User.countDocuments();
    const ucretliAktif = toplamUye >= UCRETLI_ESIK;

    // Kullanıcının üyeliğini bul veya oluştur
    let uyelik = await Uyelik.findOne({ kullaniciEmail: session.user.email });

    if (!uyelik) {
      uyelik = await Uyelik.create({
        kullaniciEmail: session.user.email,
        plan: "ucretsiz",
        uyeNumarasi: toplamUye,
      });
    }

    // Aylık kullanımı sıfırla (yeni ay başladıysa)
    const buAy = new Date();
    buAy.setDate(1);
    buAy.setHours(0, 0, 0, 0);

    if (uyelik.kullanim.sonSifirlamaTarihi < buAy) {
      uyelik.kullanim.buAyIlan = 0;
      uyelik.kullanim.buAyOneCikarma = 0;
      uyelik.kullanim.buAyMesaj = 0;
      uyelik.kullanim.sonSifirlamaTarihi = new Date();
      await uyelik.save();
    }

    return NextResponse.json({
      plan: uyelik.plan,
      odemeModeli: uyelik.odemeModeli,
      aktif: uyelik.aktif,
      kullanim: uyelik.kullanim,
      ucretliSistemAktif: ucretliAktif,
      toplamUye,
      kalanUye: Math.max(0, UCRETLI_ESIK - toplamUye),
      bitisTarihi: uyelik.bitisTarihi,
    });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
