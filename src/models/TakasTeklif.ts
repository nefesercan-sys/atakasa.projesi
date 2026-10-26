import mongoose, { Schema, models } from "mongoose";

// Takas teklifi: "gonderen", kendi ilanını (teklifIlan) karşı tarafın ilanıyla (hedefIlan) takas etmeyi önerir.
// Akış: bekliyor → kabul (ilan sahibi) → her iki taraf "takas yapıldı" onayı → tamamlandi.  Para/teminat/komisyon YOK.
const takasSchema = new Schema(
  {
    hedefIlan: { type: Schema.Types.ObjectId, ref: "Varlik", required: true, index: true },
    teklifIlan: { type: Schema.Types.ObjectId, ref: "Varlik", required: true, index: true },
    gonderen: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    alici: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mesaj: { type: String, trim: true, maxlength: 500 },
    durum: { type: String, enum: ["bekliyor", "kabul", "red", "iptal", "tamamlandi"], default: "bekliyor", index: true },
    gonderenOnay: { type: Boolean, default: false }, // "takas gerçekleşti" onayı
    aliciOnay: { type: Boolean, default: false },
    // Liste ekranları için kopya (ilan silinse bile teklif geçmişi okunur)
    hedefBaslik: { type: String },
    hedefResim: { type: String },
    teklifBaslik: { type: String },
    teklifResim: { type: String },
  },
  { timestamps: true }
);

const TakasTeklif = models.TakasTeklif || mongoose.model("TakasTeklif", takasSchema);
export default TakasTeklif;
