import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { UserModel } from "../models/user.model.js";

// type for user
type User = {
  firstName: string;
  lastName: string;
};

// utility function that generate name using crypto library
const generateFirstAndLastName = (length: number): User => {
  return {
    firstName: "User",
    lastName: crypto.randomBytes(length).toString("hex"),
  };
};

// function that generate name
export const generateName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // initialize variables
    let firstName: string = "";
    let lastName: string = "";
    let exist = true;

    // checks if the user last name value is already in the database
    while (exist) {
      const name: User = generateFirstAndLastName(4);
      firstName = name.firstName;
      lastName = name.lastName;

      const user = await UserModel.findOne({ "name.lastName": lastName });

      // if it has been used, generate a new name
      if (!user) {
        exist = false;
      }
    }

    // checks if the generated name has already been used
    req.body = { ...req.body, name: { firstName, lastName } };
    next();
  } catch (error: unknown) {
    // error handling
    if (error instanceof Error) {
      res.status(500).json({
        header: "Internal Server Error",
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
