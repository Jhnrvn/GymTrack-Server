import mongoose from "mongoose";
const { Schema, model } = mongoose;

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

const Product = mongoose.models.Product || model("Product", productSchema);
export default Product;
