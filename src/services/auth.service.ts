import bcrypt from "bcrypt";
import crypto from "crypto";
const secretKey = process.env.SECRET_KEY;
import jwt from "jsonwebtoken";
// models
import { UserModel } from "../models/user.model.js";
// types
import type { User, UserDocument } from "../models/user.model.js";
import type { CreateUserDto } from "../dtos/user.dtos.js";
// utils
import { AppError } from "../utils/error.utils.js";
import { sendVerificationEmail } from "../utils/sendVerification.utils.js";

// services
export class AuthServices {
  static async register(data: CreateUserDto): Promise<void> {
    const { email, password, isAgree, name } = data;
    const salt: number = 13;

    // find user and check if user already exist
    const userExist: UserDocument | null = await UserModel.findOne({ email });

    if (userExist) {
      throw new AppError(
        "User Already Exists",
        "An account with this email already exists. Please try logging in instead.",
        409
      );
    }

    // hash user password
    const hashPassword: string = await bcrypt.hash(password, salt);
    // create token for account verification
    const token: string = crypto.randomBytes(64).toString("hex");

    // create new User
    const newAdmin = new UserModel({
      email,
      name,
      profile_picture: "https://res.cloudinary.com/di7rdsm0n/image/upload/v1760027120/profile_1_i3g7a5.png",
      password: hashPassword,
      isAgree,
      verification_token: token,
    });

    // send verification email using nodemailer
    const info = await sendVerificationEmail(email, token);

    if (!info) {
      throw new AppError("Failed to send verification email", "Failed to send verification email", 500);
    }

    // save user
    await newAdmin.save();

    return;
  }

  static async login() {}
}
