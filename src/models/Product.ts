import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "available" }
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
