import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET);
// console.log(stripe);
import { Router } from "express";
const router = Router();

router.post("/stripe-pay", async (req, res) => {
  const { products } = req.body;

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "npr",
      product_data: {
        name: product.name,
        // ...(product.image ? { images: [image] } : {}),
        // images: [product.image],
      },
      unit_amount: product.unitPrice * 100,
    },
    quantity: product.orderedQuantity,
    // total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  }));
  //   console.log("Line ITEMS::", lineItems);
  //   console.log(lineItems[0].price_data.product_data.name);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/payment-success",
    cancel_url: "http://localhost:5173/payment-error",
  });
  //   console.log("SESSION BACKEND", session);
  res.json({ id: session.id });
});

export default router;
