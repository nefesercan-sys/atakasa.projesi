import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  offeredProductId: { type: String, required: true },
  requestedProductId: { type: String, required: true },
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  status: { type: String, default: "beklemede" },
  message: { type: String }
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model("Trade", tradeSchema);
