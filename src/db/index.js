import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) throw new Error("MONGODB_URI is not defined in environment variables.");

    const connection = await mongoose.connect(`${MONGO_URI}/${DB_NAME}?retryWrites=true&w=majority`);
    
    console.log(`\n✅ MongoDB connected! DB HOST: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error: " + error.message);
    process.exit(1);
  }
};

export default connectDB;
