// models
import { MembershipModel } from "../models/membershipPlan.model.js";
// types
import type { Request, Response, NextFunction } from "express";
import type { MembershipDocument } from "../models/membershipPlan.model.js";
import type { MemberWithPriceInfo } from "../dtos/member.dtos.js";
// utility
import { AppError } from "../utils/error.utils.js";

// get price
export const getPrice = async (
  req: Request<{}, unknown, MemberWithPriceInfo>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { discount_rate, membership_plan_id } = req.body;

  // convert the discount rate to number
  const discountRate: number = Number(discount_rate);

  // get the membership plan
  const membershipPlan: MembershipDocument | null = await MembershipModel.findById(membership_plan_id);
  if (!membershipPlan) {
    throw new AppError("Membership plan not found", "Membership plan not found", 404);
  }

  // get the price
  const price: number = membershipPlan.plan_price;

  // set the discount rate and price
  req.body.discount_rate = discountRate;
  req.body.price = price - price * discountRate;

  next();
};
