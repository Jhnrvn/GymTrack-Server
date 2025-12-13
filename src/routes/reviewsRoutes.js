import express from "express";
const router = express.Router();

// controllers
import {
  getAllReviews,
  getMemberReview,
  addReview,
  approveReview,
  removeReview,
  deleteReview,
} from "../controllers/mobile/reviews.js";
// middleware
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/", getAllReviews);
router.get("/:member_id", getMemberReview);
router.post("/", addReview);
router.put("/approve/:id", approveReview);
router.put("/remove/:id", removeReview);
router.delete("/:id", deleteReview);

export default router;
