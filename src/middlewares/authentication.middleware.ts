import jwt from "jsonwebtoken";
import "dotenv/config";
const secret = process.env.SECRET_KEY;
// types
import type { Request, Response, NextFunction } from "express";
// dtos
export interface RequestUserDto extends Request {
  user?: {
    id: string;
  };
}
// utils
import { AppError } from "../utils/error.utils.js";

// authentication middleware
export const authentication = async (req: RequestUserDto, res: Response, next: NextFunction): Promise<void> => {
  // const token = req.cookies.a15fg_token;
  const auth_header = req.headers.authorization;
  const auth_token = auth_header && auth_header.split(" ")[1];

  // check if token exist
  if (!auth_token) {
    throw new AppError("Access Denied", "Unauthorized Access", 401);
  }

  // check if token is valid
  const decoded: any = jwt.verify(auth_token, secret as string);

  // assign the decoded user to the request and call the next middleware
  req.user = decoded;
  next();
};
