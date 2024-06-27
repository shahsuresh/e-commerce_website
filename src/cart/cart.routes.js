import express from "express";
import { isBuyer } from "../middlewares/authentication.middleware.js";
import validateReqBody from "../middlewares/validation.middleware.js";
import {
  addItemToCartValidationSchema,
  updateCartQuantityValidationSchema,
} from "./cart.validation.js";
import mongoose from "mongoose";
import Product from "../product/product.model.js";
import Cart from "./cart.model.js";
import validateMongoIdFromReqParams from "../middlewares/validateMongoID.middleware.js";

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

//?======remove single product from cart==========

router.delete(
  "/cart/item/remove/:id",
  isBuyer,
  validateMongoIdFromReqParams,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find product by id
    const product = await Product.findOne({ _id: productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    // remove product for this user from cart
    await Cart.deleteOne({ buyerId: req.loggedInUserId, productId: productId });

    // send res
    return res
      .status(200)
      .send({ message: "Item is removed from Cart Successfully" });
  }
);

//?======update item quantity in cart==========
//use product id
router.put(
  "/cart/item/update/quantity/:id",
  isBuyer,
  validateReqBody(updateCartQuantityValidationSchema),
  async (req, res) => {
    //extract productId from req.params
    const productId = req.params.id;

    //extract buyerId from req.loggedInUserId
    const buyerId = req.loggedInUserId;

    //extract action from req.body
    const actionData = req.body;

    //find product using productId

    const product = await Product.findOne({ _id: productId });

    //if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    //find product's available Quanity
    const productAvailableQuantity = product?.availableQuantity;

    //find cart
    const cartItem = await Cart.findOne({ buyerId, productId });

    //if not cart item, throw error
    if (!cartItem) {
      return res.status(404).send({ message: "Cart item does not exist" });
    }

    //extract previous ordered quantity from cart item
    let previousOrderedQuantity = cartItem.orderedQuantity;
    let newOrderedQuantity;

    if (actionData.action === "inc") {
      newOrderedQuantity = previousOrderedQuantity + 1;
    } else {
      newOrderedQuantity = previousOrderedQuantity - 1;
    }

    if (newOrderedQuantity < 1) {
      return res
        .status(403)
        .send({ message: "Ordered Quantity cannot be zero" });
    }
    if (newOrderedQuantity > productAvailableQuantity) {
      return res
        .status(403)
        .send({ message: "Product Reached available Quantity" });
    }
    // update cart item with new ordered quantity
    await Cart.updateOne(
      { buyerId: buyerId, productId: productId },
      {
        $set: {
          orderedQuantity: newOrderedQuantity,
        },
      }
    );

    return res
      .status(200)
      .send({ message: "Cart item quantity is updated successfully." });
  }
);

//?===========list cart items=========

router.get("/cart/item/list", isBuyer, async (req, res) => {
  // extract buyerId from req.loggedInUserId
  const buyerId = req.loggedInUserId;

  const cartData = await Cart.aggregate([
    {
      $match: {
        buyerId: buyerId,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $project: {
        name: { $first: "$productDetails.name" },
        brand: { $first: "$productDetails.brand" },
        unitPrice: { $first: "$productDetails.price" },
        image: { $first: "$productDetails.image" },
        orderedQuantity: 1,
        productId:1
      },
      
    },
    {
      $project:{
        name:1,
        brand:1,
        unitPrice:1,
        image:1,
        orderedQuantity:1,
        productId:1,
        subTotal:{$multiply:["$unitPrice","$orderedQuantity"]}

    }
  }
  ]);
  //calculate subtotal and grand total of products added in cart
  let allProductSubTotal = 0;
  let discountPercent = 0.05; // 5% percent flat discount
  let discountAmount = 0;
  let grandTotal = 0;

  cartData.forEach((item) => {
    allProductSubTotal = allProductSubTotal + item.subTotal;
  });

  discountAmount = discountPercent * allProductSubTotal;

  grandTotal = allProductSubTotal - discountAmount;

  return res.status(200).send({ message: "success", cartData: cartData,orderSummary: {
    allProductSubTotal,
    discountAmount: discountAmount.toFixed(2),
    grandTotal,
  }, });
});

//?==========get cart item count===============

router.get("/cart/item/count",isBuyer ,async(req,res)=>{
  const loggedInUserId = req.loggedInUserId;
  const cartItemCount = await Cart.find({buyerId:loggedInUserId}).countDocuments();
  return res.status(200).send({message:"Success",cartItemCount});
})

export default router;
