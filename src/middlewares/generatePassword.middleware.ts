import bcrypt from "bcrypt";
import "dotenv/config";
import crypto from "crypto";
// types
import type { Request, Response, NextFunction } from "express";

// function that generate name using crypto library
function generateMemberPassword(length: number): { password: string } {
  return {
    password: crypto.randomBytes(length).toString("hex"),
  };
}

// generate member password
export const generatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { password } = generateMemberPassword(4);
  const salt = 13;

  if (!req.body.email) {
    return next();
  }

  // hash generated password
  const hashedPassword: string = await bcrypt.hash(password, salt);
  req.body = { ...req.body, password, hashedPassword };

  next();
};
