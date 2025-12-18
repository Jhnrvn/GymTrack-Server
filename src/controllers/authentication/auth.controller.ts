// dtos
import type { Request, Response, NextFunction } from "express";
import type {
  CreateUserDto,
  LoginUserDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  resetPassword,
} from "../../dtos/user.dtos.js";
// services
import { AuthServices } from "../../services/auth.service.js";

// types
type User = {
  id: string;
};
type AuthenticateRequest = Request<{}, unknown, ChangePasswordDto> & { user: User };

//User auth controllers
export class UserController {
  // i: register
  static async register(req: Request<{}, unknown, CreateUserDto>, res: Response): Promise<void> {
    // register user
    await AuthServices.register(req.body);

    // response success
    res
      .status(201)
      .json({ header: "Register Success", message: "We have sent a verification link to your email", success: true });
  }

  // i: login
  static async login(req: Request<{}, unknown, LoginUserDto>, res: Response): Promise<void> {
    // login user
    const token: string = await AuthServices.login(req.body);

    // response success
    res.status(200).json({ header: "Login Success", message: "You have successfully logged in", success: true, token });
  }

  // i: verify account
  static async verifyAccount(req: Request<{}, unknown, {}, { token: string }>, res: Response): Promise<void> {
    // verify user account
    await AuthServices.verifyAccount(req.query.token);

    // response success
    res.status(200).send("Account verified. You can now log in.");
  }

  // i: change password
  static async changePassword(req: AuthenticateRequest, res: Response): Promise<void> {
    // change password of the user
    await AuthServices.changePassword(req.body, req.user);

    // response success
    res
      .status(200)
      .json({ header: "Password Changed", message: "Your password has been changed successfully.", success: true });
  }

  // i: forgot password
  static async forgotPassword(req: Request<{}, unknown, ForgotPasswordDto>, res: Response): Promise<void> {
    // forgot user password
    await AuthServices.forgotPassword(req.body);

    res.status(200).json({
      header: "Email Sent",
      message: "We sent you an email contains your code to reset your password.",
      success: true,
    });
  }

  // i: reset password
  static async resetPassword(req: Request<{}, unknown, resetPassword>, res: Response): Promise<void> {
    // reset user password
    await AuthServices.resetPassword(req.body);

    res.status(200).json({
      header: "Password Changed",
      message: "Your password has been changed successfully.",
      success: true,
    });
  }
}
