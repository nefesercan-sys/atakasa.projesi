
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import crypto from "crypto";

export const maxDuration = 300;

export async function GET() {
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

    const mongoose = await import("mongoose");
    const db = mongoose.default.connection.db;

    if (!db) {
      return NextResponse.json({ success: false, error: "DB bağlantısı yok" }, { status: 500 });
    }

    const collection = db.collection("varliks");

    const varliks = await collection.find({
      resimler: { $elemMatch: { $regex: "^data:image" } }
    }).toArray();

    const log: string[] = [];
    log.push(`📦 ${varliks.length} adet base64 resimli ilan bulundu`);

    let basarili = 0;
    let hatali = 0;

    for (const varlik of varliks) {
      const yeniResimler: string[] = [];
      let degisti = false;
      const resimler = Array.isArray(varlik.resimler) ? varlik.resimler : [];

      for (let i = 0; i < resimler.length; i++) {
        const resim = resimler[i];

        if (typeof resim === "string" && resim.startsWith("data:image")) {
          try {
            const base64Data = resim.replace(/^data:image\/\w+;base64,/, "");
            const publicId = `atakasa/${varlik._id}_${i}`;
            const url = await uploadToCloudinary(base64Data, publicId);
            yeniResimler.push(url);
            degisti = true;
            log.push(`✅ ${varlik.baslik} - resim ${i + 1} yüklendi`);
            await new Promise(r => setTimeout(r, 400));
          } catch (err: any) {
            log.push(`❌ ${varlik.baslik} - resim ${i + 1}: ${err.message}`);
            yeniResimler.push(resim);
            hatali++;
          }
        } else {
          yeniResimler.push(resim);
        }
      }

      if (degisti) {
        await collection.updateOne(
          { _id: varlik._id },
          { $set: { resimler: yeniResimler } }
        );
        basarili++;
        log.push(`💾 Kaydedildi: ${varlik.baslik}`);
      }
    }

    log.push(`🎉 Tamamlandı! Başarılı: ${basarili}, Hatalı: ${hatali}`);

    return NextResponse.json({ success: true, log }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
