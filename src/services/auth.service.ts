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
import type {
  CreateUserDto,
  LoginUserDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  resetPassword,
} from "../dtos/user.dtos.js";
// utils
import { AppError } from "../utils/error.utils.js";
import { sendVerificationEmail } from "../utils/sendVerification.utils.js";
import { sendCodeToChangePassword } from "../utils/sendCodeToChangePassword.middleware.js";

// services
export class AuthServices {
  // i: register user
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

  // i: login user
  static async login(data: LoginUserDto): Promise<string> {
    const { email, password } = data;

    const user: UserDocument | null = await UserModel.findOne({ email });

    // check if user exist
    if (!user) {
      throw new AppError("User not found", "User not found", 404);
    }

    // check if password is correct
    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", "The email or password you entered is incorrect", 401);
    }

    // check if user is authorized to access this resource
    if (!user.isVerified || user.isBlocked || !user.isPermitted) {
      throw new AppError("Unauthorized", "Your account is not allowed to access this resource", 401);
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

  // i: change user password
  static async changePassword(data: ChangePasswordDto, user: { id: string }): Promise<void> {
    const { current_password, new_password } = data;
    const { id } = user;

    // find the user to check if the user is existing
    const userExist: UserDocument | null = await UserModel.findById(id);
    if (!userExist) {
      throw new AppError("User not found", "User not found", 404);
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(current_password, userExist.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", "The current password you entered is incorrect", 401);
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(new_password, 13);
    userExist.password = hashedPassword;

    // save user
    await userExist.save();

    // [ ] todo: create new log and save

    return;
  }

  // i: forgot password
  static async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const { email, code } = data;

    // find user and check if user exist
    const userExist: UserDocument | null = await UserModel.findOne({ email });
    if (!userExist) {
      throw new AppError("User not found", "User not found", 404);
    }

    userExist.changePassword_code = code;
    await userExist.save();

    await sendCodeToChangePassword(email, code);
  }

  // i: reset password
  static async resetPassword(data: resetPassword): Promise<void> {
    const { email, code, password } = data;

    // check if user exist
    const userExist: UserDocument | null = await UserModel.findOne({ email });
    if (!userExist) {
      throw new AppError("User not found", "User not found", 404);
    }

    // check if code is correct
    if (userExist.changePassword_code !== code) {
      throw new AppError("Invalid code", "Invalid code", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 13);

    userExist.password = hashedPassword;
    userExist.changePassword_code = null;

    await userExist.save();

    return;
  }
}
