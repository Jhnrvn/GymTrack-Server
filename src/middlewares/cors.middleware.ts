import type { CorsOptions } from "cors";

const allowedOrigins = [null, "http://localhost:5173", "http://localhost:5174", "https://your-app.com"];

// CORS config with TypeScript typing
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
