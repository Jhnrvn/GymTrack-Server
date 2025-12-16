import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.utils.js";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  // checks if the error is an instance of AppError
  if (err instanceof AppError) {
    res.status((err as any).status || "500").json({ header: err.header, message: err.message, success: false });

    // checks if the error is an instance of Error
  } else if (err instanceof Error) {
    res.status(500).json({ header: "Internal Server Error", message: err.message, success: false });

    // if the error is not an instance of AppError or Error
  } else {
    res.status(500).json({ header: "Internal Server Error", message: "Unknown error", success: false });
  }
}
