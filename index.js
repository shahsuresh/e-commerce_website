import express from "express";
import connectDB from "./src/db/connect.db.js";
import userRoutes from "./src/user/user.routes.js";
import productRoutes from "./src/product/product.route.js";
import cartRoutes from "./src/cart/cart.routes.js";
import khaltiRoutes from "./src/payment-mode/khalti.routes.js";
import stripeRoutes from "./src/payment-mode/stripe.payments.js";
import cors from "cors";

const app = express();
//? ==to make app understand json===
app.use(express.json());

//?=== enable cors===
// Cross origin Resource Sharing

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors());
// app.use(cors(corsOptions));
//======
app.use(express.urlencoded({ extended: true }));

//?======database connection======

connectDB();

//?=====register routes======
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(khaltiRoutes);
app.use(stripeRoutes);

//?===server and PORT======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});
