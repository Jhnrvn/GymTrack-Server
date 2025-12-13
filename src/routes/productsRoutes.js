import express from "express";
const router = express.Router();

// controllers
import {
  getAllProducts,
  getAllMembers,
  addNewProducts,
  buyProducts,
  updateProducts,
  restockProducts,
  modifyCurrentStocks,
  getAllOrders,
  confirmOrders,
  cancelOrder,
  deleteProduct,
} from "../controllers/home/products.js";
// controllers for mobile
import {
  getAllAvailableProducts,
  getAllUserPendingOrders,
  cancelOrders,
  getAllUserConfirmedOrders,
  orderProduct,
  uploadProofOfPayment,
} from "../controllers/mobile/products.js";

// middleware
import authentication from "../middlewares/authentication.js";
import uploadImage from "../middlewares/UploadImage.js";

router.use(authentication);

// products endpoint
router.get("/", getAllProducts);
router.get("/members", getAllMembers);
router.get("/all-orders", getAllOrders);
router.put("/", uploadImage, updateProducts);
router.post("/", uploadImage, addNewProducts);
router.post("/buy/:product_id", buyProducts);
router.patch("/restock/:product_id", restockProducts);
router.patch("/modify/:product_id", modifyCurrentStocks);
router.patch("/order/confirm", confirmOrders);
router.delete("/:id", deleteProduct);
router.delete("/order/cancel", cancelOrder);

// mobile endpoints
router.get("/available", getAllAvailableProducts);
router.get("/orders/pending", getAllUserPendingOrders);
router.get("/orders/confirmed", getAllUserConfirmedOrders);
router.post("/order", orderProduct);
router.patch("/:id/proof-of-payment", uploadImage, uploadProofOfPayment);
router.delete("/cancel-order/:id", cancelOrders);

export default router;
