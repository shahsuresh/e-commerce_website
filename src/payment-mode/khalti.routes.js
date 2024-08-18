import axios from "axios";
import { Router } from "express";

const router = Router();
//?=======route to initiate payment==========
router.post("/khalti-api", async (req, res) => {
  let headersList = {
    Authorization: `Key b26190226c8641cc86c13fa2e8ba69de`,
    "Content-Type": "application/json",
  };
  let bodyContent = JSON.stringify({
    return_url: "http://localhost:5173/payment-success",
    website_url: "http://localhost:5173/",
    amount: 500,
    purchase_order_id: "test1",
    purchase_order_name: "test",
    customer_info: {
      name: "Suresh",
      email: "example@gmail.com",
      phone: "9800000123",
    },
  });
  let reqOptions = {
    url: `https://a.khalti.com/api/v2/epayment/initiate/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };
  let response = await axios.request(reqOptions);
  return response.data;
  // const payload = req.body;
  // console.log(payload);
  // const payload = {
  //   return_url: "https://example.com/payment/",
  //   website_url: "https://example.com/",
  //   amount: 1300,
  //   purchase_order_id: "test12",
  //   purchase_order_name: "test",
  //   customer_info: {
  //     name: "Khalti Bahadur",
  //     email: "example@gmail.com",
  //     phone: "9800000123",
  //   },
  // };
  // const stringifiedPayload = JSON.stringify(payload);

  // const khaltiResponse = await axios.post(
  //   `https://a.khalti.com/api/v2/epayment/initiate/`,
  //payload,

  //   // stringifiedPayload,
  //   {
  //     headers: {
  //       Authorization: `key b26190226c8641cc86c13fa2e8ba69de`,
  //       "Content-Type": "application/json",
  //     },
  //   },
  //   payload
  // );
  // if (khaltiResponse) {
  //   res.json({
  //     success: true,
  //     data: khaltiResponse?.data,
  //   });
  // } else {
  //   res.json({
  //     success: false,
  //     message: "something went wrong",
  //   });
  // }
});

export default router;
