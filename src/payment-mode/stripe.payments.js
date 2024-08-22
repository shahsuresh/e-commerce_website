import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET);
// console.log(stripe);
import { Router } from "express";
import User from "../user/user.model.js";
import { isBuyer } from "../middlewares/authentication.middleware.js";
const router = Router();

// router.post("/stripe-pay",
const stripePaymentController = async (req, res) => {
  const { products } = req.body;
  // console.log(products);

  const buyerId = req.loggedInUserId;
  console.log("BUYER ID IS", buyerId);
  const user = await User.findOne({ _id: buyerId });
  console.log("USER", user);

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "npr",
      product_data: {
        name: product.name,
        // ...(product.image ? { images: [image] } : {}),
        // images: [product.image],
        metadata: { productID: product._id },
      },
      unit_amount: product.unitPrice * 100,
    },
    quantity: product.orderedQuantity,
    // total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  }));
  //   console.log("Line ITEMS::", lineItems);
  //   console.log(lineItems[0].price_data.product_data.name);
  const session = await stripe.checkout.sessions.create({
    submit_type: "pay",
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    //customer_email: "user?.email",
    metadata: {
      userId: buyerId,
    },
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/payment-success",
    cancel_url: "http://localhost:5173/payment-error",
  });
  //   console.log("SESSION BACKEND", session);
  res.json({ id: session.id });
};

// export default router;
export default stripePaymentController;
