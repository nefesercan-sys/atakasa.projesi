import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: "Pro Broker" },
    image: { type: String },
    toplamHacim: { type: Number, default: 0 },
    basariliIslem: { type: Number, default: 0 }
  },
  { timestamps: true } // Ne zaman kayıt olduğunu otomatik tutar
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
