// models
import { UserBiometricModel } from "../models/userBiometric.model.js";
// types
import type { UserBiometricDocument } from "../models/userBiometric.model.js";
// utils
import { AppError } from "../utils/error.utils.js";

// services
export class userFingerprintServices {
  static async getFingerprintTemplates(): Promise<> {
    const templates: UserBiometricDocument[] | [] = await UserBiometricModel.find().lean();


    // new template type
    type NewTemplateType = Omit<UserBiometricDocument, "user_id"> 
      

    // convert the key form user_id to member_id
    const newTemplates: NewTemplateType[] = templates.map((template) => {
      let templateObj = template;

      templateObj["member_id"] = templateObj["user_id"];
      delete templateObj["user_id"];

      return (templateObj = {
        _id: template._id,
        member_id: template.member_id,
        ...templateObj,
      });
    });

    return newTemplates;
  }
  static async userFingerprintLogin() {}
  static async enrollUserFingerprint() {}
  static async deleteUserFingerprint() {}
}
