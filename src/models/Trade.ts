import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  // SENİN MEVCUT ÇALIŞAN ALANLARIN (Bunlara dokunmuyoruz, sistemin çökmemesi için)
  offeredProductId: { type: String, required: true },
  requestedProductId: { type: String, required: true },
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  message: { type: String },

  // SİBER PANELE UYGUN YENİ NESİL DURUM (STATUS) ALANI
  // Enum sayesinde sadece bu kelimeler veritabanına girebilir, çakışma önlenir.
  status: { 
    type: String, 
    enum: [
      "beklemede",           // İlk teklif yapıldığında
      "kabul_edildi",        // Karşı taraf onayladığında
      "reddedildi",          // Karşı taraf reddettiğinde
      "gonderici_kargoladi", // Teklifi yapan kargoya verdiğinde
      "alici_kargoladi",     // Teklifi alan kargoya verdiğinde
      "tamamlandi"           // Her iki taraf ürünü teslim aldığında
    ],
    default: "beklemede" 
  },

  // KARGO TAKİP NUMARALARI (Panele anlık düşecek olan yeni alanlar)
  senderTrackingNumber: { type: String, default: null },
  receiverTrackingNumber: { type: String, default: null }

}, { timestamps: true }); // timestamps zaten var, bunu koruduk

export default mongoose.models.Trade || mongoose.model("Trade", tradeSchema);
