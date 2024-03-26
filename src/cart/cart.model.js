import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    buyerId: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    productId: {
      type: mongoose.ObjectId,
      ref: "products",
      required: true,
    },
    orderedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {}
);
//create table
const Cart = mongoose.model("Cart", cartSchema);

//export table
export default Cart;
