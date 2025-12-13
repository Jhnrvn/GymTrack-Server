import express from "express";
const router = express.Router();

// controllers
import { getAllStaff, getAllBlockedStaff, grantPermission, blockUser, unblockUser } from "../controllers/home/staff.js";

router.get("/", getAllStaff);
router.get("/blocked", getAllBlockedStaff);
router.put("/permission", grantPermission);
router.put("/block", blockUser);
router.put("/unblock", unblockUser);

export default router;
