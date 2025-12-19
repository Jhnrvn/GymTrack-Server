import express from "express";
import type { Express } from "express";
import cors from "cors";
// express app instance
const app: Express = express();
const PORT = process.env.PORT || 3000;

// routes
import rootRoutes from "./routes/root.routes.js";
import oAuth2Routes from "./routes/oAuth2.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userFingerprintRoutes from "./routes/userFingerprint.routes.js";
import memberRoutes from "./routes/member.routes.js";

// mongodb connection
import { connection } from "./configs/connection.js";
await connection();

// middlewares
import { corsOptions } from "./middlewares/cors.middleware.js";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(globalRateLimiter);

// API
app.get("/", rootRoutes);
app.use("/api/v1/oauth", oAuth2Routes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user/fingerprint", userFingerprintRoutes);
app.use("/api/v1/member/", memberRoutes);

// error
app.use(errorHandler);

app.listen(PORT, (): void => console.log(`Server running on http://localhost:${PORT}`));
