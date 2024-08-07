import express from "express";
import {
  isBuyer,
  isSeller,
  isUser,
} from "../middlewares/authentication.middleware.js";
import validateReqBody from "../middlewares/validation.middleware.js";
import {
  listProductByBuyerValidationSchema,
  newProductValidationSchema,
  paginationValidationSchema,
} from "./product.validation.js";
import Product from "./product.model.js";
import validateMongoIdFromReqParams from "../middlewares/validateMongoID.middleware.js";

const router = express.Router();

//?=== add product =====
//add product
//1. logged in user must be seller
//2. validate product
//3. create product in db

router.post(
  "/product/add",
  isSeller,
  validateReqBody(newProductValidationSchema),
  async (req, res) => {
    // extract new product from req.body
    const newProduct = req.body;

    // extract loggedInUserId
    const loggedInUserId = req.loggedInUserId;

    newProduct.sellerId = loggedInUserId;

    // create product
    await Product.create(newProduct);

    return res.status(200).send({ message: "Product is added successfully." });
  }
);

//?=====get product details by id===========
router.get(
  "/product/details/:id",
  isUser,
  validateMongoIdFromReqParams,
  async (req, res) => {
    //extract id from req.params
    const productId = req.params.id;

    //find product
    const product = await Product.findOne({ _id: productId }).select(
      "-sellerId"
    );

    //if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    //send response
    return res
      .status(200)
      .send({ message: "Success", productDetails: product });
  }
);

//?========delete product=====

router.delete(
  "/product/delete/:id",
  isSeller,
  validateMongoIdFromReqParams,
  async (req, res) => {
    //extract product Id from req.params.id
    const productId = req.params.id;

    //find product
    const product = await Product.findById(productId);

    //if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    //check product ownership

    // To be product owner: product sellerId must be equal to logged in user ID

    const sellerId = product.sellerId;
    const loggedInUserId = req.loggedInUserId;

    //const isProductOwner = String(sellerId) === String(loggedInUserId)
    //alternative code
    const isProductOwner = sellerId.equals(loggedInUserId);

    //if not product owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product" });
    }

    //delete product

    await Product.deleteOne({ _id: productId });

    //send response
    return res.status(200).send({ message: "Product Deleted Successfully" });
  }
);

//?=====edit product============

router.put(
  "/product/update/:id",
  isSeller,
  validateMongoIdFromReqParams,
  validateReqBody(newProductValidationSchema),
  async (req, res) => {
    //extract product Id from req.params.id
    const productId = req.params.id;

    //find product by id
    const product = await Product.findById(productId);

    //if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    //check product ownership

    // To be product owner: product sellerId must be equal to logged in user ID

    const sellerId = product.sellerId;
    const loggedInUserId = req.loggedInUserId;

    const isProductOwner = sellerId.equals(loggedInUserId);

    //if not product owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product" });
    }

    //extract new Values from req.body
    const productUpdatedData = req.body;

    //update/edit product

    await Product.updateOne(
      { _id: productId },
      { $set: { ...productUpdatedData } }
    );

    //send response
    return res.status(200).send({ message: "Product Updated Successfully" });
  }
);

//?=====list product by buyer======
router.post(
  "/product/list/buyer",
  isBuyer,
  validateReqBody(listProductByBuyerValidationSchema),
  async (req, res) => {
    //extract pagination data from req.body
    const { page, limit, searchText, category, minPrice, maxPrice } = req.body;
    // console.log({ page, limit, searchText, category, minPrice, maxPrice });

    //calculate skip and limit
    const skip = (page - 1) * limit;

    let match = {};

    if (searchText) {
      match = {
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { brand: { $regex: searchText, $options: "i" } },
        ],
      };
    }
    if (category) {
      match = { ...match, category: category };
    }
    if (minPrice && maxPrice && maxPrice < minPrice) {
      return res
        .status(409)
        .send({ message: "Min Price cannot be greater than Max Price" });
    }
    if (minPrice || maxPrice) {
      match = { ...match, price: { $gte: minPrice, $lte: maxPrice } };
    }

    const productList = await Product.aggregate([
      { $match: match },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          category: 1,
          freeShipping: 1,
          availableQuantity: 1,
          description: { $substr: ["$description", 0, 200] },
          image: 1,
        },
      },
    ]);
    if (!productList) {
      return res.status(404).send({ message: "No Products available now" });
    }
    // total products count
    const totalProducts = await Product.find(match).countDocuments();

    // total pages
    const totalPage = Math.ceil(totalProducts / limit);

    return res.status(200).send({ productList: productList, totalPage });
  }
);

//?=====list product by Seller======

router.post(
  "/product/list/seller",
  isSeller,
  validateReqBody(paginationValidationSchema),
  async (req, res) => {
    //extract pagination data from req.body
    const { page, limit } = req.body;

    //calculate skip and limit
    const skip = (page - 1) * limit;
    const productList = await Product.aggregate([
      {
        $match: { sellerId: req.loggedInUserId },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          category: 1,
          freeShipping: 1,
          availableQuantity: 1,
          description: { $substr: ["$description", 0, 200] },
          image: 1,
        },
      },
    ]);
    // calculate page
    const totalProducts = await Product.find({
      sellerId: req.loggedInUserId,
    }).countDocuments();

    // total page
    const totalPage = Math.ceil(totalProducts / limit);

    return res.status(200).send({ productList: productList, totalPage });
  }
);
export default router;
