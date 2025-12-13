import express from "express";
const router = express.Router();
// controllers
import {
  getMembershipPlans,
  getArchivedMembershipPlans,
  addMembershipPlan,
  editMembershipPlan,
  archiveMembershipPlan,
  unarchiveMembershipPlan,
} from "../controllers/home/membershipPlan.js";
// middlewares
import authentication from "../middlewares/authentication.js";
router.use(authentication);
import { formatPlanName } from "../middlewares/formatName.js";

// endpoints
router.get("/", getMembershipPlans);
router.get("/archived", getArchivedMembershipPlans);
router.put("/", formatPlanName, editMembershipPlan);
router.post("/add-plan", formatPlanName, addMembershipPlan);
router.patch("/archive/:id", archiveMembershipPlan);
router.patch("/unarchive/:id", unarchiveMembershipPlan);

export default router;
