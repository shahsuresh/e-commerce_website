import { Router } from "express";
import { registerUserValidationSchema } from "./user.validation.js";
import User from "./user.model.js";
import bcrypt from "bcrypt";
import { loginUserValidationSchema } from "./user.validation.js";
import validateReqBody from "../middlewares/validation.middleware.js";
import jwt from "jsonwebtoken";

const router = Router();
//? register user means
// its just creating a new user
// forget not: to hash password before saving user into db

router.post(
  "/user/register",
  validateReqBody(registerUserValidationSchema),

  async (req, res) => {
    // extract new user data from req.body
    const newUser = req.body;

    // check if user with provided email already exist
    const userEmail = await User.findOne({ email: newUser.email });

    // if user exist, throw error
    if (userEmail) {
      return res
        .status(400)
        .send({ message: "User with this email already exists" });
    }
    // extract password from user data

    const plainPassword = newUser.password;
    const saltRound = 10;

    // convert plain password into hashed password

    const hashedPassword = await bcrypt.hash(plainPassword, saltRound);
    newUser.password = hashedPassword;

    // register user data in db

    await User.create(newUser);
    // send response
    return res.status(201).send({ message: "User Registration Success" });
  }
);

//?=======login user==========

router.post(
  "/user/login",
  validateReqBody(loginUserValidationSchema),

  async (req, res) => {
    //extract login data from req.body

    const loginData = req.body;

    //find user by provided email
    const user = await User.findOne({ email: loginData.email });
    console.log(user);

    //if user does not exist, throw error
    if (!user) {
      return res.status(404).send({ message: "Invalid Credentials" });
    }
    // check for password match

    const plainPassword = loginData.password;

    const hashedPassword = user.password;

    const isPasswordMatch = await bcrypt.compare(plainPassword, hashedPassword);

    //if not password match, throw error
    if (!isPasswordMatch) {
      return res.status(404).send({ message: "Invalid Credentials" });
    }

    //generate access token
    const payload = { email: user.email };
    const accessToken = jwt.sign(payload, "e5b12253701f86a67131");

    //to hide password

    user.password = undefined;

    //send response
    return res
      .status(200)
      .send({ message: "Login success", UserDetails: user, accessToken });
  }
);
//export router
export default router;
