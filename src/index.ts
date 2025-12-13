import express from "express";
import type { Request, Response } from "express";
import type { Express } from "express";
import cors from "cors";
// express app instance
const app: Express = express();
const PORT = process.env.PORT || 3000;

// routes
import rootRoutes from "./routes/root.routes.js";

// mongodb connection
import { connection } from "./configs/connection.js";
await connection();

// middlewares
import { corsOptions } from "./middlewares/cors.js";
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// API
app.get("/", rootRoutes);

app.listen(PORT, (): void => console.log(`Server running on http://localhost:${PORT}`));
