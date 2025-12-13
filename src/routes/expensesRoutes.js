import express from "express";
const router = express.Router();

// controller
import { addExpense, deleteExpense } from "../controllers/home/expenses.js";
// middlewares
import authentication from "../middlewares/authentication.js";

router.use(authentication);

router.post("/", addExpense);
router.delete("/:id", deleteExpense);

export default router;
