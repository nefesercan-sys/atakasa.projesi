import mongoose, { Schema, models } from "mongoose";

// Mevcut "users" koleksiyonu korunur (eski üyeler çalışmaya devam eder).
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    telefon: { type: String, trim: true, maxlength: 20 },
    sehir: { type: String, trim: true },
    image: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
