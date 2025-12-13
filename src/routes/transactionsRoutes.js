import express from "express";
const router = express.Router();

// controllers
import {
  getMemberTransactions,
  cancelMembershipTransaction,
  cancelProductTransaction,
} from "../controllers/home/transactions.js";
// middlewares
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/:memberId", getMemberTransactions);
router.delete("/membership/delete", cancelMembershipTransaction);
router.delete("/product/delete", cancelProductTransaction);

export default router;
