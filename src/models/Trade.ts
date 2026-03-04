import mongoose from "mongoose"

const TradeSchema = new mongoose.Schema({
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  offeredProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  offeredProductId: { type: String, required: true },
  requestedProductId: { type: String, required: true },
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  status: { type: String, default: "beklemede" }, // beklemede, kabul_edildi, reddedildi
  message: { type: String }
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model("Trade", tradeSchema);: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true })

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema)
