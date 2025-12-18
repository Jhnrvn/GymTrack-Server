// types
import type { Request, Response, NextFunction } from "express";
import type { MemberDocument } from "../models/member.model.js";
// Utility
import { AppError } from "../utils/error.utils.js";

const nameFormatter = (input: string): string => {
  if (!input || !input.trim()) return "";

  // Collapse multiple spaces and split into words
  const words: string[] = input.trim().replace(/\s+/g, " ").split(" ");

  return words
    .map((w: string): string =>
      w
        .toLowerCase()
        // Capitalize first letter and any letter after -, ' or ’
        .replace(/(^|[-'’])[a-z]/g, (match: string) => match.toUpperCase())
    )
    .join(" ");
};

// Middleware
export const formatName = async (req: Request<{}, {}, MemberDocument>, res: Response, next: NextFunction) => {
  const { firstName, lastName } = req.body;

  // Check if first name and last name are provided
  if (!firstName || !lastName) {
    throw new AppError("Bad Request", "First name and last name are required", 400);
  }

  // Apply formatter
  req.body.firstName = nameFormatter(firstName);
  req.body.lastName = nameFormatter(lastName);

  // call the next middleware
  next();
};

// Utility function
const planNameFormatter = (input: string): string => {
  if (!input || !input.trim()) return "";

  return (
    input
      // Trim and collapse extra spaces
      .trim()
      .replace(/\s+/g, " ")
      // Remove unwanted characters except letters, numbers, spaces, hyphens
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      // Convert to uppercase
      .toUpperCase()
  );
};

// Middleware function
export const formatPlanName = async (req: Request, res: Response, next: NextFunction) => {
  const { plan_name } = req.body;

  if (!plan_name || !plan_name.trim()) {
    throw new AppError("Bad Request", "Plan name is required", 400);
  }

  // Apply formatter
  req.body.plan_name = planNameFormatter(plan_name);

  // call the next middleware
  next();
};
