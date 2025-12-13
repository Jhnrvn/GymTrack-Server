import MembershipPlan from "../../models/MembershipPlan.js";
import Log from "../../models/Log.js";

const getMembershipPlans = async (req, res) => {
  try {
    const membership_plans = await MembershipPlan.find({ archived: false }).sort({ plan_price: 1 });
    res.status(200).json(membership_plans);
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};

const getArchivedMembershipPlans = async (req, res) => {
  try {
    const archived_membership_plans = await MembershipPlan.find({ archived: true });
    res.status(200).json(archived_membership_plans);
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};

const addMembershipPlan = async (req, res) => {
  const { role } = req.user;

  try {
    // check if the user is an admin
    if (role !== "Admin") {
      return res.status(403).json({
        header: "Forbidden",
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    const membershipPlanExist = await MembershipPlan.findOne({ plan_duration: req.body.plan_duration });
    if (membershipPlanExist) {
      return res.status(400).json({
        header: "Oops..",
        message: "Membership Plan with this duration already exists. check the archive for membership plans",
        success: false,
      });
    }

    // create a new membership plan and save it to database
    const membershipPlan = new MembershipPlan(req.body);
    const plan = await membershipPlan.save();

    // create log
    const log = new Log({
      action: "ADD",
      membership: plan._id,
      user: req.user.id,
      message: "Membership Plan Added",
      status: true,
    });
    await log.save();

    // send a successful response
    res.status(201).json({
      header: "Membership Plan",
      message: "Membership Plan Added Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};

const editMembershipPlan = async (req, res) => {
  const { _id, plan_name, plan_price, plan_duration, plan_description, plan_features } = req.body;
  const { role } = req.user;

  try {
    // check if the user is an admin
    if (role !== "Admin") {
      return res.status(403).json({
        header: "Forbidden",
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    const membershipPlan = await MembershipPlan.findById(_id);
    if (!membershipPlan) {
      return res.status(404).json({
        header: "Not Found",
        message: "Membership Plan not found",
        success: false,
      });
    }

    membershipPlan.plan_name = plan_name;
    membershipPlan.plan_price = plan_price;
    membershipPlan.plan_duration = plan_duration;
    membershipPlan.plan_description = plan_description;
    membershipPlan.plan_features = plan_features;

    const plan = await membershipPlan.save();

    // create log
    const log = new Log({
      action: "UPDATE",
      membership: plan._id,
      user: req.user.id,
      message: "Membership Plan Updated",
      status: true,
    });
    await log.save();

    res.status(200).json({
      header: "Membership Plan",
      message: "Membership Plan Updated Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};

const archiveMembershipPlan = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  try {
    if (role !== "Admin") {
      return res.status(403).json({
        header: "Forbidden",
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        header: "Not Found",
        message: "Membership Plan not found",
        success: false,
      });
    }

    plan.archived = true;
    await plan.save();

    // create log
    const log = new Log({
      action: "ARCHIVE",
      membership: plan._id,
      user: req.user.id,
      message: "Membership Plan Archived",
      status: true,
    });

    await log.save();

    res.status(200).json({
      header: "Membership Plan",
      message: "Membership Plan Archived Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};
const unarchiveMembershipPlan = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  try {
    if (role !== "Admin") {
      return res.status(403).json({
        header: "Forbidden",
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        header: "Not Found",
        message: "Membership Plan not found",
        success: false,
      });
    }

    plan.archived = false;
    await plan.save();

    // create log
    const log = new Log({
      action: "UNARCHIVE",
      membership: plan._id,
      user: req.user.id,
      message: "Membership Plan Unarchived",
      status: true,
    });
    await log.save();

    res.status(200).json({
      header: "Membership Plan",
      message: "Membership Plan remove from archive Successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      header: "Error",
      message: error.message,
      success: true,
    });
  }
};

export {
  getMembershipPlans,
  getArchivedMembershipPlans,
  addMembershipPlan,
  editMembershipPlan,
  archiveMembershipPlan,
  unarchiveMembershipPlan,
};
