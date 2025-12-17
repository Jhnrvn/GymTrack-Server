import express from "express";
import type { Router } from "express";
// express router instance
const userFingerprintRouter: Router = express.Router();
// utils
import { asyncHandler } from "../utils/asyncHandler.utils.js";

// controllers
import { UserFingerprintController } from "../controllers/authentication/userFingerprint.controller.js";

// middlewares

// endpoints
userFingerprintRouter.get("/", asyncHandler(UserFingerprintController.getFingerprints));
userFingerprintRouter.post("/login", asyncHandler(UserFingerprintController.userFingerprintLogin));
userFingerprintRouter.post("/enroll", asyncHandler(UserFingerprintController.enrollUserFingerprint));
userFingerprintRouter.delete("/delete", asyncHandler(UserFingerprintController.deleteUserFingerprint));

export default userFingerprintRouter;
