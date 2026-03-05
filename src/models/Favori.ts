import mongoose, { Schema, models, model } from "mongoose";

const FavoriSchema = new Schema(
  {
    kullaniciEmail: { type: String, required: true },
    ilanId: { type: Schema.Types.ObjectId, ref: "Varlik", required: true },
  },
  { timestamps: true }
);

const Favori = models.Favori || model("Favori", FavoriSchema);
export default Favori;
