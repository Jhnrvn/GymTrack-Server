import MembershipPlan from "../models/MembershipPlan.js";

const getPrice = async (req, res, next) => {
  const { discount_rate, plan } = req.body;
  
  try {
    const discountRate = Number(discount_rate);
    const membershipPlan = await MembershipPlan.findById(plan);

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
