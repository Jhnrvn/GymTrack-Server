import express from "express";
import type { Router } from "express";
// express router instance
const memberRouter: Router = express.Router();
// utils
import { asyncHandler } from "../utils/asyncHandler.utils.js";

// controllers
import { MemberController } from "../controllers/main/member.controller.js";

// middlewares
import { authentication } from "../middlewares/authentication.middleware.js";
import { formatName } from "../middlewares/formatName.middleware.js";
import { getPrice } from "../middlewares/getPrice.middleware.js";
import { getEndDate } from "../middlewares/getEndDate.middleware.js";
import { assignProfilePicture } from "../middlewares/assignProfilePicture.middleware.js";
import { generatePassword } from "../middlewares/generatePassword.middleware.js";
// use middleware
memberRouter.use(authentication);

// endpoints
// memberRouter.get("/", asyncHandler(MemberController.getAllMembers));
// memberRouter.get("/", asyncHandler(MemberController.getMemberDetails));
memberRouter.post(
  "/",
  asyncHandler(formatName),
  asyncHandler(getPrice),
  asyncHandler(getEndDate),
  asyncHandler(assignProfilePicture),
  asyncHandler(generatePassword),
  asyncHandler(MemberController.addMembers)
);
// memberRouter.get("/", asyncHandler(MemberController.renewMembershipPlan));
// memberRouter.get("/", asyncHandler(MemberController.changeMembershipPlan));
// memberRouter.get("/", asyncHandler(MemberController.updateMemberDetails));

export default memberRouter;
