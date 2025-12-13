import express from "express";
const router = express.Router();

// desktop controllers
import { getAllAdminNotifications, readAdminNotification } from "../controllers/home/notification.js";
// mobile controller
import { getAllNotification, readNotification, deleteNotification } from "../controllers/mobile/notifications.js";
// authentication
import authentication from "../middlewares/authentication.js";
router.use(authentication);

// desktop endpoints
router.get("/", getAllAdminNotifications);
router.patch("/read/:id", readAdminNotification);

// mobile endpoints
router.get("/:member_id", getAllNotification);
router.put("/mobile/read/:id", readNotification);
router.delete("/mobile/delete/:id", deleteNotification);

export default router;
