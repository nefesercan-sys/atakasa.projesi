import mongoose, { Schema, models, model } from "mongoose";

const MesajSchema = new Schema(
  {
    gonderen: { type: String, required: true }, // Gönderen email
    alici: { type: String, required: true },    // Alıcı email
    ilanId: { type: Schema.Types.ObjectId, ref: "Varlik", required: true },
    metin: { type: String, required: true },
    okundu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Mesaj = models.Mesaj || model("Mesaj", MesajSchema);
export default Mesaj;
