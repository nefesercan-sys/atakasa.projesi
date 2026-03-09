import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // TEMEL BİLGİLER (Senin Trade.ts yapınla tam uyumlu String model)
  productId: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  
  // FİYAT VE ÖDEME DURUMU
  price: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: [
      "bekliyor", 
      "odendi", 
      "iade_edildi"
    ],
    default: "bekliyor"
  },

  // SİBER PANEL İÇİN ANLIK SİPARİŞ DURUMU (STATUS)
  status: {
    type: String,
    enum: [
      "isleme_alindi",   
      "onaylandi",       
      "kargolandi",      
      "teslim_edildi",   
      "iptal_edildi"     
    ],
    default: "isleme_alindi"
  },

  // TESLİMAT BİLGİLERİ
  trackingNumber: { type: String, default: null },
  shippingAddress: { type: String, required: true },

}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
