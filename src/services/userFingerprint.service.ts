import jwt from "jsonwebtoken";
import "dotenv/config";
const secretKey = process.env.SECRET_KEY;
// models
import { UserBiometricModel } from "../models/userBiometric.model.js";
import { UserModel } from "../models/user.model.js";
// types
import type { UserBiometricDocument } from "../models/userBiometric.model.js";
import type { UserDocument } from "../models/user.model.js";
import type { UserBiometricTemplateDto, UserBiometricDto } from "../dtos/user.dtos.js";
// utils
import { AppError } from "../utils/error.utils.js";
import { partialHiddenEmail } from "../utils/hideEmail.utils.js";

// services
export class userFingerprintServices {
  // get all user fingerprints
  static async getFingerprintTemplates(): Promise<UserBiometricTemplateDto[]> {
    const templates: UserBiometricDocument[] | [] = await UserBiometricModel.find({}, { __v: 0 }).lean<
      UserBiometricDocument[]
    >();

    // convert the key form user_id to member_id
    const newTemplates: UserBiometricTemplateDto[] = templates.map(({ user_id, ...rest }) => {
      return {
        member_id: user_id,
        ...rest,
      };
    });

    return newTemplates;
  }

  // use fingerprint to login user
  static async userFingerprintLogin(data: Omit<UserBiometricDto, "fingerprint">): Promise<string> {
    const user: UserDocument | null = await UserModel.findById(data.id);

    if (!user) {
      throw new AppError("User not found", "User not found", 404);
    }

    // user information payload
    const validUser = {
      id: user._id.toString(),
      profile_picture: user.profile_picture,
      email: partialHiddenEmail(user.email),
      name: user.name,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
    };

    // create token
    const token: string = jwt.sign(validUser, secretKey as string, {
      expiresIn: "1d",
    });

    user.active = true;

    // save user
    await user.save();
    // [ ] todo: save log

    return token;
  }

  // enroll user fingerprint
  static async enrollUserFingerprint(data: UserBiometricDto): Promise<void> {
    const { id, fingerprint } = data;

    // check if user exist
    const user: UserDocument | null = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", "User not found", 404);
    }

    // enroll fingerprint
    user.enrolledAt = new Date();
    user.isEnrolled = true;

    // save fingerprint
    const fingerprintTemplate: UserBiometricDocument = new UserBiometricModel({ user_id: id, template: fingerprint });
    await fingerprintTemplate.save();
    await user.save();

    return;
  }

  // delete user fingerprint
  static async deleteUserFingerprint(data: Omit<UserBiometricDto, "fingerprint">): Promise<void> {
    const { id } = data;

    const user: UserDocument | null = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", "User not found", 404);
    }

    // check if fingerprint exist
    if (!user.isEnrolled) {
      throw new AppError("Fingerprint not found", "Fingerprint not found", 404);
    }

    // delete fingerprint
    await UserBiometricModel.deleteMany({ user_id: id });
    user.isEnrolled = false;
    user.enrolledAt = null;
    await user.save();

    return;
  }
}
