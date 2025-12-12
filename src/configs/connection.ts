import mongoose from "mongoose";
import "dotenv/config";
const prod: boolean = false;
const uri = prod ? process.env.MONGODB_URI : process.env.COMPASS_URI;

export const connection = async (): Promise<void> => {
  // checks if the uri is defined
  if (!uri) {
    throw new Error("MongoDB URI is not defined");
  }

  // connects to the database
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
