/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import crypto from "crypto";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const onlyCount = searchParams.get("count");

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "diuamcnej";
  const API_KEY = process.env.CLOUDINARY_API_KEY || "";
  const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

  async function uploadToCloudinary(base64Data: string, publicId: string) {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
      .digest("hex");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: `data:image/png;base64,${base64Data}`,
        public_id: publicId,
        timestamp,
        api_key: API_KEY,
        signature,
      }),
    });

    const data = await res.json();
    if (data.secure_url) return data.secure_url as string;
    throw new Error(data.error?.message || "Cloudinary hatası");
  }

  try {
    await connectMongoDB();
    const db = mongoose.connection.useDb("nexus_db");
    const collection = db.collection("varliks");

    // Sadece sayım yap
    if (onlyCount) {
      const total = await collection.countDocuments();
      const withBase64 = await collection.countDocuments({
        resimler: { $elemMatch: { $regex: "data:image" } }
      });
      return NextResponse.json({ total, withBase64 });
    }

    // Sadece 1 ilan işle (timeout olmasın)
    const varlik = await collection.findOne({
      resimler: { $elemMatch: { $regex: "data:image" } }
    });

    if (!varlik) {
      return NextResponse.json({ success: true, message: "🎉 Tüm resimler taşındı!" });
    }

    const log: string[] = [];
    const yeniResimler: string[] = [];
    const resimler = Array.isArray(varlik.resimler) ? varlik.resimler : [];

    for (let i = 0; i < resimler.length; i++) {
      const resim = resimler[i];
      if (typeof resim === "string" && resim.includes("data:image")) {
        try {
          const base64Data = resim.replace(/^data:image\/\w+;base64,/, "");
          const publicId = `atakasa/${varlik._id}_${i}`;
          const url = await uploadToCloudinary(base64Data, publicId);
          yeniResimler.push(url);
          log.push(`✅ Resim ${i + 1} yüklendi`);
        } catch (err: any) {
          log.push(`❌ Resim ${i + 1} hata: ${err.message}`);
          yeniResimler.push(resim);
        }
      } else {
        yeniResimler.push(resim);
      }
    }

    await collection.updateOne(
      { _id: varlik._id },
      { $set: { resimler: yeniResimler } }
    );

    log.push(`💾 Kaydedildi: ${varlik.baslik}`);
    log.push(`🔄 Devam etmek için sayfayı tekrar aç`);

    return NextResponse.json({ success: true, ilan: varlik.baslik, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

Deploy olunca önce şunu aç — kaç ilan var görelim:
```
atakasa.com/api/migrate?count=1
```

Sonra her seferinde şunu aç, her açışta 1 ilan işlenecek:
```
atakasa.com/api/migrate
