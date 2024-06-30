import Yup from "yup";

export const newProductValidationSchema = Yup.object({
  name: Yup.string()
    .required("Product Name is required")
    .trim()
    .max(60, "Product name must be at most 60 Characters"),
  brand: Yup.string()
    .required("Brand Name is required")
    .trim()
    .max(60, "Brand name must be at most 60 Characters"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be a positive number"),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .oneOf([
      "grocery",
      "electronics",
      "furniture",
      "electrical",
      "kitchen",
      "kids",
      "sports",
      "personal care",
      "auto",
      "auto",
      "clothes",
      "shoes",
      "pharmaceuticals",
      "stationary",
      "cosmetics",
    ]),
  freeShipping: Yup.boolean().default(false),
  //sellerId: Yup.string(),
  availableQuantity: Yup.number()
    .required("Product Quantity is required")
    .default(1)
    .integer("Available Quantity Must be a Integer Number")
    .min(1, "Available Quantity must be 1"),
  description: Yup.string()
    .required("Product description is required")
    .trim()
    .min(200, "Description must be at least 200 of characters")
    .max(1000),
  image: Yup.string().nullable(),
});

export const paginationValidationSchema = Yup.object({
  page: Yup.number()
    .min(1, "Page must be at least 1.")
    .required("Page is required."),
  limit: Yup.number()
    .min(1, "Limit must be at least 1.")
    .required("Limit is required.")
    .max(100, "Limit must be at max 100."),
    searchText: Yup.string().nullable(),
});
