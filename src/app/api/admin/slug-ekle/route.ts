import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import mongoose from "mongoose";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const dynamic = "force-dynamic";

export async function GET() {
  await connectMongoDB();
  const db = mongoose.connection.db;
  if (!db) return NextResponse.json({ error: "DB bağlantısı yok" }, { status: 500 });

  const ilanlar = await db.collection("varliklar").find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: "" }
    ]
  }).toArray();

  let guncellenen = 0;

  for (const ilan of ilanlar) {
    const base = slugify(ilan.baslik || "ilan");
    const slug = `${base}-${ilan._id.toString().slice(-6)}`;
    await db.collection("varliklar").updateOne(
      { _id: ilan._id },
      { $set: { slug } }
    );
    guncellenen++;
  }

  return NextResponse.json({
    mesaj: `${guncellenen} ilana slug eklendi ✅`,
    toplam: guncellenen,
  });
}
