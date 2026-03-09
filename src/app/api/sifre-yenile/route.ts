import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "../../../lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { token, email, yeniSifre } = await req.json();

    if (!token || !email || !yeniSifre) {
      return NextResponse.json(
        { message: "Eksik bilgi gonderildi." },
        { status: 400 }
      );
    }

    if (yeniSifre.length < 6) {
      return NextResponse.json(
        { message: "Sifre en az 6 karakter olmalidir." },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    const resetRecord = await db
      .collection("password_resets")
      .findOne({ email, token });

    if (!resetRecord) {
      return NextResponse.json(
        { message: "Gecersiz veya suresi dolmus baglanti." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(resetRecord.expires)) {
      await db.collection("password_resets").deleteOne({ token });
      return NextResponse.json(
        { message: "Baglantin suresi dolmus. Lutfen tekrar isteyin." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(yeniSifre, 12);
    await db.collection("users").updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    await db.collection("password_resets").deleteOne({ token });

    return NextResponse.json({
      message: "Sifreniz basariyla guncellendi. Giris yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { message: "Sunucu hatasi. Lutfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
