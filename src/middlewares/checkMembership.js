import Member from "../models/Member.js";

const membershipExpiryChecker = async (endDate) => {
  if (!endDate) return;

  const membershipEndDate = new Date(endDate);
  const today = new Date();

  if (today > membershipEndDate) return true;

  return false;
};

const checkMembership = async (req, res, next) => {
  const { id } = req.body;
  try {
    const member = await Member.findById(id);
    if (!member) {
      const error = new Error("Member not found");
      error.status = 404;
      throw error;
    }

    const isExpired = await membershipExpiryChecker(member.currentPlan.endDate);

    if (isExpired) {
      const error = new Error("Membership plan expired");
      error.status = 400;
      error.isExpired = isExpired;
      throw error;
    }
    next();
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      isExpired: error.isExpired,
      success: false,
    });
  }
};

export default checkMembership;
