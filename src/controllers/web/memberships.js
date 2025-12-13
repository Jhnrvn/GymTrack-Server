import Member from "../../models/member.model.js";
import MembershipPlan from "../../models/membershipPlan.model.js";
import Equipment from "../../models/equipment.model.js";
import Review from "../../models/review.model.js";

/**
 * function to get all the active memberships
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*}
 */
const getAllActiveMemberships = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ archived: false })
      .select("-_id -createdAt -updatedAt -__v -archived")
      .sort({ plan_price: 1 });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

/**
 * function to get all the equipments
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*}
 */
const getAllEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.find().select("-_id -createdAt -updatedAt -__v");
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

/**
 * function to get all the approved reviews by the admin
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*}
 */
const getAllReviews = async (req, res) => {
  try {
    const equipments = await Review.find({ approved: true })
      .populate("member", "firstName lastName profile_picture -_id")
      .select("-_id -updatedAt -__v ");
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const getAllCounts = async (req, res) => {
  try {
    const members = await Member.countDocuments();
    const equipment = await Equipment.countDocuments();
    const coaches = await Member.countDocuments({ member_type: "Trainer" });

    res.status(200).json({ members, equipment, coaches });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

export { getAllActiveMemberships, getAllEquipments, getAllReviews, getAllCounts };
