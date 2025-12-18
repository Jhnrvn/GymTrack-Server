// models
import { MembershipModel } from "../models/membershipPlan.model.js";
// types
import type { Request, Response, NextFunction } from "express";
import { MembershipDocument } from "../models/membershipPlan.model.js";
import { Member, MemberDocument } from "../models/member.model.js";
// utility
import { AppError } from "../utils/error.utils.js";

const getPrice = async (
  req: Request<{}, unknown, { discount_rate: number; plan: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { discount_rate, plan } = req.body;

  try {
    const discountRate = Number(discount_rate);
    const membershipPlan: MembershipDocument | null = await MembershipModel.findById(plan);

    if (!membershipPlan) {
      throw new AppError("Membership plan not found", "Membership plan not found", 404);
    }

    const price = membershipPlan.plan_price;

    req.body.discount_rate = discountRate;
    req.body.price = price - price * discountRate;

    next();
  } catch (error) {
    res.status(500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

export default getPrice;
