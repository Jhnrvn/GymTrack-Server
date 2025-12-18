// types
import type { Request, Response } from "express";
import type { UserBiometricTemplateDto, UserBiometricDto } from "../../dtos/user.dtos.js";
// services
import { userFingerprintServices } from "../../services/userFingerprint.service.js";

// user fingerprint controller
export class UserFingerprintController {
  //  get all user fingerprints
  static async getFingerprints(req: Request<{}, unknown, UserBiometricTemplateDto>, res: Response): Promise<void> {
    // get all user fingerprints
    const fingerprint = await userFingerprintServices.getFingerprintTemplates();

    res.status(200).json({ success: true, templates: fingerprint });
  }
  //  login user using fingerprint
  static async userFingerprintLogin(
    req: Request<{}, unknown, Omit<UserBiometricDto, "fingerprint">>,
    res: Response
  ): Promise<void> {
    const token: string = await userFingerprintServices.userFingerprintLogin(req.body);

    res.status(200).json({
      success: true,
      header: "Login Successful",
      message: "You have logged in successfully.",
      token,
    });
  }

  //  enroll user fingerprint
  static async enrollUserFingerprint(
    req: Request<{}, unknown, { id: string; fingerprint: string }>,
    res: Response
  ): Promise<void> {
    await userFingerprintServices.enrollUserFingerprint(req.body);

    res.status(200).json({
      success: true,
      header: "Fingerprint Enrolled",
      message: "Fingerprint enrolled successfully.",
    });
  }

  //  delete user fingerprint
  static async deleteUserFingerprint(
    req: Request<{}, unknown, Omit<UserBiometricDto, "fingerprint">>,
    res: Response
  ): Promise<void> {
    await userFingerprintServices.deleteUserFingerprint(req.body);

    // response success
    res.status(200).json({
      success: true,
      header: "Fingerprint Deleted",
      message: "Fingerprint deleted successfully.",
    });
  }
}
