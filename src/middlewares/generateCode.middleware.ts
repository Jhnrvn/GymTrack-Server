import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
// dtos
import type { ForgotPasswordDto } from "../dtos/user.dtos.js";

// function that generate name using crypto library
const generateTempCode = (length: number) => {
  return {
    code: crypto.randomBytes(length).toString("hex"),
  };
};

// middleware
export const generateCode = async (req: Request<{}, unknown, ForgotPasswordDto>, res: Response, next: NextFunction) => {
  const { code } = generateTempCode(3);
  req.body = { ...req.body, code };
  next();
};
