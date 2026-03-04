import mongoose from "mongoose"

const TradeSchema = new mongoose.Schema({
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  offeredProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  requestedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true })

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema)
