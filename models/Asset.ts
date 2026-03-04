import mongoose, { Schema, model, models } from 'mongoose';

const AssetSchema = new Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: false }, // İleride eklenecek Cloudinary medya linkleri için
  description: { type: String, required: false },
}, { timestamps: true });

const Asset = models.Asset || model('Asset', AssetSchema);

export default Asset;
