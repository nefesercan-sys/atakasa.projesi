import mongoose from "mongoose";

const UyelikSchema = new mongoose.Schema({
  kullaniciEmail: { type: String, required: true, unique: true },
  plan: {
    type: String,
    enum: ["ucretsiz", "starter", "pro", "business"],
    default: "ucretsiz",
  },
  odemeModeli: { type: String, enum: ["aylik", "yillik"], default: "aylik" },
  baslangicTarihi: { type: Date, default: Date.now },
  bitisTarihi: { type: Date },
  aktif: { type: Boolean, default: true },
  otomatikYenileme: { type: Boolean, default: true },
  kullanim: {
    buAyIlan: { type: Number, default: 0 },
    buAyOneCikarma: { type: Number, default: 0 },
    buAyMesaj: { type: Number, default: 0 },
    sonSifirlamaTarihi: { type: Date, default: Date.now },
  },
  odemeGecmisi: [{
    tarih: Date,
    tutar: Number,
    plan: String,
    durum: String,
  }],
  // 10.000 üye kontrolü için
  uyeNumarasi: { type: Number },
  ucretliSistemeGecis: { type: Date },
}, { timestamps: true });

export default mongoose.models.Uyelik ||
  mongoose.model("Uyelik", UyelikSchema);
