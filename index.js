import express from "express";
import connectDB from "./src/db/connect.db.js";
import userRoutes from "./src/user/user.routes.js";
import productRoutes from "./src/product/product.route.js";
import cartRoutes from "./src/cart/cart.routes.js";
import khaltiRoutes from "./src/payment-mode/khalti.routes.js";
// import stripeRoutes from "./src/payment-mode/stripe.payments.js";
import orderRoutes from "./src/order/order.routes.js";
import cors from "cors";
import webhooks from "./src/order/webhook.js";
import {
  isBuyer,
  isUser,
} from "./src/middlewares/authentication.middleware.js";
import stripePaymentController from "./src/payment-mode/stripe.payments.js";

const app = express();
//? ==to make app understand json===
app.use(express.json());

//?=== enable cors===
// Cross origin Resource Sharing

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// app.use(cors());
app.use(cors(corsOptions));
//======
app.use(express.urlencoded({ extended: true }));

//?======database connection======

connectDB();

//?=====register routes======
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(khaltiRoutes);
// app.use(stripeRoutes);
app.post("/stripe-pay", stripePaymentController);
app.post("/webhook", webhooks); // /api/webhook
app.use(orderRoutes);

//?===server and PORT======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});
