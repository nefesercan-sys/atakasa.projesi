import mongoose, { Schema, models, model } from "mongoose";

const teklifSchema = new Schema(
  {
    hedefIlan: { type: Schema.Types.ObjectId, ref: "Varlik", required: true, index: true }, // istenen ürün
    teklifIlan: { type: Schema.Types.ObjectId, ref: "Varlik", required: true, index: true }, // karşılığında verilen ürün
    gonderen: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    alici: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mesaj: { type: String, trim: true, maxlength: 500, default: "" },
    // bekliyor → kabul → tamamlandi   |   red | iptal
    durum: { type: String, default: "bekliyor", index: true },
    gonderenOnay: { type: Boolean, default: false }, // "takas gerçekleşti" onayı
    aliciOnay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

teklifSchema.index({ hedefIlan: 1, teklifIlan: 1, durum: 1 });

export default (models.Teklif as mongoose.Model<mongoose.InferSchemaType<typeof teklifSchema>>) || model("Teklif", teklifSchema);
