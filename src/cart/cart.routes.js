import express from "express";
import { isBuyer } from "../middlewares/authentication.middleware.js";
import validateReqBody from "../middlewares/validation.middleware.js";
import { addItemToCartValidationSchema } from "./cart.validation.js";
import mongoose from "mongoose";
import Product from "../product/product.model.js";
import Cart from "./cart.model.js";

const router = express.Router();

//?===add item to Cart=====

router.post(
  "/cart/item/add",
  isBuyer,
  validateReqBody(addItemToCartValidationSchema),
  async (req, res) => {
    //extract cart data from req.body
    const cartData = req.body;

    //check productId validity i.e productId must be a valid mongoID
    const isValidMongoId = mongoose.isValidObjectId(cartData.productId);

    //if not valid mongo id, throw error
    if (!isValidMongoId) {
      return res.status(400).send({ message: "Invalid Mongo Id" });
    }
    //find product using product id
    const product = await Product.findOne({ _id: cartData.productId });

    //if not product, throw error
    if (!product) {
      return res.status(400).send({ message: "Product does not exist" });
    }

    //check if ordered quantity is less than or equal to product available quantity
    if (cartData.orderedQuantity > product.availableQuantity) {
      return res.status(409).send({
        message: "Ordered Quantity is greater than available quantity",
      });
    }
    // Check, if item is already present in loggedIn user's cart,
    // find cart using productId and buyerId
    const cartItem = await Cart.findOne({
      buyerId: req.loggedInUserId,
      productId: cartData.productId,
    });

    // if item is already present in user's cart, show message
    // Same user cannot add same item in cart more than one time,
    // but they can increase quantity of that item in his cart
    if (cartItem) {
      return res.status(409).send({
        message:
          "Item is already added to Cart. Try updating quantity from cart menu",
      });
    }
    // add item to cart
    await Cart.create({
      buyerId: req.loggedInUserId,
      productId: cartData.productId,
      orderedQuantity: cartData.orderedQuantity,
    });

    //send response
    return res
      .status(200)
      .send({ message: "Item is added to cart successfully" });
  }
);

//?====Clear/flush Cart=======
router.delete("/cart/clear", isBuyer, async (req, res) => {
  const loggedInUserId = req.loggedInUserId;

  //remove cart items from logged in user
  await Cart.deleteMany({ buyerId: loggedInUserId });
  return res.status(200).send({ message: "Cart is cleared successfully" });
});
export default router;
