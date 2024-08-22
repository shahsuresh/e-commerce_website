import Stripe from "stripe";
import Cart from "../cart/cart.model.js";
import orderModel from "./order.model.js";
import emailSender from "../email/emailSender.js";
const stripe = Stripe(process.env.STRIPE_SECRET);
const endpointSecret =
  "whsec_edb3c6a11603d1b2603a74faf397ced1c46a6e22e1f9d3500773674f28f9ea62";

//?======get lineitems==============
async function getLIneItems(lineItems) {
  let ProductItems = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productID;
      // console.log("PRODUCT FROM WEBHOOK", product);
      const productData = {
        productId: productId,
        name: product.name,
        price: item.price.unit_amount / 100,
        quantity: item.quantity,
        image: product.images,
      };
      ProductItems.push(productData);
      // console.log("PRODUCT ITEMS", ProductItems);
    }
  }

  return ProductItems;
}

//==================================

const webhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  const payload = JSON.stringify(request.body);
  const header = stripe.webhooks.generateTestHeaderString({
    payload: payload,
    secret: endpointSecret,
  });
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, header, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  //? Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // Then define and call a function to handle the event checkout.session.completed
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      // console.log("LINEITEMS", lineItems);

      const productDetails = await getLIneItems(lineItems);
      const orderDetails = {
        productDetails: productDetails,
        email: session.customer_email,
        userId: session.metadata.userId,
        paymentDetails: {
          paymentId: session.payment_intent,
          payment_method_type: session.payment_method_types,
          payment_status: session.payment_status,
        },
        shipping_options: session.shipping_options.map((s) => {
          return {
            ...s,
            shipping_amount: s.shipping_amount / 100,
          };
        }),
        totalAmount: session.amount_total / 100,
      };
      // console.log("ORDER DETAILS WEBHOOK", orderDetails);
      const order = new orderModel(orderDetails);
      const saveOrder = await order.save();

      if (saveOrder?._id) {
        //! ==on payment success, delete all products from that user cart====
        const deleteCartItem = await Cart.deleteMany({
          buyerId: session.metadata.userId,
        });
      }
      //TODO: send email to user , containing user order details
      //*========function to send email containing order details to user==========
      emailSender(orderDetails);
      //==========================================================================
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.status(200).send();
};

export default webhooks;
