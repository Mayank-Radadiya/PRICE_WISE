import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  currency: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  priceHistory: [
    {
      price: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lowestPrice: { type: Number },
  highestPrice: { type: Number },
  averagePrice: { type: Number },
  discountRate: { type: Number },
  isOutOfStock: { type: Boolean },
  description: { type: String },
  reviews: { type: Number },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});
