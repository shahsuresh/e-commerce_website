import mongoose from "mongoose";
const userName = process.env.db_USER_NAME;
const password = encodeURIComponent(process.env.db_PASSWORD);

const dbName = process.env.db_NAME;
const dbHost = process.env.db_HOST_NAME;
const dbURL = `mongodb+srv://${userName}:${password}@${dbHost}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
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
