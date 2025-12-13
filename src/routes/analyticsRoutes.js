import express from "express";
const router = express.Router();

// controllers
import {
  activePlans,
  membershipTrend,
  monthlyRevenue,
  productSales,
  dailyRevenue,
} from "../controllers/home/analytics.js";
// middleware
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/active-plans", activePlans);
router.get("/membership-trends", membershipTrend);
router.get("/monthly-revenue", monthlyRevenue);
router.get("/product-sales", productSales);
router.get("/daily-revenue", dailyRevenue);

export default router;
