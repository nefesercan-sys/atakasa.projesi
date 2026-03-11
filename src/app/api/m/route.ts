import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    // 1. Güncel veritabanına (atakasadb) bağlan
    await connectMongoDB();

    // 2. Eski veritabanına (nexus_db) tünel aç
    const oldDb = mongoose.connection.useDb("nexus_db");
    const oldVarliks = oldDb.collection("varliks");
    const oldUsers = oldDb.collection("users");

    // 3. Yeni veritabanı bağlantılarını al
    const newDb = mongoose.connection;
    const newVarliks = newDb.collection("varliks");
    const newUsers = newDb.collection("users");

    // 4. Eski verileri hafızaya çek
    const varlikListesi = await oldVarliks.find({}).toArray();
    const userListesi = await oldUsers.find({}).toArray();

    const log: string[] = [];
    log.push(`🔍 Eski DB'de bulunan İlan: ${varlikListesi.length}`);
    log.push(`👤 Eski DB'de bulunan Kullanıcı: ${userListesi.length}`);

    // 5. Kullanıcıları (Satıcıları) yeni DB'ye kopyala
    if (userListesi.length > 0) {
      try {
        // Çakışmayı önlemek için önce yeniyi temizle (Zaten boş)
        await newUsers.deleteMany({});
        await newUsers.insertMany(userListesi, { ordered: false });
        log.push(`✅ Kullanıcılar başarıyla yeni veritabanına aktarıldı.`);
      } catch (err: any) {
        log.push(`⚠️ Kullanıcı aktarımında uyarı (Önemsiz): ${err.message}`);
      }
    }

    // 6. İlanları yeni DB'ye kopyala
    if (varlikListesi.length > 0) {
      try {
        await newVarliks.deleteMany({});
        await newVarliks.insertMany(varlikListesi, { ordered: false });
        log.push(`🚀 ${varlikListesi.length} ADET İLAN BAŞARIYLA YENİ VERİTABANINA KLONLANDI!`);
      } catch (err: any) {
        log.push(`❌ İlan aktarım hatası: ${err.message}`);
      }
    } else {
      log.push("⚠️ Eski veritabanında taşınacak ilan bulunamadı.");
    }

    return NextResponse.json({ success: true, log }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
