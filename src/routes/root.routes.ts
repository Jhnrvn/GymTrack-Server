import express from "express";
import type { Router, Request, Response } from "express";

// utils
import path from "path";
import { fileURLToPath } from "url";
// paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// router instance
const router: Router = express.Router();

// server static assets
router.use(express.static(path.join(__dirname, "../public")));

// routes
router.use("/", async (req: Request, res: Response): Promise<void> => {
  try {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
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
