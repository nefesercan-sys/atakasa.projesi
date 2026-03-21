// Mevcut tüm varlıklar için slug üret — TEK SEFERLIK çalıştır
// Kullanım: npx ts-node -r tsconfig-paths/register scripts/migrate-slugs.ts

import mongoose from "mongoose";
import { generateVarlikSlug } from "../src/utils/slugify";

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ DB bağlandı\n");

  const collection = mongoose.connection.db.collection("varliks");
  const varliklar = await collection
    .find({ slug: { $exists: false } })
    .project({ _id: 1, baslik: 1, kategori: 1, sehir: 1 })
    .toArray();

  console.log(`📦 ${varliklar.length} varlık işlenecek\n`);

  const sayac: Record<string, number> = {};
  let basarili = 0;

  for (const v of varliklar) {
    const base = generateVarlikSlug(
      v.baslik   || "ilan",
      v.kategori || "genel",
      v.sehir    || "turkiye"
    );

    let slug = base;
    if (sayac[base]) { sayac[base]++; slug = `${base}-${sayac[base]}`; }
    else sayac[base] = 1;

    await collection.updateOne({ _id: v._id }, { $set: { slug } });
    console.log(`✅ ${v._id} → /varlik/${slug}`);
    basarili++;
  }

  console.log(`\n✅ ${basarili} varlık güncellendi`);
  await mongoose.disconnect();
}

main().catch(console.error);
