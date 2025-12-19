// models
import { MembershipModel } from "../models/membershipPlan.model.js";
// types
import type { Request, Response, NextFunction } from "express";
import type { MembershipDocument } from "../models/membershipPlan.model.js";
import type { MemberWithEndDate } from "../dtos/member.dtos.js";
// utility
import { AppError } from "../utils/error.utils.js";

//[] todo: make a function for date duration more flexible

const getDate = (plan_duration: string): number => {
  let duration: number | null = null;
  const now: Date = new Date();
  const currentHour: number = now.getUTCHours();

  switch (plan_duration) {
    case "1_day":
      // If it's already past 11:59 PM PH (15:59 UTC), use tomorrow
      if (currentHour > 15) {
        // Changed from >= 16 to > 15
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        duration = tomorrow.setUTCHours(15, 59, 59, 999);
      } else {
        duration = new Date().setUTCHours(15, 59, 59, 999);
      }
      break;
    case "1_month":
      duration = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).setUTCHours(16, 0, 0, 0);
      break;

    case "15_days":
      duration = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).setUTCHours(16, 0, 0, 0);
      break;

    case "3_months":
      duration = new Date(Date.now() + 89 * 24 * 60 * 60 * 1000).setUTCHours(16, 0, 0, 0);
      break;

    case "6_months":
      duration = new Date(Date.now() + 181 * 24 * 60 * 60 * 1000).setUTCHours(16, 0, 0, 0);
      break;

    case "1_year":
      duration = new Date(Date.now() + 364 * 24 * 60 * 60 * 1000).setUTCHours(16, 0, 0, 0);
      break;
    default:
      if (currentHour > 15) {
        // Same change here
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        duration = tomorrow.setUTCHours(15, 59, 59, 999);
      } else {
        duration = new Date().setUTCHours(15, 59, 59, 999);
      }
      break;
  }

  return duration;
};

// get end date
export const getEndDate = async (
  req: Request<{}, unknown, MemberWithEndDate>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { membership_plan_id } = req.body;

  // get the membership plan
  const membership_plan: MembershipDocument | null = await MembershipModel.findById(membership_plan_id);
  if (!membership_plan) {
    throw new AppError("Membership plan not found", "Membership plan not found", 404);
  }

  const endDate = getDate(membership_plan.plan_duration);
  req.body = { ...req.body, endDate: endDate.toString() };

  next();
};
