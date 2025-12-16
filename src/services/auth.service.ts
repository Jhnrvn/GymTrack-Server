import bcrypt from "bcrypt";
import crypto from "crypto";
const secretKey = process.env.SECRET_KEY;
import jwt from "jsonwebtoken";
// models
import { UserModel } from "../models/user.model.js";
import { LogModel } from "../models/logs.model.js";
// types
import type { UserDocument } from "../models/user.model.js";
import type { LogDocument } from "../models/logs.model.js";
import type { CreateUserDto, LoginUserDto } from "../dtos/user.dtos.js";
// utils
import { AppError } from "../utils/error.utils.js";
import { sendVerificationEmail } from "../utils/sendVerification.utils.js";

// services
export class AuthServices {
  // register user
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

  // login user
  static async login(data: LoginUserDto): Promise<string> {
    const { email, password } = data;

    const user: UserDocument | null = await UserModel.findOne({ email });

    // check if user exist
    if (!user) {
      throw new AppError("User not found", "User not found", 404);
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    // check if password is correct
    if (!isMatch) {
      throw new AppError("Invalid credentials", "The email or password you entered is incorrect", 401);
    }

    // check if user is blocked
    if (user.isBlocked) {
      throw new AppError("Your account is blocked", "Your account is blocked", 401);
    }

    // check if user is verified
    if (!user.isVerified) {
      throw new AppError("Unauthorized", "Your account is not verified ", 401);
    }

    // check if user is permitted
    if (!user.isPermitted) {
      throw new AppError("Unauthorized", "User is not permitted", 401);
    }

    // payload
    const userData: { id: string } = {
      id: user._id.toString(),
    };

    // generate token
    const token: string = jwt.sign(userData, secretKey as string, { expiresIn: "1d" });

    // [ ] todo: create new log and save

    return token;
  }
}
