import express from "express";
import connectDB from "./src/db/connect.db.js";
import userRoutes from "./src/user/user.routes.js";
import productRoutes from "./src/product/product.route.js";

const app = express();
//? ==to make app understand json===
app.use(express.json());

//?======database connection======

connectDB();

//?=====register routes======
app.use(userRoutes);
app.use(productRoutes);

//?===server and PORT======
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running at port:${PORT}`);
});
