import mongoose, { Schema, models } from "mongoose";

const varlikSchema = new Schema(
  {
    baslik:   { type: String, required: true },
    fiyat:    { type: Number, required: true },

    eskiFiyat:            { type: Number, default: 0 },
    fiyatGuncellemeTarihi:{ type: Date, default: Date.now },

    kategori: { type: String, required: true },
    ulke:     { type: String, required: true },
    sehir:    { type: String, required: true },
    ilce:     { type: String, required: true },
    aciklama: { type: String },
    takasIstegi: { type: String },
    resimler: [{ type: String }],
    satici:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    aktif:    { type: Boolean, default: true },

    // ─── YENİ: SEO Slug ───────────────────────────────────
    slug: {
      type: String,
      unique: true,
      sparse: true,   // mevcut kayıtları etkilemez
      index: true,
      trim: true,
    },

    goruntulenmeSayisi:    { type: Number, default: 0 },
    takasTeklifSayisi:     { type: Number, default: 0 },
    begeniSayisi:          { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Hızlandırıcı index'ler
varlikSchema.index({ createdAt: -1 });
varlikSchema.index({ kategori: 1, createdAt: -1 });
varlikSchema.index({ satici: 1, createdAt: -1 });
varlikSchema.index({ sehir: 1, createdAt: -1 });
varlikSchema.index({ sehir: 1, kategori: 1, createdAt: -1 });
varlikSchema.index({ aktif: 1, createdAt: -1 });

const Varlik = models.Varlik || mongoose.model("Varlik", varlikSchema);
export default Varlik;
