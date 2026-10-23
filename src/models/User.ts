import mongoose, { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    telefon: { type: String, trim: true, maxlength: 20 },
    sehir: { type: String, trim: true, maxlength: 40 },
    tamamlananTakas: { type: Number, default: 0 },
    resetTokenHash: { type: String, select: false },
    resetTokenBitis: { type: Date, select: false },
  },
  { timestamps: true }
);

export default (models.User as mongoose.Model<mongoose.InferSchemaType<typeof userSchema>>) || model("User", userSchema);
