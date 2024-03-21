import mongoose from "mongoose";
const userName = "suresh";
const password = encodeURIComponent("suresh1234");

const dbName = "e-commerce_website";
const dbURL = `mongodb+srv://${userName}:${password}@cluster0.ke3mn7e.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log(`Database connected successfully`);
  } catch (error) {
    console.log(error.message);
    console.log(`Database Connection error`);
  }
};

export default connectDB;
