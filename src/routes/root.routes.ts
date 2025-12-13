import express from "express";
import type { Router, Request, Response } from "express";
// router instance
const router: Router = express.Router();

// routes
router.use("/", async (req: Request, res: Response): Promise<void> => {
  try {
    res.send("Welcome to GymTrack API");
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        header: "Internal Server Error",
        message: error.message,
        success: false,
      });
    } else {
      res.status(500).json({
        header: "Internal Server Error",
        message: "An error occurred",
        success: false,
      });
    }
  }
});

export default router;
