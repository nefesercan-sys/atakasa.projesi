export const dynamic = 'force-dynamic'; // 🚀 BUZUL KIRICI

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Mesaj from "../../../models/Mesaj";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ message: "Yetkisiz Erişim" }, { status: 401 });

    await connectMongoDB();
    const mesajlar = await Mesaj.find({
      $or: [{ gonderen: session.user?.email }, { alici: session.user?.email }]
    }).sort({ createdAt: 1 });

    return NextResponse.json(mesajlar);
  } catch (error) {
    return NextResponse.json({ message: "Sinyal hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ message: "Yetkisiz" }, { status: 401 });

    const { alici, ilanId, metin } = await req.json();
    await connectMongoDB();

    const yeniMesaj = await Mesaj.create({
      gonderen: session.user?.email,
      alici,
      ilanId,
      metin
    });

    return NextResponse.json(yeniMesaj, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Mesaj iletilemedi" }, { status: 500 });
  }
}
