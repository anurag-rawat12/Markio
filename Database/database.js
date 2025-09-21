import mongoose from "mongoose";
import { DB_URL } from "../Config/env.config.js";


const connectDB = async () => {
  try {
    await mongoose.connect(`${DB_URL}`);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
