import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false, // Use `true` for port 465, `false` for all other ports
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
let emailSender = async ({
  productDetails,
  email,
  paymentDetails,
  totalAmount,
}) => {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Nepal e-Mart"<shahsuresh75@gmail.com>', // sender address
      to: `${email},shahsuresh75@zohomail.com`, // list of receivers
      subject: `Order Conformed for:${productDetails[0].name}.`, // Subject line
      //   text: `Thank you for your order placed on ${new Date()}`,
      // plain text body
      html: `
        <h1> Hello Suresh</h1>
        <h2>Thank you for your order placed on ${new Date()}</h2>
        <p>Your order <strong>#123456</strong> has been confirmed.</p>
        <p>We appreciate you and hope you enjoy your new products.</p>
        <hr>
        <h2>Order Details</h2>
        <ul>
            <li><strong>Product Name:</strong> ${productDetails.map((item) => {
              return item.name;
            })}</li>
            <li><strong>Quantity:</strong> ${productDetails.map((item) => {
              return item.quantity;
            })}</li>
            <li><strong>Total Price:</strong><b style="color:green;">${totalAmount}</b></li>
            <li><strong>Payment Status:</strong> <b style="color:green;">${
              paymentDetails.payment_status
            }</b> 
            </li>
            
            
        </ul>
        <p>We will send you another email once your order has been shipped.</p>
        <p>Best regards,</p>
        <p>Nepal e-Mart</p>
    `, // HTML body content
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  } catch (error) {
    console.log("SOMETHING IS WRONG");
    console.log(error.message);
  }
};
// emailSender();
export default emailSender;
