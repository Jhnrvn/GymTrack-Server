import MembershipPlan from "../models/MembershipPlan.js";

//todo: make a function for date duration more flexible

const getDate = (plan_duration) => {
  let duration = null;
  const now = new Date();
  const currentHour = now.getUTCHours();

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

const getEndDate = async (req, res, next) => {
  const { plan } = req.body;

  try {
    const membership_plan = await MembershipPlan.findById(plan);
    if (!membership_plan) {
      const error = new Error("Membership plan not found");
      error.status = 404;
      throw error;
    }

    const endDate = getDate(membership_plan.plan_duration);
    req.body = { ...req.body, endDate: endDate.toString() };
    next();
  } catch (error) {
    res.status(error.status || 500).json({
      header: "Internal Server Error",
      message: error.message,
      success: false,
    });
  }
};

export default getEndDate;
