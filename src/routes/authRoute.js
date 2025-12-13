import express from "express";
const router = express.Router();

// controllers
import {
  oAuth,
  callback,
  register,
  getFingerprints,
  verifyAccount,
  login,
  loginFingerprint,
  saveFingerprint,
  deleteFingerprint,
  changePassword,
  forgotPassword,
  newPassword,
} from "../controllers/authentication/auth.js";
import {
  signUp,
  signIn,
  updatePassword,
  forgotPasswordMobile,
  resetPasswordMobile,
} from "../controllers/mobile/auth.js";

// middlewares
import authentication from "../middlewares/authentication.js";
import generateName from "../middlewares/generateName.js";
import generateCode from "../middlewares/generateCode.js";
import generateMemberName from "../middlewares/generateMemberName.js";

// endpoints
router.get("/oAuth", oAuth);
router.get("/oauth2callback", callback);
router.get("/verify", verifyAccount);
router.get("/fingerprint", getFingerprints);
router.post("/register", generateName, register);
router.post("/login", login);
router.post("/login-fingerprint", loginFingerprint);
router.post("/save-fingerprint", saveFingerprint);
router.delete("/delete-fingerprint", deleteFingerprint);
router.patch("/change-password", authentication, changePassword);
router.post("/forgot-password", generateCode, forgotPassword);
router.put("/reset-password", newPassword);

// mobile user endpoints
router.post("/sign-up-mobile", generateMemberName, signUp);
router.post("/sign-in-mobile", signIn);
router.patch("/change-password-mobile", authentication, updatePassword);
router.patch("/forgot-password-mobile", generateCode, forgotPasswordMobile);
router.patch("/reset-password-mobile", resetPasswordMobile);

export default router;
