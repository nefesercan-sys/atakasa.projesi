import mongoose, { Schema, models } from "mongoose";

// Mevcut "varliks" koleksiyonu korunur. Eski ilanlarda durum/videolar alanları yoktur: yokluğu "aktif" sayılır.
const varlikSchema = new Schema(
  {
    baslik: { type: String, required: true, trim: true, maxlength: 100 },
    aciklama: { type: String, trim: true, maxlength: 2000 },
    takasIstegi: { type: String, trim: true, maxlength: 300 }, // "Karşılığında ne istiyorum"
    kategori: { type: String, required: true },
    sehir: { type: String, required: true },
    ilce: { type: String, default: "" },
    ulke: { type: String, default: "Türkiye" },
    resimler: [{ type: String }],
    videolar: [{ type: String }],
    satici: { type: Schema.Types.ObjectId, ref: "User", required: true },
    aktif: { type: Boolean, default: true },
    durum: { type: String, enum: ["aktif", "takasta", "takasEdildi"], default: "aktif" },
    slug: { type: String, unique: true, sparse: true, index: true, trim: true },
    goruntulenmeSayisi: { type: Number, default: 0 },
    takasTeklifSayisi: { type: Number, default: 0 },
    // Eski alanlar (geriye dönük uyum; yeni ilanlarda kullanılmaz)
    fiyat: { type: Number, default: 0 },
    eskiFiyat: { type: Number },
  },
  { timestamps: true }
);

varlikSchema.index({ createdAt: -1 });
varlikSchema.index({ sehir: 1, kategori: 1, createdAt: -1 });
varlikSchema.index({ satici: 1, createdAt: -1 });
varlikSchema.index({ baslik: "text", aciklama: "text", takasIstegi: "text" });

const Varlik = models.Varlik || mongoose.model("Varlik", varlikSchema);
export default Varlik;
