import { Types } from "mongoose";
export type CurrentPlanTypes = {
  transaction?: Types.ObjectId | null;
  plan?: Types.ObjectId | null;
  startDate?: Date | NativeDate | null;
  endDate?: Date | NativeDate | null;
  discount_rate?: number | null;
  price?: number | null;
};

export type PlanHistoryTypes = {
  id: {
    id: string;
  };
  price: number;
  discountRate: number;
  startDate: Date;
  endDate: Date;
  _id: {
    id: string;
  };
};
