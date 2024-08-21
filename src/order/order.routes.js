import express from "express";
import orderModel from "./order.model.js";
import { isBuyer } from "../middlewares/authentication.middleware.js";
const router = express.Router();

router.get("/order-list", isBuyer, async (req, res) => {
  try {
    const userId = req.loggedInUserId;
    console.log("USERID FROM ORDER ROUTES", userId);
    const orderDetails = await orderModel
      .find({ userId: userId })
      .sort({ createdAt: -1 });
    console.log("ORDER DETAILS", orderDetails);

    if (!orderDetails.length) {
      return res.status(200).send({ message: "No any orders from you" });
    }
    return res
      .status(200)
      .send({ message: "success", orderDetails: orderDetails });
  } catch (error) {
    res.status(500).json({ message: error.message || error });
  }
});

export default router;
