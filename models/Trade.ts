// models/Trade.ts

import mongoose, { Schema, models, model } from "mongoose";

const TradeSchema = new Schema(
  {
    initiator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    requestedProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "shipping",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    escrowAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default models.Trade || model("Trade", TradeSchema);
