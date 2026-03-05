import mongoose, { Schema, models } from "mongoose";

const varlikSchema = new Schema(
  {
    baslik: { type: String, required: true },
    fiyat: { type: Number, required: true },
    kategori: { type: String, required: true },
    ulke: { type: String, required: true },
    sehir: { type: String, required: true },
    ilce: { type: String, required: true },
    aciklama: { type: String },
    takasIstegi: { type: String },
    resimler: [{ type: String }], // Görsel linklerini tutacak dizi
    satici: { type: Schema.Types.ObjectId, ref: "User", required: true }, // İlanı kimin verdiğini User'a bağlar
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Varlik = models.Varlik || mongoose.model("Varlik", varlikSchema);
export default Varlik;
