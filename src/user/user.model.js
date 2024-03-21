import mongoose from "mongoose";

//?====set rules====

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 35,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 35,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    maxlength: 65,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
    enum: ["seller", "buyer"],
  },
  gender: {
    type: String,
    required: false,
    trim: true,
    enum: ["male", "female", "preferNotToSay"],
  },
});

//?====create table===

const User = mongoose.model("User", userSchema);

//?====export User=====

export default User;
