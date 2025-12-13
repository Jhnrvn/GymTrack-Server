import express from "express";
const router = express.Router();

// controllers
import {
  getAllActiveMemberships,
  getAllEquipments,
  getAllReviews,
  getAllCounts,
} from "../controllers/web/memberships.js";

router.get("/memberships", getAllActiveMemberships);
router.get("/equipment", getAllEquipments);
router.get("/reviews", getAllReviews);
router.get("/counts", getAllCounts);

export default router;
