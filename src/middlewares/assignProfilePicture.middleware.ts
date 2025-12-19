// types
import type { Request, Response, NextFunction } from "express";
import type { MemberDocument } from "../models/member.model.js";
// utility
import { AppError } from "../utils/error.utils.js";
// member avatar based on their gender
const male_profile: string = "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111855/male-profile_y0lfy1.png";
const female_profile: string =
  "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111856/female-profile-2_hh6ten.png";

// assign profile picture
export const assignProfilePicture = async (
  req: Request<{}, unknown, MemberDocument>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { gender } = req.body;

  if (!gender) {
    throw new AppError("Bad Request", "Gender is required", 400);
  }

  req.body.profile_picture = gender === "Male" ? male_profile : female_profile;

  next();
};
