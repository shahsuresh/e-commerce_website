import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 60,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      maxlength: 60,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      enum: [
        "grocery",
        "electronics",
        "furniture",
        "electrical",
        "kitchen",
        "kids",
        "sports",
        "auto",
        "clothes",
        "shoes",
        "pharmaceuticals",
        "stationary",
        "cosmetics",
      ],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    sellerId: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    availableQuantity: {
      type: Number,
      min: 1,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      minlength: 200,
      maxlength: 1000,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
