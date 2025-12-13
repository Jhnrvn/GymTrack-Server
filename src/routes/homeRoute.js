import express from "express";
const router = express.Router();

// controller
import { home, updateUserAvatar, updateInfo, changePassword, logout } from "../controllers/home/home.js";

// middlewares
import authentication from "../middlewares/authentication.js";
import { formatName } from "../middlewares/formatName.js";
router.use(authentication);

router.get("/", home);
router.put("/update-avatar", updateUserAvatar);
router.patch("/update-info", formatName, updateInfo);
router.patch("/change-password", changePassword);
router.get("/logout", logout);

export default router;
