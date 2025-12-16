import express from "express";
import type { Router } from "express";
const authRouter: Router = express.Router();
// utils
import { asyncHandler } from "../utils/asyncHandler.utils.js";

// controllers
import { UserController } from "../controllers/authentication/auth.controller.js";

// middlewares
import { generateName } from "../middlewares/generateName.middleware.js";
import { generateCode } from "../middlewares/generateCode.middleware.js";

// endpoints
authRouter.post("/register", generateName, asyncHandler(UserController.register));
authRouter.post("/login", asyncHandler(UserController.login));
authRouter.patch("/change-password", asyncHandler(UserController.changePassword));
authRouter.patch("/forgot-password", generateCode, asyncHandler(UserController.forgotPassword));
authRouter.patch("/reset-password", asyncHandler(UserController.resetPassword));

export default authRouter;
``;
