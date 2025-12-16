// dtos
import type { Request, Response } from "express";
import type { CreateUserDto, LoginUserDto } from "../../dtos/user.dtos.js";
// utils
import { AppError } from "../../utils/error.utils.js";
// services
import { AuthServices } from "../../services/auth.service.js";

// controllers
export class UserController {
  // register
  static async register(req: Request<{}, unknown, CreateUserDto>, res: Response): Promise<void> {
    try {
      // register user
      await AuthServices.register(req.body);

      // response success
      res
        .status(201)
        .json({ header: "Register Success", message: "We have sent a verification link to your email", success: true });
    } catch (err) {
      // response error
      if (err instanceof AppError) {
        res.status((err as any).status || "500").json({ header: err.header, message: err.message, success: false });
      } else if (err instanceof Error) {
        res.status(500).json({ header: "Internal Server Error", message: err.message, success: false });
      } else {
        res.status(500).json({ header: "Internal Server Error", message: "Unknown error", success: false });
      }
    }
  }

  // login
  static async login(req: Request<{}, unknown, LoginUserDto>, res: Response): Promise<void> {
    try {
      // login user
      const token: string = await AuthServices.login(req.body);

      // response success
      res
        .status(200)
        .json({ header: "Login Success", message: "You have successfully logged in", success: true, token });
    } catch (err) {
      // response error
      if (err instanceof AppError) {
        res.status((err as any).status || "500").json({ header: err.header, message: err.message, success: false });
      } else if (err instanceof Error) {
        res.status(500).json({ header: "Internal Server Error", message: err.message, success: false });
      } else {
        res.status(500).json({ header: "Internal Server Error", message: "Unknown error", success: false });
      }
    }
  }
}
