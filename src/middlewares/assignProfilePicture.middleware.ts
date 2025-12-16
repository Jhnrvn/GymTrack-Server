import type { Request, Response, NextFunction } from "express";

// member avatar based on their gender
const male_profile: string = "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111855/male-profile_y0lfy1.png";
const female_profile: string =
  "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760111856/female-profile-2_hh6ten.png";

const assignProfilePicture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { gender } = req.body;
  try {
    if (!gender) {
      res.status(400).json({
        header: "Bad Request",
        message: "Gender is required",
        success: false,
      });
      return;
    }

    req.body.profile_picture = gender === "Male" ? male_profile : female_profile;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({
        header: "Authentication Failed",
        message: error.message,
        success: false,
      });
    } else {
      res.status(500).json({
        header: "Internal Server Error",
        message: "Something went wrong",
        success: false,
      });
    }
  }
};

export default assignProfilePicture;
