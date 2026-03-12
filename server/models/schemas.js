import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const RentalSchema = new Schema({
  title: { type: String },
  location: { type: String, index: true },
  street: { type: String },
  category: { type: String },
  image: { type: String },
  bedrooms: { type: Number },
  shared: { type: Boolean },
  description: { type: String },
  price: { type: String },
  dailyRate: { type: Number, index: true },
  listingURL: { type: String, required: true, unique: true },
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure unique index on listingURL
// RentalSchema.index({ listingURL: 1 }, { unique: true });

export default mongoose.model('Rental', RentalSchema);