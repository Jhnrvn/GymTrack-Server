import express from "express";
const router = express.Router();

// controllers
import {
  getAllFingerprints,
  getFingerprint,
  enrollFingerprint,
  deleteFingerprint,
} from "../controllers/home/biometric.js";
// middlewares
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/", getAllFingerprints);
router.get("/:id", getFingerprint);
router.post("/enroll", enrollFingerprint);
router.delete("/delete", deleteFingerprint);

export default router;
