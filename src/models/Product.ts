import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  ownerEmail: { type: String, required: true },
  image: { type: String, default: "https://placehold.co/600x400/030712/00f260?text=ATAKASA" },
  status: { type: String, default: "aktif" }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
