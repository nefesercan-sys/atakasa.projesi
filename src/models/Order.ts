import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Ödeme ve Fiyat Bilgisi
  totalPrice: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Bekliyor', 'Ödendi', 'İade Edildi'], 
    default: 'Bekliyor' 
  },

  // Anlık Durum Takibi (Panelin kalbi burası)
  status: {
    type: String,
    enum: ['İşleme Alındı', 'Onaylandı', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'],
    default: 'İşleme Alındı'
  },

  // Kargo ve Adres
  shippingAddress: { type: String, required: true },
  trackingNumber: { type: String, default: null },

}, { timestamps: true }); // createdAt ve updatedAt otomatik eklenir

const Order = models.Order || model('Order', OrderSchema);
export default Order;
