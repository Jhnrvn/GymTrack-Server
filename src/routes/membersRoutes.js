import express from "express";
const router = express.Router();

// controllers
import {
  getAllMembers,
  getTodaysAttendance,
  getMemberDetails,
  addNewMember,
  clockInAttendance,
  clockOutAttendance,
  renewMembershipPlan,
  changeMembershipPlan,
  updateMemberDetails,
} from "../controllers/home/members.js";
import { deleteAttendance } from "../controllers/home/attendance.js";
import { getMemberInfo, updateMemberInfo, updateMemberProfile } from "../controllers/mobile/member.js";

// middlewares
import authentication from "../middlewares/authentication.js";
import assignProfilePicture from "../middlewares/assignProfilePicture.js";
import { formatName } from "../middlewares/formatName.js";
import getPrice from "../middlewares/getPrice.js";
import getEndDate from "../middlewares/getEndDate.js";
import generatePassword from "../middlewares/generatePassword.js";
router.use(authentication);
import generatePasswordUpdateMemberInfo from "../middlewares/generatePasswordUpdateMemberInfo.js";
import checkMembership from "../middlewares/checkMembership.js";

// admin endpoints
router.get("/", getAllMembers);
router.get("/today", getTodaysAttendance);
router.get("/:id", getMemberDetails);
router.post("/add-member", formatName, getPrice, getEndDate, assignProfilePicture, generatePassword, addNewMember);
router.post("/attendance/clock-in", checkMembership, clockInAttendance);
router.patch("/attendance/clock-out", checkMembership, clockOutAttendance);
router.delete("/attendance/delete", deleteAttendance);
router.put("/renew-membership", getPrice, getEndDate, renewMembershipPlan);
router.put("/change-plan", getPrice, getEndDate, changeMembershipPlan);
router.patch("/update-details", generatePasswordUpdateMemberInfo, updateMemberDetails);

// mobile user endpoints
router.get("/users", getMemberInfo);
router.patch("/users", updateMemberInfo);
router.patch("/profile", updateMemberProfile);

export default router;
