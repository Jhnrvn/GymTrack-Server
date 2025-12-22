// types
import type { Types } from "mongoose";
import type { UserBiometricDocument } from "../models/userBiometric.model.js";

// create new user
export interface CreateUserDto {
  email: string;
  password: string;
  isAgree: boolean;
  name: {
    firstName: string;
    lastName: string;
  };
  profile_picture?: string;
  verification_token?: string;
}

// login user
export interface LoginUserDto {
  email: string;
  password: string;
}

// user change password
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

// forgot password
export interface ForgotPasswordDto {
  email: string;
  code: string;
}

// reset password
export type resetPassword = ForgotPasswordDto & { password: string };

// user biometric template
export interface UserBiometricTemplateDto {
  _id: Types.ObjectId | string;
  member_id: Types.ObjectId | string;
  template: string;
}

// user biometric
export interface UserBiometricDto {
  id: string;
  fingerprint: string;
}
