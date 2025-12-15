import express from "express";
import type { Router } from "express";
const authRouter: Router = express.Router();

// controllers
import { UserController } from "../controllers/authentication/auth.controller.js";

// middlewares
import { generateName } from "../middlewares/generateName.js";

// endpoints
authRouter.post("/register", generateName, UserController.register);

export default authRouter;
