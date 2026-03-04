import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Trade from "../../../models/Trade";

// 📥 GET: Kullanıcıya Gelen ve Giden Takas Tekliflerini Çek
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Siber Kalkan: E-posta belirtilmedi." }, { status: 400 });
    }

    // Hem gönderdiğimiz hem de bize gelen teklifleri bul
    const trades = await Trade.find({
      $or: [{ senderEmail: email }, { receiverEmail: email }]
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: trades }, { status: 200 });
  } catch (error) {
    console.error("Takas Çekme Hatası:", error);
    return NextResponse.json({ success: false, error: "Takas verileri getirilemedi." }, { status: 500 });
  }
}

// 📤 POST: Sisteme Yeni Takas Teklifi Mühürle
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const newTrade = await Trade.create({
      offeredProductId: body.offeredProductId,
      requestedProductId: body.requestedProductId,
      senderEmail: body.senderEmail || "test_gonderen@atakasa.com",
      receiverEmail: body.receiverEmail || "test_alici@atakasa.com",
      message: body.message || "Merhaba, bu varlık için takas teklif ediyorum.",
      status: "beklemede"
    });

    return NextResponse.json({ success: true, message: "Takas teklifi siber ağa fırlatıldı!", data: newTrade }, { status: 201 });
  } catch (error) {
    console.error("Takas Ekleme Hatası:", error);
    return NextResponse.json({ success: false, error: "Teklif gönderilemedi." }, { status: 500 });
  }
}
