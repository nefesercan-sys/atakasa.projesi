import mongoose, { Schema, models, model } from "mongoose";

// Koleksiyon adı/modeli eski sürümle aynı kalır ("varliks"): mevcut ilanlar kaybolmaz.
const varlikSchema = new Schema(
  {
    baslik: { type: String, required: true, trim: true, maxlength: 100 },
    aciklama: { type: String, trim: true, maxlength: 2000, default: "" },
    kategori: { type: String, required: true },
    sehir: { type: String, required: true },
    ilce: { type: String, trim: true, maxlength: 40, default: "" },
    // "Karşılığında ne istiyorum?" (serbest metin)
    takasIstegi: { type: String, trim: true, maxlength: 300, default: "" },
    // Cloudinary adresleri (fotoğraf ve video aynı listede; video adresi /video/upload/ içerir)
    resimler: [{ type: String }],
    satici: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // aktif | takasta (teklif kabul edildi, bekliyor) | takas_oldu | pasif | silindi
    durum: { type: String, default: "aktif", index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    goruntulenme: { type: Number, default: 0 },
    teklifSayisi: { type: Number, default: 0 },
  },
  { timestamps: true }
);

varlikSchema.index({ durum: 1, createdAt: -1 });
varlikSchema.index({ kategori: 1, durum: 1, createdAt: -1 });
varlikSchema.index({ sehir: 1, durum: 1, createdAt: -1 });

export default (models.Varlik as mongoose.Model<mongoose.InferSchemaType<typeof varlikSchema>>) || model("Varlik", varlikSchema);
