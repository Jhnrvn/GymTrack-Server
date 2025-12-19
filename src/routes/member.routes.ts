import express from "express";
import type { Router } from "express";
// express router instance
const memberRouter: Router = express.Router();
// utils
import { asyncHandler } from "../utils/asyncHandler.utils.js";

// controllers
import { MemberController } from "../controllers/main/member.controller.js";

// middlewares
import { formatName } from "../middlewares/formatName.middleware.js";

// endpoints
memberRouter.get("/", asyncHandler(MemberController.getAllMembers));
memberRouter.get("/", asyncHandler(MemberController.getMemberDetails));
memberRouter.post("/", asyncHandler(formatName), asyncHandler(MemberController.addMembers));
memberRouter.get("/", asyncHandler(MemberController.renewMembershipPlan));
memberRouter.get("/", asyncHandler(MemberController.changeMembershipPlan));
memberRouter.get("/", asyncHandler(MemberController.updateMemberDetails));

export default memberRouter;
