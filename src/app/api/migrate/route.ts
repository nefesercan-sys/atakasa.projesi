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
    throw new Error(data.error?.message || "Cloudinary error");
  }

  try {
    await connectMongoDB();
    const db = mongoose.connection.useDb("nexus_db");
    const collection = db.collection("varliks");

    if (onlyCount) {
      const total = await collection.countDocuments();
      const withBase64 = await collection.countDocuments({
        resimler: { $elemMatch: { $regex: "data:image" } }
      });
      return NextResponse.json({ total, withBase64 });
    }

    const varlik = await collection.findOne({
      resimler: { $elemMatch: { $regex: "data:image" } }
    });

    if (!varlik) {
      return NextResponse.json({ success: true, message: "All images migrated!" });
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
          log.push(`OK: Image ${i + 1} uploaded`);
        } catch (err: any) {
          log.push(`ERROR: Image ${i + 1}: ${err.message}`);
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

    log.push(`Saved: ${varlik.baslik}`);

    return NextResponse.json({ success: true, ilan: varlik.baslik, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
