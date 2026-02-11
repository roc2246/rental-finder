import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const RentalSchema = new Schema({
  title: String,
  city: String,
  street: String,
  category: String,
  image: String,
  bedrooms: Number,
  shared: Boolean,
  description: String,
  rent: Number
});

RentalSchema.index({ city: 1 });
RentalSchema.index({ rent: 1 });


export default mongoose.model('Rental', RentalSchema);