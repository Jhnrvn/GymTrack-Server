import express from "express";
const router = express.Router();

// controllers
import {
  getIncidentReport,
  createIncidentReport,
  resolvedIncidentReport,
  deleteIncidentReport,
} from "../controllers/home/incidentReport.js";

// authentication
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/", getIncidentReport);
router.post("/", createIncidentReport);
router.patch("/:id", resolvedIncidentReport);
router.delete("/:id", deleteIncidentReport);

export default router;
