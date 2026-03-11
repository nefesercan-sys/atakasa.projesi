import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Varlik from "../../../../models/Varlik";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoDB();
    const varlik = await Varlik.findById(params.id);

    if (!varlik || !varlik.resimler || varlik.resimler.length === 0) {
      return new NextResponse("Resim bulunamadı", { status: 404 });
    }

    // Base64 verisini temizle ve Buffer'a çevir
    const base64Data = varlik.resimler[0].replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Paylaşım robotlarına "bu bir resimdir" de
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new NextResponse("Sistem hatası", { status: 500 });
  }
}
