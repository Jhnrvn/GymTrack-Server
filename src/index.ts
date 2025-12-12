import express from "express";
import cors from "cors";
// express app instance
const app = express();
const PORT = process.env.PORT || 3000;

// mongodb connection
import { connection } from "./configs/connection.js";
await connection();

// middlewares
import { corsOptions } from "./middlewares/cors.js";

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

app.listen(PORT, (): void => console.log(`Server running on http://localhost:${PORT}`));
