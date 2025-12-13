import express from "express";
const router = express.Router();

// controllers
import { getAllLogs } from "../controllers/home/logs.js";

// authentication
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/", getAllLogs);

export default router;
