import mongoose from "mongoose";
import type { InferSchemaType, HydratedDocument } from "mongoose";
const { Schema, model } = mongoose;

// schema
const productSchema = new Schema(
  {
    product_name: { type: String, required: true },
    product_price: { type: Number, required: true },
    product_stocks: { type: Number, required: true, default: 0 },
    product_category: { type: String, required: true },
    product_description: { type: String },
    product_image: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// types
export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

// models
export const ProductModel = mongoose.models.Product || model("Product", productSchema);
