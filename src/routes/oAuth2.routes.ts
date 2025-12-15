import express from "express";
import type { Router } from "express";
const oAuth2Router: Router = express.Router();

// controllers
import { oAuth2, callback } from "../controllers/authentication/oAuth2.controller.js";

// endpoints
oAuth2Router.get("/oauth2", oAuth2);
oAuth2Router.get("/callback", callback);

export default oAuth2Router;
